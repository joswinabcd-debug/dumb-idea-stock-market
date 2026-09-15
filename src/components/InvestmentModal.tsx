"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Idea } from "../types";
import { X, DollarSign, Award, CheckCircle } from "lucide-react";

interface InvestmentModalProps {
  idea: Idea;
  onClose: () => void;
}

export default function InvestmentModal({ idea, onClose }: InvestmentModalProps) {
  const { wallet, buyStock } = useApp();
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [investedAmount, setInvestedAmount] = useState(0);

  const presets = [
    { label: "Pre-seed", amount: 500, perk: "Get a thank-you email from a fake CEO" },
    { label: "Seed", amount: 1500, perk: "Your name written on a virtual sticky note" },
    { label: "Series A", amount: 5000, perk: "Virtual seat on our nonexistent board" },
  ];

  const handleInvest = (amount: number) => {
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive number.");
      return;
    }
    if (wallet.balance < amount) {
      setError("Insufficient pretend cash. Pitch your own terrible ideas to get... wait, that doesn't pay either.");
      return;
    }

    setError("");
    const isOk = buyStock(idea.id, amount);
    if (isOk) {
      setInvestedAmount(amount);
      setSuccess(true);
    } else {
      setError("Investment failed. Please try again.");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-2xl p-6 transition-all duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {!success ? (
          <>
            {/* Header */}
            <div className="mb-5 pr-8">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md">
                Angel Investment
              </span>
              <h3 className="mt-2 text-xl font-extrabold text-neutral-900 dark:text-white">
                Back &quot;{idea.name}&quot;
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">
                {idea.pitch}
              </p>
            </div>

            {/* Wallet Info */}
            <div className="mb-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 p-4 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                Your Remaining Pretend Cash:
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(wallet.balance)}
              </span>
            </div>

            {/* Presets */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block">
                Select Investment Tier:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {presets.map((preset) => {
                  const isDisabled = wallet.balance < preset.amount;
                  return (
                    <button
                      key={preset.amount}
                      onClick={() => handleInvest(preset.amount)}
                      disabled={isDisabled}
                      className={`flex flex-col text-left p-3 rounded-2xl border text-sm transition-all ${
                        isDisabled
                          ? "border-neutral-100 dark:border-neutral-800/40 opacity-40 cursor-not-allowed"
                          : "border-neutral-200 dark:border-neutral-800 hover:border-amber-500 hover:bg-amber-50/10 dark:hover:border-amber-500"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full font-bold">
                        <span className="text-neutral-800 dark:text-neutral-200">{preset.label}</span>
                        <span className="text-amber-500">{formatCurrency(preset.amount)}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                        {preset.perk}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Input */}
            <div className="mb-6">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                Or Enter Custom Amount:
              </label>
              <div className="relative rounded-2xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <DollarSign className="h-4 w-4 text-neutral-400" />
                </div>
                <input
                  type="number"
                  placeholder="0"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="block w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-transparent py-2.5 pl-9 pr-24 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none"
                />
                <div className="absolute inset-y-1.5 right-1.5">
                  <button
                    onClick={() => handleInvest(Number(customAmount))}
                    className="h-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 text-xs font-bold transition-colors"
                  >
                    Invest Cash
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 p-2.5 rounded-xl border border-rose-100 dark:border-rose-950/50 mb-4 animate-shake">
                {error}
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mb-4">
              <CheckCircle className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-neutral-950 dark:text-white">
              You are an Investor!
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-xs mx-auto">
              Successfully poured <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(investedAmount)}</strong> into <strong>{idea.name}</strong>.
            </p>
            
            <div className="mt-6 flex flex-col gap-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-950/30 w-fit mx-auto">
                <Award className="h-4 w-4" />
                <span>Non-dilutive pretend equity unlocked!</span>
              </div>

              <button
                onClick={onClose}
                className="mt-6 w-full rounded-2xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 py-2.5 text-sm font-bold shadow-md transition-colors"
              >
                Awesome, close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
