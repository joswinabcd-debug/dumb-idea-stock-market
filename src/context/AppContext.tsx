"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Idea, UserWallet, Comment, MarketEvent, Achievement, DailyChallenge, Match, TeamStats, LeagueData } from "../types";
import { MOCK_IDEAS } from "../data/mockIdeas";

interface AppContextType {
  ideas: Idea[];
  wallet: UserWallet;
  voted: Record<string, "up" | "down">;
  news: string[];
  activeEvent: MarketEvent | null;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  league: LeagueData;
  watchlist: string[];
  toggleWatchlist: (id: string) => void;
  marketSession: "pre-market" | "open" | "after-hours" | "closed";
  marketClock: number;
  sentiment: "Fear" | "Neutral" | "Greed" | "Extreme Greed";
  upvoteIdea: (id: string) => void;
  downvoteIdea: (id: string) => void;
  buyStock: (id: string, amount: number) => boolean;
  sellStock: (id: string, sharesToSell: number) => boolean;
  addComment: (ideaId: string, author: string, text: string) => void;
  createIdea: (
    name: string,
    pitch: string,
    description: string,
    category: string,
    author: string,
    targetFunding: number
  ) => void;
  generateRandomStartup: () => void;
  pitchToSharks: (ideaId: string, sharkName: string) => string;
  scheduleMatch: (homeIdeaId: string, awayIdeaId: string) => void;
  playUserMove: (matchId: string, cellIndex: number) => void;
  challengeTeam: (awayIdeaId: string) => void;
  resetLeague: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Preset list of parody headlines
const INITIAL_NEWS = [
  "MARKET UPDATE: Dumb Idea Index (DII) reaches new heights as pretend capital flows in.",
  "BREAKING: Startup 'Netflix for Dreams' sued by local cat claiming intellectual property theft.",
  "INVESTOR RADAR: Venture capitalists shift focus from artificial intelligence to cloud-based geology.",
  "EXCLUSIVE: Mark Puban calls cheek-pinching 'the highest-leverage emotional play of 2026'.",
  "TRENDING: Cloud-Based Pet Rock developers announce horizontal scaling into custom mountain ranges.",
  "ALERT: SEC reminds investors that 'Dumbcorns' do not qualify for FDIC insurance.",
  "TECH REPORT: Smart Fork updates firmware, users report chew speed data posted directly to CEO's phone."
];

// Achievements list
const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_buy", title: "Pretend Venture Capitalist", description: "Buy your first shares in a terrible startup.", unlocked: false, iconName: "Coins" },
  { id: "unicorn", title: "Dumbcorn Hunter", description: "Own shares in a startup valued over $10,000,000.", unlocked: false, iconName: "Award" },
  { id: "meme_king", title: "Market Manipulator", description: "Buy and sell the same stock within a short timeframe.", unlocked: false, iconName: "Flame" },
  { id: "survivor", title: "Crash Test Dummy", description: "Hold stock in a startup while a Market Crash event occurs.", unlocked: false, iconName: "ShieldAlert" },
  { id: "whale", title: "The Wolf of Wall Street", description: "Grow your net portfolio value beyond $25,000.", unlocked: false, iconName: "TrendingUp" },
  { id: "broke", title: "Chapter 11", description: "Let your cash balance fall below $100.", unlocked: false, iconName: "HelpCircle" }
];

// Daily Challenges list
const INITIAL_CHALLENGES: DailyChallenge[] = [
  { id: "trade_3", description: "Invest in 3 different bad startups", target: 3, current: 0, completed: false },
  { id: "make_money", description: "Earn $1,000 profit from selling stock", target: 1000, current: 0, completed: false },
  { id: "survive_crash", description: "Own stock during a market event", target: 1, current: 0, completed: false }
];

// Event archetypes
const MARKET_EVENTS: Omit<MarketEvent, "id" | "timestamp">[] = [
  { name: "📉 Market Crash", description: "Panic in the streets! Valuations fall globally by 25% as VCs realize they are trading pretend money.", impactType: "all", impactFactor: 0.75 },
  { name: "📈 Investor Frenzy", description: "A wave of FOMO sweeps the market! All startup stocks surge by 20%.", impactType: "all", impactFactor: 1.2 },
  { name: "🔥 Viral Meme", description: "A TikTok dancer featured a Pet startup! Pet-related valuations soar by 40%.", impactType: "pets", impactFactor: 1.4 },
  { name: "🤖 AI Bubble", description: "A VC tweeted 'AI is the new fire'. AI & Tech valuations skyrocket by 50%.", impactType: "ai", impactFactor: 1.5 },
  { name: "🚨 SEC Investigation", description: "Regulators question if haunted houses are zoned correctly. Real Estate stocks plunge 30%.", impactType: "realestate", impactFactor: 0.7 },
  { name: "🦈 Shark Tank Hype", description: "An idea got 5 shark offers. Selected stocks jump by 45%.", impactType: "specific", impactFactor: 1.45 }
];

// ─── League helpers (pure functions, no state) ────────────────────────────────

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]           // diags
];

function checkWin(board: ("X"|"O"|null)[], symbol: "X"|"O"): boolean {
  return WIN_LINES.some(([a,b,c]) => board[a]===symbol && board[b]===symbol && board[c]===symbol);
}

function getBestAIMove(board: ("X"|"O"|null)[], aiSymbol: "X"|"O"): number {
  const playerSymbol = aiSymbol === "X" ? "O" : "X";
  // 1. Win if possible
  for (const [a,b,c] of WIN_LINES) {
    const line = [board[a],board[b],board[c]];
    if (line.filter(x=>x===aiSymbol).length===2 && line.includes(null)) {
      return [a,b,c].find(i=>board[i]===null)!;
    }
  }
  // 2. Block opponent
  for (const [a,b,c] of WIN_LINES) {
    const line = [board[a],board[b],board[c]];
    if (line.filter(x=>x===playerSymbol).length===2 && line.includes(null)) {
      return [a,b,c].find(i=>board[i]===null)!;
    }
  }
  // 3. Center
  if (board[4]===null) return 4;
  // 4. Random corner/edge
  const empties = board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);
  return empties[Math.floor(Math.random()*empties.length)];
}

