"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import {
  Trophy, Swords,
  RefreshCw, Play, ChevronRight, Medal,
  BarChart2, Users, Zap
} from "lucide-react";

export default function LeaguePage() {
  const { league, ideas, resetLeague, scheduleMatch } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const standings = league.standings;

  const getRankIcon = (idx: number) => {
    if (idx === 0) return <span className="text-yellow-400 text-lg">🥇</span>;
    if (idx === 1) return <span className="text-slate-300 text-lg">🥈</span>;
    if (idx === 2) return <span className="text-amber-600 text-lg">🥉</span>;
    return <span className="text-neutral-500 font-bold text-sm">{idx + 1}</span>;
  };

  const getBonusBadge = (bonus: number) => {
    if (bonus > 0.02) return <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 rounded-full px-2 py-0.5">+{(bonus * 100).toFixed(0)}%</span>;
    if (bonus > 0) return <span className="text-[10px] font-black text-emerald-500/70 bg-emerald-950/30 border border-emerald-900/30 rounded-full px-2 py-0.5">+{(bonus * 100).toFixed(0)}%</span>;
    if (bonus < 0) return <span className="text-[10px] font-black text-red-400 bg-red-950/50 border border-red-800/50 rounded-full px-2 py-0.5">{(bonus * 100).toFixed(0)}%</span>;
    return <span className="text-[10px] font-black text-neutral-500 bg-neutral-900 border border-neutral-800 rounded-full px-2 py-0.5">0%</span>;
  };

  const getRowGlow = (idx: number) => {
    if (idx === 0) return "border-l-2 border-l-yellow-400/60 bg-yellow-950/10";
    if (idx === 1) return "border-l-2 border-l-slate-400/60 bg-slate-950/10";
    if (idx === 2) return "border-l-2 border-l-amber-700/60 bg-amber-950/10";
    if (idx >= standings.length - 3) return "border-l-2 border-l-red-700/40 bg-red-950/5";
    return "border-l-2 border-l-transparent";
  };

  const handleScheduleRandom = () => {
    if (ideas.length < 2) return;
    const shuffled = [...ideas].sort(() => Math.random() - 0.5);
    scheduleMatch(shuffled[0].id, shuffled[1].id);
  };

  // Live / pending auto matches
  const liveMatches = league.matches.filter(m => m.result === "pending" && !m.isUserMatch);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.12),transparent_70%)]" />
        <div className="relative mx-auto max-w-full px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-500 shadow-lg shadow-violet-500/20">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Tic Tac Toe League</h1>
                  <p className="text-xs text-neutral-400 font-semibold uppercase tracking-widest">Season 1 — Professional Standings</p>
                </div>
              </div>
              <p className="text-sm text-neutral-400 max-w-lg">
                Every startup competes in the league. Rankings directly influence stock valuations — <span className="text-violet-400 font-bold">top teams get a stock bonus, bottom teams face penalties.</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleScheduleRandom}
                className="flex items-center gap-2 rounded-xl bg-violet-600/20 border border-violet-600/40 px-4 py-2 text-sm font-bold text-violet-300 hover:bg-violet-600/30 transition-all"
              >
                <Zap className="h-4 w-4" /> Schedule Match
              </button>
              <Link
                href="/play"
                className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm font-bold text-amber-400 hover:bg-amber-500/20 transition-all"
              >
                <Play className="h-4 w-4" /> Play Now
              </Link>
              <Link
                href="/matches"
                className="flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm font-bold text-neutral-300 hover:bg-neutral-700 transition-all"
              >
                <BarChart2 className="h-4 w-4" /> Match History
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Teams", value: standings.length, icon: Users, color: "text-violet-400" },
            { label: "Matches Played", value: league.matches.filter(m => m.result !== "pending").length, icon: Swords, color: "text-amber-400" },
            { label: "Live Matches", value: liveMatches.length, icon: Zap, color: "text-emerald-400" },
            { label: "Your Points", value: league.userStats.points, icon: Trophy, color: "text-yellow-400" },
          ].map(stat => (
            <div key={stat.label} className="stat-tile rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{stat.label}</span>
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Live matches banner */}
        {liveMatches.length > 0 && (
          <div className="stat-tile rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Live Now</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {liveMatches.map(m => (
                <div key={m.id} className="rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2 text-sm font-bold">
                  <span className="text-violet-300">{m.homeTeamName}</span>
                  <span className="text-neutral-500 mx-2">vs</span>
                  <span className="text-amber-300">{m.awayTeamName}</span>
                  <span className="ml-2 text-xs text-neutral-500">🔴 IN PLAY</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standings table */}
        <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-violet-400" />
              <h2 className="text-base font-black">League Standings</h2>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-red-400 transition-colors"
            >
              <RefreshCw className="h-3 w-3" /> Reset Season
            </button>
          </div>

          {/* Table content scrolling wrapper */}
          <div className="overflow-x-auto scrollbar-none">
            <div className="min-w-[620px]">
              {/* Table header */}
              <div className="grid grid-cols-[44px_1fr_52px_52px_52px_52px_64px_72px] gap-0 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-neutral-500 border-b border-neutral-800/50">
                <span className="text-center">Rank</span>
                <span className="pl-2">Team</span>
                <span className="text-center">P</span>
                <span className="text-center">W</span>
                <span className="text-center">D</span>
                <span className="text-center">L</span>
                <span className="text-center">Pts</span>
                <span className="text-center">Bonus</span>
              </div>

              {standings.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 text-sm">
                  <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="font-bold">No standings yet</p>
                  <p className="text-xs mt-1">Matches are automatically scheduled every ~40 seconds</p>
                </div>
              ) : (
                <div>
                  {standings.map((team, idx) => {
                    return (
                      <div
                        key={team.ideaId}
                        className={`grid grid-cols-[44px_1fr_52px_52px_52px_52px_64px_72px] gap-0 px-4 py-3 items-center border-b border-neutral-800/30 last:border-0 transition-colors hover:bg-neutral-800/20 ${getRowGlow(idx)}`}
                      >
                        {/* Rank */}
                        <div className="flex justify-center">
                          {getRankIcon(idx)}
                        </div>

                        {/* Team name + ticker */}
                        <div className="pl-2 min-w-0">
                          <div className="font-bold text-sm text-neutral-100 truncate leading-tight">{team.teamName}</div>
                          <div className="text-[10px] font-black text-neutral-500 tracking-widest font-mono">{team.ticker}</div>
                        </div>

                        {/* Played */}
                        <div className="text-center text-sm font-bold text-neutral-300 font-mono">{team.played}</div>

                        {/* Wins */}
                        <div className="text-center text-sm font-bold text-emerald-400 font-mono">{team.wins}</div>

                        {/* Draws */}
                        <div className="text-center text-sm font-bold text-amber-400 font-mono">{team.draws}</div>

                        {/* Losses */}
                        <div className="text-center text-sm font-bold text-red-400 font-mono">{team.losses}</div>

                        {/* Points */}
                        <div className="text-center font-mono">
                          <span className={`text-base font-black ${idx < 3 ? "text-white" : "text-neutral-300"}`}>{team.points}</span>
                        </div>

                        {/* League Bonus */}
                        <div className="flex justify-center">
                          {getBonusBadge(team.leagueBonus)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User record */}
        <div className="tile rounded-3xl border border-amber-800/30 bg-amber-950/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <h2 className="text-base font-black text-yellow-400">Your League Record</h2>
              </div>
              <p className="text-xs text-neutral-500">Your personal match statistics against startup teams</p>
            </div>
            <div className="flex items-center gap-6">
              {[
                { label: "Played", value: league.userStats.played, color: "text-neutral-300" },
                { label: "Wins", value: league.userStats.wins, color: "text-emerald-400" },
                { label: "Draws", value: league.userStats.draws, color: "text-amber-400" },
                { label: "Losses", value: league.userStats.losses, color: "text-red-400" },
                { label: "Points", value: league.userStats.points, color: "text-yellow-400" },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{stat.label}</div>
                </div>
              ))}
            </div>
            <Link
              href="/play"
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
            >
              Play a Match <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Legend */}
        <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Stock Bonus Explained</p>
          <div className="flex flex-wrap gap-3 text-xs">
            {[
              { label: "1st Place", bonus: "+3%", color: "text-yellow-400" },
              { label: "2nd Place", bonus: "+2%", color: "text-slate-300" },
              { label: "3rd Place", bonus: "+1%", color: "text-amber-600" },
              { label: "Mid Table", bonus: "0%", color: "text-neutral-400" },
              { label: "Bottom 3", bonus: "-1% to -3%", color: "text-red-400" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5">
                <span className="text-neutral-400">{item.label}</span>
                <span className={`font-black ${item.color}`}>{item.bonus}</span>
                <span className="text-neutral-600">stock bonus/tick</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reset confirm modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-black mb-2 text-red-400">Reset the League?</h3>
            <p className="text-sm text-neutral-400 mb-6">This will clear all match history and reset all standings to zero. Stock bonuses will be recalculated.</p>
            <div className="flex gap-3">
              <button
                onClick={() => { resetLeague(); setShowResetConfirm(false); }}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-black text-white hover:bg-red-500 transition-all"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 rounded-xl bg-neutral-800 py-2.5 text-sm font-bold text-neutral-300 hover:bg-neutral-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
