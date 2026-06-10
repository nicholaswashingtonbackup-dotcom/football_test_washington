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
  simulationMode?: string
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
  const tot = homeProb + awayProb + drawProb;
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

  // Force NO EDGE state for neutral fallback matches to demonstrate the "No Bet" guardrail!
  const isNeutralFallback = !normalizedHome.includes("usa") && !normalizedHome.includes("united states") && !normalizedHome.includes("germany") && !normalizedHome.includes("france") && !normalizedHome.includes("colombia") && !normalizedHome.includes("england");
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
    cognitiveNarrative: `### 1. STRATOS MATCH STRESS & CONTEXT INTEGRITY
* **Fixture Blueprint:** ${home} vs ${away} | ${compContext} | Gender Slate: ${genderSlate}
* **Data Quality Index:** ${dataQualityScoreVal}/100 (Lineups are Projected)
* **Environmental Stress Index (ESI):** ${temp > 30 ? "SEVERE" : temp > 22 ? "MODERATE" : "LOW"} (Temp: ${temp}°C, Humidity: ${humidity}%, Altitude: ${altitudeMeters}m, Roof: ${isClimateControlled ? "CLOSED" : "OPEN_AIR"})
* **Logistical Friction:** Rest Discrepancy: ${daysRestHomeVal} Days vs ${daysRestAwayVal} Days | Market Drift: 2.15%

### 2. SQUAD COHESION & RESILIENCE PROFILES
* **Home Squad Chemistry:** Continuity Score: ${startingXiContinuityHomeVal}/100 | Manager Tenure: ${coachTenureMonthsHomeVal} Months
* **Away Squad Chemistry:** Continuity Score: ${startingXiContinuityAwayVal}/100 | Manager Tenure: ${coachTenureMonthsAwayVal} Months
* **Tactical Cohesion Synthesis:** The Home Team exhibits stable chemistry with a high starting XI continuity of ${startingXiContinuityHomeVal}/100 and manager tenure of ${coachTenureMonthsHomeVal} months. This offers a robust defensive anchor compared to the Away Team's ${startingXiContinuityAwayVal}/100 continuity and shorter manager tenure of ${coachTenureMonthsAwayVal} months. Combined with a rest disparity of ${daysRestHomeVal} days against ${daysRestAwayVal} days, early possession control is simulated to heavily favor the home side.

### 3. THE EXPLAINABILITY LAYER (Grounded Metric Drivers)
* **Positive Engine Drivers:**
    1. Foundational team power baseline rating superiority [homeElo]
    2. Elevated squad starting lineup continuity index [starting_xi_continuity_home]
* **Negative Engine Factors:**
    1. Compressed training and recovery rest duration for the guest side [days_rest_away]
    2. Dynamic thermal fatigue from elevated temperature threshold [climateDecayFactorAway]

### 4. REFEREE & IN-MATCH CRISIS PROFILE
* **Official Match Referee:** Szymon Marciniak
* **Disciplinary Profile:** Card Average: 4.8 | Penalty Rate: 24.50%
* **Tactical Impact Narrative:** Referee Szymon Marciniak represents a major enforcement profile whose card average of 4.8 and penalty rate of 24.50% will penalize physical fatigue highly. In high-stamina weathering blocks (minutes 60-90), transition defense will face elevated card accumulation risks under environmental stress indices.

### 5. FINAL SIMULATION MATRIX & VALUE VERDICT
* **STRATOS Probabilities:** Home Win ${homeProb}% | Draw ${drawProb}% | Away Win ${awayProb}%
* **Prediction Confidence Rating:** ${stratosConfidenceScoreVal}%
* **Top 3 Poisson Distributions:**
    * ${Math.ceil(baseAdjustedXgHome)} - ${Math.floor(baseAdjustedXgAway)} (15.6%)
    * 1 - 1 (13.4%)
    * ${Math.floor(baseAdjustedXgHome)} - ${Math.ceil(baseAdjustedXgAway)} (10.8%)
* **Betting Market Verdict:** ${verdictResult}
* **Target Execution:** ${hasEdge ? `Selection: ${targetMarket} with a mathematical calculated edge of +${calculatedEdgePctVal.toFixed(1)}%` : "N/A - System Recommends Passing due to inadequate value profile"}`
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
  const { homeTeam, awayTeam, venue, kickoffTime, altitudeCampHome, altitudeCampAway, pitchMoisture, matchTemperature, simulationMode, isManualInput } = req.body;
  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: "homeTeam and awayTeam parameters are required" });
  }

  const activeMode = simulationMode === "tier1" ? "tier1" : "tier2";

  // Gracefully handle missing API key or use of offline dummy key
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    console.log(`GEMINI_API_KEY is not set. Serving highly-structured 9-Phase mock result for: ${homeTeam} vs ${awayTeam} with mode: ${activeMode}`);
    const prediction = getMockPrediction(homeTeam, awayTeam, venue, kickoffTime, altitudeCampHome, altitudeCampAway, pitchMoisture, matchTemperature, activeMode);
    return res.json({ prediction: { ...prediction, simulationMode: activeMode }, isMock: true });
  }

  try {
    const ai = getGeminiClient();
    console.log(`Calling Gemini API (Stratos v2 Predictive Engine 9-Phase Core with ${activeMode}) for: ${homeTeam} vs ${awayTeam}`);

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

# ✍️ SECTION V: COGNITIVE INTERPRETATION NARRATIVE GENERATION
You MUST write a comprehensive Markdown document in the "cognitiveNarrative" field. The document MUST follow this Markdown layout EXACTLY, replacing bracketed variables with exact computed or database values:

### 1. STRATOS MATCH STRESS & CONTEXT INTEGRITY
* **Fixture Blueprint:** [Home Team] vs [Away Team] | [Competition Context] | Gender Slate: [Gender]
* **Data Quality Index:** [data_quality_score]/100 (List if Lineups are Confirmed vs Projected)
* **Environmental Stress Index (ESI):** [LOW / MODERATE / SEVERE based on Temperature, Humidity, and Altitude parameters]
* **Logistical Friction:** Rest Discrepancy: [days_rest_home] Days vs [days_rest_away] Days | Market Drift: [odds_drift_pct]%

### 2. SQUAD COHESION & RESILIENCE PROFILES
* **Home Squad Chemistry:** Continuity Score: [starting_xi_continuity_home]/100 | Manager Tenure: [coach_tenure_months_home] Months
* **Away Squad Chemistry:** Continuity Score: [starting_xi_continuity_away]/100 | Manager Tenure: [coach_tenure_months_away] Months
* **Tactical Cohesion Synthesis:** [Briefly explain how the gap in continuity and rest days impacts the early structural stability of the game]

### 3. THE EXPLAINABILITY LAYER (Grounded Metric Drivers)
* **Positive Engine Drivers:**
    1. [Driver 1 - Explicitly name the payload value and add its source bracket]
    2. [Driver 2 - Explicitly name the payload value and add its source bracket]
* **Negative Engine Factors:**
    1. [Factor 1 - Explicitly name the liability metric and add its source bracket]
    2. [Factor 2 - Explicitly name the liability metric and add its source bracket]

### 4. REFEREE & IN-MATCH CRISIS PROFILE
* **Official Match Referee:** [Referee Name]
* **Disciplinary Profile:** Card Average: [cards_per_match] | Penalty Rate: [penalty_frequency_pct]%
* **Tactical Impact Narrative:** [Synthesize how this referee's strictness profile interacts with the environmental stress metrics during high-fatigue match blocks (minutes 60-90)]

### 5. FINAL SIMULATION MATRIX & VALUE VERDICT
* **STRATOS Probabilities:** Home Win [Calculated %] | Draw [Calculated %] | Away Win [Calculated %]
* **Prediction Confidence Rating:** [stratos_confidence_score]%
* **Top 3 Poisson Distributions:** [List scorelines provided]
* **Betting Market Verdict:** [Output 🟢 VALUE OPPORTUNITY or ⚠️ NO EDGE DETECTED - SKIP MATCH]
* **Target Execution:** [If value opportunity exists, specify target selection, bookie odds, and exact mathematical edge %. If no edge exists, write 'N/A - System Recommends Passing due to inadequate value profile']

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
    const prediction = getMockPrediction(homeTeam, awayTeam, venue, kickoffTime, altitudeCampHome, altitudeCampAway, pitchMoisture, matchTemperature);
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
