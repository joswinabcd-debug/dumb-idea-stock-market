"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { SECTORS } from "../../data/mockIdeas";
import Link from "next/link";
import {
  Search,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Award,
  Compass,
  BarChart4,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown
} from "lucide-react";

type SortOption = "popular" | "newest" | "dailyChange" | "volume" | "valuation" | "price";
type SortDir = "asc" | "desc";
type ViewTab = "browse" | "rankings";
type RankType = "gainers" | "losers" | "active" | "valuable" | "trending";

export default function IdeasFeed() {
  const { ideas, watchlist, toggleWatchlist, marketSession } = useApp();

  const [activeTab, setActiveTab] = useState<ViewTab>("browse");
  const [rankTab, setRankTab] = useState<RankType>("gainers");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("dailyChange");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [watchlistOnly, setWatchlistOnly] = useState(false);

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch =
      idea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.pitch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === "All" || idea.sector === selectedSector;
    const matchesWatchlist = !watchlistOnly || watchlist.includes(idea.id);
    return matchesSearch && matchesSector && matchesWatchlist;
  });

  const sortedIdeas = [...filteredIdeas].sort((a, b) => {
    let diff = 0;
    if (sortBy === "popular") diff = (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    else if (sortBy === "newest") diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    else if (sortBy === "dailyChange") diff = b.dailyChange - a.dailyChange;
    else if (sortBy === "volume") diff = b.volume - a.volume;
    else if (sortBy === "valuation") diff = b.valuation - a.valuation;
    else if (sortBy === "price") {
      const priceA = a.valuation / (a.sharesOutstanding || 10000);
      const priceB = b.valuation / (b.sharesOutstanding || 10000);
      diff = priceB - priceA;
    }
    return sortDir === "asc" ? -diff : diff;
  });

  const handleSort = (col: SortOption) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const rankList = (() => {
    switch (rankTab) {
      case "gainers":  return [...ideas].sort((a, b) => b.dailyChange - a.dailyChange).slice(0, 8);
      case "losers":   return [...ideas].sort((a, b) => a.dailyChange - b.dailyChange).slice(0, 8);
      case "active":   return [...ideas].sort((a, b) => b.volume - a.volume).slice(0, 8);
      case "valuable": return [...ideas].sort((a, b) => b.valuation - a.valuation).slice(0, 8);
      case "trending": return [...ideas].sort((a, b) => (b.upvotes + b.downvotes) - (a.upvotes + a.downvotes)).slice(0, 8);
    }
  })();

  const fmt = (val: number, d = 0) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: d }).format(val);

  const fmtCompact = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val.toFixed(0)}`;
  };

  const renderSortIcon = (col: SortOption) => {
    if (sortBy !== col) return <ChevronsUpDown className="h-3 w-3 text-neutral-600" />;
    return sortDir === "desc"
      ? <ChevronDown className="h-3 w-3 text-amber-400" />
      : <ChevronUp className="h-3 w-3 text-amber-400" />;
  };

  const sessionBadge = {
    "open": "text-emerald-400 bg-emerald-950/40 border-emerald-800/50",
    "pre-market": "text-amber-400 bg-amber-950/30 border-amber-800/40",
    "after-hours": "text-violet-400 bg-violet-950/30 border-violet-800/40",
    "closed": "text-neutral-400 bg-neutral-900/60 border-neutral-700/40",
  }[marketSession];

  return (
    <div className="mx-auto max-w-full px-4 py-6 sm:px-6 lg:px-8 bg-neutral-950 min-h-screen text-neutral-100">

      {/* Compact Page Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
              Simulated Nasdaq
            </span>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${sessionBadge}`}>
              {marketSession}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
            Market Catalog <span className="text-neutral-500 font-semibold text-base">({ideas.length} listings)</span>
          </h1>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1 bg-neutral-900 p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("browse")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-lg transition-all ${
              activeTab === "browse" ? "bg-white text-neutral-950" : "text-neutral-400 hover:text-white"
            }`}
          >
            <Compass className="h-3.5 w-3.5" /> Market Table
          </button>
          <button
            onClick={() => setActiveTab("rankings")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-lg transition-all ${
              activeTab === "rankings" ? "bg-white text-neutral-950" : "text-neutral-400 hover:text-white"
            }`}
          >
            <BarChart4 className="h-3.5 w-3.5" /> Leaderboards
          </button>
        </div>
      </div>

      {/* VIEW 1: MARKET TABLE */}
      {activeTab === "browse" && (
        <div className="space-y-4 animate-fade-up">

          {/* Compact Filter Bar */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-2xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Search */}
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
              <input
                type="text"
                placeholder="Search ticker, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500/50 focus:outline-none transition-colors"
              />
            </div>

            {/* Watchlist toggle */}
            <button
              onClick={() => setWatchlistOnly(!watchlistOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl border transition-all ${
                watchlistOnly
                  ? "bg-amber-500 text-neutral-950 border-amber-500"
                  : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${watchlistOnly ? "fill-neutral-950" : ""}`} />
              Watchlist
            </button>

            {/* Sector filter pills */}
            <div className="flex flex-wrap gap-1 overflow-x-auto scrollbar-none">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSector(s)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all whitespace-nowrap ${
                    selectedSector === s
                      ? "bg-amber-500 text-neutral-950 border-amber-500"
                      : "bg-neutral-950 text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <span className="text-[10px] text-neutral-500 font-mono ml-auto whitespace-nowrap">
              {sortedIdeas.length}/{ideas.length}
            </span>
          </div>

          {/* Market Table */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_2.5fr_1.2fr_auto] sm:grid-cols-[1.5fr_2.5fr_1.2fr_1fr_auto] md:grid-cols-[1.5fr_2.5fr_1.2fr_1fr_1.2fr_auto] lg:grid-cols-[1.5fr_2.5fr_1.2fr_1fr_1.2fr_1.2fr_auto] gap-0 border-b border-neutral-800 bg-neutral-950/60">
              {/* Ticker */}
              <button
                onClick={() => handleSort("price")}
                className="flex items-center gap-1 px-4 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider hover:text-neutral-300 transition-colors text-left"
              >
                Ticker / Price {renderSortIcon("price")}
              </button>
              {/* Name */}
              <div className="px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                Company
              </div>
              {/* Change */}
              <button
                onClick={() => handleSort("dailyChange")}
                className="flex items-center gap-1 px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider hover:text-neutral-300 transition-colors"
              >
                Change {renderSortIcon("dailyChange")}
              </button>
              {/* Volume */}
              <button
                onClick={() => handleSort("volume")}
                className="flex items-center gap-1 px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider hover:text-neutral-300 transition-colors hidden sm:flex"
              >
                Vol {renderSortIcon("volume")}
              </button>
              {/* Market Cap */}
              <button
                onClick={() => handleSort("valuation")}
                className="flex items-center gap-1 px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider hover:text-neutral-300 transition-colors hidden md:flex"
              >
                Mkt Cap {renderSortIcon("valuation")}
              </button>
              {/* Sector */}
              <div className="px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider hidden lg:block">
                Sector
              </div>
              {/* Actions */}
              <div className="px-4 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider text-right">
                ★
              </div>
            </div>

            {/* Table Rows */}
            {sortedIdeas.length > 0 ? (
              <div className="divide-y divide-neutral-800/60">
                {sortedIdeas.map((idea) => {
                  const price = idea.valuation / (idea.sharesOutstanding || 10000);
                  const isUp = idea.dailyChange >= 0;
                  const isWatched = watchlist.includes(idea.id);

                  return (
                    <div
                      key={idea.id}
                      className="market-row grid grid-cols-[1.5fr_2.5fr_1.2fr_auto] sm:grid-cols-[1.5fr_2.5fr_1.2fr_1fr_auto] md:grid-cols-[1.5fr_2.5fr_1.2fr_1fr_1.2fr_auto] lg:grid-cols-[1.5fr_2.5fr_1.2fr_1fr_1.2fr_1.2fr_auto] gap-0 items-center"
                    >
                      {/* Ticker + Price */}
                      <Link href={`/stock/${idea.ticker}`} className="flex flex-col px-4 py-3 group">
                        <span className="text-xs font-black font-mono text-amber-400 group-hover:text-amber-300 transition-colors tracking-wider">
                          {idea.ticker}
                        </span>
                        <span className="text-sm font-black text-white font-mono tabular-nums mt-0.5">
                          {fmt(price, 2)}
                        </span>
                      </Link>

                      {/* Company Name */}
                      <Link href={`/stock/${idea.ticker}`} className="px-3 py-3 group">
                        <span className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors block truncate">
                          {idea.name}
                        </span>
                        <span className="text-[10px] text-neutral-500 truncate block max-w-[240px]">
                          {idea.pitch.length > 55 ? idea.pitch.slice(0, 55) + "…" : idea.pitch}
                        </span>
                      </Link>

                      {/* Daily Change */}
                      <div className="px-3 py-3">
                        <span className={`inline-flex items-center gap-0.5 text-sm font-black font-mono tabular-nums ${
                          isUp ? "text-emerald-400 gain-glow" : "text-rose-400 loss-glow"
                        }`}>
                          {isUp ? <ArrowUpRight className="h-3.5 w-3.5 shrink-0" /> : <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />}
                          {isUp ? "+" : ""}{idea.dailyChange.toFixed(2)}%
                        </span>
                      </div>

                      {/* Volume */}
                      <div className="px-3 py-3 hidden sm:block">
                        <span className="text-xs font-mono tabular-nums text-neutral-300">
                          {idea.volume ? idea.volume.toLocaleString() : "—"}
                        </span>
                      </div>

                      {/* Market Cap */}
                      <div className="px-3 py-3 hidden md:block">
                        <span className="text-xs font-mono tabular-nums text-neutral-300">
                          {fmtCompact(idea.valuation)}
                        </span>
                      </div>

                      {/* Sector */}
                      <div className="px-3 py-3 hidden lg:block">
                        <span className="text-[10px] font-bold text-neutral-500 border border-neutral-800 bg-neutral-950/40 px-2 py-0.5 rounded-md">
                          {idea.sector}
                        </span>
                      </div>

                      {/* Watchlist toggle */}
                      <div className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleWatchlist(idea.id)}
                          className={`transition-all hover:scale-110 ${
                            isWatched ? "text-amber-400" : "text-neutral-700 hover:text-neutral-400"
                          }`}
                          title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          <Star className={`h-4 w-4 ${isWatched ? "fill-amber-400" : ""}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-neutral-500">
                <Search className="h-8 w-8 mx-auto mb-3 text-neutral-700" />
                <p className="font-bold text-sm text-neutral-400">No listings match your filters</p>
                <button
                  onClick={() => { setSearchTerm(""); setSelectedSector("All"); setWatchlistOnly(false); }}
                  className="mt-3 text-xs text-amber-500 hover:text-amber-400 font-bold underline underline-offset-2"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: LEADERBOARDS */}
      {activeTab === "rankings" && (
        <div className="space-y-4 animate-fade-up">

          {/* Ranking Tab Selector */}
          <div className="tile flex flex-wrap gap-1.5 bg-neutral-900 border border-neutral-800 rounded-2xl p-3">
            {([
              { id: "gainers",  label: "Top Gainers",  icon: TrendingUp,  color: "text-emerald-400" },
              { id: "losers",   label: "Top Losers",   icon: TrendingDown, color: "text-rose-400" },
              { id: "active",   label: "Most Active",  icon: Activity,    color: "text-cyan-400" },
              { id: "valuable", label: "Most Valuable", icon: Award,       color: "text-amber-400" },
              { id: "trending", label: "Trending",      icon: Flame,       color: "text-purple-400" },
            ] as { id: RankType; label: string; icon: React.ElementType; color: string }[]).map((tab) => {
              const Icon = tab.icon;
              const isActive = rankTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRankTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-black rounded-xl border transition-all ${
                    isActive
                      ? "bg-neutral-800 border-neutral-700 text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? tab.color : ""}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Rankings Table */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[30px_1.5fr_2.5fr_1fr_1.2fr] sm:grid-cols-[30px_1.5fr_2.5fr_1fr_1.2fr_1.2fr] border-b border-neutral-800 bg-neutral-950/60">
              <div className="px-4 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider">#</div>
              <div className="px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Ticker</div>
              <div className="px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Company</div>
              <div className="px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider">Price</div>
              <div className="px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider">
                {rankTab === "active" ? "Volume" : rankTab === "valuable" ? "Mkt Cap" : "Day %"}
              </div>
              <div className="px-3 py-2.5 text-[10px] font-black text-neutral-500 uppercase tracking-wider hidden sm:block">
                {rankTab === "active" ? "Mkt Cap" : "Volume"}
              </div>
            </div>

            <div className="divide-y divide-neutral-800/60">
              {rankList.map((stock, idx) => {
                const price = stock.valuation / (stock.sharesOutstanding || 10000);
                const isUp = stock.dailyChange >= 0;
                const primaryValue = rankTab === "active"
                  ? stock.volume?.toLocaleString() ?? "—"
                  : rankTab === "valuable"
                  ? fmtCompact(stock.valuation)
                  : `${isUp ? "+" : ""}${stock.dailyChange.toFixed(2)}%`;
                const secondaryValue = rankTab === "active"
                  ? fmtCompact(stock.valuation)
                  : stock.volume?.toLocaleString() ?? "—";

                return (
                  <Link
                    key={stock.id}
                    href={`/stock/${stock.ticker}`}
                    className="market-row grid grid-cols-[30px_1.5fr_2.5fr_1fr_1.2fr] sm:grid-cols-[30px_1.5fr_2.5fr_1fr_1.2fr_1.2fr] items-center group"
                  >
                    <div className="px-4 py-3 text-sm font-black text-neutral-600 font-mono tabular-nums w-10 text-center">
                      {idx + 1}
                    </div>
                    <div className="px-3 py-3">
                      <span className="text-xs font-black font-mono text-amber-400 group-hover:text-amber-300 tracking-wider transition-colors">
                        {stock.ticker}
                      </span>
                    </div>
                    <div className="px-3 py-3">
                      <span className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors block truncate">
                        {stock.name}
                      </span>
                    </div>
                    <div className="px-3 py-3">
                      <span className="text-sm font-black font-mono tabular-nums text-white">
                        {fmt(price, 2)}
                      </span>
                    </div>
                    <div className="px-3 py-3">
                      <span className={`text-sm font-black font-mono tabular-nums ${
                        rankTab !== "active" && rankTab !== "valuable"
                          ? (isUp ? "text-emerald-400 gain-glow" : "text-rose-400 loss-glow")
                          : "text-neutral-300"
                      }`}>
                        {primaryValue}
                      </span>
                    </div>
                    <div className="px-3 py-3 hidden sm:block">
                      <span className="text-xs font-mono tabular-nums text-neutral-500">
                        {secondaryValue}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
