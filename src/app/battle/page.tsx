"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import FintechChart from "../../components/FintechChart";
import { Swords, Trophy, Sparkles, Vote } from "lucide-react";

export default function StartupBattle() {
  const { ideas } = useApp();

  // Selected Stock IDs
  const [stockAId, setStockAId] = useState(ideas[0]?.id || "");
  const [stockBId, setStockBId] = useState(ideas[1]?.id || "");

  // Hype votes tracking
  const [hypeVotesA, setHypeVotesA] = useState(14);
  const [hypeVotesB, setHypeVotesB] = useState(22);

  const stockA = ideas.find((i) => i.id === stockAId);
  const stockB = ideas.find((i) => i.id === stockBId);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Parody algorithmic score calculation to determine the winner
  const getSuccessScore = (idea: { valuation: number; funding: number; upvotes: number; downvotes: number; investorCount: number; riskScore: string } | undefined) => {
    if (!idea) return 0;
    const riskFactor = idea.riskScore === "Silly" ? 1.2 : idea.riskScore === "High" ? 1.5 : idea.riskScore === "Extreme" ? 1.8 : 2.2;
    const netVotes = idea.upvotes - idea.downvotes;
    
    // Completely silly calculation
    return Math.round(
      (idea.valuation * 0.1 + idea.funding * 0.3 + netVotes * 1000 + idea.investorCount * 2000) * riskFactor
    );
  };

  const scoreA = getSuccessScore(stockA);
  const scoreB = getSuccessScore(stockB);

  const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : null;

  return (
    <div className="mx-auto max-w-full px-4 py-12 sm:px-6 lg:px-8 bg-neutral-950 min-h-screen text-neutral-100 transition-colors duration-300">
      
      {/* Page Header */}
      <div className="mb-10 text-center">
        <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
          Matchup Desk
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Startup Battle Mode
        </h1>
        <p className="mt-2 text-sm text-neutral-400 max-w-lg mx-auto">
          Compare two ridiculous startup stocks side-by-side. Our proprietary algorithmic evaluator will crown the winner.
        </p>
      </div>

      {/* 1. Comparison Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center mb-10">
        {/* Selector A */}
        <div className="tile md:col-span-3 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm text-center">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
            Select Challenger A
          </label>
          <select
            value={stockAId}
            onChange={(e) => {
              setStockAId(e.target.value);
              setHypeVotesA(Math.floor(Math.random() * 20) + 5);
            }}
            className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id} disabled={idea.id === stockBId}>
                {idea.name} ({idea.ticker})
              </option>
            ))}
          </select>
        </div>

        {/* VS Divider */}
        <div className="md:col-span-1 flex justify-center py-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-neutral-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Swords className="h-6 w-6" />
          </div>
        </div>

        {/* Selector B */}
        <div className="tile md:col-span-3 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm text-center">
          <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-2">
            Select Challenger B
          </label>
          <select
            value={stockBId}
            onChange={(e) => {
              setStockBId(e.target.value);
              setHypeVotesB(Math.floor(Math.random() * 20) + 5);
            }}
            className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 px-4 text-sm text-white focus:border-amber-500 focus:outline-none"
          >
            {ideas.map((idea) => (
              <option key={idea.id} value={idea.id} disabled={idea.id === stockAId}>
                {idea.name} ({idea.ticker})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Visual Battle Arena */}
      {stockA && stockB ? (
        <div className="space-y-8">
          
          {/* Challengers Summary Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Challenger A Card */}
            <div className={`tile bg-neutral-900 border rounded-3xl p-6 relative overflow-hidden shadow-md transition-all ${
              winner === "A" 
                ? "border-amber-500 ring-2 ring-amber-500/10 shadow-amber-500/[0.02]" 
                : "border-neutral-800 opacity-80"
            }`}>
              {winner === "A" && (
                <div className="absolute top-4 right-4 bg-amber-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                  <Trophy className="h-3 w-3" /> Winner
                </div>
              )}
              <span className="text-[10px] font-black text-neutral-500 font-mono tracking-widest uppercase">{stockA.ticker}</span>
              <h2 className="text-2xl font-black text-white mt-1 leading-snug">{stockA.name}</h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed italic">&quot;{stockA.pitch}&quot;</p>

              {/* Sparkline */}
              <div className="h-16 mt-6 overflow-hidden">
                <FintechChart data={stockA.valuationHistory} height={60} showGrid={false} />
              </div>
            </div>

            {/* Challenger B Card */}
            <div className={`tile bg-neutral-900 border rounded-3xl p-6 relative overflow-hidden shadow-md transition-all ${
              winner === "B" 
                ? "border-amber-500 ring-2 ring-amber-500/10 shadow-amber-500/[0.02]" 
                : "border-neutral-800 opacity-80"
            }`}>
              {winner === "B" && (
                <div className="absolute top-4 right-4 bg-amber-500 text-neutral-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm">
                  <Trophy className="h-3 w-3" /> Winner
                </div>
              )}
              <span className="text-[10px] font-black text-neutral-500 font-mono tracking-widest uppercase">{stockB.ticker}</span>
              <h2 className="text-2xl font-black text-white mt-1 leading-snug">{stockB.name}</h2>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed italic">&quot;{stockB.pitch}&quot;</p>

              {/* Sparkline */}
              <div className="h-16 mt-6 overflow-hidden">
                <FintechChart data={stockB.valuationHistory} height={60} showGrid={false} />
              </div>
            </div>

          </div>

          {/* 3. Stat Battle breakdown */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Metrics Comparison</h3>
            </div>

            {/* Statistics comparison grid */}
            <div className="space-y-5 text-xs">
              {/* Stat 1: Valuation */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-neutral-400">
                  <span>{formatCurrency(stockA.valuation)}</span>
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Valuation</span>
                  <span>{formatCurrency(stockB.valuation)}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-neutral-950 flex overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 border-r border-neutral-900 transition-all duration-300"
                    style={{ width: `${(stockA.valuation / (stockA.valuation + stockB.valuation)) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${(stockB.valuation / (stockA.valuation + stockB.valuation)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stat 2: Capital Raised */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-neutral-400">
                  <span>{formatCurrency(stockA.funding)}</span>
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Capital Raised</span>
                  <span>{formatCurrency(stockB.funding)}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-neutral-950 flex overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 border-r border-neutral-900 transition-all duration-300"
                    style={{ width: `${((stockA.funding || 1) / ((stockA.funding || 1) + (stockB.funding || 1))) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${((stockB.funding || 1) / ((stockA.funding || 1) + (stockB.funding || 1))) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stat 3: Investors */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-neutral-400">
                  <span>{stockA.investorCount}</span>
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Backers</span>
                  <span>{stockB.investorCount}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-neutral-950 flex overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 border-r border-neutral-900 transition-all duration-300"
                    style={{ width: `${(stockA.investorCount / (stockA.investorCount + stockB.investorCount)) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${(stockB.investorCount / (stockA.investorCount + stockB.investorCount)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stat 4: Growth Rate */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-neutral-400">
                  <span>{stockA.growth}%</span>
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Traction Rate</span>
                  <span>{stockB.growth}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-neutral-950 flex overflow-hidden">
                  {/* Avoid negative dividing crashes */}
                  <div 
                    className="h-full bg-amber-500 border-r border-neutral-900 transition-all duration-300"
                    style={{ width: `${(Math.max(stockA.growth + 20, 1) / (Math.max(stockA.growth + 20, 1) + Math.max(stockB.growth + 20, 1))) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${(Math.max(stockB.growth + 20, 1) / (Math.max(stockA.growth + 20, 1) + Math.max(stockB.growth + 20, 1))) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stat 5: Upvotes */}
              <div className="space-y-2">
                <div className="flex justify-between items-center font-bold text-neutral-400">
                  <span>{stockA.upvotes}</span>
                  <span className="text-neutral-500 uppercase tracking-widest text-[10px]">Board Upvotes</span>
                  <span>{stockB.upvotes}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-neutral-950 flex overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 border-r border-neutral-900 transition-all duration-300"
                    style={{ width: `${((stockA.upvotes || 1) / ((stockA.upvotes || 1) + (stockB.upvotes || 1))) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${((stockB.upvotes || 1) / ((stockA.upvotes || 1) + (stockB.upvotes || 1))) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Interactive hypetrain voting */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl flex items-center justify-center">
                <Vote className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-white">Board Hype Vote</h4>
                <p className="text-xs text-neutral-400 mt-0.5">Which startup has the better pitch? Click to feed the hypetrain!</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setHypeVotesA(hypeVotesA + 1)}
                className="flex-grow sm:flex-grow-0 inline-flex h-9 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 text-xs font-black shadow-sm"
              >
                Hype {stockA.ticker} ({hypeVotesA})
              </button>
              
              <span className="font-extrabold text-neutral-500 text-xs">VS</span>

              <button
                onClick={() => setHypeVotesB(hypeVotesB + 1)}
                className="flex-grow sm:flex-grow-0 inline-flex h-9 items-center justify-center rounded-xl bg-purple-500 hover:bg-purple-600 text-white px-4 text-xs font-black shadow-sm"
              >
                Hype {stockB.ticker} ({hypeVotesB})
              </button>
            </div>
          </div>

        </div>
      ) : (
        <p className="text-center text-sm text-neutral-500 italic py-10">Choose two active stocks to begin comparisons.</p>
      )}

    </div>
  );
}
