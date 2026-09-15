"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import {
  ChevronLeft, BarChart2, Trophy, Swords,
  Filter, Clock, TrendingUp, TrendingDown, Minus
} from "lucide-react";

type FilterType = "all" | "auto" | "user";

function BoardPreview({ board }: { board: ("X"|"O"|null)[] }) {
  return (
    <div className="grid grid-cols-3 gap-0.5 w-14 h-14 shrink-0">
      {board.map((cell, i) => (
        <div
          key={i}
          className="rounded-[3px] bg-neutral-800 flex items-center justify-center text-[10px] font-black"
        >
          {cell === "X" && <span className="text-amber-400">✕</span>}
          {cell === "O" && <span className="text-violet-400">○</span>}
        </div>
      ))}
    </div>
  );
}

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function MatchesPage() {
  const { league } = useApp();
  const [filter, setFilter] = useState<FilterType>("all");

  const allMatches = [...league.matches].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filtered = allMatches.filter(m => {
    if (filter === "auto") return !m.isUserMatch;
    if (filter === "user") return m.isUserMatch;
    return true;
  });

  const finished = allMatches.filter(m => m.result !== "pending");
  const autoFinished = finished.filter(m => !m.isUserMatch);
  const userFinished = finished.filter(m => m.isUserMatch);

  const getResultLabel = (m: typeof allMatches[0]) => {
    if (m.result === "pending") return { label: "IN PROGRESS", color: "text-emerald-400 bg-emerald-950/30 border-emerald-800/30", icon: null };
    if (m.result === "draw")    return { label: "DRAW", color: "text-amber-400 bg-amber-950/30 border-amber-800/30", icon: Minus };
    const winnerName = (m.result === "homeWin" ? m.homeTeamName : m.awayTeamName) || "Unknown";
    return { label: `${winnerName.split(" ").slice(0,3).join(" ")} WIN`, color: "text-violet-400 bg-violet-950/30 border-violet-800/30", icon: TrendingUp };
  };

  const getUserResultLabel = (m: typeof allMatches[0]) => {
    if (m.result === "homeWin") return { label: "YOU WIN", color: "text-emerald-400", icon: TrendingUp };
    if (m.result === "draw")    return { label: "DRAW", color: "text-amber-400", icon: Minus };
    if (m.result === "awayWin") return { label: "YOU LOSE", color: "text-red-400", icon: TrendingDown };
    return { label: "IN PROGRESS", color: "text-neutral-400", icon: null };
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.10),transparent_70%)]" />
        <div className="relative mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/league" className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-300 transition-colors">
              <ChevronLeft className="h-3 w-3" /> League
            </Link>
            <span className="text-neutral-700">/</span>
            <span className="text-xs font-bold text-blue-400">Match History</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Match History</h1>
                <p className="text-sm text-neutral-400">{allMatches.length} total matches · {finished.length} completed</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/play" className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm font-bold text-amber-400 hover:bg-amber-500/20 transition-all">
                <Swords className="h-4 w-4" /> Play Now
              </Link>
              <Link href="/league" className="flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm font-bold text-neutral-300 hover:bg-neutral-700 transition-all">
                <Trophy className="h-4 w-4" /> Standings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Matches", value: allMatches.length, color: "text-blue-400" },
            { label: "Auto Matches", value: autoFinished.length, color: "text-violet-400" },
            { label: "Your Matches", value: userFinished.length, color: "text-amber-400" },
            { label: "Live Now", value: allMatches.filter(m => m.result === "pending").length, color: "text-emerald-400" },
          ].map(s => (
            <div key={s.label} className="stat-tile rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-1">{s.label}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-500" />
          <div className="flex rounded-xl bg-neutral-900 border border-neutral-800 p-1 gap-1">
            {(["all", "auto", "user"] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === f
                    ? "bg-neutral-700 text-neutral-100"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {f === "all" ? "All Matches" : f === "auto" ? "Auto Matches" : "Your Matches"}
              </button>
            ))}
          </div>
        </div>

        {/* Match list */}
        {filtered.length === 0 ? (
          <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/50 py-20 text-center">
            <BarChart2 className="h-12 w-12 mx-auto mb-4 text-neutral-700" />
            <p className="text-neutral-400 font-bold">No matches yet</p>
            <p className="text-neutral-600 text-sm mt-1">
              {filter === "user"
                ? "Challenge a team on the Play page to get started"
                : "Matches are automatically scheduled every ~40 seconds as the market ticks"}
            </p>
            {filter === "user" && (
              <Link href="/play" className="inline-flex items-center gap-2 mt-4 rounded-xl bg-amber-500/10 border border-amber-500/30 px-5 py-2.5 text-sm font-bold text-amber-400 hover:bg-amber-500/20 transition-all">
                <Swords className="h-4 w-4" /> Play Now
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Live matches first */}
            {filtered.filter(m => m.result === "pending").map(m => (
              <div key={m.id} className="tile rounded-2xl border border-emerald-800/40 bg-emerald-950/10 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Match</span>
                  {m.isUserMatch && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-full px-2 py-0.5 ml-1">Your Match</span>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <BoardPreview board={m.board} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm text-neutral-100 truncate max-w-[140px]">{m.homeTeamName}</span>
                      <span className="text-neutral-600 font-black text-xs shrink-0">vs</span>
                      <span className="font-bold text-sm text-neutral-100 truncate max-w-[140px]">{m.awayTeamName}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-neutral-600" />
                      <span className="text-[10px] text-neutral-500">{timeAgo(m.timestamp)}</span>
                      <span className="text-[10px] text-neutral-600">· Move: {m.turn === "home" ? m.homeTeamName.split(" ")[0] : m.awayTeamName.split(" ")[0]}&apos;s turn</span>
                    </div>
                  </div>
                  {m.isUserMatch && (
                    <Link href="/play" className="shrink-0 flex items-center gap-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-all">
                      Play <Swords className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* Finished matches */}
            {filtered.filter(m => m.result !== "pending").map(m => {
              const isUser = m.isUserMatch;
              const res = isUser ? getUserResultLabel(m) : getResultLabel(m);
              const ResIcon = res.icon;

              return (
                <div
                  key={m.id}
                  className="tile rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5 hover:bg-neutral-900/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <BoardPreview board={m.board} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <span className={`font-bold text-sm truncate max-w-[160px] ${m.result === "homeWin" ? "text-neutral-100" : "text-neutral-400"}`}>
                          {m.homeTeamName}
                        </span>
                        <span className="text-neutral-700 font-black text-xs hidden sm:block">vs</span>
                        <span className={`font-bold text-sm truncate max-w-[160px] ${m.result === "awayWin" ? "text-neutral-100" : "text-neutral-400"}`}>
                          {m.awayTeamName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Clock className="h-3 w-3 text-neutral-600" />
                        <span className="text-[10px] text-neutral-500">{timeAgo(m.timestamp)}</span>
                        {isUser && (
                          <span className="text-[10px] font-black text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-full px-1.5 py-0.5">Your Match</span>
                        )}
                      </div>
                    </div>
                    <div className={`shrink-0 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black ${isUser ? "" : ""} ${res.color}`}>
                      {ResIcon && <ResIcon className="h-3.5 w-3.5" />}
                      <span className="hidden sm:inline">{res.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
