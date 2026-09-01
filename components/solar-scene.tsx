"use client";

import { useEffect, useRef, useState } from "react";

/* Linear interpolation between two hex colors */
function lerpColor(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) + (((pb >> 16) & 255) - ((pa >> 16) & 255)) * t);
  const g = Math.round(((pa >> 8) & 255) + (((pb >> 8) & 255) - ((pa >> 8) & 255)) * t);
  const bl = Math.round((pa & 255) + ((pb & 255) - (pa & 255)) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(media.matches);

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  return reducedMotion;
}

function formatTime(hour: number) {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

const STARS = [
  [80, 60], [190, 110], [300, 45], [420, 90], [520, 40], [640, 70],
  [760, 55], [870, 100], [140, 160], [360, 150], [560, 130], [820, 170],
  [250, 200], [700, 30], [910, 40], [40, 130],
] as const;

export default function SolarScene() {
  const [hour, setHour] = useState(10.5);
  const [playing, setPlaying] = useState(true);
  const reducedMotion = useReducedMotionPreference();
  const dragging = useRef(false);
  const pendingAnimationTime = useRef(0);

  useEffect(() => {
    if (!playing || reducedMotion) return;

    let animationFrame = 0;
    let previousTime = performance.now();

    const animate = (now: number) => {
      const delta = now - previousTime;
      previousTime = now;

      if (!dragging.current) {
        pendingAnimationTime.current += delta;
        if (pendingAnimationTime.current >= 80) {
          const elapsed = pendingAnimationTime.current;
          pendingAnimationTime.current = 0;
          setHour((h) => {
            const next = h + (elapsed / 1000) * 0.45;
            return next > 19 ? 5 : next;
          });
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [playing, reducedMotion]);

  // Daylight factor: 0 at night, 1 at solar noon
  const d = clamp(Math.sin((Math.PI * (hour - 6)) / 12), 0, 1);
  const duskiness = 4 * d * (1 - d);

  const sunX = 90 + ((hour - 5) / 14) * 780;
  const sunY = 400 - d * 300;

  const skyTop = lerpColor("#082d2c", "#0f766e", d);
  const skyHorizonBase = lerpColor("#0b3d3b", "#73b9ae", d);
  const skyHorizon = lerpColor(skyHorizonBase, "#2fa6ad", duskiness * 0.4);

  const generation = Math.round(d * 5 * 10) / 10;
  const onSolar = d > 0.12;
  const windowGlow = onSolar ? 0.16 + d * 0.3 : 0.5;
  const batteryLevel = onSolar ? 0.35 + d * 0.6 : 0.85;
  const batterySegments = Math.max(1, Math.round(batteryLevel * 4));
  const particleOpacity = reducedMotion ? 0 : d;

  // Line-work color shifts slightly lighter in daylight
  const line = lerpColor("#327975", "#95d0c5", d);
  const lineSoft = lerpColor("#245b58", "#67aaa1", d);
  const wall = lerpColor("#0c3938", "#155b57", d);
  const glass = "#082d2c";

  return (
    <div className="solar-scene-card relative overflow-hidden rounded-3xl border border-white/10 bg-night shadow-2xl shadow-black/40">
      <svg
        viewBox="0 0 960 475"
        className="solar-scene-artwork block w-full"
        role="img"
        aria-label="Animated technical illustration: the sun crosses the sky, rooftop solar panels feed an inverter and battery, and the house lights stay on from stored solar after dark"
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={skyTop} />
            <stop offset="1" stopColor={skyHorizon} />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0" stopColor="#edffad" stopOpacity="0.75" />
            <stop offset="0.4" stopColor="#d8f36a" stopOpacity="0.25" />
            <stop offset="1" stopColor="#d8f36a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="panelFace" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0e5553" />
            <stop offset="1" stopColor="#082d2c" />
          </linearGradient>
          <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <path id="energyPath" d="M 655 176 L 655 208 L 836 208 L 836 352" fill="none" />
          <path id="housePath" d="M 836 396 L 836 428 L 770 428" fill="none" />
        </defs>

        {/* Sky */}
        <rect width="990" height="592" fill="url(#sky)" />

        {/* Stars */}
        <g opacity={1 - d}>
          {STARS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} fill="#dfe4ff" opacity={0.4 + (i % 4) * 0.12} />
          ))}
          <circle cx={128} cy={88} r={16} fill="#e8ecff" opacity={0.85} />
          <circle cx={135} cy={83} r={14.5} fill={skyTop} />
        </g>

        {/* Sun */}
        <g style={{ opacity: clamp(d * 3, 0, 1) }}>
          <circle cx={sunX} cy={sunY} r={95} fill="url(#sunGlow)" />
          <circle cx={sunX} cy={sunY} r={21} fill="#edffad" />
          <circle cx={sunX} cy={sunY} r={16} fill="#d8f36a" />
        </g>

        {/* Distant skyline — simple line silhouettes */}
        <g stroke={lineSoft} strokeWidth="1.2" fill="#082d2c" opacity="0.75">
          <path d="M 20 472 V 396 H 96 V 472" />
          <path d="M 118 472 V 356 H 172 V 472" />
          <path d="M 196 472 V 412 H 286 V 472" />
          <path d="M 306 472 V 380 H 352 V 472" />
        </g>
        <g fill="#d8f36a" opacity={(1 - d) * 0.4}>
          <rect x="132" y="372" width="7" height="7" rx="1" />
          <rect x="150" y="372" width="7" height="7" rx="1" />
          <rect x="132" y="392" width="7" height="7" rx="1" />
          <rect x="318" y="396" width="6" height="6" rx="1" />
          <rect x="40" y="410" width="7" height="7" rx="1" />
        </g>

        {/* Ground */}
        {/* <rect y="472" width="960" height="88" fill={lerpColor("#062827", "#15534f", d)} />
        <line x1="0" y1="472" x2="960" y2="472" stroke={lineSoft} strokeWidth="2.5" /> */}

        {/* ---- House: architectural line-work, flat RCC roof ---- */}
        {/* Compound wall + gate hint */}
        {/* <line x1="430" y1="472" x2="530" y2="472" stroke={lineSoft} strokeWidth="1" /> */}
        {/* <path d="M 440 472 V 448 H 528" fill="none" stroke={lineSoft} strokeWidth="1.5" opacity="0.7" /> */}

        {/* Main volume */}
        <rect x="548" y="212" width="332" height="260" fill={wall} stroke={line} strokeWidth="2" />
        {/* Roof slab overhang */}
        <rect x="538" y="200" width="352" height="14" fill={wall} stroke={line} strokeWidth="2" />
        {/* Parapet railing */}
        <g stroke={line} strokeWidth="1.5">
          <line x1="548" y1="182" x2="880" y2="182" />
          {[560, 600, 640, 680, 720, 760, 800, 840, 872].map((x) => (
            <line key={x} x1={x} y1={182} x2={x} y2={200} />
          ))}
        </g>
        {/* Floor slab line */}
        <line x1="548" y1="342" x2="880" y2="342" stroke={line} strokeWidth="1.5" opacity="0.7" />

        {/* Solar array: two rows of sleek framed panels on low stands */}
        {[0, 1, 2].map((i) => {
          const px = 566 + i * 92;
          return (
            <g key={i}>
              <line x1={px + 12} y1={182} x2={px + 12} y2={158} stroke={line} strokeWidth="2" />
              <line x1={px + 64} y1={182} x2={px + 64} y2={150} stroke={line} strokeWidth="2" />
              <g transform={`rotate(-8 ${px + 15} 156)`}>
                <rect x={px} y={144} width={78} height={24} rx="2" fill="url(#panelFace)" stroke={line} strokeWidth="1.5" />
                {[13, 26, 39, 52, 65].map((ox) => (
                  <line key={ox} x1={px + ox} y1={145} x2={px + ox} y2={167} stroke={line} strokeWidth="0.6" opacity="0.7" />
                ))}
                <line x1={px + 1} y1={156} x2={px + 77} y2={156} stroke={line} strokeWidth="1" opacity="0.7" />
                <rect x={px} y={144} width={78} height={24} rx="2" fill="#d8f36a" opacity={d * 0.18} />
              </g>
            </g>
          );
        })}

        {/* Solar water heater: collector + horizontal tank, line style */}
        <g stroke={line} strokeWidth="1.5" fill="none">
          <rect x="838" y="150" width="34" height="30" rx="15" fill={wall} />
          <line x1="844" y1="180" x2="844" y2="200" />
          <line x1="866" y1="180" x2="866" y2="200" />
        </g>

        {/* Windows: slim, architectural, subtle warm glow when powered */}
        {[
          [572, 244], [660, 244], [572, 372], [660, 372], [742,244]
        ].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width={44} height={74} fill={glass} stroke={line} strokeWidth="1.5" />
            <rect x={x} y={y} width={44} height={74} fill="#d8f36a" opacity={windowGlow} />
            <line x1={x + 22} y1={y} x2={x + 22} y2={y + 74} stroke={line} strokeWidth="0.9" />
            <line x1={x} y1={y + 36} x2={x + 44} y2={y + 36} stroke={line} strokeWidth="0.9" />
            {/* sill */}
            <line x1={x - 4} y1={y + 74} x2={x + 48} y2={y + 74} stroke={line} strokeWidth="3" />
          </g>
        ))}

        {/* Balcony on first floor right
        <g stroke={line} strokeWidth="1.3" fill="none" opacity="0.85">
          <rect x="742" y="252" width="58" height="66" fill={glass} />
          <rect x="742" y="252" width="58" height="66" fill="#d8f36a" opacity={windowGlow * 0.7} />
          <line x1="771" y1="252" x2="771" y2="318" />
          <line x1="734" y1="318" x2="808" y2="318" strokeWidth="2" />
          {[742, 754, 766, 778, 790, 800].map((x) => (
            <line key={x} x1={x} y1={318} x2={x} y2={304} strokeWidth="0.9" />
          ))}
        </g> */}

        {/* Door: slim entrance with canopy */}
        <g>
          <rect x="742" y="398" width="46" height="74" fill={glass} stroke={line} strokeWidth="1.5" />
          <rect x="742" y="398" width="46" height="74" fill="#d8f36a" opacity={windowGlow * 0.45} />
          <line x1="736" y1="394" x2="794" y2="394" stroke={line} strokeWidth="2.5" />
        </g>

        {/* AC unit — small technical detail */}
        {/* <g stroke={line} strokeWidth="1.2" fill={wall} opacity="0.9">
          <rect x="562" y="322" width="26" height="14" rx="2" />
          <line x1="566" y1="326" x2="584" y2="326" />
          <line x1="566" y1="330" x2="584" y2="330" />
        </g> */}

        {/* Conduit runs */}
        <path d="M 655 182 L 655 208 L 836 208 L 836 352" fill="none" stroke={line} strokeWidth="1.8" strokeLinejoin="round" opacity="0.9" />
        <path d="M 836 396 L 836 428 L 770 428" fill="none" stroke={line} strokeWidth="1.8" strokeLinejoin="round" opacity="0.9" />

        {/* Inverter + battery wall unit */}
        <g>
          <rect x="822" y="352" width="28" height="44" rx="3" fill="#062827" stroke={line} strokeWidth="1.5" />
          <circle cx="836" cy="362" r="3" fill={onSolar ? "#d8f36a" : "#edffad"} filter="url(#softGlow)" />
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={827 + i * 5}
              y={374}
              width={3.6}
              height={9}
              rx={0.8}
              fill={i < batterySegments ? "#d8f36a" : "#1c5b57"}
            />
          ))}
          <line x1="827" y1="388" x2="845" y2="388" stroke={line} strokeWidth="0.8" opacity="0.7" />
        </g>

        {/* Energy particles: panels → inverter */}
        <g opacity={particleOpacity}>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} r="3.2" fill="#edffad" filter="url(#softGlow)">
              <animateMotion dur="2.4s" repeatCount="indefinite" begin={`${-i * 0.48}s`}>
                <mpath href="#energyPath" />
              </animateMotion>
            </circle>
          ))}
        </g>
        {/* Energy particles: inverter → house (from battery after dark) */}
        <g opacity={reducedMotion ? 0 : 0.85}>
          {[0, 1].map((i) => (
            <circle key={i} r="2.8" fill="#d8f36a" filter="url(#softGlow)">
              <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${-i * 0.9}s`}>
                <mpath href="#housePath" />
              </animateMotion>
            </circle>
          ))}
        </g>

        {/* Datasheet labels — kept inside the frame, leader lines to parts */}
        <g fontFamily="var(--font-mono)" fontSize="11" letterSpacing="0.12em" fill="#ffffff">
          <g opacity="0.8">
            <line x1="600" y1="112" x2="600" y2="140" stroke="#ffffff" strokeWidth="1" opacity="0.35" />
            <text x="600" y="102" textAnchor="middle">solar panel</text>
          </g>
          {/* <g opacity="0.8">
            <line x1="855" y1="118" x2="855" y2="146" stroke="#ffffff" strokeWidth="1" opacity="0.35" />
            <text x="872" y="108" textAnchor="end">solar water heater</text>
          </g> */}
          <g opacity="0.8">
            <line x1="812" y1="374" x2="770" y2="374" stroke="#ffffff" strokeWidth="1" opacity="0.35" />
            <text x="774" y="370" textAnchor="end">inverter</text>
            <text x="774" y="384" textAnchor="end">& battery</text>
          </g>
        </g>
      </svg>

      {/* Readout */}
      <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/15 bg-night/70 px-4 py-3 font-mono text-[11px] tracking-widest text-white/90 backdrop-blur sm:left-6 sm:top-6 sm:text-xs">
        {/* <div className="text-gold-soft">{formatTime(hour)}</div> */}
        {/* <div className="mt-1">
          GENERATING&nbsp;
          <span className="text-gold">{generation.toFixed(1)} kW</span>
        </div> */}
        <div className="mt-1 text-white/60">
          HOUSE ON {onSolar ? "SOLAR" : "BATTERY"}
        </div>
      </div>

      {/* Help text */}
      <p className="text-center font-mono text-[9px] font-bold tracking-[.16em] text-teal px-5 py-2">DRAG THE TIMELINE · WATCH THE SUN CHARGE THE HOUSE</p>

      {/* Controls */}
      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-center gap-4 border-t border-white/10 bg-dusk/60 px-5 py-3 backdrop-blur sm:px-8">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause the day cycle" : "Play the day cycle"}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-gold hover:text-gold"
        >
          {playing ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden>
              <rect width="4" height="14" rx="1" />
              <rect x="8" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden>
              <path d="M0 0l12 7-12 7z" />
            </svg>
          )}
        </button>
        <div className="mx-auto flex w-full max-w-[17rem] min-w-0 items-center gap-3">
          <span className="shrink-0 font-mono text-[10px] tracking-widest text-white/70">MORNING</span>
          <input
            type="range"
            min={5}
            max={19}
            step={0.05}
            value={hour}
            aria-label="Time of day"
            onChange={(e) => setHour(parseFloat(e.target.value))}
            onPointerDown={() => {
              dragging.current = true;
              setPlaying(false);
            }}
            onPointerUp={() => {
              dragging.current = false;
            }}
            className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-gold"
          />
          <span className="shrink-0 font-mono text-[10px] tracking-widest text-white/70">EVENING</span>
        </div>
      </div>
    </div>
  );
}
