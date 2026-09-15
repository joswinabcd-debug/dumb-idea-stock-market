"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { ArrowUp, ArrowDown } from "lucide-react";

interface VoteButtonsProps {
  ideaId: string;
  upvotes: number;
  downvotes: number;
}

export default function VoteButtons({ ideaId, upvotes, downvotes }: VoteButtonsProps) {
  const { voted, upvoteIdea, downvoteIdea } = useApp();

  const userVote = voted[ideaId];

  return (
    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl w-fit transition-colors duration-200">
      {/* Upvote Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          upvoteIdea(ideaId);
        }}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
          userVote === "up"
            ? "bg-amber-500 text-white shadow-sm"
            : "text-neutral-600 hover:text-amber-500 dark:text-neutral-300 dark:hover:text-amber-400 hover:bg-white/50 dark:hover:bg-neutral-700/50"
        }`}
        title="I would invest my life savings in this"
      >
        <ArrowUp className={`h-3.5 w-3.5 transition-transform duration-200 ${userVote === "up" ? "-translate-y-0.5" : "group-hover:-translate-y-0.5"}`} />
        <span>{upvotes}</span>
      </button>

      {/* Divider */}
      <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700" />

      {/* Downvote Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          downvoteIdea(ideaId);
        }}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
          userVote === "down"
            ? "bg-rose-500 text-white shadow-sm"
            : "text-neutral-600 hover:text-rose-500 dark:text-neutral-300 dark:hover:text-rose-400 hover:bg-white/50 dark:hover:bg-neutral-700/50"
        }`}
        title="Delete this from the internet"
      >
        <ArrowDown className={`h-3.5 w-3.5 transition-transform duration-200 ${userVote === "down" ? "translate-y-0.5" : "group-hover:translate-y-0.5"}`} />
        <span>{downvotes}</span>
      </button>
    </div>
  );
}
