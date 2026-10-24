"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { panelCorners, localFrame } from "@/lib/solar/geometry";
import { selectedPanels, type Project } from "@/lib/solar/model";

export default function Preview({ project }: { project: Project }) {
  const host = useRef<HTMLDivElement>(null), controlsRef = useRef<OrbitControls | null>(null), resetRef = useRef<(() => void) | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!host.current || !project.solar) return;
    const container = host.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true }); }
    catch { setError("3D geometry preview is unavailable: this browser cannot create a WebGL context. Use the 2D map and saved PDF."); return; }
    const scene = new THREE.Scene(); scene.background = new THREE.Color("#102a2a");
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = false; controlsRef.current = controls;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); container.appendChild(renderer.domElement);
    const solar = project.solar, frame = localFrame(solar.insights.center);
    const group = new THREE.Group(); scene.add(group);
    const meshes: THREE.BufferGeometry[] = [], materials: THREE.Material[] = [];
    const addQuad = (corners: { x: number; y: number; z: number }[], color: string, wireframe = false) => {
      const geometry = new THREE.BufferGeometry();
      const points = corners.flatMap(p => [p.x, p.z, -p.y]);
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3)); geometry.setIndex([0, 1, 2, 0, 2, 3]); geometry.computeVertexNormals();
      const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, wireframe });
      group.add(new THREE.Mesh(geometry, material)); meshes.push(geometry); materials.push(material);
    };
    // Segment rectangles are ONLY plane bounding-box wireframes, not invented roofs.
    for (const segment of solar.insights.solarPotential.roofSegmentStats) {
      const sw = frame.toLocal(segment.boundingBox.sw), ne = frame.toLocal(segment.boundingBox.ne), c = frame.toLocal(segment.center), az = segment.azimuthDegrees * Math.PI / 180;
      const corners = [{ x: sw.x, y: sw.y }, { x: ne.x, y: sw.y }, { x: ne.x, y: ne.y }, { x: sw.x, y: ne.y }].map(p => ({ ...p, z: segment.planeHeightAtCenterMeters - ((p.x - c.x) * Math.sin(az) + (p.y - c.y) * Math.cos(az)) * Math.tan(segment.pitchDegrees * Math.PI / 180) }));
      addQuad(corners, "#91ad98", true);
    }
    for (const panel of selectedPanels(project)) addQuad(panelCorners(solar.insights, panel, frame), "#d8f36a");
    const box = new THREE.Box3().setFromObject(group), center = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3()), size = box.isEmpty() ? 30 : Math.max(10, box.getSize(new THREE.Vector3()).length());
    const reset = () => { camera.position.set(center.x + size * 0.7, center.y + size * 0.7, center.z + size * 0.7); controls.target.copy(center); controls.update(); renderer.render(scene, camera); };
    resetRef.current = reset;
    const draw = () => renderer.render(scene, camera);
    controls.addEventListener("change", draw);
    const resize = () => { camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); draw(); };
    const observer = new ResizeObserver(resize); observer.observe(container); resize(); reset();
    return () => { observer.disconnect(); controls.dispose(); meshes.forEach(mesh => mesh.dispose()); materials.forEach(material => material.dispose()); renderer.dispose(); renderer.domElement.remove(); controlsRef.current = null; resetRef.current = null; };
  }, [project.solar, project.settings.selectedPanelCount]);
  return (
    <div>
      <div className="solar-canvas" ref={host} aria-label="Schematic 3D solar geometry preview">
        {(!project.solar || error) && (
          <p className="solar-map-status" role="status">{error || "Generate a layout to view its 3D geometry."}</p>
        )}
      </div>
      <div className="solar-preview-controls" aria-label="3D view controls">
        <button onClick={() => { const control = controlsRef.current; if (control) { const offset = control.object.position.clone().sub(control.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 8); control.object.position.copy(control.target).add(offset); control.update(); } }}>Orbit left</button>
        <button onClick={() => { const control = controlsRef.current; if (control) { const offset = control.object.position.clone().sub(control.target).multiplyScalar(0.8); control.object.position.copy(control.target).add(offset); control.update(); } }}>Zoom in</button>
        <button onClick={() => { const control = controlsRef.current; if (control) { const offset = control.object.position.clone().sub(control.target).multiplyScalar(1.25); control.object.position.copy(control.target).add(offset); control.update(); } }}>Zoom out</button>
        <button onClick={() => resetRef.current?.()}>Reset view</button>
      </div>
      <p className="solar-canvas-caption">Geometry preview only. Wireframes are segment plane bounding boxes, not actual roof outlines or reconstructed buildings. Panels use API reference sizes, pitch and height. No obstacles, terrain, thickness, shadows or energy analysis. Drag to orbit; scroll to zoom.</p>
    </div>
  );
}
