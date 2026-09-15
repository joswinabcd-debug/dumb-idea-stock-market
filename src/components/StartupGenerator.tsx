"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, Megaphone, CheckCircle2 } from "lucide-react";

export default function StartupGenerator() {
  const { ideas, generateRandomStartup, pitchToSharks } = useApp();
  const [activeTab, setActiveTab] = useState<"generate" | "pitch">("generate");

  // Generator States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedName, setGeneratedName] = useState("");

  // Shark States
  const [selectedIdeaId, setSelectedIdeaId] = useState("");
  const [selectedShark, setSelectedShark] = useState("Mark Puban");
  const [sharkFeedback, setSharkFeedback] = useState("");

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedName("");
    
    setTimeout(() => {
      generateRandomStartup();
      setIsGenerating(false);
      // Retrieve the newly created startup (it's the first in list)
      setGeneratedName("A new startup was registered and IPO'd on the exchange!");
    }, 1200);
  };

  const handlePitch = () => {
    if (!selectedIdeaId) {
      setSharkFeedback("Please select a startup first.");
      return;
    }
    const feedback = pitchToSharks(selectedIdeaId, selectedShark);
    setSharkFeedback(feedback);
  };

  const sharks = [
    { name: "Mark Puban", desc: "Energy & scale investor. Hates low leverage.", avatar: "🦈" },
    { name: "Kevin O'Jeery", desc: "Cockroach hunter. Demands heavy royalties.", avatar: "👺" },
    { name: "Lori Greener", desc: "Hero-product visualist. QVC queen.", avatar: "👑" },
  ];

  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
      {/* Header Tabs */}
      <div className="flex border-b border-neutral-800 bg-neutral-900/60">
        <button
          onClick={() => { setActiveTab("generate"); setSharkFeedback(""); }}
          className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "generate"
              ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Random IPO Generator
        </button>
        <button
          onClick={() => { setActiveTab("pitch"); setGeneratedName(""); }}
          className={`flex-1 py-4 text-sm font-bold text-center border-b-2 transition-all flex items-center justify-center gap-2 ${
            activeTab === "pitch"
              ? "border-amber-500 text-amber-500 bg-amber-500/[0.02]"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Pitch to the Sharks
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6">
        {activeTab === "generate" ? (
          <div className="text-center py-6 space-y-6">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-extrabold text-white">
                Launch a Random Startup IPO
              </h3>
              <p className="text-xs text-neutral-400 mt-2">
                Our advanced cloud algorithms will compile premium buzzwords (Tinder, Spotify, AWS, Plant rocks, Fish) to structure the next meme market asset.
              </p>
            </div>

            <div className="h-28 flex items-center justify-center bg-neutral-950/40 rounded-2xl border border-neutral-800/80 p-4">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                  <span className="text-xs font-semibold text-neutral-400 animate-pulse">Consulting Synergy Partners...</span>
                </div>
              ) : generatedName ? (
                <div className="flex flex-col items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-bounce" />
                  <span className="text-xs font-bold">{generatedName}</span>
                  <span className="text-[10px] text-neutral-400">Go to &quot;Browse Pitches&quot; to check its stock price.</span>
                </div>
              ) : (
                <span className="text-xs text-neutral-500 italic">No startup launched yet. Press the button below.</span>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-bold px-8 shadow-md transition-all hover:scale-[1.02] gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              Generate & Launch IPO
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Form controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Select Startup */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-2">
                  Select a Startup Stock:
                </label>
                <select
                  value={selectedIdeaId}
                  onChange={(e) => setSelectedIdeaId(e.target.value)}
                  className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 px-4 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Choose Startup --</option>
                  {ideas.map((idea) => (
                    <option key={idea.id} value={idea.id}>
                      {idea.name} ({idea.ticker}) - ${Math.round(idea.valuation / 1000)}k Val
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Shark */}
              <div>
                <label className="text-xs font-bold text-neutral-400 block mb-2">
                  Choose a Shark:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {sharks.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setSelectedShark(s.name)}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center flex flex-col items-center gap-1 transition-all ${
                        selectedShark === s.name
                          ? "border-amber-500 bg-amber-500/10 text-white"
                          : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-xl">{s.avatar}</span>
                      <span>{s.name.split(" ")[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pitch Button */}
            <button
              onClick={handlePitch}
              className="w-full inline-flex h-11 items-center justify-center rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-950 text-xs font-bold shadow-md transition-colors"
            >
              <Megaphone className="h-4 w-4 mr-1.5" />
              Pitch Idea to {selectedShark}!
            </button>

            {/* Shark Speech Bubble */}
            {sharkFeedback && (
              <div className="bg-neutral-950/80 p-5 rounded-2xl border border-neutral-800 flex items-start gap-4 animate-fade-in">
                <div className="h-12 w-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-2xl shrink-0">
                  {sharks.find((s) => s.name === selectedShark)?.avatar}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">
                    {selectedShark} says:
                  </span>
                  <p className="text-xs text-neutral-200 leading-relaxed font-semibold italic">
                    {sharkFeedback}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
