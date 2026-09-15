"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import TradingViewChart from "../../../components/TradingViewChart";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Send,
  Trophy,
  Swords,
  AlertTriangle,
  BookmarkCheck,
  Activity,
  Layers,
  ArrowDownUp
} from "lucide-react";

export default function StockDetailPageByTicker() {
  const { ticker } = useParams() as { ticker: string };
  const {
    ideas,
    wallet,
    watchlist,
    toggleWatchlist,
    marketSession,
    upvoteIdea,
    downvoteIdea,
    buyStock,
    sellStock,
    addComment,
    news,
    league
  } = useApp();

  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [tradeError, setTradeError] = useState("");
  const [tradeSuccess, setTradeSuccess] = useState("");

  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  // Look up idea by ticker (case-insensitive)
  const idea = useMemo(() => {
    if (!ticker) return undefined;
    return ideas.find((i) => i.ticker.toUpperCase() === ticker.toUpperCase());
  }, [ideas, ticker]);

  const sharePrice = idea ? idea.valuation / (idea.sharesOutstanding || 10000) : 0;
  const dailyChangeIsUp = idea ? idea.dailyChange >= 0 : false;
  const isWatched = idea ? watchlist.includes(idea.id) : false;

  // Position variables
  const userHolding = idea ? wallet.investments[idea.id] || { shares: 0, avgBuyPrice: 0, realizedGL: 0 } : { shares: 0, avgBuyPrice: 0, realizedGL: 0 };
  const currentHoldingValue = userHolding.shares * sharePrice;
  const holdingCostBasis = userHolding.shares * userHolding.avgBuyPrice;
  const unrealizedGL = userHolding.shares > 0 ? currentHoldingValue - holdingCostBasis : 0;
  const returnPercentage = userHolding.avgBuyPrice > 0 ? (unrealizedGL / holdingCostBasis) * 100 : 0;
  const realizedGL = userHolding.realizedGL || 0;

  // Standings position
  const sortedStandings = useMemo(() => [...league.standings].sort((a, b) => b.points - a.points), [league.standings]);
  const standingsIdx = idea ? sortedStandings.findIndex((s) => s.ideaId === idea.id) : -1;
  const leaguePosition = standingsIdx >= 0 ? standingsIdx + 1 : "-";
  const teamStats = idea ? sortedStandings.find((s) => s.ideaId === idea.id) : undefined;

  // Calculate Win Streak
  const winStreak = useMemo(() => {
    if (!idea) return 0;
    const finishedMatches = league.matches
      .filter((m) => m.result !== "pending" && !m.isUserMatch && (m.homeTeamId === idea.id || m.awayTeamId === idea.id))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    let streak = 0;
    for (const match of finishedMatches) {
      const isHome = match.homeTeamId === idea.id;
      if ((match.result === "homeWin" && isHome) || (match.result === "awayWin" && !isHome)) {
        streak++;
      } else if (match.result === "draw") {
        // Draw breaks streak or keeps it? Usually breaks win streak
        break;
      } else {
        break;
      }
    }
    return streak;
  }, [league.matches, idea]);

  // Order Book math
  let spreadPct = 0.001;
  if (marketSession === "pre-market") spreadPct = 0.003;
  else if (marketSession === "after-hours") spreadPct = 0.002;
  else if (marketSession === "closed") spreadPct = 0.005;

  const bidPrice = sharePrice * (1 - spreadPct);
  const askPrice = sharePrice * (1 + spreadPct);
  const spreadValue = askPrice - bidPrice;

  // Stable, pseudo-random order book levels derived from price
  const buyOrders = useMemo(() => {
    if (!idea) return [];
    return Array.from({ length: 5 }, (_, i) => {
      const priceOffset = (i + 1) * (sharePrice * 0.0006);
      const orderPrice = bidPrice - priceOffset;
      const size = Math.floor((8000 - i * 1200) * (0.85 + Math.sin(i * 1.5 + sharePrice) * 0.15));
      return { price: orderPrice, size, total: orderPrice * size };
    });
  }, [sharePrice, bidPrice, idea]);

  const sellOrders = useMemo(() => {
    if (!idea) return [];
    return Array.from({ length: 5 }, (_, i) => {
      const priceOffset = (i + 1) * (sharePrice * 0.0006);
      const orderPrice = askPrice + priceOffset;
      const size = Math.floor((7500 - i * 1100) * (0.85 + Math.cos(i * 1.5 + sharePrice) * 0.15));
      return { price: orderPrice, size, total: orderPrice * size };
    });
  }, [sharePrice, askPrice, idea]);

  // Filter specific news
  const matchingNews = useMemo(() => {
    if (!idea) return [];
    return news.filter(
      (headline) =>
        headline.toLowerCase().includes(idea.name.toLowerCase()) ||
        headline.toLowerCase().includes(`(${idea.ticker})`) ||
        headline.toLowerCase().includes(idea.ticker.toLowerCase())
    );
  }, [news, idea]);

  // Filter matches
  const matchingMatches = useMemo(() => {
    if (!idea) return [];
    return league.matches.filter(
      (m) => m.homeTeamId === idea.id || m.awayTeamId === idea.id
    );
  }, [league.matches, idea]);

  if (!ticker || !idea) {
    const displayTicker = (ticker || "").toUpperCase();
    return (
      <div className="mx-auto max-w-full px-4 py-32 text-center text-neutral-400 min-h-screen bg-neutral-950">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Startup Stock Not Found</h2>
        <p className="mt-2 text-sm">The ticker symbol &quot;{displayTicker}&quot; does not exist on our simulated exchange.</p>
        <Link href="/ideas" className="mt-6 inline-flex h-10 items-center justify-center rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 px-6 font-bold text-xs">
          Return to Market Catalog
        </Link>
      </div>
    );
  }

  const formatCurrency = (val: number, maxDigits: number = 2) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: maxDigits,
    }).format(val);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "Silly": return "bg-green-950/40 text-green-400 border-green-900/30";
      case "High": return "bg-orange-950/40 text-orange-400 border-orange-900/30";
      case "Extreme": return "bg-red-950/40 text-red-400 border-red-900/30";
      case "Memetic": return "bg-purple-950/40 text-purple-400 border-purple-900/30 animate-pulse";
      default: return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  const handleBuy = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError("");
    setTradeSuccess("");
    const cash = Number(buyAmount);
    if (isNaN(cash) || cash <= 0) {
      setTradeError("Enter a valid purchase amount.");
      return;
    }
    if (wallet.balance < cash) {
      setTradeError("Insufficient cash balance.");
      return;
    }
    const ok = buyStock(idea.id, cash);
    if (ok) {
      setTradeSuccess(`Successfully bought ${(cash / askPrice).toFixed(4)} shares of ${idea.ticker}!`);
      setBuyAmount("");
    } else {
      setTradeError("Failed to purchase stock.");
    }
  };

  const handleSell = (e: React.FormEvent) => {
    e.preventDefault();
    setTradeError("");
    setTradeSuccess("");
    const sharesToSell = Number(sellAmount);
    if (isNaN(sharesToSell) || sharesToSell <= 0) {
      setTradeError("Enter a valid share count.");
      return;
    }
    if (userHolding.shares < sharesToSell) {
      setTradeError("You do not own that many shares.");
      return;
    }
    const ok = sellStock(idea.id, sharesToSell);
    if (ok) {
      setTradeSuccess(`Successfully sold ${sharesToSell.toFixed(4)} shares of ${idea.ticker}!`);
      setSellAmount("");
    } else {
      setTradeError("Failed to sell stock.");
    }
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(idea.id, commentAuthor.trim() || "AnonymousTrader", commentText);
    setCommentText("");
  };

  return (
    <div className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8 bg-neutral-950 text-neutral-100 min-h-screen">
      {/* 1. Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/ideas"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Markets
        </Link>

        {/* Watchlist Toggle */}
        <button
          onClick={() => toggleWatchlist(idea.id)}
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl border text-xs font-extrabold transition-all hover:scale-[1.02] ${
            isWatched
              ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
              : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
          }`}
        >
          <Star className={`h-4 w-4 ${isWatched ? "fill-amber-400 text-amber-400" : ""}`} />
          {isWatched ? "Watched" : "Add to Watchlist"}
        </button>
      </div>

      {/* 2. Stock Header Banner */}
      <div className="border-b border-neutral-900 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black font-mono text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded-md tracking-wider border border-neutral-800">
              {idea.ticker}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getRiskColor(idea.riskScore)}`}>
              {idea.riskScore} Risk
            </span>
            <span className="text-xs font-bold text-neutral-500 border border-neutral-900 px-2 py-0.5 rounded-md bg-neutral-900/40">
              Sector: {idea.sector}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-3 leading-tight tracking-tight">
            {idea.name}
          </h1>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl font-medium">
            {idea.pitch}
          </p>
        </div>

        {/* Price & Change Widget */}
        <div className="text-left md:text-right shrink-0">
          <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
            Current Price
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-white mt-1 leading-none">
            {formatCurrency(sharePrice)}
          </div>
          <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-xl border ${
            dailyChangeIsUp
              ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
              : "bg-red-950/20 text-red-400 border-red-900/30"
          }`}>
            <span>{dailyChangeIsUp ? "▲" : "▼"}</span>
            <span>{dailyChangeIsUp ? "+" : ""}{idea.dailyChange.toFixed(2)}%</span>
            <span className="text-[9px] text-neutral-500 font-bold ml-0.5">TODAY</span>
          </div>
        </div>
      </div>

      {/* 3. Core Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Charts, Stats, News, Matches) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* A. TradingView Chart */}
          <TradingViewChart
            history1D={idea.history1D}
            history1W={idea.history1W}
            history1M={idea.history1M}
            history3M={idea.history3M}
            history1Y={idea.history1Y}
            historyAll={idea.historyAll}
            volumeHistory={idea.volumeHistory}
          />

          {/* Order Book Panel */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-black text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" /> Order Book
            </h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Buy Orders (Bids) */}
              <div className="space-y-2">
                <div className="grid grid-cols-[1.2fr_1.2fr_1fr] gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest px-1">
                  <span>Bid Price</span>
                  <span className="text-right">Size (Shares)</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="space-y-1">
                  {buyOrders.map((ord, idx) => (
                    <div key={idx} className="grid grid-cols-[1.2fr_1.2fr_1fr] gap-2 items-center text-xs font-mono py-1.5 px-2 bg-emerald-950/5 rounded-xl border border-emerald-900/5 hover:bg-emerald-950/10 transition-colors">
                      <span className="text-emerald-400 font-bold">{formatCurrency(ord.price)}</span>
                      <span className="text-neutral-350 text-right">{ord.size.toLocaleString()}</span>
                      <span className="text-neutral-500 text-right">{formatCurrency(ord.total, 0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sell Orders (Asks) */}
              <div className="space-y-2">
                <div className="grid grid-cols-[1.2fr_1.2fr_1fr] gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest px-1">
                  <span>Ask Price</span>
                  <span className="text-right">Size (Shares)</span>
                  <span className="text-right">Total</span>
                </div>
                <div className="space-y-1">
                  {sellOrders.map((ord, idx) => (
                    <div key={idx} className="grid grid-cols-[1.2fr_1.2fr_1fr] gap-2 items-center text-xs font-mono py-1.5 px-2 bg-rose-950/5 rounded-xl border border-rose-900/5 hover:bg-rose-950/10 transition-colors">
                      <span className="text-rose-400 font-bold">{formatCurrency(ord.price)}</span>
                      <span className="text-neutral-350 text-right">{ord.size.toLocaleString()}</span>
                      <span className="text-neutral-500 text-right">{formatCurrency(ord.total, 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spread Stats Banner */}
            <div className="mt-4 flex flex-wrap justify-between items-center gap-4 bg-neutral-950 p-4 rounded-2xl border border-neutral-850 text-xs font-mono">
              <div className="flex gap-4">
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">Bid Price</span>
                  <span className="text-white font-extrabold">{formatCurrency(bidPrice)}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">Ask Price</span>
                  <span className="text-white font-extrabold">{formatCurrency(askPrice)}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">Spread Value / Pct</span>
                <span className="text-amber-500 font-extrabold">
                  {formatCurrency(spreadValue)} ({(spreadPct * 100).toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {/* B. Overview & Pitch Deck */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
              <BookmarkCheck className="h-5 w-5 text-amber-500" /> Company Overview
            </h2>
            <div className="space-y-3 text-sm text-neutral-300 leading-relaxed font-semibold italic">
              &quot;{idea.description}&quot;
            </div>

            {/* Target Funding progress bar */}
            <div className="pt-3 space-y-2 border-t border-neutral-800/60 mt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-500">Seed Funding Progress:</span>
                <span className="font-mono font-extrabold text-white">
                  {formatCurrency(idea.funding, 0)} / {formatCurrency(idea.targetFunding, 0)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-neutral-950 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                  style={{ width: `${Math.min((idea.funding / idea.targetFunding) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* C. Stock Statistics Grid */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-white border-b border-neutral-800 pb-3">
              Key Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="stat-tile bg-neutral-950/60 border border-neutral-800/40 p-3.5 rounded-2xl">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">Market Cap</span>
                <span className="text-white font-extrabold text-sm block mt-1">{formatCurrency(idea.valuation, 0)}</span>
              </div>
              <div className="stat-tile bg-neutral-950/60 border border-neutral-800/40 p-3.5 rounded-2xl">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">24h Volume</span>
                <span className="text-white font-extrabold text-sm block mt-1">{idea.volume ? idea.volume.toLocaleString() : "-"}</span>
              </div>
              <div className="stat-tile bg-neutral-950/60 border border-neutral-800/40 p-3.5 rounded-2xl">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">52 Week High</span>
                <span className="text-emerald-400 font-extrabold text-sm block mt-1">{formatCurrency(idea.high52Week)}</span>
              </div>
              <div className="stat-tile bg-neutral-950/60 border border-neutral-800/40 p-3.5 rounded-2xl">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">52 Week Low</span>
                <span className="text-rose-400 font-extrabold text-sm block mt-1">{formatCurrency(idea.low52Week)}</span>
              </div>
              <div className="stat-tile bg-neutral-950/60 border border-neutral-800/40 p-3.5 rounded-2xl">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">Total Shares</span>
                <span className="text-neutral-300 font-extrabold text-sm block mt-1">{idea.totalShares ? idea.totalShares.toLocaleString() : "-"}</span>
              </div>
              <div className="stat-tile bg-neutral-950/60 border border-neutral-800/40 p-3.5 rounded-2xl">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">Shares Outstanding</span>
                <span className="text-neutral-300 font-extrabold text-sm block mt-1">{idea.sharesOutstanding ? idea.sharesOutstanding.toLocaleString() : "-"}</span>
              </div>
              <div className="stat-tile bg-neutral-950/60 border border-neutral-800/40 p-3.5 rounded-2xl">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">Investor Count</span>
                <span className="text-neutral-300 font-extrabold text-sm block mt-1">{idea.investorCount}</span>
              </div>
              <div className="stat-tile bg-neutral-950/60 border border-neutral-800/40 p-3.5 rounded-2xl">
                <span className="text-neutral-500 block text-[10px] font-bold uppercase tracking-wider">Founder</span>
                <span className="text-amber-400 font-extrabold text-xs block mt-1 truncate">@{idea.author}</span>
              </div>
            </div>
          </div>

          {/* D. Tic Tac Toe League Integration info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Standings & League Impact block */}
            <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-white border-b border-neutral-800 pb-2.5 flex items-center gap-2">
                <Trophy className="h-4.5 w-4.5 text-amber-500" /> League Standing & Impact
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">Standings Rank</span>
                  <div className="text-2xl font-black text-white mt-1">
                    #{leaguePosition} <span className="text-xs text-neutral-500 font-normal">/ {sortedStandings.length}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase">Win Streak</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    {winStreak} Wins
                  </div>
                </div>
              </div>
              
              {teamStats && (
                <div className="text-xs space-y-1.5 pt-2 border-t border-neutral-800/60 font-mono">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Points Record:</span>
                    <span className="text-neutral-200 font-bold">{teamStats.points} pts ({teamStats.played} matches)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-500">Win Rate / Streak:</span>
                    <span className="text-neutral-400">{teamStats.wins}W - {teamStats.draws}D - {teamStats.losses}L</span>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-400 leading-relaxed flex items-center justify-between bg-neutral-950/20 p-2.5 rounded-xl border border-neutral-800">
                <span>League Stock Bonus:</span>
                <strong className={`font-mono font-black ${teamStats && teamStats.leagueBonus >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {teamStats && teamStats.leagueBonus >= 0 ? "+" : ""}{(teamStats?.leagueBonus || 0) * 100}%
                </strong>
              </div>
            </div>

            {/* Matches block */}
            <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-white border-b border-neutral-800 pb-2.5 flex items-center gap-2">
                <Swords className="h-4.5 w-4.5 text-amber-500" /> Recent League Matches
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {matchingMatches.length > 0 ? (
                  matchingMatches.slice(0, 5).map((m) => {
                    const isHome = m.homeTeamId === idea.id;
                    const opponent = (isHome ? m.awayTeamName : m.homeTeamName) || "Unknown Team";
                    let resultLabel = "Draw";
                    let resultColor = "text-neutral-400 bg-neutral-900 border-neutral-800";
                    
                    if (m.result === "homeWin" && isHome) {
                      resultLabel = "WIN";
                      resultColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";
                    } else if (m.result === "awayWin" && !isHome) {
                      resultLabel = "WIN";
                      resultColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/30";
                    } else if (m.result !== "pending" && m.result !== "draw") {
                      resultLabel = "LOSS";
                      resultColor = "text-rose-400 bg-rose-950/20 border-rose-900/30";
                    } else if (m.result === "pending") {
                      resultLabel = "LIVE";
                      resultColor = "text-amber-400 bg-amber-950/20 border-amber-900/30 animate-pulse";
                    }

                    return (
                      <div key={m.id} className="text-xs p-2 rounded-xl bg-neutral-950/40 border border-neutral-850 flex justify-between items-center">
                        <span className="font-semibold text-neutral-300 truncate max-w-[130px]" title={opponent}>
                          vs {opponent}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase ${resultColor}`}>
                          {resultLabel}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-neutral-500 italic text-center py-6">No recent matches found.</p>
                )}
              </div>
            </div>
          </div>

          {/* E. News Feed specific to this Stock */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-white border-b border-neutral-800 pb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" /> Recent News Headlines
            </h2>
            <div className="space-y-3">
              {matchingNews.length > 0 ? (
                matchingNews.map((headline, idx) => (
                  <div key={idx} className="p-3 bg-neutral-950/40 rounded-2xl border border-neutral-850 flex items-start gap-2.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-neutral-200 font-semibold leading-relaxed">
                      {headline}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500 italic py-2">
                  No direct news coverage for this stock. Make trades or upvote it to trigger market coverage.
                </p>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Trading Terminal & Position Panel */}
        <div className="space-y-6">
          
          {/* Terminal Block */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-md space-y-5">
            <h2 className="text-lg font-black text-white border-b border-neutral-800 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><ArrowDownUp className="h-4.5 w-4.5 text-amber-400" /> Terminal</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-xl font-bold uppercase ${
                marketSession === "open"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30"
                  : marketSession === "pre-market" || marketSession === "after-hours"
                  ? "bg-amber-950/20 text-amber-400 border border-amber-900/30 animate-pulse"
                  : "bg-red-950/20 text-red-400 border border-red-900/30"
              }`}>
                {marketSession}
              </span>
            </h2>

            {/* Position details */}
            <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-2xl space-y-2.5 text-xs font-mono">
              <div className="font-extrabold text-neutral-300 pb-1.5 border-b border-neutral-800 flex justify-between">
                <span>Your Asset Position</span>
                <span className="text-neutral-500">({idea.ticker})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shares Owned:</span>
                <span className="text-white font-extrabold">{userHolding.shares.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Market Value:</span>
                <span className="text-white font-extrabold">{formatCurrency(currentHoldingValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Avg Cost:</span>
                <span className="text-white font-extrabold">{formatCurrency(userHolding.avgBuyPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Unrealized G/L:</span>
                <span className={`font-black ${unrealizedGL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {unrealizedGL >= 0 ? "+" : ""}{formatCurrency(unrealizedGL)} ({unrealizedGL >= 0 ? "+" : ""}{returnPercentage.toFixed(2)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Realized G/L:</span>
                <span className={`font-black ${realizedGL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {realizedGL >= 0 ? "+" : ""}{formatCurrency(realizedGL)}
                </span>
              </div>
            </div>

            {/* Forms */}
            <div className="space-y-4">
              
              {/* Buy Form */}
              <form onSubmit={handleBuy} className="space-y-2.5 p-3.5 bg-emerald-950/5 rounded-2xl border border-emerald-900/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Buy Order (Ask: {formatCurrency(askPrice)})</span>
                  <span className="text-[9px] text-neutral-500 font-bold">CASH: {formatCurrency(wallet.balance)}</span>
                </div>
                <div className="relative rounded-xl">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500 text-xs">$</span>
                  <input
                    type="number"
                    placeholder="Cash amount..."
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 py-2 pl-6 pr-3 text-xs text-white focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-black text-xs transition-colors hover:scale-[1.01]"
                >
                  Execute Buy
                </button>
              </form>

              {/* Sell Form */}
              <form onSubmit={handleSell} className="space-y-2.5 p-3.5 bg-rose-950/5 rounded-2xl border border-rose-900/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">Sell Order (Bid: {formatCurrency(bidPrice)})</span>
                  <span className="text-[9px] text-neutral-500 font-bold">SHARES: {userHolding.shares.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Share count..."
                    value={sellAmount}
                    onChange={(e) => setSellAmount(e.target.value)}
                    className="block flex-grow rounded-xl border border-neutral-800 bg-neutral-950 py-2 px-3 text-xs text-white focus:border-rose-500 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setSellAmount(userHolding.shares.toString())}
                    className="h-8 rounded-xl border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-300 font-black text-[10px] px-3 transition-colors"
                  >
                    Max
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full h-8 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition-colors hover:scale-[1.01]"
                >
                  Execute Sell
                </button>
              </form>
            </div>

            {/* Error notifications */}
            {tradeError && (
              <p className="text-[11px] font-semibold text-rose-400 bg-rose-950/20 p-2.5 rounded-xl border border-rose-950/35">
                {tradeError}
              </p>
            )}
            {tradeSuccess && (
              <p className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-950/35">
                {tradeSuccess}
              </p>
            )}
          </div>

          {/* Hype and Voting Block (Pump/Dump) */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-white border-b border-neutral-800 pb-2.5">
              Hype Controller (Pump / Dump)
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Use your upvotes and downvotes to manipulate the startup&apos;s valuation and drive price action.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => upvoteIdea(idea.id)}
                className="flex-grow flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-emerald-950/10 hover:bg-emerald-950/20 border border-emerald-900/40 text-emerald-400 font-black text-xs transition-all hover:scale-[1.02]"
              >
                <TrendingUp className="h-4 w-4" /> Pump Upvote (+3%)
              </button>
              <button
                onClick={() => downvoteIdea(idea.id)}
                className="flex-grow flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-rose-950/10 hover:bg-rose-950/20 border border-rose-900/40 text-rose-400 font-black text-xs transition-all hover:scale-[1.02]"
              >
                <TrendingDown className="h-4 w-4" /> Dump Downvote (-4%)
              </button>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-500 font-mono mt-1 pt-1.5">
              <span>Upvotes: {idea.upvotes}</span>
              <span>Downvotes: {idea.downvotes}</span>
            </div>
          </div>

          {/* Social Feedback / Discussion Board */}
          <div className="tile bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-white border-b border-neutral-800 pb-2.5">
              Shareholder Board
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {idea.comments && idea.comments.length > 0 ? (
                idea.comments.map((comment) => (
                  <div key={comment.id} className="text-xs p-2.5 rounded-xl bg-neutral-950/40 border border-neutral-850">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-amber-500">@{comment.author}</span>
                      <span className="text-[9px] text-neutral-600">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-neutral-300 leading-normal">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-neutral-500 italic text-center py-4">No discussions yet. Post one below!</p>
              )}
            </div>

            <form onSubmit={handlePostComment} className="space-y-2 pt-2 border-t border-neutral-800/40">
              <input
                type="text"
                placeholder="Shareholder tag (e.g. VC_Chad)..."
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                className="block w-full rounded-xl border border-neutral-800 bg-neutral-950 py-1.5 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type board comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  className="block flex-grow rounded-xl border border-neutral-800 bg-neutral-950 py-1.5 px-3 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-600 transition-colors shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