function computeStandings(ideas: Idea[], matches: Match[], prevStandings: TeamStats[]): TeamStats[] {
  const finishedMatches = matches.filter(m => m.result !== "pending" && !m.isUserMatch);
  return ideas.map(idea => {
    const prev = prevStandings.find(s=>s.ideaId===idea.id);
    const homeMatches = finishedMatches.filter(m=>m.homeTeamId===idea.id);
    const awayMatches = finishedMatches.filter(m=>m.awayTeamId===idea.id);
    let wins=0, draws=0, losses=0;
    homeMatches.forEach(m=>{ if(m.result==="homeWin") wins++; else if(m.result==="draw") draws++; else losses++; });
    awayMatches.forEach(m=>{ if(m.result==="awayWin") wins++; else if(m.result==="draw") draws++; else losses++; });
    const played = wins+draws+losses;
    const points = wins*3+draws;
    return {
      ideaId: idea.id,
      teamName: idea.name,
      ticker: idea.ticker,
      played,
      wins,
      draws,
      losses,
      points,
      leagueBonus: prev?.leagueBonus ?? 0 // will be recalculated after sort
    };
  });
}

function applyLeagueBonuses(standings: TeamStats[]): TeamStats[] {
  const sorted = [...standings].sort((a,b)=>b.points-a.points);
  const n = sorted.length;
  return sorted.map((team, idx) => {
    let bonus = 0;
    if (idx === 0) bonus = 0.03;
    else if (idx === 1) bonus = 0.02;
    else if (idx === 2) bonus = 0.01;
    else if (idx >= n-3) bonus = -0.01 - (0.01 * (n-1-idx));
    return { ...team, leagueBonus: bonus };
  });
}

function getTimestamp(): number {
  return Date.now();
}

function generateMockHistory(initialValuation: number, pointsCount: number, trend: number, noise: number): number[] {
  const rawWalk: number[] = [100];
  for (let i = 1; i < pointsCount; i++) {
    const change = (Math.random() - 0.48) * noise + trend;
    rawWalk.push(rawWalk[i - 1] * (1 + change));
  }
  const endVal = rawWalk[rawWalk.length - 1];
  const scale = initialValuation / endVal;
  return rawWalk.map(v => Math.max(v * scale, 1.0));
}

function populateIdeaHistories(idea: Omit<Idea, "history1D" | "history1W" | "history1M" | "history3M" | "history1Y" | "historyAll" | "volumeHistory"> & Partial<Idea>): Idea {
  const baseVal = idea.valuation;
  const sharesOutstanding = idea.sharesOutstanding || 90000;
  const basePrice = baseVal / sharesOutstanding;
  
  const history1D = idea.history1D?.length ? idea.history1D : generateMockHistory(basePrice, 24, 0.0001, 0.015);
  const history1W = idea.history1W?.length ? idea.history1W : generateMockHistory(basePrice, 30, 0.0003, 0.025);
  const history1M = idea.history1M?.length ? idea.history1M : generateMockHistory(basePrice, 30, 0.0006, 0.04);
  const history3M = idea.history3M?.length ? idea.history3M : generateMockHistory(basePrice, 90, 0.001, 0.06);
  const history1Y = idea.history1Y?.length ? idea.history1Y : generateMockHistory(basePrice, 250, 0.002, 0.1);
  const historyAll = idea.historyAll?.length ? idea.historyAll : generateMockHistory(basePrice, 500, 0.004, 0.15);
  const volumeHistory = idea.volumeHistory?.length ? idea.volumeHistory : Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000) + 5000);

  return {
    ...idea,
    history1D,
    history1W,
    history1M,
    history3M,
    history1Y,
    historyAll,
    volumeHistory
  } as Idea;
}

