import React, { useState } from "react";

interface DonutSlice { label: string; value: number; color: string; }

interface DonutChartProps {
  data: DonutSlice[];
  size?: number;
  thickness?: number;
  formatValue?: (v: number) => string;
}

function polarToXY(cx: number, cy: number, r: number, angle: number): [number, number] {
  const rad = ((angle - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const [x1, y1] = polarToXY(cx, cy, r, startAngle);
  const [x2, y2] = polarToXY(cx, cy, r, endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
}

export function DonutChart({
  data, size = 200, thickness = 36,
  formatValue = (v) => v.toLocaleString(),
}: DonutChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size / 2 - 16;

  let angle = 0;
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * 360;
    const start = angle;
    const end = angle + sweep - (sweep > 1 ? 0.8 : 0);
    angle += sweep;
    return { ...d, start, end, i };
  });

  const hov = hovered !== null ? data[hovered] : null;

  return (
    <div className="flex items-center gap-6" onMouseLeave={() => setHovered(null)}>
      <svg width={size} height={size} className="flex-shrink-0">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a30" strokeWidth={thickness} />

        {slices.map((s) => (
          <path
            key={s.i}
            d={arcPath(cx, cy, r, s.start, s.end)}
            fill="none"
            stroke={s.color}
            strokeWidth={hovered === s.i ? thickness + 6 : thickness}
            strokeLinecap="butt"
            strokeOpacity={hovered !== null && hovered !== s.i ? 0.3 : 1}
            style={{ transition: "stroke-width 0.15s, stroke-opacity 0.15s", cursor: "pointer" }}
            onMouseEnter={() => setHovered(s.i)}
          />
        ))}

        {/* Center text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#a1a1aa" fontSize={11} fontFamily="JetBrains Mono">
          {hov ? hov.label.substring(0, 12) : "Total"}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill={hov?.color ?? "#f5c842"} fontSize={14}
          fontFamily="JetBrains Mono" fontWeight={600}>
          {formatValue(hov ? hov.value : total)}
        </text>
        <text x={cx} y={cy + 28} textAnchor="middle" fill="#52525b" fontSize={10} fontFamily="JetBrains Mono">
          {hov ? ((hov.value / total) * 100).toFixed(1) + "%" : ""}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {data.map((d, i) => (
          <div key={i}
            className="flex items-center gap-2 cursor-pointer group"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-xs font-body text-ink-secondary truncate group-hover:text-ink-primary transition-colors">
              {d.label}
            </span>
            <span className="ml-auto text-xs font-mono text-ink-muted flex-shrink-0">
              {((d.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
