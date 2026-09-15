export interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Idea {
  id: string;
  name: string;
  pitch: string;
  description: string;
  category: string;
  author: string;
  upvotes: number;
  downvotes: number;
  funding: number;
  targetFunding: number;
  createdAt: string;
  comments: Comment[];
  
  // Stock Market Additions
  ticker: string;
  valuation: number;
  investorCount: number;
  growth: number; // percentage growth (e.g. +12)
  riskScore: "Silly" | "High" | "Extreme" | "Memetic";
  
  // Historical tracks for charts (length 10-15)
  valuationHistory: number[];
  fundingHistory: number[];
  investorHistory: number[];
  popularityHistory: number[];
  voteHistory: number[];

  // Realistic Market Mechanics
  sector: string;
  totalShares: number;
  sharesOutstanding: number;
  volume: number;
  dailyChange: number;
  high52Week: number;
  low52Week: number;
  
  // Timeframe Histories
  history1D: number[];
  history1W: number[];
  history1M: number[];
  history3M: number[];
  history1Y: number[];
  historyAll: number[];
  volumeHistory: number[]; // volume history corresponding to the main points
}

export interface Holding {
  shares: number;       // total simulated shares owned
  avgBuyPrice: number;  // average valuation at buy time
  realizedGL: number;   // total realized profit/loss from selling this asset
}

export interface UserWallet {
  balance: number;
  investments: Record<string, Holding>; // maps ideaId -> holding details
}

export interface MarketEvent {
  id: string;
  name: string;
  description: string;
  impactType: "all" | "ai" | "realestate" | "pets" | "specific";
  impactFactor: number; // e.g. 1.4 for +40%, 0.6 for -40%
  timestamp: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
  iconName: string;
}

export interface DailyChallenge {
  id: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
}

// ─── Tic Tac Toe League ───────────────────────────────────────────────────────

export interface Match {
  id: string;
  homeTeamId: string;        // idea.id acting as team
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  board: ("X" | "O" | null)[];  // 9-cell board
  turn: "home" | "away";
  result: "pending" | "homeWin" | "awayWin" | "draw";
  homeScore: number;         // goals equivalent
  awayScore: number;
  timestamp: string;
  isUserMatch: boolean;      // true when user is the home team
}

export interface TeamStats {
  ideaId: string;
  teamName: string;
  ticker: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;            // 3-1-0 scoring
  leagueBonus: number;       // percentage bonus applied to stock (+3% to -3%)
}

export interface LeagueData {
  matches: Match[];
  standings: TeamStats[];
  userStats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    points: number;
  };
  currentUserMatch: Match | null;
}
