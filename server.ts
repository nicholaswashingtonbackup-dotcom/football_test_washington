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

// Structured JSON Schema for STRATOS v2 9-Phase Predictive Engine Architecture
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
        venueStatus: { type: Type.STRING, description: "Must be: 'Standard League Match (Mode A)' or 'Tournament / Neutral Venue (Mode B)'" },
        environmentalAdjustments: { type: Type.STRING, description: "Detailed flight fatigue, weather climate indices, turf friction description" },
        venueInfluenceIndex: { type: Type.STRING, description: "Quantification of expected crowd turnout, takeover bias, or altitude factors" },
      },
      required: ["venueStatus", "environmentalAdjustments", "venueInfluenceIndex"],
    },
    explainabilityLayer: {
      type: Type.OBJECT,
      properties: {
        positiveDrivers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. ['+ Attacking xG Advantage [+11%]', '+ Tactical Formation Matchup [+6%]']" },
        negativeFactors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. ['- Squad Fatigue Index 82/100 [-5%]', '- Lineup Disruption [-4%]']" },
      },
      required: ["positiveDrivers", "negativeFactors"],
    },
    whyNotEngine: {
      type: Type.OBJECT,
      properties: {
        failureConditions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Explicit tactical/random events that could break this prediction" },
      },
      required: ["failureConditions"],
    },
    phase1PowerRating: {
      type: Type.OBJECT,
      properties: {
        homeRating: { type: Type.NUMBER, description: "Power score out of 100, e.g. 84.5" },
        awayRating: { type: Type.NUMBER, description: "Power score out of 100, e.g. 81.2" },
        squadDepthValueHome: { type: Type.STRING },
        squadDepthValueAway: { type: Type.STRING },
        historicalXgTrendHome: { type: Type.NUMBER },
        historicalXgTrendAway: { type: Type.NUMBER },
        analysis: { type: Type.STRING },
      },
      required: ["homeRating", "awayRating", "squadDepthValueHome", "squadDepthValueAway", "historicalXgTrendHome", "historicalXgTrendAway", "analysis"],
    },
    phase2FormMomentum: {
      type: Type.OBJECT,
      properties: {
        recentFormHome: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. Array of W, D, L in last 5 games" },
        recentFormAway: { type: Type.ARRAY, items: { type: Type.STRING } },
        pointsDivergenceHome: { type: Type.STRING, description: "Expected vs actual points divergence trend last 5" },
        pointsDivergenceAway: { type: Type.STRING },
        cleanSheetTrendHome: { type: Type.STRING },
        cleanSheetTrendAway: { type: Type.STRING },
        analysis: { type: Type.STRING },
      },
      required: ["recentFormHome", "recentFormAway", "pointsDivergenceHome", "pointsDivergenceAway", "cleanSheetTrendHome", "cleanSheetTrendAway", "analysis"],
    },
    phase3TacticalEngine: {
      type: Type.OBJECT,
      properties: {
        homeFormation: { type: Type.STRING },
        awayFormation: { type: Type.STRING },
        homeTacticalStyle: { type: Type.STRING },
        awayTacticalStyle: { type: Type.STRING },
        homePpda: { type: Type.NUMBER, description: "Passes allowed per defensive action" },
        awayPpda: { type: Type.NUMBER },
        formationStabilityScoreHome: { type: Type.NUMBER, description: "Stability Score (0-100)" },
        formationStabilityScoreAway: { type: Type.NUMBER, description: "Stability Score (0-100)" },
        transitionVulnerabilityHome: { type: Type.STRING },
        transitionVulnerabilityAway: { type: Type.STRING },
        matchupAnalysis: { type: Type.STRING },
      },
      required: [
        "homeFormation",
        "awayFormation",
        "homeTacticalStyle",
        "awayTacticalStyle",
        "homePpda",
        "awayPpda",
        "formationStabilityScoreHome",
        "formationStabilityScoreAway",
        "transitionVulnerabilityHome",
        "transitionVulnerabilityAway",
        "matchupAnalysis"
      ],
    },
    phase4VenueEnvironment: {
      type: Type.OBJECT,
      properties: {
        weatherDetails: { type: Type.STRING },
        weatherIcon: { type: Type.STRING, description: "one of: rain, sun, cloud, wind, snow" },
        altitudeMeters: { type: Type.NUMBER },
        travelDistancePenaltyHome: { type: Type.STRING },
        travelDistancePenaltyAway: { type: Type.STRING },
        pitchFrictionTurf: { type: Type.STRING },
        homeAdvantageMagnitude: { type: Type.STRING },
        crowdBiasExpected: { type: Type.STRING },
        environmentalAnalysis: { type: Type.STRING },
      },
      required: ["weatherDetails", "weatherIcon", "altitudeMeters", "travelDistancePenaltyHome", "travelDistancePenaltyAway", "pitchFrictionTurf", "homeAdvantageMagnitude", "crowdBiasExpected", "environmentalAnalysis"],
    },
    phase5SquadFatigueManager: {
      type: Type.OBJECT,
      properties: {
        fatigueScoreHome: { type: Type.NUMBER, description: "Fatigue Score from 0 to 100" },
        fatigueScoreAway: { type: Type.NUMBER, description: "Fatigue Score from 0 to 100" },
        congestionAnalysis: { type: Type.STRING },
        managerExperienceHome: { type: Type.STRING },
        managerExperienceAway: { type: Type.STRING },
        managerDecisionImpact: { type: Type.STRING },
      },
      required: ["fatigueScoreHome", "fatigueScoreAway", "congestionAnalysis", "managerExperienceHome", "managerExperienceAway", "managerDecisionImpact"],
    },
    phase6PsychologicalEngine: {
      type: Type.OBJECT,
      properties: {
        motivationContextHome: { type: Type.STRING },
        motivationContextAway: { type: Type.STRING },
        derbyTensionLevel: { type: Type.STRING },
        situationalStakes: { type: Type.STRING },
        psychologicalEdge: { type: Type.STRING },
        psychologicalAnalysis: { type: Type.STRING },
      },
      required: ["motivationContextHome", "motivationContextAway", "derbyTensionLevel", "situationalStakes", "psychologicalEdge", "psychologicalAnalysis"],
    },
    phase7MatchdayValidation: {
      type: Type.OBJECT,
      properties: {
        expectedVsConfirmedHome: { type: Type.STRING },
        expectedVsConfirmedAway: { type: Type.STRING },
        lineupDisruptionScoreHome: { type: Type.NUMBER, description: "Rating and xG deduction impact score e.g. -4.5" },
        lineupDisruptionScoreAway: { type: Type.NUMBER },
        confirmedTacticalShiftHome: { type: Type.STRING },
        confirmedTacticalShiftAway: { type: Type.STRING },
        suspensionsAndLateScrapes: { type: Type.STRING },
        personnelDeductionAnalysis: { type: Type.STRING, description: "e.g. Top scorer out = Attacking drops 87 -> 76" },
        validationVerdict: { type: Type.STRING },
      },
      required: ["expectedVsConfirmedHome", "expectedVsConfirmedAway", "lineupDisruptionScoreHome", "lineupDisruptionScoreAway", "confirmedTacticalShiftHome", "confirmedTacticalShiftAway", "suspensionsAndLateScrapes", "personnelDeductionAnalysis", "validationVerdict"],
    },
    phase8MonteCarlo: {
      type: Type.OBJECT,
      properties: {
        adjustedXgHome: { type: Type.NUMBER },
        adjustedXgAway: { type: Type.NUMBER },
        winProbabilityHome: { type: Type.NUMBER, description: "Probability out of 100" },
        winProbabilityDraw: { type: Type.NUMBER },
        winProbabilityAway: { type: Type.NUMBER },
        cleanSheetProbHome: { type: Type.NUMBER },
        cleanSheetProbAway: { type: Type.NUMBER },
        scorelineProjections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.STRING, description: "e.g. '2 - 1'" },
              probability: { type: Type.NUMBER },
            },
            required: ["score", "probability"],
          },
        },
        predictionConfidenceScore: { type: Type.NUMBER, description: "Prediction Confidence rating (0-100)" },
        predictionConfidenceExplanation: { type: Type.STRING },
        simulationConfidenceInterval: { type: Type.STRING },
      },
      required: [
        "adjustedXgHome",
        "adjustedXgAway",
        "winProbabilityHome",
        "winProbabilityDraw",
        "winProbabilityAway",
        "cleanSheetProbHome",
        "cleanSheetProbAway",
        "scorelineProjections",
        "predictionConfidenceScore",
        "predictionConfidenceExplanation",
        "simulationConfidenceInterval"
      ],
    },
    phase9ValueBetDetection: {
      type: Type.OBJECT,
      properties: {
        marketOddsHome: { type: Type.STRING, description: "Real market odds e.g. +220" },
        marketOddsDraw: { type: Type.STRING },
        marketOddsAway: { type: Type.STRING },
        modelOddsHome: { type: Type.STRING, description: "STRATOS derived fair odds e.g. +145" },
        modelOddsDraw: { type: Type.STRING },
        modelOddsAway: { type: Type.STRING },
        edgeHome: { type: Type.NUMBER, description: "Difference percent eg +10.5%" },
        edgeDraw: { type: Type.NUMBER },
        edgeAway: { type: Type.NUMBER },
        edgeVerdict: { type: Type.STRING, description: "Must be: 'VALUE OPPORTUNITY' or 'MARKET ALIGNED'" },
        exactDiscrepancyExplanation: { type: Type.STRING },
        valueRecommendation: { type: Type.STRING },
      },
      required: ["marketOddsHome", "marketOddsDraw", "marketOddsAway", "modelOddsHome", "modelOddsDraw", "modelOddsAway", "edgeHome", "edgeDraw", "edgeAway", "edgeVerdict", "exactDiscrepancyExplanation", "valueRecommendation"],
    },
  },
  required: [
    "matchInfo",
    "matchdayContext",
    "explainabilityLayer",
    "whyNotEngine",
    "phase1PowerRating",
    "phase2FormMomentum",
    "phase3TacticalEngine",
    "phase4VenueEnvironment",
    "phase5SquadFatigueManager",
    "phase6PsychologicalEngine",
    "phase7MatchdayValidation",
    "phase8MonteCarlo",
    "phase9ValueBetDetection"
  ]
};

