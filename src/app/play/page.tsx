"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "../../context/AppContext";
import {
  Trophy, ChevronRight, Swords, RotateCcw,
  TrendingUp, TrendingDown, Minus, ChevronLeft,
  Zap
} from "lucide-react";

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function getWinningLine(board: ("X"|"O"|null)[]): number[] | null {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return [a,b,c];
    }
  }
  return null;
}

export default function PlayPage() {
  const { ideas, league, challengeTeam, playUserMove } = useApp();
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const match = league.currentUserMatch;

  const filteredIdeas = ideas.filter(idea =>
    idea.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    idea.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChallenge = (ideaId: string) => {
    setSelectedOpponentId(ideaId);
    challengeTeam(ideaId);
  };

  const handleRematch = () => {
    if (selectedOpponentId) {
      challengeTeam(selectedOpponentId);
    }
  };

  const board = match?.board ?? Array(9).fill(null);
  const result = match?.result ?? null;
  const winLine = getWinningLine(board);

  const isGameOver = result && result !== "pending";
  const canMove = match && result === "pending" && match.turn === "home";

  const getResultDisplay = () => {
    if (!isGameOver) return null;
    if (result === "homeWin") return { label: "YOU WIN! 🎉", sub: "+3 League Points", color: "text-emerald-400", bg: "from-emerald-950/60 to-transparent border-emerald-800/50" };
    if (result === "draw")    return { label: "IT'S A DRAW 🤝", sub: "+1 League Point", color: "text-amber-400", bg: "from-amber-950/60 to-transparent border-amber-800/50" };
    return { label: "YOU LOSE 😔", sub: "+0 League Points", color: "text-red-400", bg: "from-red-950/60 to-transparent border-red-800/50" };
  };

  const resultDisplay = getResultDisplay();

  const opponentStats = match
    ? league.standings.find(s => s.ideaId === match.awayTeamId)
    : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.10),transparent_70%)]" />
        <div className="relative mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/league" className="flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-neutral-300 transition-colors">
              <ChevronLeft className="h-3 w-3" /> League
            </Link>
            <span className="text-neutral-700">/</span>
            <span className="text-xs font-bold text-amber-400">Play</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20">
              <Swords className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Challenge a Startup</h1>
              <p className="text-sm text-neutral-400">Beat startup teams to earn league points and boost your ranking</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

          {/* Left — Opponent Selector */}
          <div className="space-y-4">
            <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/50">
              <div className="p-4 border-b border-neutral-800">
                <h2 className="text-sm font-black mb-3">Choose Your Opponent</h2>
                <input
                  type="text"
                  placeholder="Search startups..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              <div className="max-h-[420px] overflow-y-auto divide-y divide-neutral-800/50">
                {filteredIdeas.map(idea => {
                  const stats = league.standings.find(s => s.ideaId === idea.id);
                  const isActive = match?.awayTeamId === idea.id && match.result === "pending";
                  return (
                    <button
                      key={idea.id}
                      onClick={() => handleChallenge(idea.id)}
                      disabled={isActive}
                      className={`w-full text-left px-4 py-3 transition-all group ${
                        isActive
                          ? "bg-amber-950/20 border-l-2 border-l-amber-500"
                          : "hover:bg-neutral-800/50 border-l-2 border-l-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-neutral-100 truncate">{idea.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-black text-neutral-600">{idea.ticker}</span>
                            {stats && (
                              <span className="text-[10px] text-neutral-500">
                                {stats.wins}W {stats.draws}D {stats.losses}L
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {stats && (
                            <span className="text-xs font-black text-violet-400">{stats.points}pts</span>
                          )}
                          {isActive ? (
                            <span className="text-[10px] font-black text-amber-400 bg-amber-950/30 border border-amber-800/40 rounded-full px-2 py-0.5">LIVE</span>
                          ) : (
                            <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User stats card */}
            <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-black uppercase tracking-widest text-yellow-400">Your Record</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Wins", value: league.userStats.wins, color: "text-emerald-400" },
                  { label: "Draws", value: league.userStats.draws, color: "text-amber-400" },
                  { label: "Losses", value: league.userStats.losses, color: "text-red-400" },
                ].map(s => (
                  <div key={s.label} className="text-center rounded-xl bg-neutral-800/50 py-2">
                    <div className={`text-lg font-black ${s.color}`}>{s.value}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-neutral-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl bg-violet-950/30 border border-violet-800/30 py-2 text-center">
                <span className="text-sm font-black text-violet-300">{league.userStats.points}</span>
                <span className="text-xs text-neutral-500 ml-1.5">League Points</span>
              </div>
            </div>
          </div>

          {/* Right — Game Board */}
          <div className="space-y-5">
            {!match ? (
              /* No match yet */
              <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/50 flex flex-col items-center justify-center py-24 text-center px-8">
                <div className="text-6xl mb-4">⚽</div>
                <h3 className="text-xl font-black text-neutral-300 mb-2">Pick an Opponent</h3>
                <p className="text-sm text-neutral-500 max-w-xs">
                  Select a startup team from the list to challenge them to a Tic Tac Toe match. Win to earn league points!
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {["Win = +3pts", "Draw = +1pt", "Loss = +0pts"].map(t => (
                    <span key={t} className="text-xs font-bold bg-neutral-800 border border-neutral-700 rounded-full px-3 py-1 text-neutral-400">{t}</span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Match header */}
                <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    {/* Home (Player) */}
                    <div className="text-center flex-1">
                      <div className="text-3xl mb-1">🏆</div>
                      <div className="font-black text-sm text-neutral-100">Player Team</div>
                      <div className="text-xs font-bold text-amber-400 mt-0.5">YOU (X)</div>
                    </div>

                    {/* VS */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-xs font-black uppercase tracking-widest text-neutral-600">vs</div>
                      {!isGameOver && (
                        <div className={`text-[10px] font-black uppercase tracking-widest rounded-full px-3 py-1 ${
                          canMove
                            ? "bg-amber-950/40 border border-amber-800/50 text-amber-400"
                            : "bg-neutral-800 border border-neutral-700 text-neutral-500"
                        }`}>
                          {canMove ? "Your Turn" : "AI Thinking..."}
                        </div>
                      )}
                    </div>

                    {/* Away (AI) */}
                    <div className="text-center flex-1">
                      <div className="text-3xl mb-1">🤖</div>
                      <div className="font-black text-sm text-neutral-100 truncate max-w-[120px] mx-auto">{match.awayTeamName}</div>
                      <div className="text-xs font-bold text-violet-400 mt-0.5">
                        AI (O)
                        {opponentStats && <span className="ml-1 text-neutral-500">· {opponentStats.points}pts</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result banner */}
                {resultDisplay && (
                  <div className={`tile rounded-2xl border border-neutral-800 bg-gradient-to-r ${resultDisplay.bg} p-5 text-center`}>
                    <div className={`text-2xl font-black ${resultDisplay.color}`}>{resultDisplay.label}</div>
                    <div className="text-sm text-neutral-400 mt-1">{resultDisplay.sub}</div>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      <button
                        onClick={handleRematch}
                        className="flex items-center gap-2 rounded-xl bg-neutral-800 border border-neutral-700 px-5 py-2 text-sm font-bold text-neutral-200 hover:bg-neutral-700 transition-all"
                      >
                        <RotateCcw className="h-4 w-4" /> Rematch
                      </button>
                      <Link
                        href="/league"
                        className="flex items-center gap-2 rounded-xl bg-violet-600/20 border border-violet-600/40 px-5 py-2 text-sm font-bold text-violet-300 hover:bg-violet-600/30 transition-all"
                      >
                        <Trophy className="h-4 w-4" /> View Standings
                      </Link>
                    </div>
                  </div>
                )}

                {/* TTT Board */}
                <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6">
                  <div className="mx-auto w-full max-w-sm">
                    <div className="grid grid-cols-3 gap-3">
                      {board.map((cell, idx) => {
                        const isWinCell = winLine?.includes(idx);
                        const isEmpty = cell === null;
                        const isClickable = isEmpty && canMove && !isGameOver;

                        return (
                          <button
                            key={idx}
                            onClick={() => isClickable && match && playUserMove(match.id, idx)}
                            disabled={!isClickable}
                            className={`
                              aspect-square rounded-2xl text-4xl font-black flex items-center justify-center
                              transition-all duration-150 select-none
                              ${isWinCell
                                ? cell === "X"
                                  ? "bg-emerald-950/60 border-2 border-emerald-500 shadow-lg shadow-emerald-500/20"
                                  : "bg-red-950/60 border-2 border-red-500 shadow-lg shadow-red-500/20"
                                : "border-2 border-neutral-800 bg-neutral-800/50"
                              }
                              ${isClickable ? "hover:bg-neutral-700/60 hover:border-amber-500/50 cursor-pointer hover:scale-[1.03] active:scale-95" : "cursor-default"}
                              ${isEmpty && !isClickable ? "opacity-40" : ""}
                            `}
                          >
                            {cell === "X" && (
                              <span className={`${isWinCell ? "text-emerald-400" : "text-amber-400"}`}>✕</span>
                            )}
                            {cell === "O" && (
                              <span className={`${isWinCell ? "text-red-400" : "text-violet-400"}`}>○</span>
                            )}
                            {cell === null && isClickable && (
                              <span className="text-neutral-700 text-2xl">·</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Board guide */}
                    {!isGameOver && (
                      <div className="flex justify-center gap-6 mt-5 text-xs text-neutral-500 font-bold">
                        <span className="flex items-center gap-1.5"><span className="text-amber-400 text-base">✕</span> You (X)</span>
                        <span className="flex items-center gap-1.5"><span className="text-violet-400 text-base">○</span> AI (O)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Board state info */}
                {!isGameOver && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 px-4 py-3 flex items-center gap-3">
                    <Zap className="h-4 w-4 text-amber-400 shrink-0" />
                    <p className="text-xs text-neutral-400 font-bold">
                      {canMove
                        ? "Click any empty cell to make your move. The AI will respond instantly."
                        : "The AI is processing its move. After it plays, it'll be your turn again."}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Recent user matches */}
            {league.matches.filter(m => m.isUserMatch && m.result !== "pending").length > 0 && (
              <div className="tile rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Recent Results</h3>
                <div className="space-y-2">
                  {league.matches
                    .filter(m => m.isUserMatch && m.result !== "pending")
                    .slice(0, 5)
                    .map(m => {
                      const won = m.result === "homeWin";
                      const drew = m.result === "draw";
                      return (
                        <div key={m.id} className="flex items-center justify-between text-sm rounded-xl bg-neutral-800/30 px-3 py-2">
                          <span className="text-neutral-400 truncate max-w-[180px]">vs {m.awayTeamName}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {won  ? <TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> :
                             drew ? <Minus className="h-3.5 w-3.5 text-amber-400" /> :
                                    <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                            <span className={`text-xs font-black ${won ? "text-emerald-400" : drew ? "text-amber-400" : "text-red-400"}`}>
                              {won ? "WIN" : drew ? "DRAW" : "LOSS"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <Link href="/matches" className="block text-center text-xs font-bold text-neutral-500 hover:text-neutral-300 mt-3 transition-colors">
                  View Full History →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
