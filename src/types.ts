export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  surface: string;
  date: string;
}

export interface MatchdayContext {
  venueStatus: "Standard League Match (Mode A)" | "Tournament / Neutral Venue (Mode B)";
  environmentalAdjustments: string; // Detail travel fatigue, climate, and crowd bias metrics
  venueInfluenceIndex: string; // Detail travel distance, expected crowd takeover bias
}

export interface ExplainabilityLayer {
  positiveDrivers: string[]; // e.g. ["+ Attacking xG Advantage [+11%]", "+ Tactical Formation Matchup [+6%]"]
  negativeFactors: string[]; // e.g. ["- Squad Fatigue Index 82/100 [-5%]", "- Lineup Disruption [-4%]"]
}

export interface WhyNotEngine {
  failureConditions: string[]; // list what could completely break this prediction
}

export interface Phase1PowerRating {
  homeRating: number; // e.g. 84.5
  awayRating: number; // e.g. 81.2
  squadDepthValueHome: string;
  squadDepthValueAway: string;
  historicalXgTrendHome: number;
  historicalXgTrendAway: number;
  analysis: string;
}

export interface Phase2FormMomentum {
  recentFormHome: string[]; // e.g. ["W", "D", "W", "L", "W"]
  recentFormAway: string[];
  pointsDivergenceHome: string;
  pointsDivergenceAway: string;
  cleanSheetTrendHome: string;
  cleanSheetTrendAway: string;
  analysis: string;
}

export interface Phase3TacticalEngine {
  homeFormation: string;
  awayFormation: string;
  homeTacticalStyle: string;
  awayTacticalStyle: string;
  homePpda: number;
  awayPpda: number;
  formationStabilityScoreHome: number; // 0-100 indicating tactical stability
  formationStabilityScoreAway: number; // 0-100 indicating tactical stability
  transitionVulnerabilityHome: string;
  transitionVulnerabilityAway: string;
  matchupAnalysis: string;
}

export interface Phase4VenueEnvironment {
  weatherDetails: string;
  weatherIcon: string;
  altitudeMeters: number;
  travelDistancePenaltyHome: string;
  travelDistancePenaltyAway: string;
  pitchFrictionTurf: string;
  homeAdvantageMagnitude: string;
  crowdBiasExpected: string;
  environmentalAnalysis: string;
}

export interface Phase5SquadFatigueManager {
  fatigueScoreHome: number; // 0-100 (high = heavy congestion)
  fatigueScoreAway: number; // 0-100 (high = heavy congestion)
  congestionAnalysis: string;
  managerExperienceHome: string; // Profile experience / stability
  managerExperienceAway: string;
  managerDecisionImpact: string; // Adjusts model uncertainty description
}

export interface Phase6PsychologicalEngine {
  motivationContextHome: string;
  motivationContextAway: string;
  derbyTensionLevel: string;
  situationalStakes: string; // Group-stage math, elimination threat, or dead rubber
  psychologicalEdge: string;
  psychologicalAnalysis: string;
}

export interface Phase7MatchdayValidation {
  expectedVsConfirmedHome: string;
  expectedVsConfirmedAway: string;
  lineupDisruptionScoreHome: number; // rating points drop (negative e.g. -4.5)
  lineupDisruptionScoreAway: number;
  confirmedTacticalShiftHome: string;
  confirmedTacticalShiftAway: string;
  suspensionsAndLateScrapes: string;
  personnelDeductionAnalysis: string; // e.g., Top Scorer out = Attacking Rating drops 87->76, reducing xG
  validationVerdict: string;
}

export interface ScorelineCurve {
  score: string;
  probability: number;
}

export interface Phase8MonteCarlo {
  adjustedXgHome: number;
  adjustedXgAway: number;
  winProbabilityHome: number;
  winProbabilityDraw: number;
  winProbabilityAway: number;
  cleanSheetProbHome: number;
  cleanSheetProbAway: number;
  scorelineProjections: ScorelineCurve[];
  predictionConfidenceScore: number; // 0-100%
  predictionConfidenceExplanation: string;
  simulationConfidenceInterval: string;
}

export interface Phase9ValueBetDetection {
  marketOddsHome: string;
  marketOddsDraw: string;
  marketOddsAway: string;
  modelOddsHome: string;
  modelOddsDraw: string;
  modelOddsAway: string;
  edgeHome: number;
  edgeDraw: number;
  edgeAway: number;
  edgeVerdict: "VALUE OPPORTUNITY" | "MARKET ALIGNED";
  exactDiscrepancyExplanation: string;
  valueRecommendation: string;
}

export interface StratosV2MatchStressReport {
  venueName: string;
  localTime: string;
  roofStatus: string;
  environmentalStressIndex: "LOW" | "MODERATE" | "SEVERE";
  temperatureCelsius: number;
  humidityPercentage: number;
  solarRadiation: string;
  airQualityIndex: string;
  altitudeMeters: number;
  haiHomeScore: number;
  haiHomePerformanceDrop: number;
  haiAwayScore: number;
  haiAwayPerformanceDrop: number;
  mostAffectedPositions: string[];
  substituteImportanceAnalysis: string;
  travelDistanceMilesHome: number;
  travelDistanceMilesAway: number;
  timeZoneDeltaHome: number;
  timeZoneDeltaAway: number;
  restDaysHome: number;
  restDaysAway: number;
  benchSustainabilityScoreHome: number;
  benchSustainabilityScoreAway: number;
}

export interface StratosV2ValueBetOverlay {
  targetMarket: string;
  edgePercentage: number;
  calculatedOdds: string;
  marketOdds: string;
  verdict: "VALUE OPPORTUNITY" | "MARKET ALIGNED";
}

export interface StratosV2 {
  matchStressReport: StratosV2MatchStressReport;
  valueBetOverlay: StratosV2ValueBetOverlay;
}

export interface MatchPrediction {
  matchInfo: MatchInfo;
  matchdayContext: MatchdayContext;
  explainabilityLayer: ExplainabilityLayer;
  whyNotEngine: WhyNotEngine;
  phase1PowerRating: Phase1PowerRating;
  phase2FormMomentum: Phase2FormMomentum;
  phase3TacticalEngine: Phase3TacticalEngine;
  phase4VenueEnvironment: Phase4VenueEnvironment;
  phase5SquadFatigueManager: Phase5SquadFatigueManager;
  phase6PsychologicalEngine: Phase6PsychologicalEngine;
  phase7MatchdayValidation: Phase7MatchdayValidation;
  phase8MonteCarlo: Phase8MonteCarlo;
  phase9ValueBetDetection: Phase9ValueBetDetection;
  stratosV2?: StratosV2;
  simulationMode?: 'tier1' | 'tier2';
}
