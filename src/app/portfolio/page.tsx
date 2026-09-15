"use client";

import React from "react";
import { useApp } from "../../context/AppContext";
import FintechChart from "../../components/FintechChart";
import Link from "next/link";
import { 
  Trophy, 
  Target, 
  ArrowUpRight, 
  ArrowDownRight, 
  Briefcase,
  PieChart,
  HelpCircle,
  CheckCircle,
  Lock
} from "lucide-react";

export default function PortfolioDashboard() {
  const { wallet, ideas, achievements, dailyChallenges } = useApp();

  // Compute stats
  const totalEquity = Object.entries(wallet.investments).reduce((sum, [id, holding]) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return sum;
    const currentPrice = idea.valuation / (idea.sharesOutstanding || 10000);
    return sum + holding.shares * currentPrice;
  }, 0);

  const netWorth = wallet.balance + totalEquity;
  const initialFunds = 10000;
  
  // Realized and Unrealized totals
  const totalRealizedGL = Object.values(wallet.investments).reduce((sum, holding) => {
    return sum + (holding.realizedGL || 0);
  }, 0);

  const totalCostBasis = Object.entries(wallet.investments).reduce((sum, [, holding]) => {
    return sum + holding.shares * holding.avgBuyPrice;
  }, 0);
  
  const totalUnrealizedGL = totalEquity - totalCostBasis;

  const totalPL = netWorth - initialFunds;
  const plPercentage = (totalPL / initialFunds) * 100;
  const plIsUp = totalPL >= 0;

  const formatCurrency = (val: number, maxDigits: number = 2) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: maxDigits,
    }).format(val);
  };

  // Compile holdings list
  const holdingsList = Object.entries(wallet.investments)
    .map(([id, holding]) => {
      const idea = ideas.find((i) => i.id === id);
      if (!idea) return null;

      const currentPrice = idea.valuation / (idea.sharesOutstanding || 10000);
      const marketValue = holding.shares * currentPrice;
      const holdingCost = holding.shares * holding.avgBuyPrice;
      const unrealizedProfit = holding.shares > 0 ? marketValue - holdingCost : 0;
      const returnPct = holding.avgBuyPrice > 0 ? (unrealizedProfit / holdingCost) * 100 : 0;
      const realizedProfit = holding.realizedGL || 0;

      return {
        id,
        name: idea.name,
        ticker: idea.ticker,
        sector: idea.sector || "Uncategorized",
        category: idea.category || "Uncategorized",
        shares: holding.shares,
        avgBuyPrice: holding.avgBuyPrice,
        currentPrice,
        marketValue,
        unrealizedProfit,
        realizedProfit,
        returnPct,
      };
    })
    .filter(Boolean) as {
      id: string;
      name: string;
      ticker: string;
      sector: string;
      category: string;
      shares: number;
      avgBuyPrice: number;
      currentPrice: number;
      marketValue: number;
      unrealizedProfit: number;
      realizedProfit: number;
      returnPct: number;
    }[];

  // Filter list of holdings actually owned (shares > 0)
  const activeHoldings = holdingsList.filter(h => h.shares > 0);

  // Find best and worst performer
  let bestPerformer = null;
  let worstPerformer = null;

  if (activeHoldings.length > 0) {
    const sortedByReturn = [...activeHoldings].sort((a, b) => b.unrealizedProfit - a.unrealizedProfit);
    bestPerformer = sortedByReturn[0];
    worstPerformer = sortedByReturn[sortedByReturn.length - 1];
    
    if (sortedByReturn.length === 1) {
      worstPerformer = null;
    }
  }

  // Sector Allocation Donut Slices
  const sectorAllocation = activeHoldings.reduce((acc, h) => {
    acc[h.sector] = (acc[h.sector] || 0) + h.marketValue;
    return acc;
  }, {} as Record<string, number>);

  const totalHoldingValue = (Object.values(sectorAllocation) as number[]).reduce((sum, v) => sum + v, 0);

  const colors = [
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#3b82f6"  // blue
  ];

  let cumulativePercent = 0;
  const donutSlices = (Object.entries(sectorAllocation) as [string, number][]).map(([sector, val], idx) => {
    const percent = totalHoldingValue > 0 ? val / totalHoldingValue : 0;
    const strokeDasharray = `${percent * 314.16} 314.16`;
    const strokeDashoffset = `${-cumulativePercent * 314.16}`;
    cumulativePercent += percent;
    const color = colors[idx % colors.length];

    return {
      sector,
      val,
      percent,
      strokeDasharray,
      strokeDashoffset,
      color
    };
  });

  // Simulated Portfolio History Track
  const portfolioHistory = [
    9800, 9920, 10050, 9780, 10120, 10010, 10240, 10180, 10420, netWorth
  ];

  return (
    <div className="mx-auto max-w-full px-4 py-12 sm:px-6 lg:px-8 bg-neutral-950 min-h-screen text-neutral-100 transition-colors duration-300">
      
      {/* 1. Header Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
        
        {/* Net Worth Summary */}
        <div className="tile bg-neutral-900/80 backdrop-blur-md border border-neutral-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between h-56 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
              Net Portfolio Value
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-2 leading-none font-mono tracking-tight">
              {formatCurrency(netWorth)}
            </h1>
            
            <div className="mt-3 flex items-center gap-1.5 text-sm font-bold">
              <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 border ${
                plIsUp 
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30" 
                  : "bg-red-950/40 text-red-400 border-red-900/30"
              }`}>
                {plIsUp ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                <span className="font-mono">{plIsUp ? "+" : ""}{formatCurrency(totalPL)} ({plIsUp ? "+" : ""}{plPercentage.toFixed(2)}%)</span>
              </span>
              <span className="text-neutral-500 text-xs">Total Returns</span>
            </div>
          </div>

          <div className="border-t border-neutral-800/60 pt-4 flex justify-between text-xs text-neutral-400 font-mono">
            <div>
              <span className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Available Cash</span>
              <span className="font-extrabold text-white">{formatCurrency(wallet.balance)}</span>
            </div>
            <div className="text-center">
              <span className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Unrealized P/L</span>
              <span className={`font-extrabold ${totalUnrealizedGL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalUnrealizedGL >= 0 ? "+" : ""}{formatCurrency(totalUnrealizedGL)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] text-neutral-500 font-bold uppercase tracking-wider">Realized Profit</span>
              <span className={`font-extrabold ${totalRealizedGL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalRealizedGL >= 0 ? "+" : ""}{formatCurrency(totalRealizedGL)}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Area Chart */}
        <div className="tile lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm h-56 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              Historical Portfolio Value
            </span>
            <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              10 TICK WINDOW
            </span>
          </div>
          <div className="flex-grow h-28 overflow-hidden relative">
            <FintechChart data={portfolioHistory} height={110} showGrid={false} />
          </div>
        </div>

      </div>

      {/* 2. Allocation & Holdings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-10">
        
        {/* Holdings Table Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-amber-500" />
                <h2 className="text-lg font-black text-white">Venture Holdings</h2>
              </div>
              <span className="text-[9px] text-neutral-500 font-mono font-bold uppercase">
                {activeHoldings.length} Active Positions
              </span>
            </div>

            {holdingsList.length > 0 ? (
              <div className="overflow-x-auto scrollbar-none">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-neutral-800 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pr-2">Startup Asset</th>
                      <th className="pb-3 pr-2 text-right">Shares Owned</th>
                      <th className="pb-3 pr-2 text-right">Avg Cost</th>
                      <th className="pb-3 pr-2 text-right">Market Price</th>
                      <th className="pb-3 pr-2 text-right">Unrealized P/L</th>
                      <th className="pb-3 text-right">Realized P/L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-850">
                    {holdingsList.map((h) => {
                      const returnIsUp = h.unrealizedProfit >= 0;
                      const realizedIsUp = h.realizedProfit >= 0;
                      return (
                        <tr key={h.id} className="hover:bg-neutral-850/30 transition-colors">
                          <td className="py-3.5 pr-2">
                            <Link href={`/stock/${h.ticker}`} className="group block">
                              <span className="font-extrabold text-white group-hover:text-amber-400 block transition-colors text-sm">
                                {h.name}
                              </span>
                              <span className="text-[9px] text-neutral-500 font-mono tracking-wider">
                                {h.ticker} · {h.sector}
                              </span>
                            </Link>
                          </td>
                          <td className="py-3.5 pr-2 text-right font-mono font-semibold text-neutral-300">
                            {h.shares.toFixed(4)}
                          </td>
                          <td className="py-3.5 pr-2 text-right font-mono text-neutral-400">
                            {h.shares > 0 ? formatCurrency(h.avgBuyPrice) : "-"}
                          </td>
                          <td className="py-3.5 pr-2 text-right font-mono text-neutral-300">
                            {formatCurrency(h.currentPrice)}
                          </td>
                          <td className={`py-3.5 pr-2 text-right font-mono font-bold ${returnIsUp ? "text-emerald-400" : "text-rose-400"}`}>
                            {h.shares > 0 ? (
                              <div className="flex flex-col items-end">
                                <span className="block text-xs">
                                  {returnIsUp ? "+" : ""}{formatCurrency(h.unrealizedProfit)}
                                </span>
                                <span className="text-[9px] font-normal block mt-0.5">
                                  {returnIsUp ? "+" : ""}{h.returnPct.toFixed(1)}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-neutral-600 font-normal">Closed</span>
                            )}
                          </td>
                          <td className={`py-3.5 text-right font-mono font-bold ${realizedIsUp ? "text-emerald-400" : "text-rose-400"}`}>
                            {h.realizedProfit !== 0 ? (
                              <span className="text-xs">{realizedIsUp ? "+" : ""}{formatCurrency(h.realizedProfit)}</span>
                            ) : (
                              <span className="text-neutral-605 font-normal">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-neutral-500 italic">You don&apos;t own any startup stocks yet.</p>
                <Link
                  href="/ideas"
                  className="mt-4 inline-flex h-9 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 px-4 text-xs font-bold transition-all hover:scale-[1.01]"
                >
                  Browse Market Catalog
                </Link>
              </div>
            )}
          </div>

          {/* Best/Worst Performers Stats */}
          {activeHoldings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Best performer */}
              {bestPerformer && (
                <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block font-mono">
                      Top Performer (Unrealized)
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1 leading-none">
                      {bestPerformer.name} ({bestPerformer.ticker})
                    </h4>
                    <span className="text-xs text-neutral-400 block mt-2">
                      Total gain: <strong className="text-emerald-400 font-black">+{formatCurrency(bestPerformer.unrealizedProfit)}</strong>
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-950/20 text-emerald-400 flex items-center justify-center border border-emerald-900/30">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              )}

              {/* Worst performer */}
              {worstPerformer ? (
                <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block font-mono">
                      Lowest Performer (Unrealized)
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1 leading-none">
                      {worstPerformer.name} ({worstPerformer.ticker})
                    </h4>
                    <span className="text-xs text-neutral-400 block mt-2">
                      Total loss: <strong className="text-rose-400 font-black">{formatCurrency(worstPerformer.unrealizedProfit)}</strong>
                    </span>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-rose-950/20 text-rose-400 flex items-center justify-center border border-rose-900/30">
                    <ArrowDownRight className="h-5 w-5" />
                  </div>
                </div>
              ) : activeHoldings.length > 0 ? (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-sm flex items-center justify-between opacity-55">
                  <div>
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block font-mono">
                      Diversification
                    </span>
                    <p className="text-xs text-neutral-400 mt-2">Own multiple bad startups to map portfolio diversity.</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-500 flex items-center justify-center">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Sidebar: Slices Allocation, Challenges & Achievements */}
        <div className="space-y-6">
          
          {/* Allocation Donut Chart */}
          {activeHoldings.length > 0 && (
            <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-800">
                <PieChart className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-white">Sector Allocation</h3>
              </div>

              {/* Donut Draw */}
              <div className="relative py-2">
                <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto transform -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="transparent" stroke="#1f1f23" strokeWidth="12" />
                  {donutSlices.map((slice, idx) => (
                    <circle
                      key={idx}
                      cx="60"
                      cy="60"
                      r="50"
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth="12"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  ))}
                </svg>
                {/* Total Value inside Center */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-wider leading-none">Total Assets</span>
                  <span className="text-[11px] font-black text-white mt-1 leading-none font-mono">
                    {formatCurrency(totalHoldingValue, 0)}
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/60 max-h-36 overflow-y-auto pr-1">
                {donutSlices.map((slice, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                      <span className="text-neutral-350 font-semibold truncate max-w-[90px]" title={slice.sector}>
                        {slice.sector}
                      </span>
                    </div>
                    <span className="font-mono text-neutral-450 font-semibold">
                      {Math.round(slice.percent * 100)}% ({formatCurrency(slice.val, 0)})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Challenges */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-amber-500" />
              <h3 className="text-base font-extrabold text-white">Daily Challenges</h3>
            </div>

            <div className="space-y-4">
              {dailyChallenges.map((challenge) => {
                const percentage = Math.min((challenge.current / challenge.target) * 100, 100);
                return (
                  <div key={challenge.id} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-neutral-300">{challenge.description}</span>
                      <span className="font-mono text-neutral-500">
                        {challenge.completed ? (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle className="h-3.5 w-3.5 inline" /> Completed
                          </span>
                        ) : (
                          `${Math.round(challenge.current)}/${challenge.target}`
                        )}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-950 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          challenge.completed ? "bg-emerald-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />
              <h3 className="text-base font-extrabold text-white">Achievements</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  title={`${ach.title}: ${ach.description}`}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all relative group cursor-help ${
                    ach.unlocked
                      ? "border-amber-500/40 bg-amber-500/5 text-white"
                      : "border-neutral-800 bg-neutral-950 text-neutral-600"
                  }`}
                >
                  {ach.unlocked ? (
                    <Trophy className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-neutral-700" />
                  )}
                  <span className="text-[8px] font-black uppercase tracking-wider line-clamp-1">
                    {ach.title}
                  </span>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 w-48 hidden group-hover:block bg-neutral-950 text-neutral-200 border border-neutral-800 text-[10px] rounded-xl p-2 z-50 text-left">
                    <span className="font-extrabold block text-white">{ach.title}</span>
                    <span className="text-neutral-400 block mt-1">{ach.description}</span>
                    {ach.unlocked && ach.unlockedAt && (
                      <span className="text-emerald-500 block mt-1 font-mono text-[9px]">
                        Unlocked: {new Date(ach.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
