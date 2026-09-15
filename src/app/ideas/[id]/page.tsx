"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "../../../context/AppContext";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LegacyDetailPageRedirect() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { ideas } = useApp();

  const idea = ideas.find((i) => i.id === id);

  useEffect(() => {
    if (idea) {
      router.replace(`/stock/${idea.ticker}`);
    }
  }, [idea, router]);

  if (!idea) {
    return (
      <div className="mx-auto max-w-full px-4 py-32 text-center text-neutral-400 min-h-screen bg-neutral-950">
        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-white">Startup Stock Not Found</h2>
        <p className="mt-2 text-sm">The requested stock does not exist on our simulated exchange.</p>
        <Link href="/ideas" className="mt-6 inline-flex h-10 items-center justify-center rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 px-6 font-bold text-xs">
          Return to Market Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-full px-4 py-32 text-center text-neutral-450 min-h-screen bg-neutral-950">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-10 border-4 border-amber-500 border-t-transparent rounded-full mx-auto animate-spin" />
        <h3 className="text-lg font-black text-white">Redirecting to Stock Terminal...</h3>
        <p className="text-xs text-neutral-500">Routing you to the ticker interface for {idea.name} ({idea.ticker})</p>
      </div>
    </div>
  );
}
