"use client";

import { useEffect, useRef, useState } from "react";
import type { Location, Project } from "@/lib/solar/model";
import { selectedPanels } from "@/lib/solar/model";
import { localFrame, maskGeo, panelCorners } from "@/lib/solar/geometry";

let loader: Promise<void> | undefined;
function loadMaps(key: string) {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (!loader) loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=solarMapsReady`;
    const global = window as typeof window & { solarMapsReady?: () => void; gm_authFailure?: () => void };
    const timeout = setTimeout(() => { loader = undefined; reject(new Error("Google Maps timed out. Check your network and browser key.")); }, 30000);
    global.solarMapsReady = () => { clearTimeout(timeout); resolve(); delete global.solarMapsReady; };
    global.gm_authFailure = () => { clearTimeout(timeout); loader = undefined; reject(new Error("Google Maps authorization failed. Check key restrictions, API enablement and billing.")); };
    script.onerror = () => { clearTimeout(timeout); loader = undefined; script.remove(); reject(new Error("Google satellite map could not be loaded.")); };
    document.head.appendChild(script);
  });
  return loader;
}

export default function GoogleMap({ browserKey, project, pinMode, onPin }: { browserKey: string | null; project: Project; pinMode: boolean; onPin: (location: Location) => void }) {
  const host = useRef<HTMLDivElement>(null), mapRef = useRef<google.maps.Map | null>(null), projectRef = useRef(project), pinRef = useRef(onPin);
  const [status, setStatus] = useState("Loading Google satellite imagery…"), [ready, setReady] = useState(false), [retry, setRetry] = useState(0);
  projectRef.current = project; pinRef.current = onPin;
  useEffect(() => {
    if (!browserKey || !host.current) return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    setStatus("Loading Google satellite imagery…");
    void loadMaps(browserKey).then(() => {
      if (cancelled || !host.current) return;
      const initial = projectRef.current.solar?.insights.center ?? projectRef.current.location ?? { latitude: 28.6139, longitude: 77.2090 };
      const map = new google.maps.Map(host.current, { center: { lat: initial.latitude, lng: initial.longitude }, zoom: 19, mapTypeId: "satellite", tilt: 0, heading: 0, streetViewControl: false, mapTypeControl: false, fullscreenControl: false, gestureHandling: "cooperative", rotateControl: false });
      mapRef.current = map;
      const listener = map.addListener("tilesloaded", () => setStatus(""));
      setReady(true);
      const timeout = setTimeout(() => setStatus(current => current ? "Satellite imagery has not loaded. Check network, provider quota or coverage; pan to another location or retry." : ""), 20000);
      cleanup = () => { clearTimeout(timeout); listener.remove(); google.maps.event.clearInstanceListeners(map); };
    }).catch(error => { if (!cancelled) setStatus(error.message); });
    return () => { cancelled = true; cleanup?.(); setReady(false); mapRef.current = null; };
  }, [browserKey, retry]);
  useEffect(() => {
    const map = mapRef.current; if (!map || !ready) return;
    const listener = map.addListener("click", (event: google.maps.MapMouseEvent) => {
      if (pinMode && event.latLng) pinRef.current({ latitude: event.latLng.lat(), longitude: event.latLng.lng() });
    });
    map.setOptions({ draggableCursor: pinMode ? "crosshair" : undefined });
    return () => listener.remove();
  }, [ready, pinMode]);
  useEffect(() => {
    const map = mapRef.current; if (!map || !ready) return;
    const location = project.solar?.insights.center ?? project.location;
    if (location) map.panTo({ lat: location.latitude, lng: location.longitude });
  }, [ready, project.location?.latitude, project.location?.longitude, project.solar?.fetchedAt]);
  useEffect(() => {
    const map = mapRef.current; if (!map || !ready) return;
    const canvas = document.createElement("canvas"); canvas.style.position = "absolute"; canvas.style.pointerEvents = "none";
    const overlay = new google.maps.OverlayView();
    overlay.onAdd = () => overlay.getPanes()?.overlayLayer.appendChild(canvas);
    overlay.onRemove = () => canvas.remove();
    overlay.draw = () => {
      const projection = overlay.getProjection(), ctx = canvas.getContext("2d"); if (!ctx || !host.current) return;
      const width = host.current.clientWidth, height = host.current.clientHeight, ratio = window.devicePixelRatio || 1;
      const bounds = map.getBounds(); if (!bounds) return;
      const topLeft = projection.fromLatLngToDivPixel(new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng())); if (!topLeft) return;
      canvas.style.left = `${topLeft.x}px`; canvas.style.top = `${topLeft.y}px`;
      canvas.width = width * ratio; canvas.height = height * ratio; canvas.style.width = `${width}px`; canvas.style.height = `${height}px`; ctx.scale(ratio, ratio);
      const point = (location: Location) => { const p = projection.fromLatLngToDivPixel(new google.maps.LatLng(location.latitude, location.longitude)); return p ? { x: p.x - topLeft.x, y: p.y - topLeft.y } : { x: -10000, y: -10000 }; };
      const current = projectRef.current, solar = current.solar;
      if (solar) {
        if (solar.mask) {
          ctx.fillStyle = "rgba(216,243,106,.35)";
          // Render original raster cells through the map projection, no tracing.
          for (const [y, x, n] of solar.mask.runs) {
            const corners = [maskGeo(solar.mask, x, y), maskGeo(solar.mask, x + n, y), maskGeo(solar.mask, x + n, y + 1), maskGeo(solar.mask, x, y + 1)].map(point);
            ctx.beginPath(); corners.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fill();
          }
        }
        const frame = localFrame(solar.insights.center);
        ctx.fillStyle = "rgba(13,26,60,.85)"; ctx.strokeStyle = "#d8f36a"; ctx.lineWidth = 1;
        for (const panel of selectedPanels(current)) {
          const corners = panelCorners(solar.insights, panel, frame).map(p => point(frame.toGeo(p)));
          ctx.beginPath(); corners.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
      }
      const pin = current.location ?? solar?.insights.center;
      if (pin) { const p = point(pin); ctx.beginPath(); ctx.arc(p.x, p.y, 7, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 3; ctx.stroke(); }
    };
    overlay.setMap(map);
    const observer = new ResizeObserver(() => overlay.draw()); if (host.current) observer.observe(host.current);
    return () => { observer.disconnect(); overlay.setMap(null); };
  }, [ready, project.solar, project.settings.selectedPanelCount, project.location]);
  return (
    <div className="solar-canvas" aria-label="Google satellite site map">
      <div ref={host} className="solar-map-host" />
      <div className="solar-map-north" aria-label="True north up">↑ N</div>
      {(!browserKey || status) && (
        <div className="solar-map-status" role="status">
          <p>{!browserKey ? "Satellite imagery is not configured. Set the approved Google Maps browser key and enable the integration. This is an empty workspace, not a satellite map." : status}</p>
          {browserKey && (
            <button className="solar-link-button mt-3" onClick={() => setRetry(value => value + 1)}>Retry map</button>
          )}
        </div>
      )}
    </div>
  );
}
