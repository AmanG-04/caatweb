"use client";

import { useEffect, useRef } from "react";

const circuitPaths = [
  "M -90 115 C 180 10 260 245 515 145 S 820 15 1040 150 S 1285 270 1530 90",
  "M -60 650 C 150 540 310 760 505 640 S 760 450 945 610 S 1260 795 1510 590",
  "M 165 -55 C 280 100 160 250 360 325 S 700 290 760 440 S 1030 590 1540 460",
  "M 405 955 C 470 760 660 840 745 670 S 1020 555 1080 365 S 1290 175 1540 255",
  "M -70 375 C 120 250 275 415 425 355 S 665 185 890 305 S 1185 465 1510 365",
  "M -80 220 C 125 165 245 315 400 235 S 685 90 875 205 S 1170 350 1505 185",
  "M -50 505 C 140 410 265 560 480 490 S 700 355 925 465 S 1210 635 1500 510",
  "M 15 815 C 180 650 325 875 525 770 S 760 610 965 730 S 1225 900 1470 745",
  "M 700 -55 C 620 120 805 195 700 355 S 545 570 705 650 S 925 825 860 975",
] as const;

export function CursorCurrent() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const pendingPointRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") {
        return;
      }

      pendingPointRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        const { x, y } = pendingPointRef.current;
        field.style.setProperty("--current-x", `${x}px`);
        field.style.setProperty("--current-y", `${y}px`);
        field.classList.add("is-active");
        frameRef.current = null;
      });
    };

    const handlePointerLeave = () => {
      field.classList.remove("is-active");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div ref={fieldRef} className="ambient-circuit" aria-hidden="true">
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none">
        {circuitPaths.map((path, index) => (
          <g key={path}>
            <path className="ambient-circuit-cable" d={path} />
            <path className={`ambient-circuit-pulse ambient-circuit-pulse-${index + 1} ${index === 0 ? "ambient-circuit-pulse-always" : ""}`} d={path} pathLength="100" />
          </g>
        ))}
      </svg>
    </div>
  );
}
