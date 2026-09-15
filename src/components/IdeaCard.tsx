"use client";

import React, { useState } from "react";
import { Idea } from "../types";
import { useApp } from "../context/AppContext";
import VoteButtons from "./VoteButtons";
import FintechChart from "./FintechChart";
import Link from "next/link";
import { 
  DollarSign, 
  MessageSquare, 
  Send, 
  TrendingUp,
  TrendingDown,
  Star
} from "lucide-react";

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const { wallet, buyStock, sellStock, addComment, watchlist, toggleWatchlist, marketSession } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"summary" | "charts" | "comments" | "trade" >("summary");
  
  // Charts selection state
  const [activeChartType, setActiveChartType] = useState<"valuation" | "funding" | "investor" | "popularity" | "votes">("valuation");

  // Trade States
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [tradeError, setTradeError] = useState("");
  const [tradeSuccess, setTradeSuccess] = useState("");

  // Comment States
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");

  const formatCurrency = (val: number, isLarge: boolean = false) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: isLarge ? 0 : 2,
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

  const sharePrice = idea.valuation / (idea.sharesOutstanding || 10000);
  const growthIsUp = idea.growth >= 0;
  
  // Spread calculations
  let spread = 0.001;
  if (marketSession === "pre-market") spread = 0.003;
  else if (marketSession === "after-hours") spread = 0.002;
  else if (marketSession === "closed") spread = 0.005;

  const buyPrice = sharePrice * (1 + spread);
  const sellPrice = sharePrice * (1 - spread);

  
  // User holding information
  const userHolding = wallet.investments[idea.id] || { shares: 0, avgBuyPrice: 0, realizedGL: 0 };
  const currentHoldingValue = userHolding.shares * sharePrice;
  const holdingCostBasis = userHolding.shares * userHolding.avgBuyPrice;
  const unrealizedGL = userHolding.shares > 0 ? currentHoldingValue - holdingCostBasis : 0;
  const returnPercentage = userHolding.avgBuyPrice > 0 ? (unrealizedGL / holdingCostBasis) * 100 : 0;
  const realizedGL = userHolding.realizedGL || 0;

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
      setTradeSuccess(`Successfully bought ${(cash / sharePrice).toFixed(4)} UBRG shares!`);
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
      setTradeSuccess(`Successfully sold ${sharesToSell.toFixed(4)} UBRG shares!`);
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

  const getActiveChartData = () => {
    switch (activeChartType) {
      case "valuation": return idea.valuationHistory;
      case "funding": return idea.fundingHistory;
      case "investor": return idea.investorHistory;
      case "popularity": return idea.popularityHistory;
      case "votes": return idea.voteHistory;
      default: return idea.valuationHistory;
    }
  };

  return (
    <article className="tile group flex flex-col rounded-3xl border border-neutral-800 bg-neutral-900 shadow-sm">
      
      {/* Top Banner Details */}
      <div className="flex flex-col p-5 flex-grow relative">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Link href={`/stock/${idea.ticker}`} className="text-[10px] font-black font-mono text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-md tracking-widest uppercase border border-neutral-800 hover:text-amber-400 transition-colors">
              {idea.ticker}
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(idea.id);
              }}
              className="text-neutral-500 hover:text-amber-400 transition-colors cursor-pointer"
              title={watchlist.includes(idea.id) ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              <Star className={`h-3.5 w-3.5 ${watchlist.includes(idea.id) ? "fill-amber-400 text-amber-400" : ""}`} />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${getRiskColor(idea.riskScore)}`}>
              Risk: {idea.riskScore}
            </span>
            <span className="text-[10px] font-bold text-neutral-500">
              {idea.category}
            </span>
          </div>
        </div>

        {/* Startup Name */}
        <Link href={`/stock/${idea.ticker}`}>
          <h3 className="text-lg font-black text-white leading-snug hover:text-amber-400 transition-colors cursor-pointer">
            {idea.name}
          </h3>
        </Link>
        
        {/* Pitch line */}
        <p className="mt-1 text-xs text-neutral-400 leading-normal line-clamp-2">
          {idea.pitch}
        </p>

        {/* Dynamic price indicator */}
        <div className="mt-4 flex items-end justify-between border-t border-neutral-800/60 pt-3">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">
              Share Price
            </span>
            <span className="text-lg font-black text-white mt-0.5 leading-none">
              {formatCurrency(sharePrice)}
            </span>
          </div>

          <div className={`inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-xl border ${
            growthIsUp 
              ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/30" 
              : "bg-red-950/20 text-red-400 border-red-900/30"
          }`}>
            {growthIsUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{growthIsUp ? "+" : ""}{idea.growth}%</span>
          </div>
        </div>

        {/* Tiny Sparkline */}
        <div className="h-10 mt-4 overflow-hidden relative">
          <FintechChart data={idea.valuationHistory} height={40} showGrid={false} />
        </div>
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-800 bg-neutral-900/50 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <VoteButtons ideaId={idea.id} upvotes={idea.upvotes} downvotes={idea.downvotes} />
          
          <button
            onClick={() => {
              setIsExpanded(!isExpanded);
              setActiveSubTab("comments");
            }}
            className="flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>{idea.comments?.length || 0}</span>
          </button>
        </div>

        <button
          onClick={() => {
            setIsExpanded(!isExpanded);
            setActiveSubTab(isExpanded && activeSubTab === "trade" ? "summary" : "trade");
          }}
          className="inline-flex h-8 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-950 px-4 text-xs font-black shadow-md shadow-amber-500/10 transition-all hover:scale-[1.03]"
        >
          Trade
        </button>
      </div>

      {/* Expanded sub-views */}
      {isExpanded && (
        <div className="border-t border-neutral-800 bg-neutral-950/40 p-5 rounded-b-3xl space-y-4">
          {/* Drawer tab navigation */}
          <div className="flex border-b border-neutral-800 pb-1 scrollbar-none overflow-x-auto gap-2">
            {[
              { id: "summary", label: "Summary" },
              { id: "charts", label: "Charts" },
              { id: "comments", label: "Board" },
              { id: "trade", label: "Trade" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as "summary" | "charts" | "comments" | "trade")}
                className={`text-[10px] uppercase tracking-wider font-extrabold pb-1 px-1.5 border-b-2 transition-all ${
                  activeSubTab === tab.id
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Summary */}
          {activeSubTab === "summary" && (
            <div className="space-y-3">
              <div className="bg-neutral-900/60 border border-neutral-800/80 p-3.5 rounded-2xl">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
                  Executive Pitch Deck
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed font-semibold italic">
                  &quot;{idea.description}&quot;
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-neutral-900/40 border border-neutral-800/40 p-2.5 rounded-xl">
                  <span className="text-neutral-500 block">Valuation Cap:</span>
                  <span className="text-white font-extrabold text-xs">{formatCurrency(idea.valuation, true)}</span>
                </div>
                <div className="bg-neutral-900/40 border border-neutral-800/40 p-2.5 rounded-xl">
                  <span className="text-neutral-500 block">Total Seed Raised:</span>
                  <span className="text-white font-extrabold text-xs">{formatCurrency(idea.funding, true)}</span>
                </div>
                <div className="bg-neutral-900/40 border border-neutral-800/40 p-2.5 rounded-xl">
                  <span className="text-neutral-500 block">Investors Count:</span>
                  <span className="text-white font-extrabold text-xs">{idea.investorCount}</span>
                </div>
                <div className="bg-neutral-900/40 border border-neutral-800/40 p-2.5 rounded-xl">
                  <span className="text-neutral-500 block">Target Funding:</span>
                  <span className="text-white font-extrabold text-xs">{formatCurrency(idea.targetFunding, true)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Interactive SVG Charts */}
          {activeSubTab === "charts" && (
            <div className="space-y-4">
              {/* Chart selector */}
              <div className="flex flex-wrap gap-1 bg-neutral-900 p-0.5 rounded-xl border border-neutral-850">
                {[
                  { id: "valuation", label: "Valuation" },
                  { id: "funding", label: "Funding" },
                  { id: "investor", label: "Investors" },
                  { id: "popularity", label: "Popularity" },
                  { id: "votes", label: "Votes" }
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setActiveChartType(c.id as "valuation" | "funding" | "investor" | "popularity" | "votes")}
                    className={`flex-grow text-[9px] font-bold py-1 px-1.5 rounded-lg transition-all ${
                      activeChartType === c.id
                        ? "bg-neutral-800 text-white shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Chart canvas */}
              <div className="bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800">
                <FintechChart data={getActiveChartData()} type={activeChartType} />
              </div>
            </div>
          )}

          {/* Tab 3: Comments Section */}
          {activeSubTab === "comments" && (
            <div className="space-y-4">
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {idea.comments && idea.comments.length > 0 ? (
                  idea.comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="text-[11px] p-2.5 rounded-xl bg-neutral-900 border border-neutral-850"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-neutral-300">
                          @{comment.author}
                        </span>
                        <span className="text-[9px] text-neutral-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-neutral-400 leading-normal">
                        {comment.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-neutral-500 italic text-center py-4">
                    No comments yet. Write a snarky review below!
                  </p>
                )}
              </div>

              <form onSubmit={handlePostComment} className="space-y-2 pt-2 border-t border-neutral-800/40">
                <input
                  type="text"
                  placeholder="Your handle (e.g. VC_Chad)..."
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 py-1.5 px-3 text-[11px] text-white focus:border-amber-500 focus:outline-none"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Write board comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                    className="block flex-grow rounded-xl border border-neutral-800 bg-neutral-900 py-1.5 px-3 text-[11px] text-white focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-600 transition-colors"
                  >
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Trade Stock Interface */}
          {activeSubTab === "trade" && (
            <div className="space-y-4">
              {/* User Position summary */}
              <div className="bg-neutral-900 border border-neutral-850 p-3 rounded-2xl space-y-2 text-xs">
                <div className="font-extrabold text-neutral-300 pb-1 border-b border-neutral-800 flex justify-between">
                  <span>Your Position</span>
                  <span className="text-[8px] text-neutral-500 uppercase tracking-widest font-mono">Spread Trading</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div>
                    <span className="text-neutral-500">Shares Owned:</span>
                    <span className="text-white font-extrabold ml-1">{userHolding.shares.toFixed(4)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Market Value:</span>
                    <span className="text-white font-extrabold ml-1">{formatCurrency(currentHoldingValue)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Avg Cost:</span>
                    <span className="text-white font-extrabold ml-1">{formatCurrency(userHolding.avgBuyPrice)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Unrealized G/L:</span>
                    <span className={`font-black ml-1 ${unrealizedGL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {unrealizedGL >= 0 ? "+" : ""}{formatCurrency(unrealizedGL)} ({unrealizedGL >= 0 ? "+" : ""}{returnPercentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Realized G/L:</span>
                    <span className={`font-black ml-1 ${realizedGL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {realizedGL >= 0 ? "+" : ""}{formatCurrency(realizedGL)}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Spread:</span>
                    <span className="text-amber-400 font-extrabold ml-1">{(spread * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Trading Forms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Buy Form */}
                <form onSubmit={handleBuy} className="space-y-2 p-3 bg-emerald-950/10 rounded-2xl border border-emerald-900/20">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase block">Buy shares</span>
                      <span className="text-[8px] text-neutral-500 font-mono">Ask: {formatCurrency(buyPrice)}</span>
                    </div>
                    <span className="text-[9px] text-neutral-500">Cash: {formatCurrency(wallet.balance)}</span>
                  </div>
                  <div className="relative rounded-xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
                      <DollarSign className="h-3.5 w-3.5 text-neutral-500" />
                    </div>
                    <input
                      type="number"
                      placeholder="Amount in cash..."
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 py-1.5 pl-7 pr-3 text-[11px] text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-7 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-[10px] transition-colors"
                  >
                    Buy Stock
                  </button>
                </form>

                {/* Sell Form */}
                <form onSubmit={handleSell} className="space-y-2 p-3 bg-red-950/10 rounded-2xl border border-red-900/20">
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className="text-[10px] font-bold text-red-400 uppercase block">Sell shares</span>
                      <span className="text-[8px] text-neutral-500 font-mono">Bid: {formatCurrency(sellPrice)}</span>
                    </div>
                    <span className="text-[9px] text-neutral-500">Owned: {userHolding.shares.toFixed(2)}</span>
                  </div>
                  <div className="relative rounded-xl">
                    <input
                      type="number"
                      step="any"
                      placeholder="Amount in shares..."
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="block w-full rounded-xl border border-neutral-800 bg-neutral-900 py-1.5 px-3 text-[11px] text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSellAmount(userHolding.shares.toString())}
                      className="h-7 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-300 font-bold text-[10px] px-2 transition-colors"
                    >
                      Max
                    </button>
                    <button
                      type="submit"
                      className="flex-grow h-7 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] transition-colors"
                    >
                      Sell Stock
                    </button>
                  </div>
                </form>
              </div>

              {/* Status notifications */}
              {tradeError && (
                <p className="text-[10px] font-semibold text-rose-400 bg-rose-950/20 p-2 rounded-xl border border-rose-950/40 animate-shake">
                  {tradeError}
                </p>
              )}
              {tradeSuccess && (
                <p className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/20 p-2 rounded-xl border border-emerald-950/40">
                  {tradeSuccess}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