// Realistic mock data fallback for key matches to ensure seamless UI and exact 9-Phase alignment
function getMockPrediction(home: string, away: string): any {
  const normalizedHome = home.toLowerCase();
  const normalizedAway = away.toLowerCase();

  const isUSAvsGER = (normalizedHome.includes("usa") && normalizedAway.includes("germ")) || 
                     (normalizedHome.includes("germ") && normalizedAway.includes("usa")) ||
                     (normalizedHome.includes("united states") && normalizedAway.includes("germany"));

  const isUSAWvsGERW = (normalizedHome.includes("usa women") && normalizedAway.includes("germany women")) ||
                       (normalizedHome.includes("germany women") && normalizedAway.includes("usa women"));

  if (isUSAWvsGERW) {
    return {
      matchInfo: {
        homeTeam: "USA Women",
        awayTeam: "Germany Women",
        venue: "Soldier Field, Chicago, IL",
        surface: "Natural Grass",
        date: "Today"
      },
      matchdayContext: {
        venueStatus: "Standard League Match (Mode A)",
        environmentalAdjustments: "Mild mid-west conditions (70°F), low humidity (50%). No major weather friction metrics modeled. Slight 3.5h travel fatigue for travelers.",
        venueInfluenceIndex: "Home turf bias is substantial (+12% support factor over historical neutral standards). Direct high crowd volume expected."
      },
      explainabilityLayer: {
        positiveDrivers: [
          "+ Attacking xG Advantage due to Sophia Smith's transition velocity (+14%)",
          "+ Tactical high wingoverload potential against German fullbacks (+8%)",
          "+ Crowd Motivation Factor under active match tension (+5%)"
        ],
        negativeFactors: [
          "- Naomi Girma slight lineup rest validation (-3%)",
          "- Squad middle congestion fatigue index (-2%)"
        ]
      },
      whyNotEngine: {
        failureConditions: [
          "Germany Women establishes absolute direct midfield dominance using a double pivot block, pinning America's transitions.",
          "Early structural red card or structural penalty conceding momentum.",
          "Extreme finishing underperformance (xG wastefulness of central forwards)."
        ]
      },
      phase1PowerRating: {
        homeRating: 91.2,
        awayRating: 86.8,
        squadDepthValueHome: "$15.5M Pool. Unrivaled depth across forward lines with immense fresh paces.",
        squadDepthValueAway: "$12.2M Pool. Well-structured but aging defensive midfield core.",
        historicalXgTrendHome: 2.15,
        historicalXgTrendAway: 1.58,
        analysis: "USWNT holds the baseline dominance rating from recent undefeated streaks, while Germany Women is in a transitional tactical rebuilding phase."
      },
      phase2FormMomentum: {
        recentFormHome: ["W", "W", "W", "W", "D"],
        recentFormAway: ["W", "L", "W", "D", "W"],
        pointsDivergenceHome: "+0.45 xPTS (Highly positive form alignment)",
        pointsDivergenceAway: "+0.08 xPTS (Steady momentum but struggling to secure late-stage clinical finishes)",
        cleanSheetTrendHome: "3 clean sheets in last 5 matches",
        cleanSheetTrendAway: "2 clean sheets in last 5 matches",
        analysis: "USA enters fully customized to altitude and local hydration guidelines, whereas Germany played highly energy-sapping fixtures in Europe."
      },
      phase3TacticalEngine: {
        homeFormation: "4-2-3-1",
        awayFormation: "4-3-3",
        homeTacticalStyle: "Gegenpress with elite overlapping fullbacks, forcing wide channel turnovers",
        awayTacticalStyle: "Slow direct build-up utilizing central holdup switches",
        homePpda: 8.1,
        awayPpda: 10.4,
        formationStabilityScoreHome: 92,
        formationStabilityScoreAway: 78,
        transitionVulnerabilityHome: "High line leaves horizontal spaces behind defensive line vulnerable to speed counters",
        transitionVulnerabilityAway: "Narrow defending leaves outside flanks exposed to rapid dynamic overlaps",
        matchupAnalysis: "USA's extremely low PPDA indicates high disrupting press. High tactical stability score for USA (92) means high predictability."
      },
      phase4VenueEnvironment: {
        weatherDetails: "Clear afternoon skies, 70°F, 50% humidity. Light breeze.",
        weatherIcon: "sun",
        altitudeMeters: 179,
        travelDistancePenaltyHome: "None (Fully acclimatized domestic camp)",
        travelDistancePenaltyAway: "Moderate (Transatlantic trip, -6 hours jet lag adjustment)",
        pitchFrictionTurf: "Densely mowed dry natural turf: fast ball rolls, low muscle wear risk",
        homeAdvantageMagnitude: "+0.35 xG based on sold-out local stadium",
        crowdBiasExpected: "Estimated 84% USA dominant crowd layout",
        environmentalAnalysis: "No limiting weather factors. Pitch parameters fully favor high-speed athletic transitions."
      },
      phase5SquadFatigueManager: {
        fatigueScoreHome: 24,
        fatigueScoreAway: 68,
        congestionAnalysis: "USWNT rested major starters in the previous friendly. German core played 180 international minutes in the past week.",
        managerExperienceHome: "Emma Hayes (Veteran, high elite structural experience, 95 rating)",
        managerExperienceAway: "Interim coaching team (Transition state, 70 rating)",
        managerDecisionImpact: "Emma Hayes' tactical versatility lowers model variance, whilst Germany's interim staff increases unpredictability by +4%."
      },
      phase6PsychologicalEngine: {
        motivationContextHome: "Testing squad depth in front of massive home audience. High motivation.",
        motivationContextAway: "Redemption arc after early major bracket exits. Average motivation.",
        derbyTensionLevel: "LOW",
        situationalStakes: "High profile international series preparation. Standard competitive honor stakes.",
        psychologicalEdge: "USA Women (Confident, bolstered by recent Olympic gold achievements)",
        psychologicalAnalysis: "Reigning champions enter with zero performance blocks, while Germany battles historical performance pressure against top-ranked sides."
      },
      phase7MatchdayValidation: {
        expectedVsConfirmedHome: "CONFIRMED: Sophia Smith, Trinity Rodman, and Lindsey Horan start.",
        expectedVsConfirmedAway: "DISRUPTION: Main striker Alexandra Popp of Germany benched due to late knee precaution.",
        lineupDisruptionScoreHome: -1.0,
        lineupDisruptionScoreAway: -3.8,
        confirmedTacticalShiftHome: "Standard aggressive wing alignment confirmed.",
        confirmedTacticalShiftAway: "Germany adjusts to deep 4-1-4-1 mid-block without direct focal target POpp.",
        suspensionsAndLateScrapes: "Starting center-back Naomi Girma rested precautionary due to mild quad soreness.",
        personnelDeductionAnalysis: "Alexandra Popp out = Away Attacking Rating drops from 84 -> 75, reducing projected German xG by 0.28.",
        validationVerdict: "Pre-match roster validations favor the USA. The loss of Germany's primary target striker creates a massive -3.8 disruption decay."
      },
      phase8MonteCarlo: {
        adjustedXgHome: 1.95,
        adjustedXgAway: 1.14,
        winProbabilityHome: 58,
        winProbabilityDraw: 22,
        winProbabilityAway: 20,
        cleanSheetProbHome: 34,
        cleanSheetProbAway: 15,
        scorelineProjections: [
          { score: "2 - 1", probability: 16.4 },
          { score: "1 - 1", probability: 11.2 },
          { score: "2 - 0", probability: 10.8 },
          { score: "3 - 1", probability: 8.9 },
          { score: "1 - 2", probability: 7.2 }
        ],
        predictionConfidenceScore: 88,
        predictionConfidenceExplanation: "High confidence score (88%) driven by exceptionally solid starting lineup confirmations, matching weather patterns, and Emma Hayes' highly consistent coaching history.",
        simulationConfidenceInterval: "USA wins 58% ± 4.2% across 10,000 runs inside standard deviation curves."
      },
      phase9ValueBetDetection: {
        marketOddsHome: "-125 (Decimal 1.80)",
        marketOddsDraw: "+260 (Decimal 3.60)",
        marketOddsAway: "+310 (Decimal 4.10)",
        modelOddsHome: "-138 (Decimal 1.72)",
        modelOddsDraw: "+255 (Decimal 3.55)",
        modelOddsAway: "+400 (Decimal 5.00)",
        edgeHome: 5.5,
        edgeDraw: 0.5,
        edgeAway: -6.0,
        edgeVerdict: "VALUE OPPORTUNITY",
        exactDiscrepancyExplanation: "The bookmakers heavily undervalue USA Women due to conservative international history weightings, failing to account for Alexandra Popp's absence. This creates a clear 5.5% model edge on USA Women Moneyline.",
        valueRecommendation: "USA Women Moneyline is highly recommended at -125 or higher."
      }
    };
  }

  // USA vs Germany Men dynamic mock data
  if (isUSAvsGER) {
    return {
      matchInfo: {
        homeTeam: "United States",
        awayTeam: "Germany",
        venue: "Soldier Field, Chicago, IL",
        surface: "Natural Grass (Historically hummocky/difficult)",
        date: "June 6, 2026"
      },
      matchdayContext: {
        venueStatus: "Standard League Match (Mode A)",
        environmentalAdjustments: "Wet grass surface under heavy rain, 74°F, 78% High Humidity. Slowing ball roll velocity and increasing muscle fatigue metrics by +11%.",
        venueInfluenceIndex: "Soldier Field is a major host stronghold. Home fan support provides +0.22 xG expected advantage."
      },
      explainabilityLayer: {
        positiveDrivers: [
          "+ Direct transition speed on wet turf (+11%)",
          "+ Tactical Gegenpress matching perfectly to Germany's slow build-up counters (+7%)",
          "+ Crowd/Host energy bonus (+4%)"
        ],
        negativeFactors: [
          "- Starting Goalkeeper Matt Turner failed physical fitness assessment (-4%)",
          "- Defensive depth squad congestion (-2%)"
        ]
      },
      whyNotEngine: {
        failureConditions: [
          "Germany's outstanding central box fluid rotations bypass the aggressive US mid-block press cleanly in early transitions.",
          "Early structural red card or structural penalty conceding momentum.",
          "Extreme finishing underperformance relative to high accumulated xG."
        ]
      },
      phase1PowerRating: {
        homeRating: 83.4,
        awayRating: 88.6,
        squadDepthValueHome: "$280M Market Valuation. Solid athletic framework but lacks elite deep playmaker depth.",
        squadDepthValueAway: "$830M Market Valuation. Comprehensive world-class rosters across all positions.",
        historicalXgTrendHome: 1.45,
        historicalXgTrendAway: 1.85,
        analysis: "Germany commands a direct raw power rating advantage. USA's core lineup is highly dynamic and physical but lacks Germany's deep creative bench options."
      },
      phase2FormMomentum: {
        recentFormHome: ["W", "D", "W", "L", "W"],
        recentFormAway: ["W", "W", "D", "L", "D"],
        pointsDivergenceHome: "+0.15 xPTS Differential (Performing nicely in relation to rating expectations)",
        pointsDivergenceAway: "-0.32 xPTS Differential (Performing slightly under public expectation index)",
        cleanSheetTrendHome: "2 clean sheets in last 5 matches",
        cleanSheetTrendAway: "1 clean sheet in last 5 matches",
        analysis: "USA is in excellent physical rhythm, while Germany shows slight defensive over-extension metrics in late-stages."
      },
      phase3TacticalEngine: {
        homeFormation: "4-3-3",
        awayFormation: "4-2-2-2 (Nagelsmann Box Midfield)",
        homeTacticalStyle: "High-athleticism Gegenpress, fast transitions through vertical flanks",
        awayTacticalStyle: "Fluid horizontal possession build-up designed to limit energy loss",
        homePpda: 8.4,
        awayPpda: 11.2,
        formationStabilityScoreHome: 86,
        formationStabilityScoreAway: 74,
        transitionVulnerabilityHome: "Vulnerable to rapid overlapping counters behind over-committed wingbacks",
        transitionVulnerabilityAway: "Highly vulnerable to direct speed turnovers in the defensive central pivot zone",
        matchupAnalysis: "USA's intense vertical press (PPDA 8.4) targets central midfield turnover pockets. Germany uses slow tempo passing to neutralize the US energy blocks."
      },
      phase4VenueEnvironment: {
        weatherDetails: "Rain showers, 74°F, 78% humidity. Soft heavy turf.",
        weatherIcon: "cloud",
        altitudeMeters: 179,
        travelDistancePenaltyHome: "None (Internal preparation camp)",
        travelDistancePenaltyAway: "High (Transatlantic flight & -6 hours jet lag adjustment)",
        pitchFrictionTurf: "Wet natural grass: slow ball velocity, high muscle fatigue hazard",
        homeAdvantageMagnitude: "+0.22 xG advantage based on Chicago crowd momentum",
        crowdBiasExpected: "Estimated 78% USA fan turnout",
        environmentalAnalysis: "Soldier Field's grass will clip and peel under heavy rain. High-humidity represents an additional 12% energy tax on German players."
      },
      phase5SquadFatigueManager: {
        fatigueScoreHome: 30,
        fatigueScoreAway: 72,
        congestionAnalysis: "USA players came from early off-season rest windows. German squad logged high domestic minutes in critical UEFA campaigns.",
        managerExperienceHome: "Standard National Manager (Experienced system developer, 78 rating)",
        managerExperienceAway: "Julian Nagelsmann (Elite tactical adapter, 94 rating)",
        managerDecisionImpact: "Nagelsmann's expert mid-game tactical shifts decrease German variance, while US coaching shows lower tactical flexibility (+5% model uncertainty)."
      },
      phase6PsychologicalEngine: {
        motivationContextHome: "High incentive to secure statement victory on home soil. High priority.",
        motivationContextAway: "Extremely low-key experimental test sequence. Focus is strictly on physical preservation.",
        derbyTensionLevel: "LOW",
        situationalStakes: "Pre-World Cup Send-off Series friendly. Pride and chemistry stakes.",
        psychologicalEdge: "United States (Maximum motivation & intense showpiece drive)",
        psychologicalAnalysis: "USA treats this as a crucial momentum booster before World Cup kick-off. Germany's squad plays carefully to avoid pre-tournament injury scars."
      },
      phase7MatchdayValidation: {
        expectedVsConfirmedHome: "CONFIRMED: Pulisic and McKennie start. Goalkeeper Matt Turner failed physical fitness test.",
        expectedVsConfirmedAway: "DISRUPTION: Key attacker Kai Havertz is rested; Jamal Musiala starts as sub. Late defensive changes.",
        lineupDisruptionScoreHome: -1.2,
        lineupDisruptionScoreAway: -3.8,
        confirmedTacticalShiftHome: "Ethan Horvath replaces Matt Turner in goal. No shift in formation.",
        confirmedTacticalShiftAway: "Germany pivots to a deep 4-2-3-1 counter-shape to limit stamina depletion.",
        suspensionsAndLateScrapes: "Kai Havertz sitting out match due to minor adductor strain.",
        personnelDeductionAnalysis: "Kai Havertz out = Away Attacking Rating drops 86 -> 78, reducing projected xG by 0.32.",
        validationVerdict: "Pre-match roster validations favor the USA. Loss of Havertz and resting Musiala reduces Germany's attacking efficiency significantly."
      },
      phase8MonteCarlo: {
        adjustedXgHome: 1.57,
        adjustedXgAway: 1.23,
        winProbabilityHome: 41,
        winProbabilityDraw: 27,
        winProbabilityAway: 32,
        cleanSheetProbHome: 18,
        cleanSheetProbAway: 22,
        scorelineProjections: [
          { score: "2 - 1", probability: 14.2 },
          { score: "1 - 1", probability: 12.8 },
          { score: "1 - 2", probability: 9.5 },
          { score: "2 - 0", probability: 8.1 },
          { score: "0 - 1", probability: 7.4 }
        ],
        predictionConfidenceScore: 82,
        predictionConfidenceExplanation: "Confidence rating is stable at 82%. Lowered slightly due to Ethan Horvath starting in place of Matt Turner, but supported heavily by clear European travel fatigue metrics.",
        simulationConfidenceInterval: "USA wins 41.0% ± 4.5% across 10,000 runs inside standard deviation curves."
      },
      phase9ValueBetDetection: {
        marketOddsHome: "+222 (Decimal 3.22)",
        marketOddsDraw: "+285 (Decimal 3.85)",
        marketOddsAway: "+132 (Decimal 2.32)",
        modelOddsHome: "+144 (Decimal 2.44)",
        modelOddsDraw: "+270 (Decimal 3.70)",
        modelOddsAway: "+212 (Decimal 3.12)",
        edgeHome: 10.0,
        edgeDraw: 1.0,
        edgeAway: -11.0,
        edgeVerdict: "VALUE OPPORTUNITY",
        exactDiscrepancyExplanation: "The bookmakers heavily overweight Germany's name brand, completely ignoring transatlantic flight fatigue and resting starters. This yields a major 10.0% overlay edge on USA Moneyline.",
        valueRecommendation: "United States Moneyline or Draw No Bet (DNB) at +135 represents exceptional value with built-in draw protection."
      }
    };
  }

  // General fallback mock prediction generator
  return {
    matchInfo: {
      homeTeam: home,
      awayTeam: away,
      venue: "Neutral Stadium / Main Ground",
      surface: "Natural Grass",
      date: "Scheduled Today"
    },
    matchdayContext: {
      venueStatus: "Standard League Match (Mode A)",
      environmentalAdjustments: "Standard climate, mild temperature (68°F), clear weather. Optimal friction index modeled.",
      venueInfluenceIndex: "Minimal environmental bias. Standard travel penalty rules applied."
    },
    explainabilityLayer: {
      positiveDrivers: [
        "+ Steady points divergence last 5 (+6%)",
        "+ Tactical block consolidation (+4%)"
      ],
      negativeFactors: [
        "- Slight travel fatigue surcharge (-2%)"
      ]
    },
    whyNotEngine: {
      failureConditions: [
        "Unplanned early team red card disrupts baseline tactical stability score.",
        "Opposing team successfully exploits central transition pockets.",
        "Both teams default to high-fatigue low blocks, freezing general scoring chances."
      ]
    },
    phase1PowerRating: {
      homeRating: 78.5,
      awayRating: 77.2,
      squadDepthValueHome: "Standard structural rating. Established domestic defensive pivots.",
      squadDepthValueAway: "Equal structural rating. Balanced roster depth.",
      historicalXgTrendHome: 1.32,
      historicalXgTrendAway: 1.28,
      analysis: "Very close raw strength profiles. Equal technical benchmarks indicate highly compact expected deviations."
    },
    phase2FormMomentum: {
      recentFormHome: ["D", "W", "L", "W", "D"],
      recentFormAway: ["W", "L", "W", "W", "D"],
      pointsDivergenceHome: "+0.04 xPTS Drift (Neutral momentum trajectory)",
      pointsDivergenceAway: "+0.11 xPTS Drift (Healthy form cycle)",
      cleanSheetTrendHome: "1 clean sheet in last 5",
      cleanSheetTrendAway: "2 clean sheets in last 5",
      analysis: "Both teams arrive in clean form, keeping baseline performance parameters highly convergent."
    },
    phase3TacticalEngine: {
      homeFormation: "4-2-3-1",
      awayFormation: "4-3-3",
      homeTacticalStyle: "Compact low block with rapid wing counter-attacks",
      awayTacticalStyle: "High possession width targeting overlapping fullbacks",
      homePpda: 11.5,
      awayPpda: 9.2,
      formationStabilityScoreHome: 82,
      formationStabilityScoreAway: 80,
      transitionVulnerabilityHome: "Vulnerable to overlapping wingers on physical transition shifts",
      transitionVulnerabilityAway: "Exposed in deep central spaces behind aggregate midfield line",
      matchupAnalysis: "Home's double pivot shields the back line effectively. High stability ratings suggest standard simulation behavior."
    },
    phase4VenueEnvironment: {
      weatherDetails: "Clear skies, mild wind, 68°F.",
      weatherIcon: "sun",
      altitudeMeters: 45,
      travelDistancePenaltyHome: "None (Host ground)",
      travelDistancePenaltyAway: "Low (Sub-3 hour domestic transit)",
      pitchFrictionTurf: "Standard hydration level grass: optimal ball roll",
      homeAdvantageMagnitude: "+0.15 xG baseline home field multiplier",
      crowdBiasExpected: "Neutral distribution predicted",
      environmentalAnalysis: "No restricting weather factors. Pitch parameters fully favor standard tactical deployments."
    },
    phase5SquadFatigueManager: {
      fatigueScoreHome: 35,
      fatigueScoreAway: 38,
      congestionAnalysis: "Both sides have had a full 6 days to rest, leaving fatigue scores within safe margins.",
      managerExperienceHome: "Experienced Club Manager (80 rating)",
      managerExperienceAway: "Experienced Club Manager (82 rating)",
      managerDecisionImpact: "Both managers have stable tactical styles, minimizing model variance."
    },
    phase6PsychologicalEngine: {
      motivationContextHome: "High incentive to secure safety points in regional matches.",
      motivationContextAway: "Pushing for top tier tournament qualification brackets.",
      derbyTensionLevel: "LOW",
      situationalStakes: "Mid-season league round. Standard motivation levels.",
      psychologicalEdge: "Neutral (Even distribution)",
      psychologicalAnalysis: "Both sides arrive under standard competitive focus, indicating average psychological tension levels."
    },
    phase7MatchdayValidation: {
      expectedVsConfirmedHome: "CONFIRMED: Normal starting lineup. No late scratches.",
      expectedVsConfirmedAway: "CONFIRMED: Regular XI started. Full health reported.",
      lineupDisruptionScoreHome: -0.2,
      lineupDisruptionScoreAway: -0.5,
      confirmedTacticalShiftHome: "None reported.",
      confirmedTacticalShiftAway: "None reported.",
      suspensionsAndLateScrapes: "None detected.",
      personnelDeductionAnalysis: "Standard Starting XI confirmed on both sides. Average personnel impact predicted.",
      validationVerdict: "Perfect match health profiles. Roster disruption score is near-zero on both sides."
    },
    phase8MonteCarlo: {
      adjustedXgHome: 1.38,
      adjustedXgAway: 1.28,
      winProbabilityHome: 39,
      winProbabilityDraw: 29,
      winProbabilityAway: 32,
      cleanSheetProbHome: 25,
      cleanSheetProbAway: 27,
      scorelineProjections: [
        { score: "1 - 1", probability: 14.5 },
        { score: "1 - 0", probability: 11.2 },
        { score: "0 - 1", probability: 10.4 },
        { score: "2 - 1", probability: 9.8 },
        { score: "1 - 2", probability: 8.7 }
      ],
      predictionConfidenceScore: 76,
      predictionConfidenceExplanation: "Solid confidence score (76%) based on high lineup correlation index and standard environmental setups.",
      simulationConfidenceInterval: "Hosts win 39% of 10,000 runs within standard error ± 5.2%."
    },
    phase9ValueBetDetection: {
      marketOddsHome: "+156 (2.56)",
      marketOddsDraw: "+220 (3.20)",
      marketOddsAway: "+180 (2.80)",
      modelOddsHome: "+156 (2.56)",
      modelOddsDraw: "+244 (3.44)",
      modelOddsAway: "+212 (3.12)",
      edgeHome: 0.1,
      edgeDraw: 1.5,
      edgeAway: -1.6,
      edgeVerdict: "MARKET ALIGNED",
      exactDiscrepancyExplanation: "No distinct value margin detected. Model results perfectly match public bookmaker estimates.",
      valueRecommendation: "Draw No Bet (DNB) for the Home side represents a stable protective option."
    }
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
    { home: "Brazil", away: "Egypt", venue: "Cairo International Stadium", date: formattedToday, featured: false },
    { home: "Portugal", away: "Chile", venue: "Estádio da Luz, Lisbon", date: formattedToday, featured: false },
    { home: "Argentina", away: "Honduras", venue: "Hard Rock Stadium, Miami", date: formattedToday, featured: false },
    { home: "Turkey", away: "Venezuela", venue: "Chase Stadium, Ft. Lauderdale", date: formattedToday, featured: false },
    { home: "Spain", away: "Italy", venue: "San Siro, Milan", date: formattedToday, featured: false },
  ];

  const womensFixtures = [
    { home: "USA Women", away: "Germany Women", venue: "Soldier Field, Chicago", date: formattedToday, featured: true },
    { home: "Sweden Women", away: "England Women", venue: "Friends Arena, Stockholm", date: formattedToday, featured: false },
    { home: "Spain Women", away: "France Women", venue: "Camp Nou, Barcelona", date: formattedToday, featured: false },
    { home: "Australia Women", away: "Japan Women", venue: "Stadium Australia, Sydney", date: formattedToday, featured: false },
    { home: "Brazil Women", away: "Canada Women", venue: "Maracanã, Rio de Janeiro", date: formattedToday, featured: false },
    { home: "Netherlands Women", away: "Norway Women", venue: "Johan Cruyff ArenA, Amsterdam", date: formattedToday, featured: false },
  ];

  const fixtures = category === "womens" ? womensFixtures : mensFixtures;
  res.json({ fixtures, date: formattedToday });
});

