export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  surface: string;
  date: string;
}

export interface Phase1SquadContext {
  homeFatigueIndex: string; // "LOW" | "MEDIUM" | "HIGH"
  awayFatigueIndex: string;
  homeFatigueDescription: string;
  awayFatigueDescription: string;
  missingPlayersHome: string[];
  missingPlayersAway: string[];
  squadDynamicsAnalysis: string;
}

export interface Phase2Tactics {
  homeFormation: string;
  awayFormation: string;
  homeTacticalStyle: string;
  awayTacticalStyle: string;
  tacticalMatchupAnalysis: string;
  homePpda: number;
  awayPpda: number;
  setPieceDominance: string;
}

export interface Phase3Environment {
  weatherIcon: string; // "rain" | "sun" | "cloud" | "wind" | "snow"
  weatherDetails: string;
  altitudeMeters: number;
  travelPenaltyHome: string;
  travelPenaltyAway: string;
  refereeName: string;
  refereeMetrics: string;
  homeAdvantageMultiplier: number;
  environmentalAnalysis: string;
}

export interface Phase4HistoryMotivation {
  h2hHistory: string[];
  motivationContextHome: string;
  motivationContextAway: string;
  motivationAnalysis: string;
  recentFormHome: string[]; // e.g. ["W", "D", "W", "L", "W"]
  recentFormAway: string[];
}

export interface ScorelineProjection {
  score: string; // "2 - 1"
  probability: number; // percent
}

export interface Phase5Engine {
  baselineXgHome: number;
  baselineXgAway: number;
  adjustedXgHome: number;
  adjustedXgAway: number;
  explanationOfAdjustments: string;
  winProbabilityHome: number; // e.g. 41
  winProbabilityDraw: number; // e.g. 27
  winProbabilityAway: number; // e.g. 32
  scorelineProjections: ScorelineProjection[];
  monteCarloConfidence: string;
}

export interface MarketEdge {
  oddsHomeMarket: string;
  oddsDrawMarket: string;
  oddsAwayMarket: string;
  oddsHomeModel: string;
  oddsDrawModel: string;
  oddsAwayModel: string;
  edgeHome: number; // percentage edge (positive or negative)
  edgeDraw: number;
  edgeAway: number;
  analyticalEdgeExplanation: string;
  recommendation: string;
}

export interface MatchPrediction {
  matchInfo: MatchInfo;
  phase1SquadContext: Phase1SquadContext;
  phase2Tactics: Phase2Tactics;
  phase3Environment: Phase3Environment;
  phase4HistoryMotivation: Phase4HistoryMotivation;
  phase5Engine: Phase5Engine;
  marketEdge: MarketEdge;
}
