export interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  venue: string;
  surface: string;
  date: string;
}

export interface MatchdayContext {
  venueStatus: string;
  environmentalAdjustments: string;
  venueInfluenceIndex: string;
  refereeName?: string;
  cardsPerMatch?: number;
  penaltyFrequencyPct?: number;
  oddsDriftPct?: number;
  importanceMultiplier?: number;
  motivationIndexHome?: number;
  motivationIndexAway?: number;
  lineupShockDetectedHome?: boolean;
  lineupShockDetectedAway?: boolean;
  absenceImpactHome?: number;
  absenceImpactAway?: number;
  data_quality_score?: number;
  dataQualityScore?: number;
  starting_xi_continuity_home?: number;
  startingXiContinuityHome?: number;
  starting_xi_continuity_away?: number;
  startingXiContinuityAway?: number;
  coach_tenure_months_home?: number;
  coachTenureMonthsHome?: number;
  coach_tenure_months_away?: number;
  coachTenureMonthsAway?: number;
  days_rest_home?: number;
  daysRestHome?: number;
  days_rest_away?: number;
  daysRestAway?: number;
  calculated_edge_pct?: number;
  calculatedEdgePct?: number;
  stratos_confidence_score?: number;
  stratosConfidenceScore?: number;
}

export interface ExplainabilityLayer {
  positiveDrivers: string[];
  negativeFactors: string[];
}

export interface WhyNotEngine {
  failureConditions: string[];
}

export interface ScorelineCurve {
  score: string;
  probability: number;
}

export interface Phase1EloStrength {
  homeElo: number;
  awayElo: number;
  historicalXgTrendHome: number;
  historicalXgTrendAway: number;
  rosterValueHome: string;
  rosterValueAway: string;
  genderBaselineHistory: string;
  analysis: string;
}

export interface Phase2TacticalMatchup {
  homeFormation: string;
  awayFormation: string;
  passingVelocityHome: string;
  passingVelocityAway: string;
  homePpda: number;
  awayPpda: number;
  defensiveBlockStyleHome: string;
  defensiveBlockStyleAway: string;
  formationCompatibilityAnalysis: string;
}

export interface Phase3SquadAvailability {
  missingPersonnelHome: string[];
  missingPersonnelAway: string[];
  availabilityDeltaHome: number; // e.g. -1.2
  availabilityDeltaAway: number;
  depthSustainabilityScoreHome: number; // 0-100
  depthSustainabilityScoreAway: number; // 0-100
  analysis: string;
}

export interface Phase4FormationStability {
  expectedFormationHome: string;
  expectedFormationAway: string;
  last5FormationsHome: string[];
  last5FormationsAway: string[];
  instabilityPenaltyHome: number;
  instabilityPenaltyAway: number;
  stabilityRatingHome: number; // 0-100
  stabilityRatingAway: number; // 0-100
  analysis: string;
}

export interface Phase5TravelStress {
  flightDistanceMilesHome: number;
  flightDistanceMilesAway: number;
  timeZonesCrossedHome: number;
  timeZonesCrossedAway: number;
  recoveryRestHoursHome: number;
  recoveryRestHoursAway: number;
  travelFatigueScoreHome: number; // 0-100
  travelFatigueScoreAway: number; // 0-100
  analysis: string;
}

export interface Phase6ClimateAdaptation {
  matchdayTempCelsius: number;
  matchdayHumidityPercent: number;
  matchdayWindKmh: number;
  climateDecayFactorHome: number; // performance drop
  climateDecayFactorAway: number;
  adaptationProfileHome: string;
  adaptationProfileAway: string;
  analysis: string;
}

export interface Phase7StadiumIntelligence {
  altitudeMeters: number;
  altitudeBallPhysicsAdjustment: string;
  altitudeStaminaImpactHome: number;
  altitudeStaminaImpactAway: number;
  roofEnclosureState: string;
  pitchSurfaceFriction: string;
  stadiumAnalysis: string;
}

export interface Phase8TournamentPsychology {
  competitionContext: string;
  motivationContextHome: string;
  motivationContextAway: string;
  riskMitigationBehaviorHome: string;
  riskMitigationBehaviorAway: string;
  derbyTensionLevel: string;
  behavioralLogicAnalysis: string;
}

export interface Phase9MonteCarlo {
  adjustedXgHome: number;
  adjustedXgAway: number;
  winProbabilityHome: number;
  winProbabilityDraw: number;
  winProbabilityAway: number;
  cleanSheetProbHome: number;
  cleanSheetProbAway: number;
  scorelineProjections: ScorelineCurve[];
  predictionConfidenceScore: number;
  predictionConfidenceExplanation: string;
  dataVolatilityIndex: string;
}

export interface Phase10ValueBetDetection {
  calculatedOddsHome: string;
  calculatedOddsDraw: string;
  calculatedOddsAway: string;
  bookmakerOddsHome: string;
  bookmakerOddsDraw: string;
  bookmakerOddsAway: string;
  valueMarginHome: number;
  valueMarginDraw: number;
  valueMarginAway: number;
  edgeVerdict: "⚠️ NO EDGE DETECTED - SKIP MATCH" | "🟢 VALUE OPPORTUNITY";
  targetMarketSelection: string;
  exactDiscrepancyExplanation: string;
  valueRecommendation: string;
}

export interface SummaryDataBlocks {
  matchStressAndContext: {
    genderSlate: string;
    competitionContext: string;
    esiIndex: string;
    travelFatigueScore: string;
  };
  squadResilienceProfile: {
    squadAvailabilityDelta: string;
    formationStabilityRating: string;
  };
  stratosPredictionMatrix: {
    homeDrawAwayPct: string;
    top3Scorelines: string[];
    predictionConfidenceScorePct: string;
  };
  valueBetDetectionOverlay: {
    stratosOddsVsBookmakerOdds: string;
    verdict: "⚠️ NO EDGE DETECTED - SKIP MATCH" | "🟢 VALUE OPPORTUNITY";
    targetMarketSelection: string;
  };
}

export interface MatchPrediction {
  matchInfo: MatchInfo;
  matchdayContext: MatchdayContext;
  explainabilityLayer: ExplainabilityLayer;
  whyNotEngine: WhyNotEngine;
  phase1EloStrength: Phase1EloStrength;
  phase2TacticalMatchup: Phase2TacticalMatchup;
  phase3SquadAvailability: Phase3SquadAvailability;
  phase4FormationStability: Phase4FormationStability;
  phase5TravelStress: Phase5TravelStress;
  phase6ClimateAdaptation: Phase6ClimateAdaptation;
  phase7StadiumIntelligence: Phase7StadiumIntelligence;
  phase8TournamentPsychology: Phase8TournamentPsychology;
  phase9MonteCarlo: Phase9MonteCarlo;
  phase10ValueBetDetection: Phase10ValueBetDetection;
  summaryDataBlocks: SummaryDataBlocks;
  simulationMode?: 'tier1' | 'tier2';
  cognitiveNarrative?: string;
  stratosV2?: any;
}