// Prediction Route with API fallback
app.post("/api/predict", async (req, res) => {
  const { homeTeam, awayTeam, isManualInput } = req.body;
  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: "homeTeam and awayTeam parameters are required" });
  }

  // Gracefully handle missing API key or use of offline dummy key
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    console.log(`GEMINI_API_KEY is not set. Serving highly-structured 9-Phase mock result for: ${homeTeam} vs ${awayTeam}`);
    const prediction = getMockPrediction(homeTeam, awayTeam);
    return res.json({ prediction, isMock: true });
  }

  try {
    const ai = getGeminiClient();
    console.log(`Calling Gemini API (Stratos v2 Predictive Engine 9-Phase Core) for: ${homeTeam} vs ${awayTeam}`);

    const promptText = `
You are STRATOS v2, an elite Football Intelligence and Predictive Decision Engine designed to uncover betting market inefficiencies by running a highly calibrated 9-Phase pipeline.

Analyze the football matchup between:
Home Team: "${homeTeam}"
Away Team: "${awayTeam}"

You MUST use Google Search tool to extract real-world, up-to-date lineup news, tactical setups, player fatigue metrics, injuries, and weather metrics. Evaluate the matches sequentially through these exact 9 phases:

### 📊 SECTION I: BASELINES & FORM
* **Phase 1: Team Power Rating:** Establish the foundational baseline strength of both squads using historical metrics and long-term xG trends.
* **Phase 2: Form & Momentum:** Calculate short-term performance changes, tracking expected vs. actual points divergence over the last 5 games.

### ⚙️ SECTION II: CONTEXTUAL ENGINE MODIFIERS
* **Phase 3: Tactical Engine & Formation Stability:** Analyze tactical matchups and calculate a "Formation Stability Score" from 0-100.
* **Phase 4: Venue & Environment Index:** Apply the Venue State rules. Identify if Standard League Match (Mode A) with default Home Advantage, or Tournament / Neutral Venue (Mode B). Detail expected travel fatigue, climate, and crowd turnout / expected crowd takeover bias.
* **Phase 5: Squad Fatigue & Manager Impact:** Compute a Fatigue Score (0-100) based on recent match congestion and international minutes. Adjust model uncertainty based on the manager's profile experience/stability.
* **Phase 6: Psychological Engine:** Evaluate situational stakes (World Cup elimination pressure, group-stage math, derby rivalries, or "dead rubber" fixtures).

### 🚨 SECTION III: MATCHDAY VALIDATION, SIMULATION & VALUE
* **Phase 7: Matchday Validation Layer:** The final pre-kickoff reality check. Compare expected lineups to likely XI. Compute explicit point/rating deductions for missing personnel (e.g. key scorer out = attacking rating drops, reducing team xG by a calculated value).
* **Phase 8: Monte Carlo Simulation & Confidence Engine:** Consume all finalized variables from Phases 1–7. Run 10,000 iterations to produce precise score curves. Simultaneously, compute a Prediction Confidence Score (0-100%) based on data availability, lineup changes, and sample sizes.
* **Phase 9: Value Bet Detection Layer:** Compare STRATOS v2 probabilities against real-world bookmaker odds (Pinnacle, Bet365, Asian Handicaps). Identify and flag statistical discrepancies as either "VALUE OPPORTUNITY" or "MARKET ALIGNED" edgeVerdict, calculating precise home/draw/away edge percentage and optimal bet selection recommendation.

Return a perfectly formatted raw JSON object conforming EXACTLY to the specified JSON schema. Do not wrap the JSON output inside any markdown code blocks. Returns raw JSON only.
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
    const prediction = getMockPrediction(homeTeam, awayTeam);
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
