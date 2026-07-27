type Point = { x: number; y: number };

const panelTopLeft: Point = { x: 640, y: 300 };
const panelTopRight: Point = { x: 835, y: 320 };
const panelBottomLeft: Point = { x: 620, y: 402 };
const panelBottomRight: Point = { x: 820, y: 422 };
const interpolate = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const panelColumns = Array.from({ length: 4 }, (_, index) => {
  const t = (index + 1) / 5;
  return [interpolate(panelTopLeft, panelTopRight, t), interpolate(panelBottomLeft, panelBottomRight, t)];
});
const panelRows = Array.from({ length: 2 }, (_, index) => {
  const t = (index + 1) / 3;
  return [interpolate(panelTopLeft, panelBottomLeft, t), interpolate(panelTopRight, panelBottomRight, t)];
});

export function SolarFlowAnimation() {
  return <div className="solar-flow" aria-hidden="true"><svg viewBox="0 0 1200 600" role="presentation" preserveAspectRatio="xMidYMid slice">
    <defs><linearGradient id="flow-panel" x1="0" x2="5" y1="0" y2="100"><stop offset="0" stopColor="#0c4560" /><stop offset=".55" stopColor="#176d86" /><stop offset="1" stopColor="#2fa6ad" /></linearGradient><linearGradient id="panel-glint" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffffff" stopOpacity=".05" /><stop offset=".42" stopColor="#fffde0" stopOpacity=".75" /><stop offset=".58" stopColor="#ffffff" stopOpacity=".3" /><stop offset="1" stopColor="#ffffff" stopOpacity=".04" /></linearGradient><radialGradient id="bulb-glass" cx="35%" cy="25%" r="75%"><stop offset="0" stopColor="#fff9a6" /><stop offset=".55" stopColor="#f5dc4c" /><stop offset="1" stopColor="#e9bd20" /></radialGradient><linearGradient id="bulb-socket" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#55c4d0" /><stop offset="1" stopColor="#11758e" /></linearGradient><filter id="flow-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="12" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter><filter id="sun-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
    <g className="flow-sun" filter="url(#sun-glow)"><circle cx="125" cy="125" r="60" fill="#f8ff75" /><circle cx="125" cy="125" r="78" fill="none" stroke="#f5ee6b" strokeOpacity=".35" strokeWidth="20" strokeDasharray="12 20" strokeLinejoin="round" /></g>
    <g className="flow-rays" fill="none" stroke="#caad43" strokeLinecap="round" strokeWidth="7"><path d="M185 117C300 140 470 240 707 357" /><path d="M180 151C300 190 480 280 747 387" /></g>
    <path d="M720 412C713 438 710 465 725 486C742 510 780 512 825 512C875 512 925 510 962 494C985 484 1000 466 1015 454" fill="none" stroke="#167477" strokeWidth="12" strokeLinecap="round" />
    <path className="flow-electricity" d="M720 412C713 438 710 465 725 486C742 510 780 512 825 512C875 512 925 510 962 494C985 484 1000 466 1015 454" fill="none" stroke="#d9f56b" strokeWidth="4" strokeLinecap="round" pathLength="1" strokeDasharray=".08 .12" filter="url(#flow-glow)" />
    <g className="flow-panel">
  {/* Panel */}
  <path
    id="panel"
    d="M640 300L835 320L820 422L620 402Z"
    fill="url(#flow-panel)"
    stroke="#86c7c2"
    strokeWidth="4"
  />

  {/* Mathematically interpolated grid: 5 equal columns and 3 equal rows. */}
  <g stroke="#b9e9de" strokeOpacity=".65" strokeWidth="2.5">
    {panelColumns.map(([top, bottom], index) => <line key={`column-${index}`} x1={top.x} y1={top.y} x2={bottom.x} y2={bottom.y} />)}
    {panelRows.map(([left, right], index) => <line key={`row-${index}`} x1={left.x} y1={left.y} x2={right.x} y2={right.y} />)}
  </g>

  {/* Legs */}
  <path
    d="M680 406V522M790 417V522"
    stroke="#739a9a"
    strokeWidth="10"
  />

  {/* Base */}
  <path
    d="M650 526H820"
    stroke="#557b7d"
    strokeWidth="8"
    strokeLinecap="round"
  />

  {/* Soft glass reflection */}
  <path
    d="M642 301L837 321"
    stroke="url(#panel-glint)"
    strokeOpacity=".9"
    strokeWidth="7"
    strokeLinecap="round"
  />
</g>
<g className="flow-house">
  <path
    d="M970 330L1063 252L1158 330V454H970Z"
    fill="#f7f8f2"
    stroke="#a8cec1"
    strokeWidth="4"
  />

  <path
    d="M950 332L1063 238L1178 332"
    fill="none"
    stroke="#d9f56b"
    strokeWidth="9"
    strokeLinecap="round"
    strokeLinejoin="round"
  />

  <rect
    className="flow-window-frame"
    x="1025"
    y="340"
    width="76"
    height="74"
    rx="8"
    fill="#071d20"
    stroke="#a8cec1"
    strokeWidth="5"
  />

  {/* Hanging bulb */}
  <g className="flow-bulb">

    {/* wire */}
    <line
      x1="1063"
      y1="340"
      x2="1063"
      y2="356"
      stroke="#61767d"
      strokeWidth="2"
    />

    {/* socket */}
    <rect
      x="1058"
      y="356"
      width="10"
      height="8"
      rx="2"
      fill="url(#bulb-socket)"
    />

    {/* glow */}
    <circle
      cx="1063"
      cy="381"
      r="18"
      fill="url(#bulb-glow)"
      opacity=".45"
      filter="url(#flow-glow)"
    />

    {/* bulb */}
    <g transform="translate(1063 381) rotate(180) scale(.65) translate(-1063 -381)">

      <path
        d="M1063 360C1048 360 1037 371 1037 386C1037 398 1044 406 1050 411C1054 414 1055 417 1055 420H1071C1071 417 1072 414 1076 411C1082 406 1089 398 1089 386C1089 371 1078 360 1063 360Z"
        fill="url(#bulb-glass)"
      />

      <ellipse
        cx="1054"
        cy="374"
        rx="5"
        ry="8"
        fill="#fffde0"
        opacity=".7"
        transform="rotate(35 1054 374)"
      />

      <path
        d="M1058 392Q1063 387 1068 392M1058 392V399M1068 392V399"
        stroke="#8c5617"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />

    </g>

  </g>

  <rect
    x="971"
    y="458"
    width="187"
    height="8"
    rx="4"
    fill="#d9f56b"
  />
</g>  </svg></div>;
}
