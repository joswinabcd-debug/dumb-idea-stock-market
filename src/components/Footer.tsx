import React from "react";
import Link from "next/link";
import { Lightbulb, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-900 bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8 mt-auto transition-colors duration-300">
      <div className="mx-auto max-w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 text-white shadow-sm shadow-amber-500/20">
                <Lightbulb className="h-4 w-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                Dumb Idea Exchange
              </span>
            </Link>
            <p className="text-sm text-neutral-400 max-w-sm">
              The premier venture capital platform for ideas that probably should have stayed in the shower. Funded entirely with fake pretend money.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Offerings
            </h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  0% ROI Guarantee
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Zero Real Features
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Roadmap (To Nowhere)
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Enterprise Bad Ideas
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Admin */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Legals (Sort of)
            </h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  TOS (Arbitrary)
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Privacy (Nonexistent)
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Disclaimer (Don&apos;t Sue Us)
                </span>
              </li>
              <li>
                <span className="hover:text-white cursor-pointer transition-colors">
                  Careers (Unpaid Internships)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <p>
            © {new Date().getFullYear()} Dumb Idea Exchange, Inc. All rights reserved. 
          </p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> and zero regret for the modern web.
          </p>
        </div>
      </div>
    </footer>
  );
}
