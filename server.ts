import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client Lazily/Safely
let aiClient: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

function getGeminiClient(): GoogleGenAI {
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY is not configured in environment or Secrets panel.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Structured JSON Schema for STRATOS v2 10-Phase Predictive Engine Architecture
const soccerPredictionSchema = {
  type: Type.OBJECT,
  properties: {
    matchInfo: {
      type: Type.OBJECT,
      properties: {
        homeTeam: { type: Type.STRING },
        awayTeam: { type: Type.STRING },
        venue: { type: Type.STRING },
        surface: { type: Type.STRING },
        date: { type: Type.STRING },
      },
      required: ["homeTeam", "awayTeam", "venue", "surface", "date"],
    },
    matchdayContext: {
      type: Type.OBJECT,
      properties: {
        venueStatus: { type: Type.STRING },
        environmentalAdjustments: { type: Type.STRING },
        venueInfluenceIndex: { type: Type.STRING },
        refereeName: { type: Type.STRING },
        cardsPerMatch: { type: Type.NUMBER },
        penaltyFrequencyPct: { type: Type.NUMBER },
        oddsDriftPct: { type: Type.NUMBER },
        importanceMultiplier: { type: Type.NUMBER },
        motivationIndexHome: { type: Type.NUMBER },
        motivationIndexAway: { type: Type.NUMBER },
        lineupShockDetectedHome: { type: Type.BOOLEAN },
        lineupShockDetectedAway: { type: Type.BOOLEAN },
        absenceImpactHome: { type: Type.NUMBER },
        absenceImpactAway: { type: Type.NUMBER },
        data_quality_score: { type: Type.NUMBER },
        dataQualityScore: { type: Type.NUMBER },
        starting_xi_continuity_home: { type: Type.NUMBER },
        startingXiContinuityHome: { type: Type.NUMBER },
        starting_xi_continuity_away: { type: Type.NUMBER },
        startingXiContinuityAway: { type: Type.NUMBER },
        coach_tenure_months_home: { type: Type.NUMBER },
        coachTenureMonthsHome: { type: Type.NUMBER },
        coach_tenure_months_away: { type: Type.NUMBER },
        coachTenureMonthsAway: { type: Type.NUMBER },
        days_rest_home: { type: Type.NUMBER },
        daysRestHome: { type: Type.NUMBER },
        days_rest_away: { type: Type.NUMBER },
        daysRestAway: { type: Type.NUMBER },
        calculated_edge_pct: { type: Type.NUMBER },
        calculatedEdgePct: { type: Type.NUMBER },
        stratos_confidence_score: { type: Type.NUMBER },
        stratosConfidenceScore: { type: Type.NUMBER },
      },
      required: [
        "venueStatus",
        "environmentalAdjustments",
        "venueInfluenceIndex",
        "refereeName",
        "cardsPerMatch",
        "penaltyFrequencyPct",
        "oddsDriftPct",
        "importanceMultiplier",
        "motivationIndexHome",
        "motivationIndexAway",
        "lineupShockDetectedHome",
        "lineupShockDetectedAway",
        "absenceImpactHome",
        "absenceImpactAway",
        "data_quality_score",
        "dataQualityScore",
        "starting_xi_continuity_home",
        "startingXiContinuityHome",
        "starting_xi_continuity_away",
        "startingXiContinuityAway",
        "coach_tenure_months_home",
        "coachTenureMonthsHome",
        "coach_tenure_months_away",
        "coachTenureMonthsAway",
        "days_rest_home",
        "daysRestHome",
        "days_rest_away",
        "daysRestAway",
        "calculated_edge_pct",
        "calculatedEdgePct",
        "stratos_confidence_score",
        "stratosConfidenceScore"
      ],
    },
    explainabilityLayer: {
      type: Type.OBJECT,
      properties: {
        positiveDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
        negativeFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["positiveDrivers", "negativeFactors"],
    },
    whyNotEngine: {
      type: Type.OBJECT,
      properties: {
        failureConditions: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["failureConditions"],
    },
    phase1EloStrength: {
      type: Type.OBJECT,
      properties: {
        homeElo: { type: Type.NUMBER },
        awayElo: { type: Type.NUMBER },
        historicalXgTrendHome: { type: Type.NUMBER },
        historicalXgTrendAway: { type: Type.NUMBER },
        rosterValueHome: { type: Type.STRING },
        rosterValueAway: { type: Type.STRING },
        genderBaselineHistory: { type: Type.STRING },
        analysis: { type: Type.STRING },
      },
      required: ["homeElo", "awayElo", "historicalXgTrendHome", "historicalXgTrendAway", "rosterValueHome", "rosterValueAway", "genderBaselineHistory", "analysis"],
    },
    phase2TacticalMatchup: {
      type: Type.OBJECT,
      properties: {
        homeFormation: { type: Type.STRING },
        awayFormation: { type: Type.STRING },
        passingVelocityHome: { type: Type.STRING },
        passingVelocityAway: { type: Type.STRING },
        homePpda: { type: Type.NUMBER },
        awayPpda: { type: Type.NUMBER },
        defensiveBlockStyleHome: { type: Type.STRING },
        defensiveBlockStyleAway: { type: Type.STRING },
        formationCompatibilityAnalysis: { type: Type.STRING },
      },
      required: ["homeFormation", "awayFormation", "passingVelocityHome", "passingVelocityAway", "homePpda", "awayPpda", "defensiveBlockStyleHome", "defensiveBlockStyleAway", "formationCompatibilityAnalysis"],
    },
    phase3SquadAvailability: {
      type: Type.OBJECT,
      properties: {
        missingPersonnelHome: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingPersonnelAway: { type: Type.ARRAY, items: { type: Type.STRING } },
        availabilityDeltaHome: { type: Type.NUMBER },
        availabilityDeltaAway: { type: Type.NUMBER },
        depthSustainabilityScoreHome: { type: Type.NUMBER },
        depthSustainabilityScoreAway: { type: Type.NUMBER },
        analysis: { type: Type.STRING },
      },
      required: ["missingPersonnelHome", "missingPersonnelAway", "availabilityDeltaHome", "availabilityDeltaAway", "depthSustainabilityScoreHome", "depthSustainabilityScoreAway", "analysis"],
    },
    phase4FormationStability: {
      type: Type.OBJECT,
      properties: {
        expectedFormationHome: { type: Type.STRING },
        expectedFormationAway: { type: Type.STRING },
        last5FormationsHome: { type: Type.ARRAY, items: { type: Type.STRING } },
        last5FormationsAway: { type: Type.ARRAY, items: { type: Type.STRING } },
        instabilityPenaltyHome: { type: Type.NUMBER },
        instabilityPenaltyAway: { type: Type.NUMBER },
        stabilityRatingHome: { type: Type.NUMBER },
        stabilityRatingAway: { type: Type.NUMBER },
        analysis: { type: Type.STRING },
      },
      required: ["expectedFormationHome", "expectedFormationAway", "last5FormationsHome", "last5FormationsAway", "instabilityPenaltyHome", "instabilityPenaltyAway", "stabilityRatingHome", "stabilityRatingAway", "analysis"],
    },
    phase5TravelStress: {
      type: Type.OBJECT,
      properties: {
        flightDistanceMilesHome: { type: Type.NUMBER },
        flightDistanceMilesAway: { type: Type.NUMBER },
        timeZonesCrossedHome: { type: Type.NUMBER },
        timeZonesCrossedAway: { type: Type.NUMBER },
        recoveryRestHoursHome: { type: Type.NUMBER },
        recoveryRestHoursAway: { type: Type.NUMBER },
        travelFatigueScoreHome: { type: Type.NUMBER },
        travelFatigueScoreAway: { type: Type.NUMBER },
        analysis: { type: Type.STRING },
      },
      required: ["flightDistanceMilesHome", "flightDistanceMilesAway", "timeZonesCrossedHome", "timeZonesCrossedAway", "recoveryRestHoursHome", "recoveryRestHoursAway", "travelFatigueScoreHome", "travelFatigueScoreAway", "analysis"],
    },
    phase6ClimateAdaptation: {
      type: Type.OBJECT,
      properties: {
        matchdayTempCelsius: { type: Type.NUMBER },
        matchdayHumidityPercent: { type: Type.NUMBER },
        matchdayWindKmh: { type: Type.NUMBER },
        climateDecayFactorHome: { type: Type.NUMBER },
        climateDecayFactorAway: { type: Type.NUMBER },
        adaptationProfileHome: { type: Type.STRING },
        adaptationProfileAway: { type: Type.STRING },
        analysis: { type: Type.STRING },
      },
      required: ["matchdayTempCelsius", "matchdayHumidityPercent", "matchdayWindKmh", "climateDecayFactorHome", "climateDecayFactorAway", "adaptationProfileHome", "adaptationProfileAway", "analysis"],
    },
    phase7StadiumIntelligence: {
      type: Type.OBJECT,
      properties: {
        altitudeMeters: { type: Type.NUMBER },
        altitudeBallPhysicsAdjustment: { type: Type.STRING },
        altitudeStaminaImpactHome: { type: Type.NUMBER },
        altitudeStaminaImpactAway: { type: Type.NUMBER },
        roofEnclosureState: { type: Type.STRING },
        pitchSurfaceFriction: { type: Type.STRING },
        stadiumAnalysis: { type: Type.STRING },
      },
      required: ["altitudeMeters", "altitudeBallPhysicsAdjustment", "altitudeStaminaImpactHome", "altitudeStaminaImpactAway", "roofEnclosureState", "pitchSurfaceFriction", "stadiumAnalysis"],
    },
    phase8TournamentPsychology: {
      type: Type.OBJECT,
      properties: {
        competitionContext: { type: Type.STRING },
        motivationContextHome: { type: Type.STRING },
        motivationContextAway: { type: Type.STRING },
        riskMitigationBehaviorHome: { type: Type.STRING },
        riskMitigationBehaviorAway: { type: Type.STRING },
        derbyTensionLevel: { type: Type.STRING },
        behavioralLogicAnalysis: { type: Type.STRING },
      },
      required: ["competitionContext", "motivationContextHome", "motivationContextAway", "riskMitigationBehaviorHome", "riskMitigationBehaviorAway", "derbyTensionLevel", "behavioralLogicAnalysis"],
    },
    phase9MonteCarlo: {
      type: Type.OBJECT,
      properties: {
        adjustedXgHome: { type: Type.NUMBER },
        adjustedXgAway: { type: Type.NUMBER },
        winProbabilityHome: { type: Type.NUMBER },
        winProbabilityDraw: { type: Type.NUMBER },
        winProbabilityAway: { type: Type.NUMBER },
        cleanSheetProbHome: { type: Type.NUMBER },
        cleanSheetProbAway: { type: Type.NUMBER },
        scorelineProjections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.STRING },
              probability: { type: Type.NUMBER },
            },
            required: ["score", "probability"],
          },
        },
        predictionConfidenceScore: { type: Type.NUMBER },
        predictionConfidenceExplanation: { type: Type.STRING },
        dataVolatilityIndex: { type: Type.STRING },
      },
      required: ["adjustedXgHome", "adjustedXgAway", "winProbabilityHome", "winProbabilityDraw", "winProbabilityAway", "cleanSheetProbHome", "cleanSheetProbAway", "scorelineProjections", "predictionConfidenceScore", "predictionConfidenceExplanation", "dataVolatilityIndex"],
    },
    phase10ValueBetDetection: {
      type: Type.OBJECT,
      properties: {
        calculatedOddsHome: { type: Type.STRING },
        calculatedOddsDraw: { type: Type.STRING },
        calculatedOddsAway: { type: Type.STRING },
        bookmakerOddsHome: { type: Type.STRING },
        bookmakerOddsDraw: { type: Type.STRING },
        bookmakerOddsAway: { type: Type.STRING },
        valueMarginHome: { type: Type.NUMBER },
        valueMarginDraw: { type: Type.NUMBER },
        valueMarginAway: { type: Type.NUMBER },
        edgeVerdict: { type: Type.STRING, description: "Must be: '⚠️ NO EDGE DETECTED - SKIP MATCH' or '🟢 VALUE OPPORTUNITY'" },
        targetMarketSelection: { type: Type.STRING },
        exactDiscrepancyExplanation: { type: Type.STRING },
        valueRecommendation: { type: Type.STRING },
      },
      required: ["calculatedOddsHome", "calculatedOddsDraw", "calculatedOddsAway", "bookmakerOddsHome", "bookmakerOddsDraw", "bookmakerOddsAway", "valueMarginHome", "valueMarginDraw", "valueMarginAway", "edgeVerdict", "targetMarketSelection", "exactDiscrepancyExplanation", "valueRecommendation"],
    },
    summaryDataBlocks: {
      type: Type.OBJECT,
      properties: {
        matchStressAndContext: {
          type: Type.OBJECT,
          properties: {
            genderSlate: { type: Type.STRING },
            competitionContext: { type: Type.STRING },
            esiIndex: { type: Type.STRING },
            travelFatigueScore: { type: Type.STRING }
          },
          required: ["genderSlate", "competitionContext", "esiIndex", "travelFatigueScore"]
        },
        squadResilienceProfile: {
          type: Type.OBJECT,
          properties: {
            squadAvailabilityDelta: { type: Type.STRING },
            formationStabilityRating: { type: Type.STRING }
          },
          required: ["squadAvailabilityDelta", "formationStabilityRating"]
        },
        stratosPredictionMatrix: {
          type: Type.OBJECT,
          properties: {
            homeDrawAwayPct: { type: Type.STRING },
            top3Scorelines: { type: Type.ARRAY, items: { type: Type.STRING } },
            predictionConfidenceScorePct: { type: Type.STRING }
          },
          required: ["homeDrawAwayPct", "top3Scorelines", "predictionConfidenceScorePct"]
        },
        valueBetDetectionOverlay: {
          type: Type.OBJECT,
          properties: {
            stratosOddsVsBookmakerOdds: { type: Type.STRING },
            verdict: { type: Type.STRING },
            targetMarketSelection: { type: Type.STRING }
          },
          required: ["stratosOddsVsBookmakerOdds", "verdict", "targetMarketSelection"]
        }
      },
      required: ["matchStressAndContext", "squadResilienceProfile", "stratosPredictionMatrix", "valueBetDetectionOverlay"]
    },
    cognitiveNarrative: { type: Type.STRING, description: "Highly polished Markdown document translating detailed sports science, environmental metrics, referee styles, motivation levels, and value betting intelligence into elite human-readable summaries." }
  },
  required: [
    "matchInfo",
    "matchdayContext",
    "explainabilityLayer",
    "whyNotEngine",
    "phase1EloStrength",
    "phase2TacticalMatchup",
    "phase3SquadAvailability",
    "phase4FormationStability",
    "phase5TravelStress",
    "phase6ClimateAdaptation",
    "phase7StadiumIntelligence",
    "phase8TournamentPsychology",
    "phase9MonteCarlo",
    "phase10ValueBetDetection",
    "summaryDataBlocks",
    "cognitiveNarrative"
  ]
};

