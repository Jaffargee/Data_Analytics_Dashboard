import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface BarDatum { label: string; value: number; }

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  color?: string;
  formatValue?: (v: number) => string;
  className?: string;
}

export function BarChart({
  data, height = 200, color = "#f5c842",
  formatValue = (v) => v.toLocaleString(), className,
}: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const padL = 48, padR = 12, padT = 20, padB = 32;
  const W = 600, H = height;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const barW = Math.max(4, plotW / data.length - 4);

  // Y-axis ticks
  const ticks = 4;
  const tickVals = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        onMouseLeave={() => setHovered(null)}
      >
        {/* Grid lines */}
        {tickVals.map((t, i) => {
          const y = padT + plotH - (t / max) * plotH;
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

        {/* Bars */}
        {data.map((d, i) => {
          const x = padL + (i / data.length) * plotW + (plotW / data.length - barW) / 2;
          const barH = Math.max(2, (d.value / max) * plotH);
          const y = padT + plotH - barH;
          const isHov = hovered === i;
          return (
            <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: "pointer" }}>
              {/* Hover bg */}
              <rect
                x={padL + (i / data.length) * plotW}
                y={padT}
                width={plotW / data.length}
                height={plotH}
                fill={isHov ? "rgba(245,200,66,0.04)" : "transparent"}
                rx={2}
              />
              {/* Bar */}
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={3}
                fill={isHov ? color : color + "99"}
                style={{ transition: "fill 0.15s, y 0.4s, height 0.4s" }}
              />
              {/* Value on hover */}
              {isHov && (
                <text x={x + barW / 2} y={y - 6} textAnchor="middle"
                  fill={color} fontSize={11} fontFamily="JetBrains Mono" fontWeight={500}>
                  {formatValue(d.value)}
                </text>
              )}
              {/* X label */}
              <text
                x={x + barW / 2}
                y={padT + plotH + 16}
                textAnchor="middle"
                fill={isHov ? "#a1a1aa" : "#52525b"}
                fontSize={10}
                fontFamily="JetBrains Mono"
              >
                {d.label}
              </text>
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
