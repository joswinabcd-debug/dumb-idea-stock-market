"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import { CATEGORIES } from "../../data/mockIdeas";
import { 
  Rocket, 
  DollarSign, 
  User, 
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function SubmitPitch() {
  const { createIdea } = useApp();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [pitch, setPitch] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("AI & Tech");
  const [author, setAuthor] = useState("");
  const [targetFunding, setTargetFunding] = useState("500000");

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pitch.trim() || !description.trim()) {
      return;
    }

    createIdea(
      name,
      pitch,
      description,
      category,
      author.trim() || "AnonymousFounder",
      Number(targetFunding) || 500000
    );

    setIsSuccess(true);
  };

  // Filter "All" out of categories
  const categoriesList = CATEGORIES.filter((c) => c !== "All");

  return (
    <div className="mx-auto max-w-full px-4 py-12 sm:px-6 lg:px-8 bg-neutral-950 min-h-screen text-neutral-100 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-950/20 px-2.5 py-1 rounded-xl border border-amber-900/30">
            Founder&apos;s Sandbox
          </span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Pitch a Dumb Startup
          </h1>
          <p className="mt-2 text-sm text-neutral-400">
            Submit your absolute worst business concept. No vetting, no due diligence, 100% chance of peer review.
          </p>
        </div>

        {!isSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Name */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-2">
                    Startup Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Uber for Plants"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 px-4 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* 2. Pitch (one-liner) */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-2">
                    One-line Elevator Pitch *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. On-demand hydration services for household ferns."
                    value={pitch}
                    onChange={(e) => setPitch(e.target.value)}
                    required
                    maxLength={140}
                    className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 px-4 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none transition-colors"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block text-right">
                    {pitch.length}/140 chars max
                  </span>
                </div>

                {/* 3. Description (detail) */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-2">
                    Detailed Pitch (Why is it so bad?) *
                  </label>
                  <textarea
                    placeholder="Describe the logistics. Why will you lose money? What are the key bottlenecks? Sell the joke!"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 px-4 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Row Grid: Category & Founder Alias */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-2">
                      Industry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 px-4 text-sm text-white focus:border-amber-500/50 focus:outline-none transition-colors"
                    >
                      {categoriesList.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Author Alias */}
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-2">
                      Founder Alias
                    </label>
                    <div className="relative rounded-2xl shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="h-4 w-4 text-neutral-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. PlantLover99"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Funding Target */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-2">
                    Pretend Valuation Target ($)
                  </label>
                  <div className="relative rounded-2xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <DollarSign className="h-4 w-4 text-neutral-500" />
                    </div>
                    <input
                      type="number"
                      placeholder="500000"
                      value={targetFunding}
                      onChange={(e) => setTargetFunding(e.target.value)}
                      className="block w-full rounded-2xl border border-neutral-800 bg-neutral-950 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-amber-500/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full inline-flex h-11 items-center justify-center rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-bold shadow-md transition-all hover:scale-[1.01] gap-2"
                >
                  <Rocket className="h-4 w-4" />
                  Launch Pitch Deck
                </button>
              </form>
            </div>

            {/* Warnings Sidebar */}
            <div className="space-y-4">
              {/* Box 1 */}
              <div className="rounded-3xl border border-amber-900/30 bg-amber-950/10 p-5">
                <div className="flex gap-2 text-amber-500 mb-2">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Disclaimer & Warnings
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-neutral-400 list-disc list-inside leading-relaxed">
                  <li>By submitting, you agree that your idea is legally and logically stupid.</li>
                  <li>Our mock board will review, judge, and potentially mock your business plan.</li>
                  <li>No actual funds will be transferred. (Sadly).</li>
                  <li>IP protection does not exist here. If someone else steals your &quot;Airbnb for houseplants,&quot; that&apos;s on you.</li>
                </ul>
              </div>

              {/* Box 2 */}
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 text-center flex flex-col items-center">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-neutral-950 text-neutral-500 mb-3">
                  <Info className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-white">
                  Need Inspiration?
                </h4>
                <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px]">
                  &quot;Bluetooth-enabled spoons&quot;, &quot;Tinder for pet ferrets&quot;, or &quot;A subscription service for dryer lint&quot;. Nothing is too dumb!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-16 bg-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-sm max-w-lg mx-auto">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/20 text-emerald-400 border border-emerald-900/30 mb-6">
              <CheckCircle className="h-8 w-8 animate-bounce" />
            </div>
            
            <h2 className="text-2xl font-black text-white">
              Pitch Deck Published!
            </h2>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              Your terrible business concept <strong>&quot;{name}&quot;</strong> has been listed on the marketplace. Prepare yourself for pretend investments and snarky comments.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/ideas")}
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-2xl bg-white hover:bg-neutral-100 text-neutral-950 px-6 text-sm font-bold shadow-sm transition-colors"
              >
                Go to Browse Feed
              </button>
              
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setName("");
                  setPitch("");
                  setDescription("");
                  setAuthor("");
                  setTargetFunding("500000");
                }}
                className="w-full sm:w-auto inline-flex h-11 items-center justify-center rounded-2xl border border-neutral-850 bg-neutral-950 hover:bg-neutral-900 px-6 text-sm font-bold transition-colors text-neutral-350"
              >
                Pitch Another Idea
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
