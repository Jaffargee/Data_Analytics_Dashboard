import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface LineDatum { label: string; value: number; }

interface LineChartProps {
  data: LineDatum[];
  height?: number;
  color?: string;
  fillColor?: string;
  formatValue?: (v: number) => string;
  className?: string;
}

function smooth(points: [number, number][]): string {
  if (points.length < 2) return points.map(([x, y]) => `${x},${y}`).join(" L ");
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const cx = (x0 + x1) / 2;
    d += ` C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return d;
}

export function LineChart({
  data, height = 200, color = "#2dd4bf",
  formatValue = (v) => v.toLocaleString(), className,
}: LineChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;

  const padL = 54, padR = 12, padT = 20, padB = 32;
  const W = 600, H = height;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const pts: [number, number][] = data.map((d, i) => [
    padL + (i / (data.length - 1)) * plotW,
    padT + plotH - ((d.value - min) / range) * plotH,
  ]);

  const linePath = smooth(pts);
  const areaPath = linePath + ` L ${pts[pts.length - 1][0]},${padT + plotH} L ${pts[0][0]},${padT + plotH} Z`;

  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => min + (range / ticks) * i);

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}
        onMouseLeave={() => setHovered(null)}>
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {tickVals.map((t, i) => {
          const y = padT + plotH - ((t - min) / range) * plotH;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y} y2={y}
                stroke="#2a2a30" strokeWidth={1} strokeDasharray="3 4" />
              <text x={padL - 6} y={y + 4} textAnchor="end"
                fill="#71717a" fontSize={10} fontFamily="JetBrains Mono">
                {formatValue(t)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill="url(#area-grad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />

        {/* Dots & labels */}
        {pts.map(([x, y], i) => {
          const isHov = hovered === i;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: "pointer" }}>
              {/* Hover region */}
              <rect x={i === 0 ? x : pts[i - 1][0]} y={padT}
                width={i === 0 ? (pts[1]?.[0] - x) / 2 : i === pts.length - 1
                  ? (x - pts[i - 1][0]) / 2 : (pts[i + 1][0] - pts[i - 1][0]) / 2}
                height={plotH} fill="transparent" />

              {/* Dot */}
              <circle cx={x} cy={y} r={isHov ? 5 : 3}
                fill={isHov ? color : "#111113"} stroke={color} strokeWidth={2}
                style={{ transition: "r 0.1s" }} />

              {/* Tooltip */}
              {isHov && (
                <>
                  <line x1={x} x2={x} y1={padT} y2={padT + plotH}
                    stroke={color} strokeWidth={1} strokeOpacity={0.3} strokeDasharray="3 3" />
                  <rect x={x - 50} y={y - 32} width={100} height={24} rx={4}
                    fill="#18181b" stroke={color} strokeWidth={1} strokeOpacity={0.5} />
                  <text x={x} y={y - 16} textAnchor="middle"
                    fill={color} fontSize={11} fontFamily="JetBrains Mono" fontWeight={500}>
                    {formatValue(data[i].value)}
                  </text>
                </>
              )}

              {/* X label — show every Nth */}
              {(data.length <= 12 || i % Math.ceil(data.length / 10) === 0) && (
                <text x={x} y={padT + plotH + 16} textAnchor="middle"
                  fill={isHov ? "#a1a1aa" : "#52525b"} fontSize={10} fontFamily="JetBrains Mono">
                  {data[i].label}
                </text>
              )}
            </g>
          );
        })}

        {/* Baseline */}
        <line x1={padL} x2={W - padR} y1={padT + plotH} y2={padT + plotH}
          stroke="#3a3a42" strokeWidth={1} />
      </svg>
    </div>
  );
}