// ─────────────────────────────────────────────────────────────────────────────

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    return MOCK_IDEAS.map(idea => {
      const sector = idea.sector || "Technology";
      const totalShares = idea.totalShares || 100000;
      const sharesOutstanding = idea.sharesOutstanding || 90000;
      const volume = idea.volume || 10000;
      const dailyChange = idea.dailyChange !== undefined ? idea.dailyChange : 0;
      const high52Week = idea.high52Week || (idea.valuation / sharesOutstanding) * 1.2;
      const low52Week = idea.low52Week || (idea.valuation / sharesOutstanding) * 0.8;
      
      return populateIdeaHistories({
        ...idea,
        sector,
        totalShares,
        sharesOutstanding,
        volume,
        dailyChange,
        high52Week,
        low52Week
      });
    });
  });
  const [wallet, setWallet] = useState<UserWallet>({ balance: 10000, investments: {} });
  const [voted, setVoted] = useState<Record<string, "up" | "down">>({});
  const [news, setNews] = useState<string[]>(INITIAL_NEWS);
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(INITIAL_CHALLENGES);
  const [league, setLeague] = useState<LeagueData>(() => {
    const prePopulatedIdeas = MOCK_IDEAS.map(idea => {
      const sector = idea.sector || "Technology";
      const totalShares = idea.totalShares || 100000;
      const sharesOutstanding = idea.sharesOutstanding || 90000;
      const volume = idea.volume || 10000;
      const dailyChange = idea.dailyChange !== undefined ? idea.dailyChange : 0;
      const high52Week = idea.high52Week || (idea.valuation / sharesOutstanding) * 1.2;
      const low52Week = idea.low52Week || (idea.valuation / sharesOutstanding) * 0.8;
      
      return populateIdeaHistories({
        ...idea,
        sector,
        totalShares,
        sharesOutstanding,
        volume,
        dailyChange,
        high52Week,
        low52Week
      });
    });

    const initialStandings = applyLeagueBonuses(
      prePopulatedIdeas.map(idea => ({
        ideaId: idea.id,
        teamName: idea.name,
        ticker: idea.ticker,
        played: 0, wins: 0, draws: 0, losses: 0, points: 0, leagueBonus: 0
      }))
    );

    return {
      matches: [],
      standings: initialStandings,
      userStats: { played: 0, wins: 0, draws: 0, losses: 0, points: 0 },
      currentUserMatch: null,
    };
  });
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [marketSession, setMarketSession] = useState<"pre-market" | "open" | "after-hours" | "closed">("open");
  const [marketClock, setMarketClock] = useState<number>(10); // regular open session starts with 10 ticks
  const [sentiment, setSentiment] = useState<"Fear" | "Neutral" | "Greed" | "Extreme Greed">("Neutral");
  const [isInitialized, setIsInitialized] = useState(false);

  // Keep tracking recent transactions for achievements
  const tradeHistoryRef = useRef<{ id: string; action: "buy" | "sell"; time: number }[]>([]);
  
  // Track news momentum for stock pricing
  const newsMomentumRef = useRef<Record<string, number>>({});

  // Load from localStorage on mount
  useEffect(() => {
    const storedIdeas = localStorage.getItem("dumb_ideas_v2");
    const storedWallet = localStorage.getItem("dumb_wallet_v2");
    const storedVoted = localStorage.getItem("dumb_voted_v2");
    const storedNews = localStorage.getItem("dumb_news_v2");
    const storedAchievements = localStorage.getItem("dumb_achievements_v2");
    const storedChallenges = localStorage.getItem("dumb_challenges_v2");
    const storedLeague = localStorage.getItem("dumb_league_v2");
    const storedWatchlist = localStorage.getItem("dumb_watchlist_v2");

    let loadedIdeas: Idea[] = MOCK_IDEAS;
    if (storedIdeas) {
      try { loadedIdeas = JSON.parse(storedIdeas); } catch {}
    }

    // Ensure all stock market properties exist and histories are populated
    const initializedIdeas = loadedIdeas.map(idea => {
      const sector = idea.sector || "Technology";
      const totalShares = idea.totalShares || 100000;
      const sharesOutstanding = idea.sharesOutstanding || 90000;
      const volume = idea.volume || 10000;
      const dailyChange = idea.dailyChange !== undefined ? idea.dailyChange : 0;
      const high52Week = idea.high52Week || (idea.valuation / sharesOutstanding) * 1.2;
      const low52Week = idea.low52Week || (idea.valuation / sharesOutstanding) * 0.8;
      
      return populateIdeaHistories({
        ...idea,
        sector,
        totalShares,
        sharesOutstanding,
        volume,
        dailyChange,
        high52Week,
        low52Week
      });
    });
    // Avoid synchronous state updates during initial effect run
    setTimeout(() => {
      setIdeas(initializedIdeas);

      if (storedWallet) {
        try { 
          const parsedWallet = JSON.parse(storedWallet);
          // Ensure realizedGL field is initialized on all loaded holdings
          const investments = parsedWallet.investments || {};
          Object.keys(investments).forEach(id => {
            if (investments[id].realizedGL === undefined) {
              investments[id].realizedGL = 0;
            }
          });
          setWallet(parsedWallet); 
        } catch {}
      }
      if (storedVoted) {
        try { setVoted(JSON.parse(storedVoted)); } catch {}
      }
      if (storedNews) {
        try { setNews(JSON.parse(storedNews)); } catch {}
      }
      if (storedAchievements) {
        try { setAchievements(JSON.parse(storedAchievements)); } catch {}
      }
      if (storedChallenges) {
        try { setDailyChallenges(JSON.parse(storedChallenges)); } catch {}
      }
      if (storedWatchlist) {
        try { setWatchlist(JSON.parse(storedWatchlist)); } catch {}
      }
      
      if (storedLeague) {
        try { setLeague(JSON.parse(storedLeague)); } catch {}
      } else {
        // Bootstrap standings from ideas on first run
        const initial = applyLeagueBonuses(
          initializedIdeas.map(idea => ({
            ideaId: idea.id,
            teamName: idea.name,
            ticker: idea.ticker,
            played: 0, wins: 0, draws: 0, losses: 0, points: 0, leagueBonus: 0
          }))
        );
        setLeague(prev => ({ ...prev, standings: initial }));
      }

      setIsInitialized(true);
    }, 0);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dumb_ideas_v2", JSON.stringify(ideas));
    }
  }, [ideas, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dumb_wallet_v2", JSON.stringify(wallet));
    }
  }, [wallet, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dumb_voted_v2", JSON.stringify(voted));
    }
  }, [voted, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dumb_news_v2", JSON.stringify(news));
    }
  }, [news, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dumb_achievements_v2", JSON.stringify(achievements));
    }
  }, [achievements, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dumb_challenges_v2", JSON.stringify(dailyChallenges));
    }
  }, [dailyChallenges, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dumb_league_v2", JSON.stringify(league));
    }
  }, [league, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("dumb_watchlist_v2", JSON.stringify(watchlist));
    }
  }, [watchlist, isInitialized]);

  const toggleWatchlist = (id: string) => {
    setWatchlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Helper to format currency inside news tickers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  // Upvote / Downvote logic
  const upvoteIdea = (id: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== id) return idea;
        const currentVote = voted[id];
        let upChange = 0, downChange = 0;

        if (currentVote === "up") {
          upChange = -1;
          setVoted((v) => { const n = { ...v }; delete n[id]; return n; });
        } else {
          if (currentVote === "down") downChange = -1;
          upChange = 1;
          setVoted((v) => ({ ...v, [id]: "up" }));
        }

        // Upvotes pump the valuation! (+3% per upvote)
        const valuationBump = upChange > 0 ? 1.03 : upChange < 0 ? 0.97 : 1;
        const nextValuation = Math.max(idea.valuation * valuationBump, 50000);

        // Update vote history array
        const nextVoteHistory = [...idea.voteHistory.slice(1), idea.upvotes + upChange];
        const nextValuationHistory = [...idea.valuationHistory.slice(1), nextValuation];

        return {
          ...idea,
          upvotes: idea.upvotes + upChange,
          downvotes: idea.downvotes + downChange,
          valuation: nextValuation,
          valuationHistory: nextValuationHistory,
          voteHistory: nextVoteHistory
        };
      })
    );
  };

  const downvoteIdea = (id: string) => {
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== id) return idea;
        const currentVote = voted[id];
        let upChange = 0, downChange = 0;

        if (currentVote === "down") {
          downChange = -1;
          setVoted((v) => { const n = { ...v }; delete n[id]; return n; });
        } else {
          if (currentVote === "up") upChange = -1;
          downChange = 1;
          setVoted((v) => ({ ...v, [id]: "down" }));
        }

        // Downvotes crash the valuation! (-4% per downvote)
        const valuationDump = downChange > 0 ? 0.96 : downChange < 0 ? 1.04 : 1;
        const nextValuation = Math.max(idea.valuation * valuationDump, 50000);

        const nextVoteHistory = [...idea.voteHistory.slice(1), idea.upvotes + upChange];
        const nextValuationHistory = [...idea.valuationHistory.slice(1), nextValuation];

        return {
          ...idea,
          upvotes: idea.upvotes + upChange,
          downvotes: idea.downvotes + downChange,
          valuation: nextValuation,
          valuationHistory: nextValuationHistory,
          voteHistory: nextVoteHistory
        };
      })
    );
  };

  // Buy Stock shares
  // Share Price = Valuation / Shares Outstanding
  const buyStock = (id: string, amount: number): boolean => {
    if (amount <= 0 || wallet.balance < amount) return false;

    const idea = ideas.find((i) => i.id === id);
    if (!idea) return false;

    let spread = 0.001;
    if (marketSession === "pre-market") spread = 0.003;
    else if (marketSession === "after-hours") spread = 0.002;
    else if (marketSession === "closed") spread = 0.005;

    const rawPrice = idea.valuation / (idea.sharesOutstanding || 10000);
    const buyPrice = rawPrice * (1 + spread);
    const purchasedShares = amount / buyPrice;

    // Deduct cash and record holdings
    setWallet((prev) => {
      const currentHolding = prev.investments[id] || { shares: 0, avgBuyPrice: 0, realizedGL: 0 };
      const nextShares = currentHolding.shares + purchasedShares;
      // Weighted average buy price calculation
      const nextAvgPrice =
        (currentHolding.shares * currentHolding.avgBuyPrice + purchasedShares * buyPrice) / nextShares;

      return {
        balance: prev.balance - amount,
        investments: {
          ...prev.investments,
          [id]: { 
            shares: nextShares, 
            avgBuyPrice: nextAvgPrice, 
            realizedGL: currentHolding.realizedGL || 0 
          }
        }
      };
    });

    // Buying stock drives valuation UP! (+2.5x of purchase ratio)
    setIdeas((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nextValuation = i.valuation + amount * 2.5;
          const nextValHistory = [...i.valuationHistory.slice(1), nextValuation];
          const nextFundingHistory = [...i.fundingHistory.slice(1), i.funding + amount];
          const nextInvestorHistory = [...i.investorHistory.slice(1), i.investorCount + 1];

          // Trigger news momentum boost on purchase!
          newsMomentumRef.current[i.id] = (newsMomentumRef.current[i.id] || 0) + 0.015;

          return {
            ...i,
            funding: i.funding + amount,
            valuation: nextValuation,
            investorCount: i.investorCount + 1,
            valuationHistory: nextValHistory,
            fundingHistory: nextFundingHistory,
            investorHistory: nextInvestorHistory
          };
        }
        return i;
      })
    );

    // Track for achievements
    tradeHistoryRef.current.push({ id, action: "buy", time: getTimestamp() });

    // Update Daily Challenges: Invest in 3 different startups
    setDailyChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id === "trade_3") {
          // Count unique holdings in wallet
          const uniqueHoldingsCount = Object.keys({ ...wallet.investments, [id]: true }).length;
          const current = Math.min(uniqueHoldingsCount, ch.target);
          return { ...ch, current, completed: current >= ch.target };
        }
        return ch;
      })
    );

    // Trigger achievement checks
    triggerAchievementCheck("first_buy");
    if (wallet.balance - amount < 100) triggerAchievementCheck("broke");

    return true;
  };

  // Sell Stock shares
  const sellStock = (id: string, sharesToSell: number): boolean => {
    const holding = wallet.investments[id];
    if (!holding || holding.shares < sharesToSell || sharesToSell <= 0) return false;

    const idea = ideas.find((i) => i.id === id);
    if (!idea) return false;

    let spread = 0.001;
    if (marketSession === "pre-market") spread = 0.003;
    else if (marketSession === "after-hours") spread = 0.002;
    else if (marketSession === "closed") spread = 0.005;

    const rawPrice = idea.valuation / (idea.sharesOutstanding || 10000);
    const sellPrice = rawPrice * (1 - spread);
    const saleRevenue = sharesToSell * sellPrice;
    const purchaseValuationCost = sharesToSell * holding.avgBuyPrice;
    const realizedProfit = saleRevenue - purchaseValuationCost;

    // Credit cash and update holding details
    setWallet((prev) => {
      const currentHolding = prev.investments[id];
      const remainingShares = currentHolding.shares - sharesToSell;
      const nextInvestments = { ...prev.investments };

      if (remainingShares <= 0.0001) {
        // Keep in investments with 0 shares to track realizedGL in dashboard
        nextInvestments[id] = {
          shares: 0,
          avgBuyPrice: 0,
          realizedGL: (currentHolding.realizedGL || 0) + realizedProfit
        };
      } else {
        nextInvestments[id] = {
          shares: remainingShares,
          avgBuyPrice: currentHolding.avgBuyPrice,
          realizedGL: (currentHolding.realizedGL || 0) + realizedProfit
        };
      }

      return {
        balance: prev.balance + saleRevenue,
        investments: nextInvestments
      };
    });

    // Selling stock drops valuation!
    setIdeas((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const nextValuation = Math.max(i.valuation - saleRevenue * 1.5, 50000);
          const nextValHistory = [...i.valuationHistory.slice(1), nextValuation];
          return {
            ...i,
            valuation: nextValuation,
            valuationHistory: nextValHistory
          };
        }
        return i;
      })
    );

    // Track for achievements
    tradeHistoryRef.current.push({ id, action: "sell", time: getTimestamp() });

    // Update daily challenges
    if (realizedProfit > 0) {
      setDailyChallenges((prev) =>
        prev.map((ch) => {
          if (ch.id === "make_money") {
            const nextCurrent = Math.min(ch.current + realizedProfit, ch.target);
            return { ...ch, current: nextCurrent, completed: nextCurrent >= ch.target };
          }
          return ch;
        })
      );
    }

    // Check achievements
    const recent = tradeHistoryRef.current;
    if (recent.length >= 2) {
      const last = recent[recent.length - 1];
      const prev = recent[recent.length - 2];
      if (last.id === prev.id && last.action !== prev.action && last.time - prev.time < 30000) {
        triggerAchievementCheck("meme_king");
      }
    }

    return true;
  };

  const triggerAchievementCheck = (achievementId: string) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === achievementId && !ach.unlocked) {
          // Push a news report
          setNews((newsPrev) => [
            `🏆 ACHIEVEMENT UNLOCKED: "${ach.title}" - ${ach.description}`,
            ...newsPrev.slice(0, 9)
          ]);
          return { ...ach, unlocked: true, unlockedAt: new Date().toISOString() };
        }
        return ach;
      })
    );
  };

  // Add Comment
  const addComment = (ideaId: string, author: string, text: string) => {
    if (!author.trim() || !text.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 9),
      author: author.trim(),
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id === ideaId) {
          return { ...idea, comments: [...(idea.comments || []), newComment] };
        }
        return idea;
      })
    );
  };

  // Create Startup Idea
  const createIdea = (
    name: string,
    pitch: string,
    description: string,
    category: string,
    author: string,
    targetFunding: number
  ) => {
    const val = Math.floor(Math.random() * 800000) + 200000; // $200k to $1M seed valuation
    const ticker = name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase() || "IDEX";
    const sector = category === "AI & Tech" ? "Technology" : category === "Pets" ? "Pets" : category === "Real Estate" ? "Paranormal" : category === "Lifestyle" ? "Transportation" : category === "Entertainment" ? "Entertainment" : "Technology";
    const totalShares = 100000;
    const sharesOutstanding = 90000;
    const initialPrice = val / sharesOutstanding;

    const newIdeaRaw = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      pitch: pitch.trim(),
      description: description.trim(),
      category: category,
      author: author.trim() || "AnonymousFounder",
      upvotes: 0,
      downvotes: 0,
      funding: 0,
      targetFunding: targetFunding || 500000,
      createdAt: new Date().toISOString(),
      comments: [],
      
      // Stock Market Additions
      ticker,
      valuation: val,
      investorCount: 1,
      growth: 0,
      riskScore: Math.random() > 0.6 ? "Extreme" : Math.random() > 0.3 ? "High" : "Silly",
      valuationHistory: Array(10).fill(val),
      fundingHistory: Array(10).fill(0),
      investorHistory: Array(10).fill(1),
      popularityHistory: Array(10).fill(50),
      voteHistory: Array(10).fill(0),

      // Realistic Market Mechanics
      sector,
      totalShares,
      sharesOutstanding,
      volume: Math.floor(Math.random() * 10000) + 1000,
      dailyChange: 0,
      high52Week: initialPrice,
      low52Week: initialPrice,

      // History arrays — populated immediately by populateIdeaHistories below
      history1D: [] as number[],
      history1W: [] as number[],
      history1M: [] as number[],
      history3M: [] as number[],
      history1Y: [] as number[],
      historyAll: [] as number[],
      volumeHistory: [] as number[],
    };

    const newIdea = populateIdeaHistories(newIdeaRaw as Idea);

    setIdeas((prev) => [newIdea, ...prev]);

    // Push news ticker headline
    setNews((newsPrev) => [
      `🆕 NEW PITCH IPO: ${name} (${ticker}) lists on the marketplace at a seed valuation of ${formatCurrency(val)}.`,
      ...newsPrev.slice(0, 9)
    ]);
  };

  // Random Startup Generator
  const generateRandomStartup = () => {
    const prefixes = ["Spotify", "Uber", "Tinder", "Airbnb", "Amazon", "LinkedIn", "Zoom", "Slack"];
    const nouns = ["Cows", "Fish", "Rocks", "Toddlers", "Ghosts", "Lawnmowers", "Pineapples", "Houseplants", "Aliens"];
    const descriptions = [
      "AI-driven hyper-local peer-to-peer sharing solutions for the modern demographic.",
      "An automated cloud-native paradigm shifting direct-to-consumer delivery network.",
      "Blockchain-enabled interactive matching algorithms with 0% downtime and guaranteed high latency.",
      "A premium subscription service that gamifies daily tasks with real non-dilutive virtual equity."
    ];

    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const name = `${randomPrefix} for ${randomNoun}`;
    const pitch = `The world's first ${randomPrefix.toLowerCase()}-style utility built specifically for ${randomNoun.toLowerCase()}.`;
    const desc = `${descriptions[Math.floor(Math.random() * descriptions.length)]} Perfect for raising early venture rounds.`;
    const category = Math.random() > 0.5 ? "AI & Tech" : Math.random() > 0.5 ? "Lifestyle" : "Pets";

    createIdea(name, pitch, desc, category, "RandomBot", 600000);
  };

  // Pitch to Sharks (Mark Puban, Kevin O'Jeery, Lori Greener)
  const pitchToSharks = (ideaId: string, sharkName: string): string => {
    const idea = ideas.find((i) => i.id === ideaId);
    if (!idea) return "Idea not found.";

    const risk = idea.riskScore;

    switch (sharkName) {
      case "Mark Puban":
        if (risk === "Extreme" || risk === "Memetic") {
          return `Mark Puban: "This is completely insane, UBRG-level madness. It's high risk, but I love high energy. I'll offer you $1.5M fake bucks for 30% of the company!"`;
        }
        return `Mark Puban: "Honestly, the synergy metrics are too low. There's no blockchain or AI hook. For those reasons, I'm out."`;

      case "Kevin O'Jeery":
        return `Kevin O'Jeery: "This is a cockroach, not a startup. It's ridiculous. You want $${formatCurrency(idea.valuation)}? I'll offer you $5,000 as a loan at 45% royalty until I get my money back 10x, then 50% equity. Take it or I'll crush you like a bug."`;

      case "Lori Greener":
        if (idea.category === "Lifestyle" || idea.category === "Food & Beverage") {
          return `Lori Greener: "I can see this on QVC tomorrow! Confused buyers will buy thousands of these smart devices. I'm offering exactly what you want for 15% equity."`;
        }
        return `Lori Greener: "It's not hero product material for me. It's a bit too stupid, even for this marketplace. I'm out, but I wish you pretend luck!"`;

      default:
        return "Shark not found.";
    }
  };

  // ─── League actions ──────────────────────────────────────────────────────────

  const scheduleMatch = (homeIdeaId: string, awayIdeaId: string) => {
    const homeIdea = ideas.find(i => i.id === homeIdeaId);
    const awayIdea = ideas.find(i => i.id === awayIdeaId);
    if (!homeIdea || !awayIdea) return;
    const newMatch: Match = {
      id: Math.random().toString(36).substring(2, 9),
      homeTeamId: homeIdeaId,
      awayTeamId: awayIdeaId,
      homeTeamName: homeIdea.name,
      awayTeamName: awayIdea.name,
      board: Array(9).fill(null),
      turn: "home",
      result: "pending",
      homeScore: 0,
      awayScore: 0,
      timestamp: new Date().toISOString(),
      isUserMatch: false,
    };
    setLeague(prev => ({ ...prev, matches: [newMatch, ...prev.matches].slice(0, 100) }));
  };

  const challengeTeam = (awayIdeaId: string) => {
    const awayIdea = ideas.find(i => i.id === awayIdeaId);
    if (!awayIdea) return;
    const userMatch: Match = {
      id: Math.random().toString(36).substring(2, 9),
      homeTeamId: "player",
      awayTeamId: awayIdeaId,
      homeTeamName: "🏆 Player Team",
      awayTeamName: awayIdea.name,
      board: Array(9).fill(null),
      turn: "home",
      result: "pending",
      homeScore: 0,
      awayScore: 0,
      timestamp: new Date().toISOString(),
      isUserMatch: true,
    };
    setLeague(prev => ({
      ...prev,
      currentUserMatch: userMatch,
      matches: [userMatch, ...prev.matches].slice(0, 100)
    }));
  };

  const playUserMove = (matchId: string, cellIndex: number) => {
    setLeague(prev => {
      const match = prev.currentUserMatch;
      if (!match || match.id !== matchId) return prev;
      if (match.result !== "pending") return prev;
      if (match.board[cellIndex] !== null) return prev;
      if (match.turn !== "home") return prev; // player is always "home" (X)

      // Player move
      const boardAfterPlayer = [...match.board] as ("X"|"O"|null)[];
      boardAfterPlayer[cellIndex] = "X";

      let result: Match["result"] = "pending";
      if (checkWin(boardAfterPlayer, "X")) result = "homeWin";
      else if (boardAfterPlayer.every(c => c !== null)) result = "draw";

      let finalBoard = boardAfterPlayer;
      let finalTurn: Match["turn"] = "away";

      // AI move (only if game still going)
      if (result === "pending") {
        const aiIdx = getBestAIMove(boardAfterPlayer, "O");
        finalBoard = [...boardAfterPlayer] as ("X"|"O"|null)[];
        finalBoard[aiIdx] = "O";
        if (checkWin(finalBoard, "O")) result = "awayWin";
        else if (finalBoard.every(c => c !== null)) result = "draw";
        finalTurn = "home";
      }

      const updatedMatch: Match = {
        ...match,
        board: finalBoard,
        turn: finalTurn,
        result,
        timestamp: new Date().toISOString(),
      };

      // Update user stats
      const userStats = { ...prev.userStats };
      if (result !== "pending") {
        userStats.played++;
        if (result === "homeWin") { userStats.wins++; userStats.points += 3; }
        else if (result === "draw") { userStats.draws++; userStats.points += 1; }
        else { userStats.losses++; }

        // League news
        const resultText = result === "homeWin" ? "Player Team WINS" : result === "draw" ? "a DRAW" : "Player Team LOSES";
        setNews(prev => [
          `🏆 LEAGUE RESULT: ${resultText} vs ${match.awayTeamName}! ${result === "homeWin" ? "📈 Investors cheer!" : result === "draw" ? "📊 Stable result." : "📉 Shareholders concerned."}`,
          ...prev.slice(0, 9)
        ]);
      }

      const updatedMatches = prev.matches.map(m => m.id === matchId ? updatedMatch : m);

      return {
        ...prev,
        currentUserMatch: updatedMatch,
        matches: updatedMatches,
        userStats,
      };
    });
  };

  const resetLeague = () => {
    const initial = applyLeagueBonuses(
      ideas.map(idea => ({
        ideaId: idea.id, teamName: idea.name, ticker: idea.ticker,
        played: 0, wins: 0, draws: 0, losses: 0, points: 0, leagueBonus: 0
      }))
    );
    setLeague({
      matches: [],
      standings: initial,
      userStats: { played: 0, wins: 0, draws: 0, losses: 0, points: 0 },
      currentUserMatch: null,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────

  // Real-time market tick loop (updates values, checks challenges, handles random events)
  useEffect(() => {
    if (!isInitialized || ideas.length === 0) return;

    const interval = setInterval(() => {
      // A. Advance market clock and handle sessions
      let currentSession = marketSession;
      setMarketSession(prevSession => {
        let nextSession = prevSession;
        setMarketClock(prevClock => {
          if (prevClock <= 1) {
            // Transition to next session
            let nextClock = 10;
            if (prevSession === "pre-market") {
              nextSession = "open";
              nextClock = 12;
              setNews((newsPrev) => ["🔔 MARKET BELL: Dumb Idea Exchange is now OPEN! Normal trading session begins.", ...newsPrev.slice(0, 9)]);
            } else if (prevSession === "open") {
              nextSession = "after-hours";
              nextClock = 5;
              setNews((newsPrev) => ["🔔 AFTER HOURS: Regular trading hours closed. After hours matching session active.", ...newsPrev.slice(0, 9)]);
            } else if (prevSession === "after-hours") {
              nextSession = "closed";
              nextClock = 6;
              setNews((newsPrev) => ["💤 MARKET CLOSED: Regular and after-hours trading closed. Volatility is flat.", ...newsPrev.slice(0, 9)]);
            } else {
              nextSession = "pre-market";
              nextClock = 4;
              setNews((newsPrev) => ["🌅 PRE-MARKET: Early pre-market trading is active before the bell.", ...newsPrev.slice(0, 9)]);
            }
            currentSession = nextSession;
            return nextClock;
          }
          return prevClock - 1;
        });
        return nextSession;
      });

      // B. Roll for a random global event (12% chance)
      let eventToApply: MarketEvent | null = null;
      if (Math.random() < 0.12) {
        const randomEventArchetype = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
        
        let actualEventName = randomEventArchetype.name;
        // If it's a specific shark event, pick a random stock to apply to
        if (randomEventArchetype.impactType === "specific" && ideas.length > 0) {
          const randIdea = ideas[Math.floor(Math.random() * ideas.length)];
          actualEventName = `🦈 Shark Tank: ${randIdea.name}`;
        }

        eventToApply = {
          id: Math.random().toString(),
          name: actualEventName,
          description: randomEventArchetype.description,
          impactType: randomEventArchetype.impactType,
          impactFactor: randomEventArchetype.impactFactor,
          timestamp: new Date().toISOString()
        };

        setActiveEvent(eventToApply);

        // Alert news headline
        setNews((prev) => [
          `🚨 MARKET UPDATE: ${eventToApply!.name} - ${eventToApply!.description}`,
          ...prev.slice(0, 9)
        ]);

        // Daily Challenge Update
        setDailyChallenges((prev) =>
          prev.map((ch) => {
            if (ch.id === "survive_crash") {
              const ownsStock = Object.keys(wallet.investments).length > 0;
              if (ownsStock) {
                return { ...ch, current: 1, completed: true };
              }
            }
            return ch;
          })
        );
      } else {
        // Auto-clear events after 1 tick to simulate flashing nature
        setActiveEvent(null);
      }

      // C. Ticking startup updates
      setIdeas((prevIdeas) => {
        // Calculate average performance to adjust market sentiment
        const avgG = prevIdeas.reduce((sum, i) => sum + i.growth, 0) / prevIdeas.length;
        setSentiment(() => {
          if (avgG > 12) return "Extreme Greed";
          if (avgG > 3) return "Greed";
          if (avgG < -4) return "Fear";
          return "Neutral";
        });

        return prevIdeas.map((idea) => {
          // Volatility multiplier from active session
          let volMultiplier = 1.0;
          if (currentSession === "pre-market") volMultiplier = 0.4;
          else if (currentSession === "after-hours") volMultiplier = 0.6;
          else if (currentSession === "closed") volMultiplier = 0.02;

          // 1. Random Market Movement
          const randomMovement = (Math.random() * 8.4 - 4.0) / 100; // -4.0% to +4.4% standard shift

          // 2. League Bonus (from standings)
          const leagueEntry = league.standings.find(s => s.ideaId === idea.id);
          const leagueBonus = leagueEntry?.leagueBonus ?? 0;

          // 3. Investor Demand (upvotes - downvotes)
          const netVotes = idea.upvotes - idea.downvotes;
          const voteDemand = Math.max(Math.min(netVotes * 0.0001, 0.02), -0.02);

          // 4. Sentiment Impact
          let sentimentImpact = 0;
          if (sentiment === "Extreme Greed") sentimentImpact = 0.015;
          else if (sentiment === "Greed") sentimentImpact = 0.006;
          else if (sentiment === "Fear") sentimentImpact = -0.008;

          // 5. Event Impact
          let eventImpact = 0;
          if (eventToApply) {
            if (eventToApply.impactType === "all") {
              eventImpact = (eventToApply.impactFactor - 1) * 0.5; // Scaled down for tick-by-tick
            } else if (eventToApply.impactType === "ai" && idea.sector === "Technology") {
              eventImpact = 0.08;
            } else if (eventToApply.impactType === "pets" && idea.sector === "Pets") {
              eventImpact = 0.06;
            } else if (idea.sector === "Real Estate" && eventToApply.impactType === "realestate") {
              eventImpact = -0.05;
            } else if (eventToApply.impactType === "specific" && eventToApply.description.includes(idea.name)) {
              eventImpact = 0.12;
            }
          }

          // 6. News Impact (momentum)
          const newsImpact = newsMomentumRef.current[idea.id] || 0;
          // Decay momentum by 50% each tick
          newsMomentumRef.current[idea.id] = newsImpact * 0.5;

          // Final movement formula
          const percentageChange = (randomMovement + leagueBonus + voteDemand + sentimentImpact + eventImpact + newsImpact) * volMultiplier;
          const nextValuation = Math.max(idea.valuation * (1 + percentageChange), 50000);
          
          // Growth computation relative to 10 ticks ago
          const startingVal = idea.valuationHistory[0] || nextValuation;
          const nextGrowth = Math.round(((nextValuation - startingVal) / startingVal) * 100 * 10) / 10;

          // Update histories
          const nextValHistory = [...idea.valuationHistory.slice(1), nextValuation];
          
          const sharesO = idea.sharesOutstanding || 90000;
          const currentPrice = nextValuation / sharesO;
          const next1D = [...idea.history1D.slice(1), currentPrice];
          const next1W = [...idea.history1W.slice(1), currentPrice];
          const next1M = [...idea.history1M.slice(1), currentPrice];
          const next3M = [...idea.history3M.slice(1), currentPrice];
          const next1Y = [...idea.history1Y.slice(1), currentPrice];
          const nextAll = [...idea.historyAll.slice(1), currentPrice];

          // 52 Week High/Low Price
          const nextHigh = Math.max(idea.high52Week, currentPrice);
          const nextLow = Math.min(idea.low52Week, currentPrice);

          // Daily Change calculation
          const openingPrice = next1D[0] || currentPrice;
          const nextDailyChange = Math.round(((currentPrice - openingPrice) / openingPrice) * 100 * 100) / 100;

          // Volume calculations
          const baseVol = Math.floor(Math.random() * 5000) + 1000;
          const nextVolume = Math.floor(baseVol * volMultiplier * (1 + Math.abs(percentageChange) * 15));
          const nextVolumeHistory = [...idea.volumeHistory.slice(1), nextVolume];

          const investorBump = Math.floor(Math.random() * 5) - (nextGrowth < 0 ? 3 : 1);
          const nextInvCount = Math.max(idea.investorCount + investorBump, 1);
          const nextInvHistory = [...idea.investorHistory.slice(1), nextInvCount];

          const nextFunding = idea.funding + (Math.random() > 0.7 ? Math.floor(Math.random() * 2000) : 0);
          const nextFundingHistory = [...idea.fundingHistory.slice(1), nextFunding];

          const nextPopHistory = [...idea.popularityHistory.slice(1), Math.max(Math.min(idea.popularityHistory[9] + (Math.floor(Math.random() * 11) - 5), 100), 5)];
          const nextVoteHistory = [...idea.voteHistory.slice(1), idea.upvotes];

          // Check for Unicorn Achievement
          if (nextValuation >= 10000000) {
            // Check if user owns this stock
            if (wallet.investments[idea.id]?.shares > 0) {
              setTimeout(() => triggerAchievementCheck("unicorn"), 50);
            }
          }

          return {
            ...idea,
            valuation: nextValuation,
            growth: nextGrowth,
            investorCount: nextInvCount,
            funding: nextFunding,
            valuationHistory: nextValHistory,
            investorHistory: nextInvHistory,
            fundingHistory: nextFundingHistory,
            popularityHistory: nextPopHistory,
            voteHistory: nextVoteHistory,
            volume: nextVolume,
            volumeHistory: nextVolumeHistory,
            dailyChange: nextDailyChange,
            high52Week: nextHigh,
            low52Week: nextLow,
            history1D: next1D,
            history1W: next1W,
            history1M: next1M,
            history3M: next3M,
            history1Y: next1Y,
            historyAll: nextAll
          };
        });
      });

      // Check survivor achievement if a crash just hit and user holds stock
      if (eventToApply && eventToApply.name.includes("Market Crash")) {
        const ownsStock = Object.keys(wallet.investments).length > 0;
        if (ownsStock) {
          triggerAchievementCheck("survivor");
        }
      }

      // Check Portfolio Value for Whale achievement
      const totalEquity = Object.entries(wallet.investments).reduce((sum, [id, holding]) => {
        const idea = ideas.find((i) => i.id === id);
        if (!idea) return sum;
        return sum + holding.shares * (idea.valuation / (idea.sharesOutstanding || 10000));
      }, 0);
      const totalNetWorth = wallet.balance + totalEquity;

      if (totalNetWorth >= 25000) {
        triggerAchievementCheck("whale");
      }

      // Check Portfolio net challenge
      setDailyChallenges((prev) =>
        prev.map((ch) => {
          if (ch.id === "survive_crash") {
            if (totalNetWorth >= 15000) {
              return { ...ch, current: 1, completed: true };
            }
          }
          return ch;
        })
      );

      // ── League auto-tick (runs alongside existing market logic) ──────────────
      setLeague(prevLeague => {
        let updatedMatches = [...prevLeague.matches];

        // Step A: Advance ONE pending auto-match by one AI move
        const pendingAutoIdx = updatedMatches.findIndex(m => m.result === "pending" && !m.isUserMatch);
        if (pendingAutoIdx >= 0) {
          const m = { ...updatedMatches[pendingAutoIdx] };
          const currentSymbol = m.turn === "home" ? "X" : "O";
          const moveIdx = getBestAIMove(m.board, currentSymbol);
          if (moveIdx >= 0 && m.board[moveIdx] === null) {
            const newBoard = [...m.board] as ("X"|"O"|null)[];
            newBoard[moveIdx] = currentSymbol;
            let result: Match["result"] = "pending";
            if (checkWin(newBoard, currentSymbol)) result = m.turn === "home" ? "homeWin" : "awayWin";
            else if (newBoard.every(c => c !== null)) result = "draw";
            m.board = newBoard;
            m.turn = m.turn === "home" ? "away" : "home";
            m.result = result;
            m.timestamp = new Date().toISOString();

            if (result !== "pending") {
              // Generate a league news headline when match finishes
              const resultLabel = result === "homeWin" ? `${m.homeTeamName} WINS` : result === "awayWin" ? `${m.awayTeamName} WINS` : "DRAW";
              setNews(prev => [
                `⚽ LEAGUE RESULT: ${m.homeTeamName} vs ${m.awayTeamName} — ${resultLabel}! Market reacts accordingly.`,
                ...prev.slice(0, 9)
              ]);

              // Apply news momentum to winner and loser!
              const winnerId = result === "homeWin" ? m.homeTeamId : result === "awayWin" ? m.awayTeamId : "";
              const loserId = result === "homeWin" ? m.awayTeamId : result === "awayWin" ? m.homeTeamId : "";
              if (winnerId && winnerId !== "player") {
                newsMomentumRef.current[winnerId] = (newsMomentumRef.current[winnerId] || 0) + 0.035;
              }
              if (loserId && loserId !== "player") {
                newsMomentumRef.current[loserId] = (newsMomentumRef.current[loserId] || 0) - 0.025;
              }
            }
            updatedMatches[pendingAutoIdx] = m;
          }
        }

        // Step B: Schedule a new auto-match every ~5 ticks (40s) via random chance
        const autoMatches = updatedMatches.filter(m => !m.isUserMatch);
        const pendingCount = autoMatches.filter(m => m.result === "pending").length;
        if (pendingCount < 2 && ideas.length >= 2 && Math.random() < 0.35) {
          const shuffled = [...ideas].sort(() => Math.random() - 0.5);
          const home = shuffled[0];
          const away = shuffled[1];
          // Don't schedule duplicate live matches
          const alreadyPending = updatedMatches.some(
            m => m.result === "pending" && !m.isUserMatch &&
              ((m.homeTeamId===home.id&&m.awayTeamId===away.id)||(m.homeTeamId===away.id&&m.awayTeamId===home.id))
          );
          if (!alreadyPending) {
            const newMatch: Match = {
              id: Math.random().toString(36).substring(2,9),
              homeTeamId: home.id, awayTeamId: away.id,
              homeTeamName: home.name, awayTeamName: away.name,
              board: Array(9).fill(null),
              turn: "home", result: "pending",
              homeScore: 0, awayScore: 0,
              timestamp: new Date().toISOString(),
              isUserMatch: false,
            };
            updatedMatches = [newMatch, ...updatedMatches].slice(0, 100);
          }
        }

        // Step C: Recompute standings & bonuses from all finished non-user matches
        const rawStandings = computeStandings(ideas, updatedMatches, prevLeague.standings);
        const newStandings = applyLeagueBonuses(rawStandings);

        return { ...prevLeague, matches: updatedMatches, standings: newStandings };
      });
      // ─────────────────────────────────────────────────────────────────────────

    }, 8000);

    return () => clearInterval(interval);
  }, [isInitialized, ideas.length, wallet, marketSession, sentiment]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppContext.Provider
      value={{
        ideas,
        wallet,
        voted,
        news,
        activeEvent,
        achievements,
        dailyChallenges,
        league,
        watchlist,
        toggleWatchlist,
        marketSession,
        marketClock,
        sentiment,
        upvoteIdea,
        downvoteIdea,
        buyStock,
        sellStock,
        addComment,
        createIdea,
        generateRandomStartup,
        pitchToSharks,
        scheduleMatch,
        playUserMove,
        challengeTeam,
        resetLeague,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppContextProvider");
  return context;
}
