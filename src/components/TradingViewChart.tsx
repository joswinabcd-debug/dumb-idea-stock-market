"use client";

import React, { useState, useMemo, useRef } from "react";
import { LineChart } from "lucide-react";

interface TradingViewChartProps {
  history1D: number[];
  history1W: number[];
  history1M: number[];
  history3M: number[];
  history1Y: number[];
  historyAll: number[];
  volumeHistory: number[];
}

type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";
type ChartMode = "line" | "candles";

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  x: number;
  yOpen: number;
  yClose: number;
  yHigh: number;
  yLow: number;
  isUp: boolean;
  rawOpen: number;
  rawHigh: number;
  rawLow: number;
  rawClose: number;
}

export default function TradingViewChart({
  history1D,
  history1W,
  history1M,
  history3M,
  history1Y,
  historyAll,
  volumeHistory,
}: TradingViewChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1M");
  const [chartMode, setChartMode] = useState<ChartMode>("line");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map timeframe to appropriate data slice
  const priceData = useMemo(() => {
    switch (timeframe) {
      case "1D":
        return history1D || [];
      case "1W":
        return history1W || [];
      case "1M":
        return history1M || [];
      case "3M":
        return history3M || [];
      case "1Y":
        return history1Y || [];
      case "ALL":
        return historyAll || [];
      default:
        return history1M || [];
    }
  }, [timeframe, history1D, history1W, history1M, history3M, history1Y, historyAll]);

  // Determine volume data for the timeframe
  const volumeData = useMemo(() => {
    const len = priceData.length;
    if (len === 0) return [];
    const seed = volumeHistory.length > 0 ? volumeHistory[0] : 10000;
    const vols: number[] = [];
    for (let i = 0; i < len; i++) {
      const histVol = volumeHistory[i % volumeHistory.length] || seed;
      // Deterministic noise using sin so render stays pure
      const noise = 0.7 + (Math.sin(i * 2.399) * 0.5 + 0.5) * 0.6;
      vols.push(Math.floor(histVol * noise));
    }
    return vols;
  }, [priceData, volumeHistory]);

  const maxPrice = priceData.length > 0 ? Math.max(...priceData) : 100;
  const minPrice = priceData.length > 0 ? Math.min(...priceData) : 0;
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = volumeData.length > 0 ? Math.max(...volumeData) : 100;

  // Trends
  const firstPrice = priceData[0] || 0;
  const lastPrice = priceData[priceData.length - 1] || 0;
  const isUp = lastPrice >= firstPrice;
  const priceChange = lastPrice - firstPrice;
  const percentChange = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  // Chart configuration
  const height = 240;
  const svgWidth = 600;
  const paddingX = 20;
  const paddingY = 20;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Map points to SVG coordinates for line mode
  const points = useMemo(() => {
    if (priceData.length === 0) return [];
    const denominator = priceData.length - 1 || 1;
    return priceData.map((val, idx) => {
      const x = paddingX + (idx / denominator) * chartWidth;
      const y = paddingY + chartHeight - ((val - minPrice) / priceRange) * chartHeight;
      return { x, y, value: val };
    });
  }, [priceData, minPrice, priceRange, chartWidth, chartHeight]);

  // SVG Line path
  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  }, [points]);

  // Area under path
  const fillD = useMemo(() => {
    if (points.length < 2) return "";
    return `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
  }, [points, pathD]);

  // Generate Candlestick bars (Target around 18-24 bars)
  const candles = useMemo<Candle[]>(() => {
    if (priceData.length === 0) return [];
    
    // Choose how many candles to render based on data size
    const targetCount = Math.min(priceData.length, 20);
    const chunkSize = Math.max(1, Math.floor(priceData.length / targetCount));
    const result: Candle[] = [];

    for (let c = 0; c < targetCount; c++) {
      const startIdx = c * chunkSize;
      let endIdx = (c + 1) * chunkSize;
      if (c === targetCount - 1) {
        endIdx = priceData.length;
      }
      if (startIdx >= priceData.length) break;

      const subSlice = priceData.slice(startIdx, endIdx);
      if (subSlice.length === 0) continue;

      const cOpen = subSlice[0];
      const cClose = subSlice[subSlice.length - 1];
      const cHigh = Math.max(...subSlice);
      const cLow = Math.min(...subSlice);

      const x = paddingX + (c / (targetCount - 1)) * chartWidth;
      const yOpen = paddingY + chartHeight - ((cOpen - minPrice) / priceRange) * chartHeight;
      const yClose = paddingY + chartHeight - ((cClose - minPrice) / priceRange) * chartHeight;
      const yHigh = paddingY + chartHeight - ((cHigh - minPrice) / priceRange) * chartHeight;
      const yLow = paddingY + chartHeight - ((cLow - minPrice) / priceRange) * chartHeight;

      result.push({
        open: yOpen,
        high: yHigh,
        low: yLow,
        close: yClose,
        x,
        yOpen,
        yClose,
        yHigh,
        yLow,
        isUp: cClose >= cOpen,
        rawOpen: cOpen,
        rawHigh: cHigh,
        rawLow: cLow,
        rawClose: cClose,
      });
    }

    return result;
  }, [priceData, minPrice, priceRange, chartWidth, chartHeight]);

  // Calculate volatility
  const volatilityPct = useMemo(() => {
    if (priceData.length < 2) return 0;
    const mean = priceData.reduce((s, v) => s + v, 0) / priceData.length;
    const variance = priceData.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / priceData.length;
    const stdDev = Math.sqrt(variance);
    return Math.round((stdDev / mean) * 1000) / 10;
  }, [priceData]);

  // Hover detection
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current || priceData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const hoverX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    
    if (chartMode === "candles") {
      let nearestIdx = 0;
      let minDiff = Infinity;
      candles.forEach((candle, idx) => {
        const diff = Math.abs(candle.x - hoverX);
        if (diff < minDiff) {
          minDiff = diff;
          nearestIdx = idx;
        }
      });
      setHoverIndex(nearestIdx);
    } else {
      let nearestIdx = 0;
      let minDiff = Infinity;
      points.forEach((pt, idx) => {
        const diff = Math.abs(pt.x - hoverX);
        if (diff < minDiff) {
          minDiff = diff;
          nearestIdx = idx;
        }
      });
      setHoverIndex(nearestIdx);
    }
  };

  const activeIndex = hoverIndex !== null ? hoverIndex : (chartMode === "candles" ? candles.length - 1 : points.length - 1);

  // Active prices depending on line vs candlestick
  const activeCandle = chartMode === "candles" ? candles[activeIndex] : null;
  const activePrice = activeCandle ? activeCandle.rawClose : (points[activeIndex]?.value || lastPrice);
  const activeVolume = volumeData[activeIndex] || 0;

  const strokeColor = isUp ? "#22c55e" : "#ef4444";
  const gradientId = "chart-gradient";
  const glowId = "chart-glow";

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div ref={containerRef} className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          {chartMode === "candles" && activeCandle ? (
            <div className="space-y-1.5">
              <div className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight font-mono">
                {formatCurrency(activeCandle.rawClose)}
              </div>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] font-bold font-mono text-neutral-400">
                <span className={activeCandle.rawClose >= activeCandle.rawOpen ? "text-emerald-400" : "text-rose-400"}>
                  {activeCandle.rawClose >= activeCandle.rawOpen ? "Bullish Candle" : "Bearish Candle"}
                </span>
                <span>O: <span className="text-white">{formatCurrency(activeCandle.rawOpen)}</span></span>
                <span>H: <span className="text-emerald-400">{formatCurrency(activeCandle.rawHigh)}</span></span>
                <span>L: <span className="text-rose-400">{formatCurrency(activeCandle.rawLow)}</span></span>
                <span>C: <span className="text-white">{formatCurrency(activeCandle.rawClose)}</span></span>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white leading-none tracking-tight font-mono">
                {formatCurrency(activePrice)}
              </div>
              <div className={`mt-2 flex items-center gap-1 text-xs font-black font-mono ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                <span>{isUp ? "▲" : "▼"}</span>
                <span>{formatCurrency(Math.abs(priceChange))} ({isUp ? "+" : ""}{percentChange.toFixed(2)}%)</span>
                <span className="text-neutral-500 font-bold ml-1 uppercase">{timeframe}</span>
              </div>
            </div>
          )}
        </div>

        {/* Volatility Badge */}
        <div className="text-left sm:text-right shrink-0">
          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
            Volatility index
          </div>
          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-lg text-xs font-bold border border-amber-900/30 bg-amber-950/20 text-amber-400">
            {volatilityPct > 8 ? "Extreme" : volatilityPct > 4 ? "High" : "Standard"} ({volatilityPct}%)
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${svgWidth} ${height}`}
          className="w-full overflow-visible select-none cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
            </linearGradient>
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          <g stroke="#27272a" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3">
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} />
            <line x1={paddingX} y1={paddingY + chartHeight * 0.33} x2={svgWidth - paddingX} y2={paddingY + chartHeight * 0.33} />
            <line x1={paddingX} y1={paddingY + chartHeight * 0.66} x2={svgWidth - paddingX} y2={paddingY + chartHeight * 0.66} />
            <line x1={paddingX} y1={height - paddingY} x2={svgWidth - paddingX} y2={height - paddingY} />
          </g>

          {/* Volume Bars at Bottom */}
          <g fill="#27272a" opacity="0.2">
            {volumeData.map((vol, idx) => {
              const count = chartMode === "candles" ? candles.length : volumeData.length;
              const denominator = volumeData.length - 1 || 1;
              const x = paddingX + (idx / denominator) * chartWidth;
              const barWidth = Math.max(chartWidth / count - 2, 1);
              const barHeight = (vol / maxVolume) * 40; // cap volume height to 40px
              const y = height - paddingY - barHeight;
              return (
                <rect
                  key={idx}
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="0.5"
                />
              );
            })}
          </g>

          {/* Render Line Chart Mode */}
          {chartMode === "line" && points.length >= 2 && (
            <>
              <path d={fillD} fill={`url(#${gradientId})`} />
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${glowId})`}
              />
            </>
          )}

          {/* Render Candlestick Chart Mode */}
          {chartMode === "candles" && (
            <g>
              {candles.map((candle, idx) => {
                const wickColor = candle.isUp ? "#22c55e" : "#ef4444";
                const bodyWidth = Math.max((chartWidth / candles.length) * 0.65, 3);
                const bodyHeight = Math.max(Math.abs(candle.yOpen - candle.yClose), 1.5);
                const bodyY = Math.min(candle.yOpen, candle.yClose);
                const isHovered = hoverIndex === idx;

                return (
                  <g key={idx} className="transition-opacity duration-200">
                    {/* Shadow line (High to Low) */}
                    <line
                      x1={candle.x}
                      y1={candle.yHigh}
                      x2={candle.x}
                      y2={candle.yLow}
                      stroke={wickColor}
                      strokeWidth="1.5"
                    />
                    {/* Candle body */}
                    <rect
                      x={candle.x - bodyWidth / 2}
                      y={bodyY}
                      width={bodyWidth}
                      height={bodyHeight}
                      fill={wickColor}
                      stroke={wickColor}
                      strokeWidth="1"
                      className={`transition-all ${isHovered ? "brightness-125 stroke-white" : ""}`}
                      rx="1"
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Interactive Hover Vertical Tracker Line */}
          {hoverIndex !== null && (
            <g>
              {chartMode === "line" && points[activeIndex] && (
                <>
                  <line
                    x1={points[activeIndex].x}
                    y1={paddingY}
                    x2={points[activeIndex].x}
                    y2={height - paddingY}
                    stroke="#3f3f46"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={points[activeIndex].x}
                    cy={points[activeIndex].y}
                    r="5"
                    fill={strokeColor}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                </>
              )}
              {chartMode === "candles" && candles[activeIndex] && (
                <line
                  x1={candles[activeIndex].x}
                  y1={paddingY}
                  x2={candles[activeIndex].x}
                  y2={height - paddingY}
                  stroke="#3f3f46"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
            </g>
          )}

          {/* Text Labels */}
          <g fill="#71717a" className="text-[9px] font-bold font-mono" opacity="0.75">
            <text x={paddingX} y={paddingY - 5}>
              {formatCurrency(maxPrice)}
            </text>
            <text x={paddingX} y={height - paddingY + 12}>
              {formatCurrency(minPrice)}
            </text>
            <text x={svgWidth - paddingX} y={height - paddingY + 12} textAnchor="end">
              Vol: {activeVolume.toLocaleString()}
            </text>
          </g>
        </svg>
      </div>

      {/* Timeframe Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-neutral-800 pt-3 gap-2">
        <div className="flex gap-4 items-center">
          {/* Timeframe selector */}
          <div className="flex gap-1 bg-neutral-950 p-1 rounded-2xl border border-neutral-800">
            {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  setHoverIndex(null);
                }}
                className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${
                  timeframe === tf
                    ? "bg-white text-neutral-950 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="flex gap-1 bg-neutral-950 p-1 rounded-2xl border border-neutral-800">
            <button
              onClick={() => {
                setChartMode("line");
                setHoverIndex(null);
              }}
              className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${
                chartMode === "line"
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => {
                setChartMode("candles");
                setHoverIndex(null);
              }}
              className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all ${
                chartMode === "candles"
                  ? "bg-white text-neutral-950 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              Candlesticks
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-bold uppercase">
          <LineChart className="h-3.5 w-3.5 text-neutral-600" />
          <span>Interactive terminal chart</span>
        </div>
      </div>
    </div>
  );
}
