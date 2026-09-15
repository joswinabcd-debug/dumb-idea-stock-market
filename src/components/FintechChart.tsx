"use client";

import React, { useId } from "react";

interface FintechChartProps {
  data: number[];
  height?: number;
  showGrid?: boolean;
  type?: "valuation" | "funding" | "investor" | "popularity" | "votes";
}

export default function FintechChart({
  data,
  height = 160,
  showGrid = true,
  type = "valuation",
}: FintechChartProps) {
  const baseId = useId();
  
  if (!data || data.length < 2) return null;

  // Determine trend: positive/negative
  const first = data[0];
  const last = data[data.length - 1];
  const isUp = last >= first;
  const strokeColor = isUp ? "#22c55e" : "#ef4444"; // Emerald green vs Rose red
  const gradientId = `grad-${baseId}`;
  const glowId = `glow-${baseId}`;

  // Find min and max for scaling
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  // Render dimensions
  const paddingX = 10;
  const paddingY = 15;
  const svgWidth = 500;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Map points to SVG coordinates
  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * chartWidth;
    // Invert Y because SVG coordinates start from top-left (0,0)
    const y = paddingY + chartHeight - ((val - minVal) / valRange) * chartHeight;
    return { x, y, value: val };
  });

  // Assemble path string
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    pathD += ` L ${points[i].x} ${points[i].y}`;
  }

  // Assemble fill path string (area under the line)
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const formatValue = (val: number) => {
    if (type === "valuation" || type === "funding") {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
      return `$${val}`;
    }
    if (type === "investor" || type === "votes") {
      if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
      return `${val}`;
    }
    return `${val}%`; // Popularity
  };

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${svgWidth} ${height}`} className="w-full overflow-visible">
        <defs>
          {/* Neon Glow Filter */}
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Area under line Gradient */}
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. Gridlines */}
        {showGrid && (
          <g stroke="#27272a" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.5">
            {/* Horizontal lines */}
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} />
            <line x1={paddingX} y1={paddingY + chartHeight * 0.33} x2={svgWidth - paddingX} y2={paddingY + chartHeight * 0.33} />
            <line x1={paddingX} y1={paddingY + chartHeight * 0.66} x2={svgWidth - paddingX} y2={paddingY + chartHeight * 0.66} />
            <line x1={paddingX} y1={height - paddingY} x2={svgWidth - paddingX} y2={height - paddingY} />

            {/* Vertical markers */}
            {points.map((pt, idx) => {
              if (idx === 0 || idx === points.length - 1 || idx % 3 !== 0) return null;
              return (
                <line
                  key={idx}
                  x1={pt.x}
                  y1={paddingY}
                  x2={pt.x}
                  y2={height - paddingY}
                  opacity="0.3"
                />
              );
            })}
          </g>
        )}

        {/* 2. Area under curve */}
        <path d={fillD} fill={`url(#${gradientId})`} />

        {/* 3. Stroke line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${glowId})`}
        />

        {/* 4. Dots at endpoints */}
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={strokeColor} />

        {/* 5. Axis Labels */}
        {showGrid && (
          <g fill="#71717a" className="text-[10px] font-semibold font-mono select-none" opacity="0.8">
            {/* Min value (bottom right) */}
            <text x={svgWidth - paddingX} y={height - 4} textAnchor="end">
              {formatValue(minVal)} (Min)
            </text>
            {/* Max value (top left) */}
            <text x={paddingX} y={paddingY - 4}>
              {formatValue(maxVal)} (Max)
            </text>
            {/* Current value (right on endpoint) */}
            <text x={svgWidth - paddingX} y={points[points.length - 1].y - 8} textAnchor="end" fill={strokeColor} className="font-extrabold">
              {formatValue(last)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
