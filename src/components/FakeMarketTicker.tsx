"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { AlertCircle } from "lucide-react";

export default function FakeMarketTicker() {
  const { news, activeEvent } = useApp();

  // Duplicate items to ensure a seamless looping marquee
  const tickerItems = [...news, ...news];

  return (
    <div className="w-full bg-neutral-900 border-b border-neutral-800 text-xs py-2 select-none relative overflow-hidden z-40">
      <div className="flex items-center">
        {/* Fixed Title Label */}
        <div className="absolute left-0 top-0 bottom-0 px-3 bg-red-600 hover:bg-red-700 font-extrabold text-white flex items-center gap-1 uppercase tracking-wider z-10 shadow-md shadow-red-950/20 text-[10px]">
          <AlertCircle className="h-3 w-3 animate-pulse" />
          <span>Live News</span>
        </div>

        {/* Scrolling Content */}
        <div className="pl-[85px] w-full overflow-hidden flex">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12 font-medium">
            {tickerItems.map((headline, idx) => (
              <span key={idx} className="inline-flex items-center gap-2 text-neutral-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-neutral-100 hover:text-amber-400 cursor-help transition-colors">
                  {headline}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Flashing Market Event notification if any */}
      {activeEvent && (
        <div className="w-full bg-amber-500 text-neutral-950 text-center py-1 font-extrabold uppercase tracking-widest text-[10px] animate-pulse flex items-center justify-center gap-1.5">
          <span>⚡ ACTIVE EVENT: {activeEvent.name} - {activeEvent.description}</span>
        </div>
      )}
    </div>
  );
}
