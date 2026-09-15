"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import IdeaCard from "../components/IdeaCard";
import {
  ArrowRight,
  Flame,
  Swords,
  Star,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  RefreshCw,
  Gamepad2,
  ShieldAlert,
  Award
} from "lucide-react";

type RankingTab = "gainers" | "losers" | "volume" | "trending" | "movers";

export default function Home() {
  const { ideas, watchlist, news, league, marketSession } = useApp();
  const [activeRankTab, setActiveRankTab] = useState<RankingTab>("gainers");

  const totalMarketCap = ideas.reduce((sum, item) => sum + item.valuation, 0);
  const totalStocks = ideas.length;
  const totalTradesCount = ideas.reduce((sum, item) => sum + item.investorCount, 0) + 342;
  const gainers = ideas.filter(i => i.dailyChange > 0).length;
  const losers = ideas.filter(i => i.dailyChange < 0).length;
  const avgChange = ideas.reduce((s, i) => s + i.dailyChange, 0) / (ideas.length || 1);

  const formatCurrency = (val: number, maxDigits = 0) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: maxDigits }).format(val);

  const fmtCompact = (val: number) => {
    if (val >= 1_000_000_000) return `$${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  const watchlistIdeas = useMemo(() => ideas.filter(i => watchlist.includes(i.id)), [ideas, watchlist]);
  const topGainers   = useMemo(() => [...ideas].sort((a, b) => b.dailyChange - a.dailyChange).slice(0, 6), [ideas]);
  const topLosers    = useMemo(() => [...ideas].sort((a, b) => a.dailyChange - b.dailyChange).slice(0, 6), [ideas]);
  const mostActive   = useMemo(() => [...ideas].sort((a, b) => b.volume - a.volume).slice(0, 6), [ideas]);
  const trendingStocks = useMemo(() => [...ideas].sort((a, b) => (b.upvotes + b.downvotes + b.investorCount) - (a.upvotes + a.downvotes + a.investorCount)).slice(0, 6), [ideas]);
  const biggestMovers  = useMemo(() => [...ideas].sort((a, b) => Math.abs(b.dailyChange) - Math.abs(a.dailyChange)).slice(0, 6), [ideas]);

  const activeRankingList = useMemo(() => {
    switch (activeRankTab) {
      case "gainers":  return topGainers;
      case "losers":   return topLosers;
      case "volume":   return mostActive;
      case "trending": return trendingStocks;
      case "movers":   return biggestMovers;
      default: return topGainers;
    }
  }, [activeRankTab, topGainers, topLosers, mostActive, trendingStocks, biggestMovers]);

  const activityFeedItems = useMemo(() => {
    const items: { id: string; type: string; text: string; time: string; color: string }[] = [];
    league.matches.slice(0, 3).forEach((match, idx) => {
      let text = `⚽ ${match.homeTeamName} vs ${match.awayTeamName}`;
      if (match.result === "homeWin") text += ` — ${match.homeTeamName} wins`;
      else if (match.result === "awayWin") text += ` — ${match.awayTeamName} wins`;
      else if (match.result === "draw") text += ` — Draw`;
      items.push({ id: `match-${idx}`, type: "MATCH", text, time: "Just Now", color: "text-violet-300 border-violet-900/30 bg-violet-950/20" });
    });
    news.slice(0, 2).forEach((headline, idx) => {
      items.push({ id: `news-${idx}`, type: "NEWS", text: `📰 ${headline}`, time: "5m ago", color: "text-amber-300 border-amber-900/30 bg-amber-950/10" });
    });
    const mockNames = ["VC_Chad", "Lori_Greener", "Mark_Puban", "RetailDave", "FOMOQueen", "BullTrader"];
    ideas.slice(0, 5).forEach((idea, idx) => {
      const name = mockNames[idx % mockNames.length];
      const isBuy = idx % 2 === 0;
      const size = Math.floor(3000 + idx * 800);
      const orderPrice = idea.valuation / (idea.sharesOutstanding || 10000);
      const val = size * orderPrice;
      items.push({
        id: `trade-${idx}`,
        type: isBuy ? "BUY" : "SELL",
        text: isBuy
          ? `🐳 @${name} bought ${size.toLocaleString()} ${idea.ticker} @ ${formatCurrency(orderPrice, 2)} · ${fmtCompact(val)}`
          : `⚡ @${name} sold ${size.toLocaleString()} ${idea.ticker} @ ${formatCurrency(orderPrice, 2)} · ${fmtCompact(val)}`,
        time: `${idx * 2 + 1}m ago`,
        color: isBuy ? "text-emerald-300 border-emerald-900/30 bg-emerald-950/10" : "text-rose-300 border-rose-900/30 bg-rose-950/10"
      });
    });
    return items;
  }, [league.matches, news, ideas]);

  const sessionColor = {
    "open":        "text-emerald-400 bg-emerald-950/40 border-emerald-800/50",
    "pre-market":  "text-amber-400 bg-amber-950/30 border-amber-800/40",
    "after-hours": "text-violet-400 bg-violet-950/30 border-violet-800/40",
    "closed":      "text-neutral-400 bg-neutral-900/60 border-neutral-700/40",
  }[marketSession];

  const marketingFeatures = [
    { title: "Market Manipulation Welcome",  description: "Upvote to pump valuations or coordinate short squeezes on grandmothers.", icon: Flame,      color: "text-purple-400 bg-purple-950/20 border-purple-900/30" },
    { title: "0% Real Equity, 100% Fun",     description: "Completely simulated shares. Track profits and losses in real-time.", icon: ShieldAlert, color: "text-red-400 bg-red-950/20 border-red-900/30" },
    { title: "Global Venture Indexes",       description: "Simulated catalog reacts to random global events and viral Tik Toks.", icon: Award,       color: "text-cyan-400 bg-cyan-950/20 border-cyan-900/30" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-neutral-100 relative">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-8 sm:pt-20 sm:pb-12 border-b border-neutral-900/60 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.05),transparent_60%)]">
        {/* CSS Tech Grid Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.25] pointer-events-none" />

        {/* Extra Ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-amber-500/5 blur-[120px] animate-pulse-glow" />
          <div className="absolute top-12 right-1/4 w-96 h-96 rounded-full bg-emerald-500/4 blur-[140px]" />
        </div>

        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Badge row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-[10px] font-black text-amber-400 uppercase tracking-widest animate-fade-in shadow-inner">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Simulated NASDAQ V2.0
            </span>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${sessionColor}`}>
              {marketSession}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] max-w-4xl bg-gradient-to-b from-white via-neutral-100 to-neutral-500 bg-clip-text text-transparent">
            The World&apos;s First{" "}
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Dumb Idea Stock Exchange
            </span>
            .
          </h1>

          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed font-medium">
            Trade shares of absurd business pitches. Short the Smart Fork, hold the Cloud Pet Rock — grow your $10,000 portfolio before the next crash.
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/ideas" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 px-6 text-xs font-black shadow-lg shadow-white/5 transition-all hover:scale-[1.02] border border-white">
              Open Trading Desk <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/portfolio" className="inline-flex h-10 items-center rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 px-6 text-xs font-bold transition-all hover:scale-[1.02] text-neutral-200">
              View Portfolio
            </Link>
          </div>

          {/* ── Bloomberg-style stat strip ───────────────────────────── */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Market Cap",    value: fmtCompact(totalMarketCap), sub: "simulated",      accent: "text-white", border: "border-neutral-800/80 hover:border-neutral-700 bg-neutral-900/30" },
              { label: "Listed Stocks", value: `${totalStocks}`,           sub: "SEC listed",     accent: "text-amber-400", border: "border-amber-900/30 hover:border-amber-800/40 bg-amber-950/5" },
              { label: "Investors",     value: `${totalTradesCount.toLocaleString()}`,     sub: "total positions", accent: "text-white", border: "border-neutral-800/80 hover:border-neutral-700 bg-neutral-900/30" },
              { label: "Gainers",       value: `${gainers}`,               sub: "↑ today",        accent: "text-emerald-400", border: "border-emerald-900/30 hover:border-emerald-800/40 bg-emerald-950/5" },
              { label: "Losers",        value: `${losers}`,                sub: "↓ today",        accent: "text-rose-400", border: "border-rose-900/30 hover:border-rose-800/40 bg-rose-950/5" },
              { label: "Avg Change",    value: `${avgChange >= 0 ? "+" : ""}${avgChange.toFixed(2)}%`, sub: "mkt avg", accent: avgChange >= 0 ? "text-emerald-400" : "text-rose-400", border: avgChange >= 0 ? "border-emerald-900/30 hover:border-emerald-800/40 bg-emerald-950/5" : "border-rose-900/30 hover:border-rose-800/40 bg-rose-950/5" },
            ].map(stat => (
              <div key={stat.label} className={`stat-tile border rounded-2xl px-4 py-3 transition-all duration-200 ${stat.border}`}>
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block">{stat.label}</span>
                <span className={`text-xl font-black font-mono tabular-nums leading-none mt-1.5 block ${stat.accent}`}>{stat.value}</span>
                <span className="text-[9px] text-neutral-600 font-mono mt-0.5 block">{stat.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MARKET TERMINAL + LIVE FEED ─────────────────────────────── */}
      <section className="py-12 max-w-full mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section label */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Exchange Console</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left col (2/3) — Rankings + Watchlist */}
          <div className="lg:col-span-2 space-y-6">

            {/* Watchlist */}
            {watchlistIdeas.length > 0 && (
              <div className="tile bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="flex items-center justify-between px-5 py-3 bg-neutral-900/40 border-b border-neutral-800">
                  <h2 className="text-xs font-black text-white flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" /> Watchlist
                  </h2>
                  <Link href="/ideas" className="text-[10px] text-amber-500 hover:text-amber-400 font-bold transition-colors">
                    Manage Board →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y divide-neutral-800/60 border-neutral-800/60">
                  {watchlistIdeas.slice(0, 6).map((stock) => {
                    const price = stock.valuation / (stock.sharesOutstanding || 10000);
                    const isUp = stock.growth >= 0;
                    return (
                      <Link key={stock.id} href={`/stock/${stock.ticker}`}
                        className="px-4 py-3.5 hover:bg-neutral-850/40 transition-colors group flex flex-col justify-between min-h-[76px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black font-mono text-amber-400 tracking-wider group-hover:text-amber-300 transition-colors">{stock.ticker}</span>
                          <span className={`text-[10px] font-black font-mono tabular-nums flex items-center gap-0.5 ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                            {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            {isUp ? "+" : ""}{stock.growth}%
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-sm font-black text-white block font-mono tabular-nums">{formatCurrency(price, 2)}</span>
                          <span className="text-[9px] text-neutral-500 truncate block mt-0.5">{stock.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Rankings Terminal */}
            <div className="tile bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-neutral-850 px-5 py-3 bg-neutral-900/40 gap-3">
                <h2 className="text-xs font-black text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-500" /> Market Dashboard
                </h2>
                <div className="flex flex-wrap gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-850">
                  {([
                    { id: "gainers",  label: "Gainers" },
                    { id: "losers",   label: "Losers" },
                    { id: "volume",   label: "Active" },
                    { id: "trending", label: "Trending" },
                    { id: "movers",   label: "Movers" },
                  ] as { id: RankingTab; label: string }[]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveRankTab(tab.id)}
                      className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                        activeRankTab === tab.id
                          ? "bg-neutral-800 text-white shadow-sm"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rankings Table */}
              <div className="divide-y divide-neutral-800/60 bg-neutral-900/20">
                {activeRankingList.map((stock, idx) => {
                  const price = stock.valuation / (stock.sharesOutstanding || 10000);
                  const isUp = stock.dailyChange >= 0;
                  return (
                    <Link key={stock.id} href={`/stock/${stock.ticker}`}
                      className="market-row grid grid-cols-[auto_1fr_auto] items-center px-5 py-3 group border-neutral-800/50">
                      <span className="text-[10px] text-neutral-600 font-mono w-6 font-bold">{idx + 1}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-black font-mono text-amber-400 tracking-wider shrink-0">{stock.ticker}</span>
                        <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors truncate">{stock.name}</span>
                      </div>
                      <div className="text-right font-mono tabular-nums ml-4">
                        <span className="text-sm font-black text-white block">{formatCurrency(price, 2)}</span>
                        <span className={`text-[10px] font-black flex items-center gap-0.5 justify-end mt-0.5 ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                          {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {isUp ? "+" : ""}{stock.dailyChange.toFixed(2)}%
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="px-5 py-3 border-t border-neutral-850 text-center bg-neutral-900/10">
                <Link href="/ideas" className="text-[10px] text-amber-500 hover:text-amber-400 font-black uppercase tracking-wider transition-colors">
                  View Full Market Table →
                </Link>
              </div>
            </div>
          </div>

          {/* Right col (1/3) — Live Feed */}
          <div className="tile bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[520px]">
            <div className="flex items-center justify-between px-5 py-3 bg-neutral-900/40 border-b border-neutral-800">
              <h2 className="text-xs font-black text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500 animate-pulse fill-amber-500" /> Live Feed
              </h2>
              <span className="text-[8px] font-black text-neutral-500 tracking-wider flex items-center gap-1.5 bg-neutral-950 px-2 py-1 rounded-lg border border-neutral-850">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" /> STREAMING
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40 bg-neutral-950/10">
              {activityFeedItems.map((item) => (
                <div key={item.id} className={`px-5 py-3.5 border-l-2 transition-all hover:bg-neutral-850/10 ${
                  item.type === "BUY" ? "border-emerald-700 bg-emerald-950/5" :
                  item.type === "SELL" ? "border-rose-700 bg-rose-950/5" :
                  item.type === "NEWS" ? "border-amber-700 bg-amber-950/5" : "border-violet-700 bg-violet-950/5"
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      item.type === "BUY" ? "text-emerald-400 bg-emerald-950/50 border border-emerald-900/30" :
                      item.type === "SELL" ? "text-rose-400 bg-rose-950/50 border border-rose-900/30" :
                      item.type === "NEWS" ? "text-amber-400 bg-amber-950/50 border border-amber-900/30" : "text-violet-400 bg-violet-950/50 border border-violet-900/30"
                    }`}>{item.type}</span>
                    <span className="text-[9px] font-mono text-neutral-500">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed font-semibold font-sans">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURES STRIP ──────────────────────────────────────────── */}
      <section className="py-14 border-y border-neutral-900/80 bg-neutral-900/10 backdrop-blur-sm relative overflow-hidden">
        {/* Subtle grid elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.02),transparent_40%)]" />
        
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-950/30 px-3 py-1 rounded-full border border-amber-900/30">Parody Venture Rules</span>
            <p className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">Engineered to Lose Pretend Capital</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {marketingFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="stat-tile rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950/80 p-6 flex gap-4 items-start shadow-md hover:shadow-lg">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-inner ${feat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{feat.title}</h3>
                    <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed font-medium">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CALLOUTS ────────────────────────────────────────────────── */}
      <section className="py-12 max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="tile rounded-3xl border border-neutral-800/80 bg-gradient-to-b from-neutral-900/80 to-neutral-950 p-7 flex items-start gap-5 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
            <div className="h-10 w-10 shrink-0 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl flex items-center justify-center shadow-inner">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">Startup Comparison Mode</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-medium">Compare two stocks side-by-side. See who dominates in our custom battles!</p>
              <Link href="/battle" className="inline-flex items-center gap-1 text-xs font-black text-amber-400 hover:text-amber-300 mt-4 transition-colors">
                Enter Battle Mode <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="tile rounded-3xl border border-neutral-800/80 bg-gradient-to-b from-neutral-900/80 to-neutral-950 p-7 flex items-start gap-5 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500" />
            <div className="h-10 w-10 shrink-0 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-xl flex items-center justify-center shadow-inner">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">The Startup Playground</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-medium">Auto-generate ridiculous startups and pitch them to Mark Puban &amp; Kevin O&apos;Jeery!</p>
              <Link href="/playground" className="inline-flex items-center gap-1 text-xs font-black text-purple-400 hover:text-purple-300 mt-4 transition-colors">
                Visit Sandbox <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED STOCKS ─────────────────────────────────────────── */}
      <section className="py-12 max-w-full mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-neutral-900/80">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Top Picks</span>
            <p className="mt-1.5 text-2xl font-black text-white tracking-tight">Market Leaders</p>
          </div>
          <Link href="/ideas" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-550 hover:text-amber-400 transition-colors bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2 hover:bg-neutral-850 shadow-sm">
            Full Board <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ideas.slice(0, 3).map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      </section>

    </div>
  );
}