// Realistic mock data fallback for key matches to ensure seamless UI and exact 10-Phase alignment
function getMockPrediction(
  home: string, 
  away: string,
  venue?: string,
  kickoffTime?: string,
  altitudeCampHome?: boolean,
  altitudeCampAway?: boolean,
  pitchMoisture?: string,
  matchTemperature?: number,
  simulationMode?: string,
  current_minute?: number,
  current_score?: string,
  match_context?: string
): any {
  const normalizedHome = home.toLowerCase();
  const normalizedAway = away.toLowerCase();

  const isWomen = normalizedHome.includes("women") || normalizedAway.includes("women");
  const genderSlate = isWomen ? "Women's Association" : "Men's Association";

  const activeVenue = venue || "Soldier Field, Chicago, IL";
  const activeKickoff = kickoffTime || "15:00";
  const moisture = pitchMoisture || "Standard";
  const temp = matchTemperature !== undefined ? matchTemperature : 22;

  // Altitude detection
  const isMexicoCity = activeVenue.toLowerCase().includes("mexico city") || activeVenue.toLowerCase().includes("azteca");
  const isGuadalajara = activeVenue.toLowerCase().includes("guadalajara") || activeVenue.toLowerCase().includes("akron");
  const isHighAltitude = isMexicoCity || isGuadalajara;
  const altitudeMeters = isMexicoCity ? 2240 : isGuadalajara ? 1566 : 140;

  // Climate Control Match
  const isClimateControlled = activeVenue.toLowerCase().includes("dallas") || activeVenue.toLowerCase().includes("at&t") || activeVenue.toLowerCase().includes("atlanta") || activeVenue.toLowerCase().includes("mercedes");

  // Base ELO and strength
  let baseHomeElo = isWomen ? 91.2 : 83.4;
  let baseAwayElo = isWomen ? 86.8 : 88.6;
  if (!normalizedHome.includes("usa") && !normalizedHome.includes("united states") && !normalizedHome.includes("germany")) {
    baseHomeElo = Math.min(95, Math.max(70, home.length * 1.5 + 68));
    baseAwayElo = Math.min(93, Math.max(68, away.length * 1.5 + 66));
  }

  // Altitude impacts
  let staminaDropHome = isHighAltitude && !altitudeCampHome ? 12 : 2;
  let staminaDropAway = isHighAltitude && !altitudeCampAway ? 12 : 2;

  // Travel miles, zones, recovery rest
  let distHome = 240;
  let distAway = isHighAltitude ? 1200 : 3800;
  let zonesHome = 1;
  let zonesAway = isHighAltitude ? 2 : 6;
  let restHome = 6;
  let restAway = 5;

  let travelFatigueHome = Math.round(15 + (distHome / 200) + (zonesHome * 5));
  let travelFatigueScoreAway = Math.round(Math.min(95, Math.max(20, (distAway / 100) + (zonesAway * 7) - (restAway * 3))));

  // Climate adjustments
  let humidity = temp > 28 ? 85 : 55;
  let wind = moisture === "Wet/Raining" ? 22 : 8;
  let climateDecayHome = temp > 30 ? 0.14 : 0.03;
  let climateDecayAway = temp > 30 ? 0.18 : 0.04;

  // Pitch surface friction
  let frictionStr = "Standard Natural Turf: Friction coefficient 1.0x with linear traction";
  if (moisture === "Wet/Raining") {
    frictionStr = "Slick Wet Turf: Traction reduced by 8%, ball slide velocity elevated by 15%";
  } else if (moisture === "Dry/Long Grass") {
    frictionStr = "Sticky Grass: Friction increased, deceleration curve dragging transition speed by 12%";
  } else if (isClimateControlled) {
    frictionStr = "Dry Artificial Turf: Roof closed, standard grain drag coefficient active";
  }

  // Tactical setup
  let formationHome = "4-3-3";
  let formationAway = "4-2-3-1";
  let ppdaHome = temp > 30 ? 10.2 : 8.4;
  let ppdaAway = temp > 30 ? 12.1 : 10.2;

  // Player availability and depth
  let missingH = isWomen ? ["Naomi Girma (Rested)"] : ["Matt Turner (Quad)"];
  let missingA = isWomen ? ["Alexandra Popp (Knee)"] : ["Kai Havertz (Adductor)"];
  let availDeltaH = isWomen ? -0.8 : -1.2;
  let availDeltaA = isWomen ? -3.5 : -2.8;
  let depthH = isWomen ? 92 : 84;
  let depthA = isWomen ? 74 : 88;

  // Formation Stability
  let stabilityHome = 94;
  let stabilityAway = 78;
  let instabilityPenH = 0.0;
  let instabilityPenA = isWomen ? 3.0 : 4.5;

  // Psychology STAKES
  let compContext = normalizedHome.includes("women") || normalizedAway.includes("women") ? "International High Profile Series" : "World Cup 10k Simulation Stage";
  let motivationHome = "Extremely high to showcase tactical strength on home turf";
  let motivationAway = "Stable motivation focused on injury avoidance and tactical drills";

  // Monte Carlo
  let baseAdjustedXgHome = isWomen ? 2.15 : 1.57;
  let baseAdjustedXgAway = isWomen ? 1.14 : 1.23;

  if (temp > 30) {
    baseAdjustedXgHome = parseFloat((baseAdjustedXgHome * 0.88).toFixed(2));
    baseAdjustedXgAway = parseFloat((baseAdjustedXgAway * 0.85).toFixed(2));
  }
  if (moisture === "Dry/Long Grass") {
    baseAdjustedXgHome = parseFloat((baseAdjustedXgHome * 0.93).toFixed(2));
    baseAdjustedXgAway = parseFloat((baseAdjustedXgAway * 0.93).toFixed(2));
  }

  let homeProb = Math.round(33 + (baseAdjustedXgHome - baseAdjustedXgAway) * 28);
  let awayProb = Math.round(33 - (baseAdjustedXgHome - baseAdjustedXgAway) * 28);
  let drawProb = 100 - homeProb - awayProb;
  if (homeProb < 10) homeProb = 10;
  if (awayProb < 10) awayProb = 10;
  if (drawProb < 10) drawProb = 10;
  let tot = homeProb + awayProb + drawProb;
  if (tot !== 100) homeProb += (100 - tot);

  let confidenceScore = isWomen ? 88 : 82;
  if (temp > 32) confidenceScore -= 10;

  // Value bet and guardrail
  let calculatedOddsH = `+${Math.round((100 / homeProb - 1) * 100)}`;
  let calculatedOddsD = `+${Math.round((100 / drawProb - 1) * 100)}`;
  let calculatedOddsA = `+${Math.round((100 / awayProb - 1) * 100)}`;

  let bookmakerOddsH = homeProb > 45 ? "-110" : "+180";
  let bookmakerOddsD = "+260";
  let bookmakerOddsA = awayProb > 45 ? "-105" : "+210";

  let valMarginH = homeProb > 40 ? 5.8 : 1.2;
  let valMarginD = 0.5;
  let valMarginA = awayProb > 40 ? 6.4 : -2.5;

  const isLiveInPlay = current_minute !== undefined && current_score !== undefined;
  if (isLiveInPlay) {
    const lHome = normalizedHome;
    const lAway = normalizedAway;
    if (lHome.includes("spain") && lAway.includes("germany")) {
      homeProb = 71;
      drawProb = 21;
      awayProb = 8;
    } else if (lHome.includes("sweden") && lAway.includes("usa")) {
      homeProb = 6;
      drawProb = 16;
      awayProb = 78;
    } else if (lHome.includes("mexico") && lAway.includes("france")) {
      homeProb = 44;
      drawProb = 28;
      awayProb = 28;
    } else if (lHome.includes("brazil") && lAway.includes("japan")) {
      homeProb = 94;
      drawProb = 5;
      awayProb = 1;
    } else {
      let currentHomeGoals = 0;
      let currentAwayGoals = 0;
      if (current_score) {
        const scores = current_score.split("-");
        currentHomeGoals = parseInt(scores[0], 10) || 0;
        currentAwayGoals = parseInt(scores[1], 10) || 0;
      }
      if (currentHomeGoals > currentAwayGoals) {
        homeProb = Math.round(60 + (current_minute / 2.2));
        awayProb = Math.max(2, Math.round(20 - (current_minute / 4.4)));
        drawProb = 100 - homeProb - awayProb;
      } else if (currentAwayGoals > currentHomeGoals) {
        awayProb = Math.round(60 + (current_minute / 2.2));
        homeProb = Math.max(2, Math.round(20 - (current_minute / 4.4)));
        drawProb = 100 - homeProb - awayProb;
      } else {
        drawProb = Math.round(50 + (current_minute / 2.2));
        homeProb = Math.round((100 - drawProb) / 2);
        awayProb = 100 - drawProb - homeProb;
      }
    }
    
    confidenceScore = 93;
    calculatedOddsH = homeProb >= 99 ? "+101" : `+${Math.round((100 / homeProb - 1) * 100)}`;
    calculatedOddsD = drawProb >= 99 ? "+101" : `+${Math.round((100 / drawProb - 1) * 100)}`;
    calculatedOddsA = awayProb >= 99 ? "+101" : `+${Math.round((100 / awayProb - 1) * 100)}`;
    
    valMarginH = homeProb > 40 ? 5.2 : 1.2;
    valMarginA = awayProb > 40 ? 5.8 : 1.5;
  }

  // Force NO EDGE state for neutral fallback matches to demonstrate the "No Bet" guardrail!
  const isNeutralFallback = !isLiveInPlay && !normalizedHome.includes("usa") && !normalizedHome.includes("united states") && !normalizedHome.includes("germany") && !normalizedHome.includes("france") && !normalizedHome.includes("colombia") && !normalizedHome.includes("england");
  if (isNeutralFallback) {
    confidenceScore = 48; // drops below 50% to trigger the guardrail!
    valMarginH = 1.0;
    valMarginA = 1.5;
  }

  const dataQualityScoreVal = isNeutralFallback ? 65 : 95;
  const startingXiContinuityHomeVal = 91;
  const startingXiContinuityAwayVal = 84;
  const coachTenureMonthsHomeVal = 28;
  const coachTenureMonthsAwayVal = 15;
  const daysRestHomeVal = restHome;
  const daysRestAwayVal = restAway;
  const calculatedEdgePctVal = isNeutralFallback ? 1.5 : (valMarginH > valMarginA ? valMarginH : valMarginA);
  const stratosConfidenceScoreVal = confidenceScore;

  const hasEdge = stratosConfidenceScoreVal >= 50 && dataQualityScoreVal >= 70 && calculatedEdgePctVal >= 3.0;
  const verdictResult: "⚠️ NO EDGE DETECTED - SKIP MATCH" | "🟢 VALUE OPPORTUNITY" = hasEdge ? "🟢 VALUE OPPORTUNITY" : "⚠️ NO EDGE DETECTED - SKIP MATCH";
  const targetMarket = hasEdge ? (valMarginH > valMarginA ? `${home} Moneyline` : `${away} +0.5 Asian Handicap`) : "NO EDGE - SKIP MATCH";

  const formattedCalculatedOdds = `Home: ${calculatedOddsH}, Draw: ${calculatedOddsD}, Away: ${calculatedOddsA}`;
  const formattedBookmakerOdds = `Home: ${bookmakerOddsH}, Draw: ${bookmakerOddsD}, Away: ${bookmakerOddsA}`;

  function getFederation(team: string): string {
    const t = team.toLowerCase();
    if (t.includes("usa") || t.includes("united states") || t.includes("mexico") || t.includes("canada")) {
      return "CONCACAF";
    }
    if (t.includes("germany") || t.includes("spain") || t.includes("france") || t.includes("england") || t.includes("italy") || t.includes("belgium") || t.includes("sweden")) {
      return "UEFA";
    }
    if (t.includes("brazil") || t.includes("argentina") || t.includes("uruguay") || t.includes("colombia")) {
      return "CONMEBOL";
    }
    if (t.includes("japan") || t.includes("korea") || t.includes("australia")) {
      return "AFC";
    }
    return "FIFA";
  }

  function getHeatAdaptation(team: string): number {
    const t = team.toLowerCase();
    if (t.includes("brazil") || t.includes("colombia") || t.includes("mexico")) return 92;
    if (t.includes("usa") || t.includes("united states") || t.includes("spain") || t.includes("argentina") || t.includes("uruguay")) return 85;
    if (t.includes("germany") || t.includes("france") || t.includes("england") || t.includes("italy") || t.includes("belgium") || t.includes("canada") || t.includes("sweden")) return 74;
    return 80;
  }

  const homeFed = getFederation(home);
  const awayFed = getFederation(away);
  
  let clashScore = 75;
  let stylisticBias = "Standard stylistic clash.";
  if (homeFed !== awayFed) {
    if ((homeFed === "CONMEBOL" && awayFed === "UEFA") || (homeFed === "UEFA" && awayFed === "CONMEBOL")) {
      clashScore = 92;
      stylisticBias = "Aggressive high-pressing CONMEBOL direct vertical transitions Clash [historical_regional_friction.historical_matchup_bias] with compact UEFA positional structures [historical_regional_friction.historical_matchup_bias].";
    } else if ((homeFed === "CONCACAF" && awayFed === "UEFA") || (homeFed === "UEFA" && awayFed === "CONCACAF")) {
      clashScore = 84;
      stylisticBias = "High-tempo transitions from CONCACAF [historical_regional_friction.historical_matchup_bias] seeking to break UEFA tactical rhythm and possession-reliance blocks [historical_regional_friction.historical_matchup_bias].";
    } else if ((homeFed === "CONMEBOL" && awayFed === "AFC") || (homeFed === "AFC" && awayFed === "CONMEBOL")) {
      clashScore = 80;
      stylisticBias = "Slick, disciplined organization and rapid direct counterattacks from AFC [historical_regional_friction.historical_matchup_bias] colliding with creative spaces and flow of CONMEBOL [historical_regional_friction.historical_matchup_bias].";
    } else {
      clashScore = 82;
      stylisticBias = `Clash of different federation structural philosophies: ${homeFed} vs ${awayFed} [historical_regional_friction.historical_matchup_bias].`;
    }
  } else {
    clashScore = 45;
    stylisticBias = `Intra-federation matchup (${homeFed} vs ${awayFed}) featuring high familiarity and standard low-friction tactical configurations [historical_regional_friction.historical_matchup_bias].`;
  }

  const heatStressIndex = (temp + (humidity * 0.1) - (isClimateControlled ? 5 : 0)).toFixed(1);
  const heatHome = getHeatAdaptation(home);
  const heatAway = getHeatAdaptation(away);

  const liveUpdateNarrativeSnippet = isLiveInPlay ? `* **⚠️ IN-PLAY LIVE UPDATE INDEX:** State: LIVE at ${current_minute}' | Score: ${current_score} 
* **Live Match Context:** ${match_context}` : "";

  const tacticalCohesionSnippet = isLiveInPlay ? `Recalculating remainder of the match (${90 - (current_minute || 45) > 0 ? 90 - (current_minute || 45) : 0} minutes remaining) from the current in-play state. Tactical context feedback: "${match_context}".` : `The Home Team exhibits stable chemistry with a high starting XI continuity of ${startingXiContinuityHomeVal}/100 and manager tenure of ${coachTenureMonthsHomeVal} months. This offers a robust defensive anchor compared to the Away Team's ${startingXiContinuityAwayVal}/100 continuity and shorter manager tenure of ${coachTenureMonthsAwayVal} months. Combined with a rest disparity of ${daysRestHomeVal} days against ${daysRestAwayVal} days, early possession control is simulated to heavily favor the home side.`;

  return {
    matchInfo: {
      homeTeam: home,
      awayTeam: away,
      venue: activeVenue,
      surface: isClimateControlled ? "Artificial Grass" : "Natural Grass",
      date: "Scheduled Today"
    },
    matchdayContext: {
      venueStatus: isHighAltitude || isClimateControlled ? "Tournament / Neutral Venue (Mode B)" : "Standard League Match (Mode A)",
      environmentalAdjustments: `Kickoff at ${activeKickoff} with temperature ${temp}°C and pitch moisture marked '${moisture}'. Friction details: ${frictionStr}.`,
      venueInfluenceIndex: `Altitude: ${altitudeMeters}m. Weather: ${temp}°C / ${wind}km/h. Crowd distribution expected at 75% local home splits.`,
      refereeName: "Szymon Marciniak",
      cardsPerMatch: 4.8,
      penaltyFrequencyPct: 24.5,
      oddsDriftPct: 2.15,
      importanceMultiplier: 1.5,
      motivationIndexHome: 95,
      motivationIndexAway: 78,
      lineupShockDetectedHome: false,
      lineupShockDetectedAway: true,
      absenceImpactHome: Math.abs(availDeltaH),
      absenceImpactAway: Math.abs(availDeltaA),
      data_quality_score: dataQualityScoreVal,
      dataQualityScore: dataQualityScoreVal,
      starting_xi_continuity_home: startingXiContinuityHomeVal,
      startingXiContinuityHome: startingXiContinuityHomeVal,
      starting_xi_continuity_away: startingXiContinuityAwayVal,
      startingXiContinuityAway: startingXiContinuityAwayVal,
      coach_tenure_months_home: coachTenureMonthsHomeVal,
      coachTenureMonthsHome: coachTenureMonthsHomeVal,
      coach_tenure_months_away: coachTenureMonthsAwayVal,
      coachTenureMonthsAway: coachTenureMonthsAwayVal,
      days_rest_home: daysRestHomeVal,
      daysRestHome: daysRestHomeVal,
      days_rest_away: daysRestAwayVal,
      daysRestAway: daysRestAwayVal,
      calculated_edge_pct: calculatedEdgePctVal,
      calculatedEdgePct: calculatedEdgePctVal,
      stratos_confidence_score: stratosConfidenceScoreVal,
      stratosConfidenceScore: stratosConfidenceScoreVal,
    },
    explainabilityLayer: {
      positiveDrivers: [
        `Argentina Power rating advantage [homeElo]`,
        `Favorable home team squad continuity score [starting_xi_continuity_home]`
      ],
      negativeFactors: [
        `Adverse rest discrepancy of only ${daysRestAwayVal} days rest [days_rest_away]`,
        `Degrading environmental climate decay under intense temperature conditions [climateDecayFactorAway]`
      ]
    },
    whyNotEngine: {
      failureConditions: [
        "Unplanned early referee red card completely breaks initial Poisson projection matrices.",
        "Opponent successfully parks an aggregate triple pivot defensive block, choking out transition play.",
        "Extreme dehydration or sudden heat exhaustion in defensive pivots."
      ]
    },
    phase1EloStrength: {
      homeElo: baseHomeElo,
      awayElo: baseAwayElo,
      historicalXgTrendHome: isWomen ? 2.15 : 1.45,
      historicalXgTrendAway: isWomen ? 1.58 : 1.85,
      rosterValueHome: `$${Math.round(baseHomeElo * 3.5)}M Pool Valuation`,
      rosterValueAway: `$${Math.round(baseAwayElo * 3.8)}M Pool Valuation`,
      genderBaselineHistory: `Calibrated against historical ${genderSlate} models.`,
      analysis: `Power structure represents a baseline ELO split of ${baseHomeElo} vs ${baseAwayElo} in favor of ${baseHomeElo > baseAwayElo ? home : away}.`
    },
    phase2TacticalMatchup: {
      homeFormation: formationHome,
      awayFormation: formationAway,
      passingVelocityHome: moisture === "Wet/Raining" ? "High Tempo (2.4m/s slick glide)" : "Medium Paced (1.8m/s)",
      passingVelocityAway: "Direct slow build switches",
      homePpda: ppdaHome,
      awayPpda: ppdaAway,
      defensiveBlockStyleHome: "Aggressive Gegenpress high line",
      defensiveBlockStyleAway: moisture === "Dry/Long Grass" ? "Symmetric deep low block" : "Mid-block pressing overlay",
      formationCompatibilityAnalysis: `Formation comparison of ${formationHome} vs ${formationAway} is modeled. High press index of PPDA ${ppdaHome} targets defensive pivots.`
    },
    phase3SquadAvailability: {
      missingPersonnelHome: missingH,
      missingPersonnelAway: missingA,
      availabilityDeltaHome: availDeltaH,
      availabilityDeltaAway: availDeltaA,
      depthSustainabilityScoreHome: depthH,
      depthSustainabilityScoreAway: depthA,
      analysis: `Absence of key personnel results in a rating delta of ${availDeltaH} vs ${availDeltaA}. Depth scores highlight roster resilience curves.`
    },
    phase4FormationStability: {
      expectedFormationHome: formationHome,
      expectedFormationAway: formationAway,
      last5FormationsHome: [formationHome, formationHome, "4-3-3", formationHome, formationHome],
      last5FormationsAway: [formationAway, "4-3-3", formationAway, "3-5-2", formationAway],
      instabilityPenaltyHome: instabilityPenH,
      instabilityPenaltyAway: instabilityPenA,
      stabilityRatingHome: stabilityHome,
      stabilityRatingAway: stabilityAway,
      analysis: `Formation stability scores are calibrated at ${stabilityHome}% vs ${stabilityAway}%. Manager tactical alterations are penalised accordingly.`
    },
    phase5TravelStress: {
      flightDistanceMilesHome: distHome,
      flightDistanceMilesAway: distAway,
      timeZonesCrossedHome: zonesHome,
      timeZonesCrossedAway: zonesAway,
      recoveryRestHoursHome: restHome * 24,
      recoveryRestHoursAway: restAway * 24,
      travelFatigueScoreHome: travelFatigueHome,
      travelFatigueScoreAway: travelFatigueScoreAway,
      analysis: `Travel fatigue scores of ${travelFatigueHome}/100 and ${travelFatigueScoreAway}/100 capture physical recovery rest disparities.`
    },
    phase6ClimateAdaptation: {
      matchdayTempCelsius: temp,
      matchdayHumidityPercent: humidity,
      matchdayWindKmh: wind,
      climateDecayFactorHome: climateDecayHome,
      climateDecayFactorAway: climateDecayAway,
      adaptationProfileHome: `Acclimatized domestic cohort. Heat decay active above ${temp}°C`,
      adaptationProfileAway: `Transatlantic travelers adjusting to ${temp}°C thermal limits`,
      analysis: `Thermal match decay of ${Math.round(climateDecayHome * 100)}% vs ${Math.round(climateDecayAway * 100)}% acts exponentially past sixty minutes.`
    },
    phase7StadiumIntelligence: {
      altitudeMeters: altitudeMeters,
      altitudeBallPhysicsAdjustment: isHighAltitude ? `Hypobaric thin air increases drag coefficient by -5% (ball moves faster)` : `Standard sea-level drag metrics`,
      altitudeStaminaImpactHome: staminaDropHome,
      altitudeStaminaImpactAway: staminaDropAway,
      roofEnclosureState: isClimateControlled ? "CLOSED" : "OPEN_AIR",
      pitchSurfaceFriction: frictionStr,
      stadiumAnalysis: `Stadium intelligence isolates an altitude of ${altitudeMeters}m with structural pitch friction state: "${frictionStr}".`
    },
    phase8TournamentPsychology: {
      competitionContext: compContext,
      motivationContextHome: motivationHome,
      motivationContextAway: motivationAway,
      riskMitigationBehaviorHome: compContext.includes("World Cup") ? "Medium risk mitigation with selective counter pivots" : "Open experimental testing",
      riskMitigationBehaviorAway: "Deeper defensive preservation limits to maintain stamina",
      derbyTensionLevel: isHighAltitude ? "MODERATE" : "LOW",
      behavioralLogicAnalysis: `Behavioral logic matches expected ${compContext} stakes. High professional drive dominates matchday performance parameters.`
    },
    phase9MonteCarlo: {
      adjustedXgHome: baseAdjustedXgHome,
      adjustedXgAway: baseAdjustedXgAway,
      winProbabilityHome: homeProb,
      winProbabilityDraw: drawProb,
      winProbabilityAway: awayProb,
      cleanSheetProbHome: Math.round(15 + baseAdjustedXgAway * 8),
      cleanSheetProbAway: Math.round(15 + baseAdjustedXgHome * 8),
      scorelineProjections: [
        { score: `${Math.ceil(baseAdjustedXgHome)} - ${Math.floor(baseAdjustedXgAway)}`, probability: 15.6 },
        { score: "1 - 1", probability: 13.4 },
        { score: `${Math.floor(baseAdjustedXgHome)} - ${Math.ceil(baseAdjustedXgAway)}`, probability: 10.8 },
        { score: `${Math.ceil(baseAdjustedXgHome)} - ${Math.ceil(baseAdjustedXgAway)}`, probability: 8.5 }
      ],
      predictionConfidenceScore: confidenceScore,
      predictionConfidenceExplanation: `Simulation precision calibrated at ${confidenceScore}% based on standard rosters, active alignments, training camp status, and weather constants.`,
      dataVolatilityIndex: confidenceScore > 80 ? "LOW" : confidenceScore > 60 ? "MODERATE" : "HIGH"
    },
    phase10ValueBetDetection: {
      calculatedOddsHome: calculatedOddsH,
      calculatedOddsDraw: calculatedOddsD,
      calculatedOddsAway: calculatedOddsA,
      bookmakerOddsHome: bookmakerOddsH,
      bookmakerOddsDraw: bookmakerOddsD,
      bookmakerOddsAway: bookmakerOddsA,
      valueMarginHome: valMarginH,
      valueMarginDraw: valMarginD,
      valueMarginAway: valMarginA,
      edgeVerdict: verdictResult,
      targetMarketSelection: targetMarket,
      exactDiscrepancyExplanation: `STRATOS isolates custom environmental parameters (such as ${
        isHighAltitude ? "Altitude Ball flight + fatigue" : temp > 28 ? "Heat/Humidity + Bench substitutions" : `Pitch moisture: ${moisture}`
      }) which public trading lists under-represent.`,
      valueRecommendation: hasEdge ? `Recommended Bet Selection: ${targetMarket} at ${bookmakerOddsH} or Draw No Bet representing substantial margin.` : "⚠️ NO EDGE DETECTED - Safe action dictates SKIP."
    },
    summaryDataBlocks: {
      matchStressAndContext: {
        genderSlate,
        competitionContext: compContext,
        esiIndex: temp > 30 ? "SEVERE" : temp > 22 ? "MODERATE" : "LOW",
        travelFatigueScore: `Home: ${travelFatigueHome}/100, Away: ${travelFatigueScoreAway}/100`
      },
      squadResilienceProfile: {
        squadAvailabilityDelta: `Home: ${availDeltaH} pts, Away: ${availDeltaA} pts`,
        formationStabilityRating: `Home: ${stabilityHome}%, Away: ${stabilityAway}%`
      },
      stratosPredictionMatrix: {
        homeDrawAwayPct: `${homeProb}% / ${drawProb}% / ${awayProb}%`,
        top3Scorelines: [
          `${Math.ceil(baseAdjustedXgHome)} - ${Math.floor(baseAdjustedXgAway)} (15.6%)`,
          `1 - 1 (13.4%)`,
          `${Math.floor(baseAdjustedXgHome)} - ${Math.ceil(baseAdjustedXgAway)} (10.8%)`
        ],
        predictionConfidenceScorePct: `${confidenceScore}%`
      },
      valueBetDetectionOverlay: {
        stratosOddsVsBookmakerOdds: `Calculated [${formattedCalculatedOdds}] vs Bookmaker [${formattedBookmakerOdds}]`,
        verdict: verdictResult,
        targetMarketSelection: targetMarket
      }
    },
    cognitiveNarrative: `### 1. STRATOS SYSTEM DATA INTEGRITY AUDIT
* **Active Fixture Profile:** ${home} vs ${away} | Mode: ${isNeutralFallback ? "Tier 1 - Browse Mode (fast-pass 500-iteration macro-assessment)" : "Tier 2 - Deep Analysis Mode (comprehensive 10,000-pass Monte Carlo simulation)"} | Gender Slate: ${genderSlate}
* **Telemetry Quality Index:** ${dataQualityScoreVal}/100 (Cache Age: ${isLiveInPlay ? "12" : "null"}s | Live Trigger: ${isLiveInPlay ? "PENALTY_CALIBRATION" : "null"})
* **Live In-Play Board:** ${isLiveInPlay ? current_score : "0-0"} (Minute: ${isLiveInPlay ? current_minute : "0"}' | Halftime Score: ${isLiveInPlay ? (current_minute >= 45 ? "1-0" : "0-0") : "0-0"})

### 2. HISTORICAL REGIONAL FRICTION & STYLISTIC ANALYSIS
* **Federation Structural Profiles:** ${homeFed} vs ${awayFed} | Matchup Clash Score: ${clashScore}/100
* **Style Compatibility Narrative:** ${stylisticBias}

### 3. LIVE CLIMATE DEGRADATION LOGS (Minutes 60-90 Matrix)
* **Match Venue Climate Matrix:** Venue: ${activeVenue} | Heat Stress Index: ${heatStressIndex}°C
* **Late-Game Stamina Drop-Off:** At ${temp}°C, the Heat Stress Index of ${heatStressIndex}°C triggers metabolic demand. ${home} (Heat Adaptation: ${heatHome}%) of ${homeFed} manages thermal weathering compared to ${away} (Heat Adaptation: ${heatAway}%) of ${awayFed}, creating late-game fatigue gaps (Minutes 60-90) and scoreline variances.

### 4. THE EXPLAINABILITY LAYER (Grounded Metric Drivers)
* **Positive Engine Drivers:**
    1. Foundational team power baseline rating superiority (Home Team Strength [phase1EloStrength.homeElo])
    2. Elevated squad starting lineup chemistry index (Starting XI Chemistry [matchdayContext.starting_xi_continuity_home])
* **Negative Engine Factors:**
    1. Compressed training and recovery rest duration (Guest Rest Discrepancy [matchdayContext.days_rest_away])
    2. Dynamic thermal fatigue decay factor (Away Climate Decay [phase6ClimateAdaptation.climateDecayFactorAway])

### 5. FINAL IN-PLAY SIMULATION PROJECTIONS & VALUE OVERLAY
* **STRATOS Probabilities:** Home Win ${homeProb}% | Draw ${drawProb}% | Away Win ${awayProb}%
* **Prediction Confidence Rating:** ${stratosConfidenceScoreVal}%
* **Market Status:** Live Bookie Lines vs STRATOS Target Calculations | Calculated Edge Delta: ${calculatedEdgePctVal.toFixed(1)}%
* **Betting Market Verdict:** ${verdictResult}
* **Live Target Execution:** ${hasEdge ? `Selection: ${targetMarket} with a mathematical calculated edge of +${calculatedEdgePctVal.toFixed(1)}%` : "N/A - System Recommends Passing due to alignment with current market pricing"}`
  };
}

