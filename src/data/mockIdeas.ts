import { Idea } from "../types";

export const MOCK_IDEAS: Idea[] = [
  {
    id: "1",
    name: "Uber for Grandmas",
    pitch: "Get a certified grandmother to pinch your cheeks, bake cookies, or ask why you aren't married yet on-demand.",
    description: "Are you feeling lonely or lacking pressure to settle down? Order a 'Babushka' or 'Nana' directly to your location. They arrive with Tupperware containers full of hot cookies, examine your sweater for loose threads, and ask why you don't call more often. Premium options include a grandmother who will aggressively brag about you to your neighbors.",
    category: "Lifestyle",
    author: "GrandmaConqueror",
    upvotes: 432,
    downvotes: 21,
    funding: 235000,
    targetFunding: 500000,
    createdAt: "2026-05-28T14:22:00Z",
    comments: [
      {
        id: "c1",
        author: "VC_Chad",
        text: "The cookie margins are low, but the cheek-pinching retention rates are insane. I'm in for $50k.",
        createdAt: "2026-05-28T15:30:00Z"
      },
      {
        id: "c2",
        author: "DevDave",
        text: "Will there be a subscription model for weekly guilt trips? Asking for a friend.",
        createdAt: "2026-05-28T16:45:00Z"
      }
    ],
    // Stock market parameters
    ticker: "UBRG",
    valuation: 4200000,
    investorCount: 392,
    growth: 12.4,
    riskScore: "Silly",
    valuationHistory: [3800000, 3850000, 3900000, 3880000, 3950000, 4000000, 4100000, 4050000, 4150000, 4200000],
    fundingHistory: [180000, 190000, 195000, 200000, 210000, 215000, 220000, 225000, 230000, 235000],
    investorHistory: [310, 320, 332, 340, 345, 360, 372, 380, 388, 392],
    popularityHistory: [60, 65, 62, 70, 75, 72, 80, 85, 82, 88],
    voteHistory: [350, 362, 370, 382, 390, 405, 412, 425, 438, 453],
    
    // Realistic Market Mechanics
    sector: "Transportation",
    totalShares: 100000,
    sharesOutstanding: 90000,
    volume: 48291,
    dailyChange: 3.2,
    high52Week: 52.40,
    low52Week: 35.10,
    history1D: [],
    history1W: [],
    history1M: [],
    history3M: [],
    history1Y: [],
    historyAll: [],
    volumeHistory: []
  },
  {
    id: "2",
    name: "Netflix for Dreams",
    pitch: "Stream customized dreams directly into your subconscious. Skip the nightmares or buy the Ad-Supported sleep tier.",
    description: "Why waste 8 hours of sleep on random, unscripted dreams about teeth falling out or high school exams? Stream premium content direct to your brain. Browse genres like 'Flying Without a License', 'Winning a Fake Argument', or 'Showing up to work in underwear (Classic Edition)'. Note: Standard tier contains 3 unskippable ads per REM cycle.",
    category: "Entertainment",
    author: "SubconsciousStreamer",
    upvotes: 890,
    downvotes: 45,
    funding: 780000,
    targetFunding: 1500000,
    createdAt: "2026-05-29T09:15:00Z",
    comments: [
      {
        id: "c3",
        author: "Insomniac99",
        text: "I tried the beta. The dream lagged right as I was about to find the chest of gold and I woke up with an ad for detergent. 4/5 stars.",
        createdAt: "2026-05-29T10:02:00Z"
      },
      {
        id: "c4",
        author: "CyberLawyer",
        text: "Is there copyright infringement if I dream about Mickey Mouse? Need legal clarification.",
        createdAt: "2026-05-29T11:20:00Z"
      }
    ],
    // Stock market parameters
    ticker: "NFXD",
    valuation: 9600000,
    investorCount: 843,
    growth: 24.8,
    riskScore: "Extreme",
    valuationHistory: [8000000, 8200000, 8500000, 8400000, 8800000, 9000000, 9200000, 9100000, 9450000, 9600000],
    fundingHistory: [600000, 620000, 650000, 680000, 700000, 720000, 740000, 750000, 770000, 780000],
    investorHistory: [700, 715, 730, 752, 770, 788, 805, 820, 832, 843],
    popularityHistory: [80, 82, 85, 87, 86, 90, 92, 91, 93, 95],
    voteHistory: [780, 800, 815, 832, 850, 872, 890, 905, 921, 935],

    // Realistic Market Mechanics
    sector: "Entertainment",
    totalShares: 200000,
    sharesOutstanding: 180000,
    volume: 128491,
    dailyChange: 4.8,
    high52Week: 60.50,
    low52Week: 40.20,
    history1D: [],
    history1W: [],
    history1M: [],
    history3M: [],
    history1Y: [],
    historyAll: [],
    volumeHistory: []
  },
  {
    id: "3",
    name: "Airbnb for Haunted Houses",
    pitch: "Guaranteed supernatural activity or your money back. Sleep with one eye open.",
    description: "Bored of sterile, modern hotel rooms? Sleep in a house where the doors slam themselves, cold drafts tell you to 'get out', and the portraits' eyes follow you. Every listing is audited by our Chief Exorcist to guarantee at least level 3 poltergeist activity. Perfect for team building or getting out of a bad relationship.",
    category: "Real Estate",
    author: "SpookyHost",
    upvotes: 312,
    downvotes: 78,
    funding: 45000,
    targetFunding: 300000,
    createdAt: "2026-05-27T22:10:00Z",
    comments: [
      {
        id: "c5",
        author: "GhostBusterFan",
        text: "Are the ghosts pet-friendly? I don't want my cat getting possessed again.",
        createdAt: "2026-05-28T02:00:00Z"
      },
      {
        id: "c6",
        author: "SkepticGuy",
        text: "This is just drafty windows and bad plumbing marketed as paranormal. Brilliant. Take my fake money.",
        createdAt: "2026-05-28T08:30:00Z"
      }
    ],
    // Stock market parameters
    ticker: "ABHH",
    valuation: 1200000,
    investorCount: 154,
    growth: -4.5,
    riskScore: "High",
    valuationHistory: [1400000, 1380000, 1350000, 1300000, 1320000, 1280000, 1250000, 1260000, 1220000, 1200000],
    fundingHistory: [30000, 32000, 35000, 38000, 40000, 41000, 42000, 43000, 44000, 45000],
    investorHistory: [180, 175, 170, 165, 168, 162, 158, 160, 155, 154],
    popularityHistory: [40, 38, 35, 32, 35, 30, 28, 29, 26, 25],
    voteHistory: [320, 332, 340, 348, 355, 362, 370, 378, 384, 390],

    // Realistic Market Mechanics
    sector: "Paranormal",
    totalShares: 50000,
    sharesOutstanding: 45000,
    volume: 12805,
    dailyChange: -1.5,
    high52Week: 31.00,
    low52Week: 21.40,
    history1D: [],
    history1W: [],
    history1M: [],
    history3M: [],
    history1Y: [],
    historyAll: [],
    volumeHistory: []
  },
  {
    id: "4",
    name: "Spotify for Dog Barking",
    pitch: "The premier audio platform for canine listeners. Playlists curated by breed, time of day, and mailman proximity.",
    description: "Does your dog look bored listening to Mozart? Introduce them to Barkify. Millions of high-quality tracks featuring garbage trucks, squirrels, vacuum cleaners, and neighbor dogs barking at leaves. Curated mood playlists like 'Intruder Alert at 3 AM' or 'Siren Duet (Golden Retriever edition)'.",
    category: "Pets",
    author: "DogWhipserer",
    upvotes: 621,
    downvotes: 112,
    funding: 420000,
    targetFunding: 800000,
    createdAt: "2026-05-30T16:00:00Z",
    comments: [
      {
        id: "c7",
        author: "GoodBoyBuster",
        text: "WOOF WOOF BARK! *wagging tail* translation: Best app ever, premium is totally worth the extra treats.",
        createdAt: "2026-05-30T17:10:00Z"
      },
      {
        id: "c8",
        author: "AngryNeighbor",
        text: "Please delete this. The dogs in my building are now synchronized-howling at 2 AM.",
        createdAt: "2026-05-30T18:40:00Z"
      }
    ],
    // Stock market parameters
    ticker: "BARK",
    valuation: 5100000,
    investorCount: 452,
    growth: 18.2,
    riskScore: "Silly",
    valuationHistory: [4200000, 4300000, 4400000, 4350000, 4500000, 4700000, 4850000, 4800000, 4950000, 5100000],
    fundingHistory: [310000, 320000, 335000, 350000, 360000, 372000, 385000, 395000, 410000, 420000],
    investorHistory: [380, 390, 398, 405, 412, 420, 430, 438, 445, 452],
    popularityHistory: [70, 72, 75, 73, 76, 78, 80, 79, 82, 85],
    voteHistory: [620, 635, 650, 668, 680, 695, 710, 722, 730, 733],

    // Realistic Market Mechanics
    sector: "Entertainment",
    totalShares: 150000,
    sharesOutstanding: 135000,
    volume: 59301,
    dailyChange: 2.1,
    high52Week: 42.80,
    low52Week: 28.50,
    history1D: [],
    history1W: [],
    history1M: [],
    history3M: [],
    history1Y: [],
    historyAll: [],
    volumeHistory: []
  },
  {
    id: "5",
    name: "Zoom for Cats",
    pitch: "Interactive high-frequency video calls for felines. Knock virtual coffee cups off virtual desks together.",
    description: "Our proprietary cat-eye rendering tech ensures your cat sees full color and motion. Cats can finally schedule stand-up meetings, share screen of their litter boxes, or coordinate 3 AM sprint sessions across the house. Includes a built-in virtual red laser pointer controlled by the host.",
    category: "Pets",
    author: "MeowMascot",
    upvotes: 215,
    downvotes: 94,
    funding: 15000,
    targetFunding: 200000,
    createdAt: "2026-05-25T11:00:00Z",
    comments: [
      {
        id: "c9",
        author: "CrazyCatLady",
        text: "My cat just walked across the keyboard and closed a $5M venture round. He is now my boss.",
        createdAt: "2026-05-25T13:12:00Z"
      }
    ],
    // Stock market parameters
    ticker: "MEOW",
    valuation: 950000,
    investorCount: 92,
    growth: 3.5,
    riskScore: "High",
    valuationHistory: [920000, 930000, 915000, 925000, 940000, 935000, 945000, 940000, 942000, 950000],
    fundingHistory: [10000, 11000, 11500, 12000, 12500, 13000, 13500, 14000, 14500, 15000],
    investorHistory: [80, 82, 81, 84, 86, 85, 88, 90, 89, 92],
    popularityHistory: [30, 32, 31, 33, 35, 34, 36, 38, 37, 40],
    voteHistory: [250, 258, 264, 272, 280, 288, 295, 301, 305, 309],

    // Realistic Market Mechanics
    sector: "Social Media",
    totalShares: 80000,
    sharesOutstanding: 72000,
    volume: 8294,
    dailyChange: 0.8,
    high52Week: 15.60,
    low52Week: 9.80,
    history1D: [],
    history1W: [],
    history1M: [],
    history3M: [],
    history1Y: [],
    historyAll: [],
    volumeHistory: []
  },
  {
    id: "6",
    name: "Smart Fork with Social Sharing",
    pitch: "Tweet your bites in real-time. Automatically post calorie counts and chew speeds to LinkedIn.",
    description: "Disrupt your dinner table. The Smart Fork counts your chews per minute, measures bite weight, analyses sodium levels, and posts your chewing progress directly to your professional network. Let your boss know you are chewing efficiently and optimizing your lunch hour to the microsecond.",
    category: "AI & Tech",
    author: "SynergyEater",
    upvotes: 541,
    downvotes: 210,
    funding: 610000,
    targetFunding: 1000000,
    createdAt: "2026-05-31T08:00:00Z",
    comments: [
      {
        id: "c10",
        author: "LinkedInInfluencer",
        text: "Chewing 42 times per bite shows dedication and grit. Just added this to my morning routine. #Grind",
        createdAt: "2026-05-31T09:30:00Z"
      },
      {
        id: "c11",
        author: "ForkHater",
        text: "It shocked me when I ate too fast. Highly unsafe, but it does help with my diet. 3 stars.",
        createdAt: "2026-05-31T10:15:00Z"
      }
    ],
    // Stock market parameters
    ticker: "FORK",
    valuation: 6500000,
    investorCount: 512,
    growth: 32.1,
    riskScore: "Memetic",
    valuationHistory: [4800000, 5000000, 5200000, 5100000, 5500000, 5800000, 6000000, 5950000, 6200000, 6500000],
    fundingHistory: [450000, 480000, 500000, 520000, 535000, 550000, 570000, 582000, 595000, 610000],
    investorHistory: [410, 422, 435, 442, 458, 470, 485, 492, 502, 512],
    popularityHistory: [68, 70, 74, 72, 78, 82, 85, 83, 86, 90],
    voteHistory: [640, 660, 680, 692, 708, 722, 735, 742, 748, 751],

    // Realistic Market Mechanics
    sector: "Technology",
    totalShares: 120000,
    sharesOutstanding: 108000,
    volume: 84920,
    dailyChange: 3.5,
    high52Week: 68.20,
    low52Week: 42.00,
    history1D: [],
    history1W: [],
    history1M: [],
    history3M: [],
    history1Y: [],
    historyAll: [],
    volumeHistory: []
  },
  {
    id: "7",
    name: "Cloud-Based Pet Rock",
    pitch: "A pet rock that exists purely in AWS. Zero maintenance, 100% uptime, high-availability pebble.",
    description: "Why buy a physical rock when you can host one in the cloud? Our SaaS (Stone-as-a-Service) pet rock is deployed across multiple availability zones. Features include: zero feeding required, 99.999% uptime, automatic patching, and custom digital hats. Scale your rock horizontally to create a mountain.",
    category: "AI & Tech",
    author: "SaaS_Lord",
    upvotes: 754,
    downvotes: 38,
    funding: 920000,
    targetFunding: 1200000,
    createdAt: "2026-05-30T12:00:00Z",
    comments: [
      {
        id: "c12",
        author: "DevOps_Dan",
        text: "Mine has been running for 3 months. No container drift, though it hasn't moved at all. Truly the perfect pet.",
        createdAt: "2026-05-30T14:05:00Z"
      },
      {
        id: "c13",
        author: "CostOptimizer",
        text: "My cloud bill for a single rock is $4,000/month. But can you really put a price on companionship?",
        createdAt: "2026-05-30T15:20:00Z"
      }
    ],
    // Stock market parameters
    ticker: "ROCK",
    valuation: 8200000,
    investorCount: 689,
    growth: 44.5,
    riskScore: "Memetic",
    valuationHistory: [5500000, 5800000, 6100000, 6000000, 6500000, 7000000, 7500000, 7400000, 7800000, 8200000],
    fundingHistory: [700000, 720000, 750000, 780000, 800000, 830000, 850000, 870000, 895000, 920000],
    investorHistory: [520, 542, 570, 585, 605, 630, 652, 665, 678, 689],
    popularityHistory: [75, 78, 82, 80, 85, 89, 92, 90, 94, 98],
    voteHistory: [680, 702, 718, 730, 742, 758, 765, 774, 782, 792],

    // Realistic Market Mechanics
    sector: "Pets",
    totalShares: 180000,
    sharesOutstanding: 162000,
    volume: 104928,
    dailyChange: 5.6,
    high52Week: 58.50,
    low52Week: 31.20,
    history1D: [],
    history1W: [],
    history1M: [],
    history3M: [],
    history1Y: [],
    historyAll: [],
    volumeHistory: []
  }
];

export const CATEGORIES = [
  "All",
  "AI & Tech",
  "Food & Beverage",
  "Lifestyle",
  "Pets",
  "Real Estate",
  "Entertainment"
];

export const SECTORS = [
  "All",
  "Transportation",
  "Entertainment",
  "Technology",
  "Social Media",
  "Pets",
  "Paranormal"
];

