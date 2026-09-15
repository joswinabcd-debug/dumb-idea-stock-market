"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import { 
  Lightbulb, 
  Wallet, 
  PlusCircle, 
  Compass, 
  Briefcase, 
  Swords, 
  ChevronDown,
  Trophy,
  Play,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock
} from "lucide-react";

export default function Navbar() {
  const { wallet, ideas, marketSession, marketClock, sentiment } = useApp();
  const pathname = usePathname();
  const [showNavTooltip, setShowNavTooltip] = useState(false);

  // Compute total equity value
  const totalEquity = Object.entries(wallet.investments).reduce((sum, [id, holding]) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea) return sum;
    const currentPrice = idea.valuation / (idea.sharesOutstanding || 10000);
    return sum + holding.shares * currentPrice;
  }, 0);

  const netPortfolioValue = wallet.balance + totalEquity;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Market session display config
  const sessionConfig = {
    "open": {
      label: "Open",
      dot: "bg-emerald-400",
      dotGlow: "shadow-emerald-500/60",
      text: "text-emerald-400",
      bg: "bg-emerald-950/40 border-emerald-800/50",
      animate: "animate-pulse",
      emoji: "🟢"
    },
    "pre-market": {
      label: "Pre-Market",
      dot: "bg-amber-400",
      dotGlow: "shadow-amber-400/60",
      text: "text-amber-400",
      bg: "bg-amber-950/30 border-amber-800/40",
      animate: "animate-pulse",
      emoji: "🌅"
    },
    "after-hours": {
      label: "After-Hours",
      dot: "bg-violet-400",
      dotGlow: "shadow-violet-400/60",
      text: "text-violet-400",
      bg: "bg-violet-950/30 border-violet-800/40",
      animate: "",
      emoji: "🌙"
    },
    "closed": {
      label: "Closed",
      dot: "bg-neutral-500",
      dotGlow: "",
      text: "text-neutral-400",
      bg: "bg-neutral-900/60 border-neutral-700/40",
      animate: "",
      emoji: "💤"
    }
  };

  const session = sessionConfig[marketSession];

  // Sentiment display config
  const sentimentConfig = {
    "Extreme Greed": {
      icon: TrendingUp,
      color: "text-emerald-300",
      bg: "bg-emerald-950/30 border-emerald-800/40",
      label: "🔥 Extreme Greed"
    },
    "Greed": {
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-950/30 border-green-800/40",
      label: "📈 Greed"
    },
    "Neutral": {
      icon: Minus,
      color: "text-neutral-400",
      bg: "bg-neutral-900/40 border-neutral-700/40",
      label: "⚖️ Neutral"
    },
    "Fear": {
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-950/30 border-red-800/40",
      label: "😨 Fear"
    }
  };

  const sentimentCfg = sentimentConfig[sentiment];
  const SentimentIcon = sentimentCfg.icon;

  const navLinks = [
    { href: "/ideas", label: "Market", icon: Compass },
    { href: "/portfolio", label: "Portfolio", icon: Briefcase },
    { href: "/battle", label: "Battle", icon: Swords },
    { href: "/league", label: "League", icon: Trophy },
    { href: "/play", label: "Play", icon: Play },
    { href: "/matches", label: "Matches", icon: BarChart2 },
    { href: "/submit", label: "Pitch Idea", icon: PlusCircle },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-200">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              Dumb Idea
            </span>
            <span className="text-xs block -mt-1 font-semibold text-amber-500 uppercase tracking-widest">
              Exchange
            </span>
          </div>
          <span className="ml-1.5 rounded-full bg-red-950/60 px-1.5 py-0.5 text-[9px] font-bold text-red-400 border border-red-900/30 uppercase tracking-wider self-start mt-1 hidden sm:inline-block">
            Meme Stocks
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 text-xs lg:text-sm font-bold transition-all px-3 py-1.5 rounded-xl ${
                  isActive
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Market Status + Sentiment + Portfolio */}
        <div className="flex items-center gap-2">

          {/* Market Session Badge */}
          <div
            className={`hidden lg:flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 border text-xs font-bold transition-all ${session.bg} ${session.text}`}
            title={`Market session: ${session.label} — ${marketClock} ticks remaining`}
          >
            <span
              className={`inline-block h-2 w-2 rounded-full ${session.dot} shadow-sm ${session.dotGlow} ${session.animate}`}
            />
            <span>{session.label}</span>
            <span className="text-neutral-600 font-normal">·</span>
            <Clock className="h-3 w-3 opacity-60" />
            <span className="opacity-70 font-mono text-[10px]">{marketClock}t</span>
          </div>

          {/* Sentiment Pill */}
          <div
            className={`hidden xl:flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 border text-xs font-bold transition-all ${sentimentCfg.bg} ${sentimentCfg.color}`}
            title={`Market Sentiment: ${sentiment}`}
          >
            <SentimentIcon className="h-3.5 w-3.5" />
            <span className="leading-none">{sentiment}</span>
          </div>

          {/* Dynamic Portfolio Net Worth Badge */}
          <div 
            className="relative cursor-pointer"
            onMouseEnter={() => setShowNavTooltip(true)}
            onMouseLeave={() => setShowNavTooltip(false)}
            onClick={() => setShowNavTooltip(!showNavTooltip)}
          >
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-950/30 px-3 py-1.5 border border-emerald-900/50 text-emerald-400 shadow-sm transition-all hover:bg-emerald-950/50">
              <Wallet className="h-4 w-4 text-emerald-500 animate-pulse" />
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-black leading-none uppercase tracking-wider text-emerald-500 flex items-center gap-0.5 justify-end">
                  Net Portfolio Value <ChevronDown className="h-2 w-2" />
                </span>
                <span className="text-xs sm:text-sm font-black tracking-tight mt-0.5">
                  {formatCurrency(netPortfolioValue)}
                </span>
              </div>
            </div>

            {/* NAV Tooltip Modal */}
            {showNavTooltip && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-neutral-800 bg-neutral-900 p-4 shadow-xl z-50 text-xs text-neutral-300 space-y-2 animate-fade-in">
                <div className="font-bold border-b border-neutral-800 pb-1.5 text-white">
                  Balance Breakdown
                </div>
                <div className="flex justify-between">
                  <span>Available Cash:</span>
                  <span className="font-extrabold text-white">{formatCurrency(wallet.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stock Equity:</span>
                  <span className="font-extrabold text-white">{formatCurrency(totalEquity)}</span>
                </div>
                <div className="border-t border-neutral-800 pt-1.5 flex justify-between font-black text-emerald-400">
                  <span>Total Value:</span>
                  <span>{formatCurrency(netPortfolioValue)}</span>
                </div>
                {/* Market Status in tooltip */}
                <div className="border-t border-neutral-800 pt-1.5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Market Session:</span>
                    <span className={`font-bold ${session.text}`}>{session.emoji} {session.label}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Sentiment:</span>
                    <span className={`font-bold ${sentimentCfg.color}`}>{sentimentCfg.label}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden border-t border-neutral-900 bg-neutral-950 justify-around py-2">
        {/* Mobile Market Session indicator */}
        <div className={`flex items-center gap-1 text-[9px] font-bold ${session.text}`}>
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${session.dot} ${session.animate}`} />
          {session.label}
        </div>
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center text-[9px] font-bold transition-colors ${
                isActive
                  ? "text-amber-400"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Icon className="h-4.5 w-4.5 mb-0.5" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
