import { useLayoutEffect, useRef, useState } from 'react';

const ROUTE = 'M70 214 L70 168 Q70 150 88 150 L196 150 Q214 150 214 132 L214 92 Q214 74 232 74 L318 74';

/**
 * Illustrated map — no map API. The courier marker follows the SVG route
 * using getPointAtLength, driven by `t` (0 → restaurant, 1 → your door).
 */
export default function MapPlaceholder({ t = 0, label }) {
  const pathRef = useRef(null);
  const [pt, setPt] = useState({ x: 70, y: 214 });

  useLayoutEffect(() => {
    const p = pathRef.current;
    if (!p) return;
    const len = p.getTotalLength();
    const { x, y } = p.getPointAtLength(Math.min(1, Math.max(0, t)) * len);
    setPt({ x, y });
  }, [t]);

  return (
    <figure className="map" role="img" aria-label={label}>
      <svg viewBox="0 0 390 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="390" height="260" fill="var(--map-bg)" />
        {/* blocks */}
        <g fill="var(--map-block)">
          <rect x="0" y="0" width="56" height="60" rx="6" />
          <rect x="84" y="0" width="112" height="60" rx="6" />
          <rect x="0" y="88" width="56" height="48" rx="6" />
          <rect x="84" y="88" width="112" height="48" rx="6" />
          <rect x="228" y="88" width="76" height="48" rx="6" />
          <rect x="332" y="88" width="58" height="72" rx="6" />
          <rect x="228" y="164" width="76" height="96" rx="6" />
          <rect x="84" y="178" width="112" height="82" rx="6" />
          <rect x="332" y="188" width="58" height="72" rx="6" />
          <rect x="228" y="0" width="76" height="60" rx="6" />
        </g>
        {/* park + water */}
        <rect x="332" y="0" width="58" height="60" rx="6" fill="var(--map-park)" />
        <rect x="0" y="164" width="56" height="96" rx="6" fill="var(--map-park)" />
        <path d="M0 246 C60 236 120 256 180 246 S300 236 390 248 L390 260 L0 260Z" fill="var(--map-water)" />
        {/* streets */}
        <g stroke="var(--map-road)" strokeWidth="14" fill="none" strokeLinecap="round">
          <path d="M0 74 H390" />
          <path d="M0 150 H390" />
          <path d="M70 0 V260" />
          <path d="M214 0 V260" />
          <path d="M318 0 V260" />
        </g>
        {/* route */}
        <path d={ROUTE} stroke="var(--accent)" strokeOpacity=".25" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path ref={pathRef} d={ROUTE} stroke="var(--accent)" strokeWidth="3.5" strokeDasharray="1 8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* restaurant */}
        <g transform="translate(70 214)">
          <circle r="13" fill="var(--ink)" />
          <path d="M-4 -5 v4 a2 2 0 0 0 4 0 v-4 M-2 -1 v7 M3 -5 v11 M3 -5 c2 1 2.5 4 0 5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>
        {/* home */}
        <g transform="translate(318 74)">
          <circle r="16" fill="var(--accent)" fillOpacity=".18" />
          <circle r="11" fill="var(--accent)" />
          <path d="M-5 1 L0 -4 L5 1 M-3.5 0 V5 H3.5 V0" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {/* courier */}
        <g className="map-courier" style={{ transform: `translate(${pt.x}px, ${pt.y}px)` }}>
          <circle r="16" fill="var(--surface)" stroke="var(--ink)" strokeOpacity=".08" />
          <circle r="11" fill="var(--green)" />
          <circle r="3.5" fill="#fff" />
        </g>
      </svg>
      <figcaption className="map-caption">Illustrative map · demo</figcaption>
    </figure>
  );
}