// Fixtures route with dynamic date generation for current calendar day
app.get("/api/fixtures", (req, res) => {
  const category = (req.query.category as string) || "mens";
  const today = new Date();
  
  // Format dynamically based on runtime date
  const formattedToday = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });

  const mensFixtures = [
    { home: "USA", away: "Germany", venue: "Soldier Field, Chicago", date: formattedToday, featured: true },
    { home: "Mexico", away: "USA", venue: "Estadio Azteca, Mexico City", date: formattedToday, featured: false },
    { home: "Canada", away: "Spain", venue: "Estadio Akron, Guadalajara", date: formattedToday, featured: false },
    { home: "Argentina", away: "Uruguay", venue: "Hard Rock Stadium, Miami", date: formattedToday, featured: false },
    { home: "France", away: "Brazil", venue: "AT&T Stadium, Dallas", date: formattedToday, featured: false },
    { home: "England", away: "Italy", venue: "Mercedes-Benz Stadium, Atlanta", date: formattedToday, featured: false },
    { home: "Colombia", away: "Belgium", venue: "Estadio BBVA, Monterrey", date: formattedToday, featured: false },
  ];

  const womensFixtures = [
    { home: "USA Women", away: "Germany Women", venue: "Soldier Field, Chicago", date: formattedToday, featured: true },
    { home: "Mexico Women", away: "USA Women", venue: "Estadio Azteca, Mexico City", date: formattedToday, featured: false },
    { home: "Canada Women", away: "Spain Women", venue: "Estadio Akron, Guadalajara", date: formattedToday, featured: false },
    { home: "Argentina Women", away: "Uruguay Women", venue: "Hard Rock Stadium, Miami", date: formattedToday, featured: false },
    { home: "France Women", away: "Brazil Women", venue: "AT&T Stadium, Dallas", date: formattedToday, featured: false },
    { home: "England Women", away: "Italy Women", venue: "Mercedes-Benz Stadium, Atlanta", date: formattedToday, featured: false },
    { home: "Colombia Women", away: "Belgium Women", venue: "Estadio BBVA, Monterrey", date: formattedToday, featured: false },
  ];

  const fixtures = category === "womens" ? womensFixtures : mensFixtures;
  res.json({ fixtures, date: formattedToday });
});

// Prediction Route with API fallback
app.post("/api/predict", async (req, res) => {
  const { 
    homeTeam, 
    awayTeam, 
    venue, 
    kickoffTime, 
    altitudeCampHome, 
    altitudeCampAway, 
    pitchMoisture, 
    matchTemperature, 
    simulationMode, 
    isManualInput,
    current_minute,
    current_score,
    match_context,
    currentMinute,
    currentScore,
    matchContext
  } = req.body;

  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: "homeTeam and awayTeam parameters are required" });
  }

  const activeMinute = current_minute !== undefined ? current_minute : currentMinute;
  const activeScore = current_score || currentScore;
  const activeContext = match_context || matchContext;

  const activeMode = simulationMode === "tier1" ? "tier1" : "tier2";

  // Gracefully handle missing API key or use of offline dummy key
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    console.log(`GEMINI_API_KEY is not set. Serving highly-structured 9-Phase mock result for: ${homeTeam} vs ${awayTeam} with mode: ${activeMode}`);
    const prediction = getMockPrediction(
      homeTeam, 
      awayTeam, 
      venue, 
      kickoffTime, 
      altitudeCampHome, 
      altitudeCampAway, 
      pitchMoisture, 
      matchTemperature, 
      activeMode,
      activeMinute,
      activeScore,
      activeContext
    );
    return res.json({ prediction: { ...prediction, simulationMode: activeMode }, isMock: true });
  }

  try {
    const ai = getGeminiClient();
    console.log(`Calling Gemini API (Stratos v2 Predictive Engine 9-Phase Core with ${activeMode}) for: ${homeTeam} vs ${awayTeam}`);

    const livePromptSnippet = (activeMinute !== undefined && activeScore !== undefined) ? `
⚠️ CRITICAL IN-PLAY LIVE UPDATE CONTEXT ACTIVE:
- Current Minute: ${activeMinute}'
- Current Score: ${activeScore}
- Match Context Feedback: "${activeContext}"

Evaluate the match from this live situation, calculating the probabilities specifically for the REMAINING minutes of the match based on the current score and tactical state!` : "";

    const promptText = `
You are STRATOS v2, an enterprise-grade Football Intelligence System, Cognitive Interpretation, Tactical Narrative, and Risk Layer purpose-built to translate pre-calculated sports science, weather metrics, and quantitative betting payloads into elite, human-readable betting intelligence.

Analyze the football matchup between:
Home Team: "${homeTeam}"
Away Team: "${awayTeam}"
Selected Match Venue: "${venue || "Soldier Field, Chicago, IL"}"
Scheduled Kickoff Time: "${kickoffTime || "15:00"}"
Home Team Altitude Training Prep (>14 days): ${altitudeCampHome ? "YES" : "NO"}
Away Team Altitude Training Prep (>14 days): ${altitudeCampAway ? "YES" : "NO"}
Pitch Moisture State: "${pitchMoisture || "Standard"}"
Match Day Temperature Calibration: ${matchTemperature !== undefined ? matchTemperature : 22}°C (approx ${matchTemperature !== undefined ? Math.round(matchTemperature * 1.8 + 32) : 72}°F)
SELECTED COMPUTATIONAL PASS ENGINE MODE: ${activeMode === 'tier1' ? 'Tier 1 - Browse Mode (fast-pass 500-iteration macro-assessment)' : 'Tier 2 - Deep Analysis Mode (comprehensive 10,000-pass Monte Carlo simulation)'}
${livePromptSnippet}

You MUST run a search to extract current, real-world lineup news, team injury reports, tactical setups, travel schedules, current referee info, and actual pitch/weather settings for both teams.

Process the evaluation sequentially through the following 10 structural phases and generate a detailed quantitative breakdown:

### 📊 SECTION I: THE STATISTICAL BASELINES
* **Phase 1: ELO & Foundational Team Strength:** Establish raw team power metrics using long-term xG trends, team roster values, and gender-specific baseline historical performance metrics (Male vs. Female association splits).
* **Phase 2: Tactical Matchup Engine:** Evaluate formation compatibility (e.g., 4-3-3 vs 3-5-2), passing velocity capabilities, pressing styles (PPDA), and defensive block styles (high line vs deep low block).

### 🚨 SECTION II: THE AVAILABILITY & ENVIRONMENTAL MODIFIERS
* **Phase 3: Squad Availability Index:** Calculate the specific rating reduction caused by missing personnel (injuries, cards, suspensions). Measure team depth resilience via the Depth Sustainability Score.
* **Phase 4: Formation Stability Engine:** Analyze lineup variation across the last 5 fixtures to measure tactical consistency. Apply a non-zero instability penalty if a team constantly switches shapes.
* **Phase 5: Travel Stress Index:** Measure physical travel fatigue by calculating flight hours, miles, time zones crossed, and recovery rest hours between matches.
* **Phase 6: Climate Adaptation Index:** Model dynamic physical weathering using temperature gradients, wind speeds, and relative humidity. Apply progressive performance decay multipliers after the 60th minute in high-heat (especially for European teams in >30°C conditions).
* **Phase 7: Stadium Intelligence Layer:** Feed environmental micro-climates including roof status (closed vs open-air), pitch turf friction (slick/wet vs sticky/long grass), and altitude thin-air parameters.

### 🏆 SECTION III: THE DECISION & SIMULATION OVERLAYS
* **Phase 8: Tournament Psychology Index:** Measure situational stakes including tournament pressure (e.g., group-stage math, elimination rounds), local fan support, and derby rivalry tension.
* **Phase 9: Full-Scale Monte Carlo Simulation Engine:** Consolidate factors from Phases 1-8. Run the specified iterations (${activeMode === 'tier1' ? '500 iterations for fast-pass' : '10,000 simulations for deep mode'}) to derive expected scorelines, win/draw/away probabilities, clean-sheet probabilities, and a overall Prediction Confidence Score (0-100%).
* **Phase 10: Value Bet Detector & Edge Isolation Engine:** Identify pricing discrepancies against public bookmaker odds.

---

# 🚫 CORE OPERATIONAL GUARDRAILS & BYPASS DIRECTIVES
1. **ZERO STATISTICAL FABRICATION:** You are strictly forbidden from inventing, estimating, or hallucinating performance metrics, xG trends, clean sheet frequencies, or scorelines. All metrics in your text must align EXACTLY with the numeric values returned under the schema's properties.
2. **STRICT EXPLICIT GROUNDING:** When listing "Positive Drivers" or "Negative Factors," you must ONLY reference raw metrics explicitly provided in the JSON payload (such as homeElo, starting_xi_continuity_home, days_rest_away, etc.). For every driver identified, you must append the payload key name in square brackets, e.g., (Positive Driver: Argentina Experience [starting_xi_continuity_away]).
3. **MISSING DATA SAFEGUARD:** If any metric or index block arrives empty or null, label it explicitly as "DATA UNAVAILABLE" in your report and describe the uncalibrated risk it introduces to the selection.
4. **⚠️ AUTOMATIC "NO EDGE" SYSTEM ACTIONS:** You must instantly bypass standard pick selections and output a strict "⚠️ NO EDGE DETECTED - SKIP MATCH" betting verdict if any of these conditions are met:
   - The 'data_quality_score' drops below 70% (Incomplete data).
   - The 'stratos_confidence_score' drops below 50% (High statistical model volatility).
   - The 'calculated_edge_pct' is lower than +3.0% against commercial bookmaker odds.

---

# 📋 SECTION IV: PARAMETER COUPLING SYSTEM
Thoroughly populate the "matchdayContext" properties with exact, calculated figures including:
- refereeName: Name of a realistic official assigned to this match or competition (e.g. Szymon Marciniak, Halil Umut Meler, etc).
- cardsPerMatch: The average cards per match for this official (e.g. 4.8).
- penaltyFrequencyPct: The penalty frequency percentage (e.g. 24.5).
- oddsDriftPct: The market pricing drift percentage (e.g. 2.15).
- importanceMultiplier: Tactical context stakes multiplier (e.g. 1.5).
- motivationIndexHome: Numerical index of motivation for Home (0-100).
- motivationIndexAway: Numerical index of motivation for Away (0-100).
- lineupShockDetectedHome: Boolean indicating sudden personnel shock.
- lineupShockDetectedAway: Boolean.
- absenceImpactHome: Score reflecting negative roster capacity drag (0 to 10).
- absenceImpactAway: Score.
- data_quality_score: Data quality percentage (0-100, e.g., 95 if lineups are projections, or 65 if data is incomplete).
- dataQualityScore: Match value in data_quality_score.
- starting_xi_continuity_home: Starting lineup chemistry percentage (0-100, e.g. 91).
- startingXiContinuityHome: Match value in starting_xi_continuity_home.
- starting_xi_continuity_away: Starting lineup chemistry percentage (0-100, e.g. 84).
- startingXiContinuityAway: Match value in starting_xi_continuity_away.
- coach_tenure_months_home: Months of manager tenure (e.g., 28).
- coachTenureMonthsHome: Match value in coach_tenure_months_home.
- coach_tenure_months_away: Months of manager tenure (e.g., 15).
- coachTenureMonthsAway: Match value in coach_tenure_months_away.
- days_rest_home: Rest days (e.g., 6).
- daysRestHome: Match value in days_rest_home.
- days_rest_away: Guest rest days (e.g., 5).
- daysRestAway: Match value in days_rest_away.
- calculated_edge_pct: Mathematical edge margin (e.g., 6.4).
- calculatedEdgePct: Match value in calculated_edge_pct.
- stratos_confidence_score: Prediction confidence score percentage (0-100, e.g., 82).
- stratosConfidenceScore: Match value in stratos_confidence_score.

---

# ✍️ SECTION V: COGNITIVE INTERPRETATION NARRATIVE GENERATION (Phase 14 Tactical Interpreter)
You MUST write a comprehensive Markdown document in the "cognitiveNarrative" field. The document MUST follow this Markdown layout EXACTLY, replacing bracketed variables with exact computed or database values:

### 1. STRATOS SYSTEM DATA INTEGRITY AUDIT
* **Active Fixture Profile:** [home_team] vs [away_team] | Mode: [competition_mode] | Gender Slate: [gender]
* **Telemetry Quality Index:** [data_quality_score]/100 (Cache Age: [in_play_ticker_state.cache_age_seconds]s | Live Trigger: [in_play_ticker_state.live_event_trigger])
* **Live In-Play Board:** [in_play_ticker_state.current_score] (Minute: [in_play_ticker_state.current_minute]' | Halftime Score: [in_play_ticker_state.half_time_score])

### 2. HISTORICAL REGIONAL FRICTION & STYLISTIC ANALYSIS
* **Federation Structural Profiles:** [home_federation] vs [away_federation] | Matchup Clash Score: [historical_regional_friction.h2h_stylistic_clash_score]/100
* **Style Compatibility Narrative:** [Synthesize how regional playing styles clash, citing the exact text provided in historical_matchup_bias]

### 3. LIVE CLIMATE DEGRADATION LOGS (Minutes 60-90 Matrix)
* **Match Venue Climate Matrix:** Venue: [venue] | Heat Stress Index: [environmental_inputs.calculated_heat_stress_index]
* **Late-Game Stamina Drop-Off:** [Detail how the climate variables interact with heat_adaptation_index_home and heat_adaptation_index_away to create late game score line variance, matching the trend where unacclimated teams drop off in the second half]

### 4. THE EXPLAINABILITY LAYER (Grounded Metric Drivers)
* **Positive Engine Drivers:**
    1. [Driver 1 - Explicit metric name with source bracket path, e.g. (Home Team Strength [phase1EloStrength.homeElo])]
    2. [Driver 2 - Explicit metric name with source bracket path, e.g. (Starting XI Chemistry [matchdayContext.starting_xi_continuity_home])]
* **Negative Engine Factors:**
    1. [Factor 1 - Explicit metric name with source bracket path, e.g. (Guest Rest Discrepancy [matchdayContext.days_rest_away])]
    2. [Factor 2 - Explicit metric name with source bracket path, e.g. (Away Climate Decay [phase6ClimateAdaptation.climateDecayFactorAway])]

### 5. FINAL IN-PLAY SIMULATION PROJECTIONS & VALUE OVERLAY
* **STRATOS Probabilities:** Home Win [calculated_home_win_pct]% | Draw [calculated_draw_pct]% | Away Win [calculated_away_win_pct]%
* **Prediction Confidence Rating:** [stratos_confidence_score]%
* **Market Status:** Live Bookie Lines vs STRATOS Target Calculations | Calculated Edge Delta: [market_value_overlay.calculated_edge_pct]%
* **Betting Market Verdict:** [Output 🟢 VALUE OPPORTUNITY or ⚠️ NO EDGE DETECTED - SKIP MATCH]
* **Live Target Execution:** [If value exists, state selection target and edge margin. If no edge, state 'N/A - System Recommends Passing due to alignment with current market pricing']

Return a perfectly formatted raw JSON object conforming EXACTLY to the specified soccerPredictionSchema. Do not wrap the JSON output inside any markdown code blocks. Returns raw JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: soccerPredictionSchema,
        temperature: 0.15, // highly precise analytical output
      },
    });

    const textOutput = response.text || "";
    const parsedData = JSON.parse(textOutput.trim());
    return res.json({ prediction: parsedData, isMock: false });
  } catch (error: any) {
    console.error("Gemini API prediction error:", error);
    // Graceful fallback to guarantee user gets a projection instead of raw 500
    const prediction = getMockPrediction(
      homeTeam, 
      awayTeam, 
      venue, 
      kickoffTime, 
      altitudeCampHome, 
      altitudeCampAway, 
      pitchMoisture, 
      matchTemperature,
      activeMode,
      activeMinute,
      activeScore,
      activeContext
    );
    return res.json({ prediction, isMock: true, apiError: error.message });
  }
});

// Configure Vite middleware in development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
