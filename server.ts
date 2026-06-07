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

// Structured JSON Schema for Stratos Prediction Core
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
    phase1SquadContext: {
      type: Type.OBJECT,
      properties: {
        homeFatigueIndex: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
        awayFatigueIndex: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
        homeFatigueDescription: { type: Type.STRING },
        awayFatigueDescription: { type: Type.STRING },
        missingPlayersHome: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingPlayersAway: { type: Type.ARRAY, items: { type: Type.STRING } },
        squadDynamicsAnalysis: { type: Type.STRING },
      },
      required: ["homeFatigueIndex", "awayFatigueIndex", "homeFatigueDescription", "awayFatigueDescription", "missingPlayersHome", "missingPlayersAway", "squadDynamicsAnalysis"],
    },
    phase2Tactics: {
      type: Type.OBJECT,
      properties: {
        homeFormation: { type: Type.STRING },
        awayFormation: { type: Type.STRING },
        homeTacticalStyle: { type: Type.STRING },
        awayTacticalStyle: { type: Type.STRING },
        tacticalMatchupAnalysis: { type: Type.STRING },
        homePpda: { type: Type.NUMBER },
        awayPpda: { type: Type.NUMBER },
        setPieceDominance: { type: Type.STRING },
      },
      required: ["homeFormation", "awayFormation", "homeTacticalStyle", "awayTacticalStyle", "tacticalMatchupAnalysis", "homePpda", "awayPpda", "setPieceDominance"],
    },
    phase3Environment: {
      type: Type.OBJECT,
      properties: {
        weatherIcon: { type: Type.STRING, description: "rain, sun, cloud, wind, or snow" },
        weatherDetails: { type: Type.STRING },
        altitudeMeters: { type: Type.NUMBER },
        travelPenaltyHome: { type: Type.STRING, description: "None, Low, Medium, or High" },
        travelPenaltyAway: { type: Type.STRING, description: "None, Low, Medium, or High" },
        refereeName: { type: Type.STRING },
        refereeMetrics: { type: Type.STRING },
        homeAdvantageMultiplier: { type: Type.NUMBER },
        environmentalAnalysis: { type: Type.STRING },
      },
      required: ["weatherIcon", "weatherDetails", "altitudeMeters", "travelPenaltyHome", "travelPenaltyAway", "refereeName", "refereeMetrics", "homeAdvantageMultiplier", "environmentalAnalysis"],
    },
    phase4HistoryMotivation: {
      type: Type.OBJECT,
      properties: {
        h2hHistory: { type: Type.ARRAY, items: { type: Type.STRING } },
        motivationContextHome: { type: Type.STRING },
        motivationContextAway: { type: Type.STRING },
        motivationAnalysis: { type: Type.STRING },
        recentFormHome: { type: Type.ARRAY, items: { type: Type.STRING } },
        recentFormAway: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["h2hHistory", "motivationContextHome", "motivationContextAway", "motivationAnalysis", "recentFormHome", "recentFormAway"],
    },
    phase5Engine: {
      type: Type.OBJECT,
      properties: {
        baselineXgHome: { type: Type.NUMBER },
        baselineXgAway: { type: Type.NUMBER },
        adjustedXgHome: { type: Type.NUMBER },
        adjustedXgAway: { type: Type.NUMBER },
        explanationOfAdjustments: { type: Type.STRING },
        winProbabilityHome: { type: Type.NUMBER, description: "Percentage probability (0-100)" },
        winProbabilityDraw: { type: Type.NUMBER, description: "Percentage probability (0-100)" },
        winProbabilityAway: { type: Type.NUMBER, description: "Percentage probability (0-100)" },
        scorelineProjections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.STRING, description: "e.g. '2 - 1'" },
              probability: { type: Type.NUMBER, description: "Individual probability percentage (0-100)" },
            },
            required: ["score", "probability"],
          },
        },
        monteCarloConfidence: { type: Type.STRING },
      },
      required: ["baselineXgHome", "baselineXgAway", "adjustedXgHome", "adjustedXgAway", "explanationOfAdjustments", "winProbabilityHome", "winProbabilityDraw", "winProbabilityAway", "scorelineProjections", "monteCarloConfidence"],
    },
    marketEdge: {
      type: Type.OBJECT,
      properties: {
        oddsHomeMarket: { type: Type.STRING, description: "American or Decimal market odds, e.g. +220" },
        oddsDrawMarket: { type: Type.STRING },
        oddsAwayMarket: { type: Type.STRING },
        oddsHomeModel: { type: Type.STRING, description: "American or Decimal model implied odds, e.g. +144" },
        oddsDrawModel: { type: Type.STRING },
        oddsAwayModel: { type: Type.STRING },
        edgeHome: { type: Type.NUMBER, description: "Percentage edge found (+ or -)" },
        edgeDraw: { type: Type.NUMBER },
        edgeAway: { type: Type.NUMBER },
        analyticalEdgeExplanation: { type: Type.STRING },
        recommendation: { type: Type.STRING },
      },
      required: ["oddsHomeMarket", "oddsDrawMarket", "oddsAwayMarket", "oddsHomeModel", "oddsDrawModel", "oddsAwayModel", "edgeHome", "edgeDraw", "edgeAway", "analyticalEdgeExplanation", "recommendation"],
    },
  },
  required: [
    "matchInfo",
    "phase1SquadContext",
    "phase2Tactics",
    "phase3Environment",
    "phase4HistoryMotivation",
    "phase5Engine",
    "marketEdge"
  ]
};

// Realistic mock data fallback for key matches to ensure seamless UI if no key is present or on API lookup error
function getMockPrediction(home: string, away: string): any {
  const isUSAvsGER = (home.toLowerCase().includes("usa") && away.toLowerCase().includes("germ")) || 
                     (home.toLowerCase().includes("germ") && away.toLowerCase().includes("usa")) ||
                     (home.toLowerCase().includes("united states") && away.toLowerCase().includes("germany"));

  if (isUSAvsGER) {
    return {
      matchInfo: {
        homeTeam: "United States",
        awayTeam: "Germany",
        venue: "Soldier Field, Chicago, IL",
        surface: "Natural Grass (Historically hummocky/difficult)",
        date: "June 6, 2026"
      },
      phase1SquadContext: {
        homeFatigueIndex: "LOW",
        awayFatigueIndex: "HIGH",
        homeFatigueDescription: "USA players have been in an acclimatization camp for 10 days. Optimal rest cycles.",
        awayFatigueDescription: "German core arrived 72 hours ago. Several key players played in domestic finals last week.",
        missingPlayersHome: ["Sergiño Dest (Cruciate Ligament)"],
        missingPlayersAway: ["Kai Havertz (Minor Ankle Strain - Precautionary rest)"],
        squadDynamicsAnalysis: "Excellent dressing room dynamics for the USMNT under sell-out crowd pressure. Germany prioritized safety over tactical exhaustion ahead of the World Cup."
      },
      phase2Tactics: {
        homeFormation: "4-3-3",
        awayFormation: "4-2-2-2 (Nagelsmann Box Midfield)",
        homeTacticalStyle: "High-intensity Gegenpress, exploiting physical speed",
        awayTacticalStyle: "Fluid possession, slow build-up to conserve energy",
        tacticalMatchupAnalysis: "USA's intense PPDA will disrupt Germany's deeper double-pivot during build-up phases. German midfield quality remains elite but lacks lateral sprinting recovery.",
        homePpda: 8.4,
        awayPpda: 11.2,
        setPieceDominance: "USA Favored (McKennie aerial dominance vs rotated German defensive structure)"
      },
      phase3Environment: {
        weatherIcon: "cloud",
        weatherDetails: "Rain showers, 74°F, 78% Humidity. Wet and heavy turf.",
        altitudeMeters: 179,
        travelPenaltyHome: "None",
        travelPenaltyAway: "High (Transatlantic flight and jet lag)",
        refereeName: "Piero Maza",
        refereeMetrics: "4.8 Yellows/Game, 0.22 Reds/Game (Home bias ratio: 1.12)",
        homeAdvantageMultiplier: 1.15,
        environmentalAnalysis: "Soldier Field's grass will clip and peel under heavy rain. High-humidity deceleration represents an additional 12% energy tax on German players."
      },
      phase4HistoryMotivation: {
        h2hHistory: [
          "2023 Friendly: USA 1 - 3 Germany",
          "2015 Friendly: Germany 1 - 2 USA",
          "2014 World Cup: USA 0 - 1 Germany"
        ],
        motivationContextHome: "Maximum send-off momentum before 2026 World Cup starts in 5 days.",
        motivationContextAway: "Extremely low-stake preparation. Key players instructed to avoid lunging or sliding tackles.",
        motivationAnalysis: "USA is highly motivated to prove their standard at home, while Germany views this primarily as a technical fitness exercise under injury prevention rules.",
        recentFormHome: ["W", "D", "W", "L", "W"],
        recentFormAway: ["W", "W", "D", "L", "D"]
      },
      phase5Engine: {
        baselineXgHome: 1.25,
        baselineXgAway: 1.68,
        adjustedXgHome: 1.57,
        adjustedXgAway: 1.23,
        explanationOfAdjustments: "Baseline values heavily favor Germany. STRATOS applies positive modifiers to USA for squad freshness and home environmental motivation, whereas Germany faces negative fatigue and motivation discounts.",
        winProbabilityHome: 41,
        winProbabilityDraw: 27,
        winProbabilityAway: 32,
        scorelineProjections: [
          { score: "2 - 1", probability: 14.2 },
          { score: "1 - 1", probability: 12.8 },
          { score: "1 - 2", probability: 9.5 },
          { score: "2 - 0", probability: 8.1 },
          { score: "0 - 1", probability: 7.4 }
        ],
        monteCarloConfidence: "USA wins 41.0% ± 4.5% across 10,000 simulations"
      },
      marketEdge: {
        oddsHomeMarket: "+222 (Decimal 3.22)",
        oddsDrawMarket: "+285 (Decimal 3.85)",
        oddsAwayMarket: "+132 (Decimal 2.32)",
        oddsHomeModel: "+144 (Decimal 2.44)",
        oddsDrawModel: "+270 (Decimal 3.70)",
        oddsAwayModel: "+212 (Decimal 3.12)",
        edgeHome: 10.0,
        edgeDraw: 1.0,
        edgeAway: -11.0,
        analyticalEdgeExplanation: "The public market heavily overvalues Germany's name brand, creating a massive 10.0% overlay on USA Moneyline. Current odds (+222) imply only 31% probability, whereas the engine calculates 41% due to fatigue indicators.",
        recommendation: "USA Draw No Bet (DNB) at +135 to capitalize on the overlay with an insurance layer; Over 2.5 Goals is secondary."
      }
    };
  }

  // General Mock response generator for any other match to guarantee robustness
  return {
    matchInfo: {
      homeTeam: home,
      awayTeam: away,
      venue: "Neutral Stadium / Main Ground",
      surface: "Natural Grass",
      date: "Scheduled Today"
    },
    phase1SquadContext: {
      homeFatigueIndex: "MEDIUM",
      awayFatigueIndex: "MEDIUM",
      homeFatigueDescription: "Squad displays normal rotation levels across the previous 14 days.",
      awayFatigueDescription: "Key midfielders showing minor fatigue indicators due to fixture congestion.",
      missingPlayersHome: ["Primary winger suspended due to yellow accumulation"],
      missingPlayersAway: ["Main central defender doubts with hamstring stiffness"],
      squadDynamicsAnalysis: "Home side moral is exceptionally stable following a coaching shift; Away side dressing room reports minor factional tension."
    },
    phase2Tactics: {
      homeFormation: "4-2-3-1",
      awayFormation: "4-3-3",
      homeTacticalStyle: "Compact low block with rapid wing counter-attacks",
      awayTacticalStyle: "High possession width targeting overlapping fulbacks",
      tacticalMatchupAnalysis: "Home's double-pivot will shield the back four effectively against Away's wide overloads. Counters will target vacated full-back spaces.",
      homePpda: 11.5,
      awayPpda: 9.2,
      setPieceDominance: "Neutral expectation across both defensive and offensive sets"
    },
    phase3Environment: {
      weatherIcon: "sun",
      weatherDetails: "Clear skies, mild wind, 68°F. Mint pitches.",
      altitudeMeters: 45,
      travelPenaltyHome: "None",
      travelPenaltyAway: "Low (Sub-3 hour transit)",
      refereeName: "Felix Zwayer",
      refereeMetrics: "4.1 Yellows/Game",
      homeAdvantageMultiplier: 1.10,
      environmentalAnalysis: "No significant weather penalties expected. Perfect conditions prioritize tactical elegance and technical execution."
    },
    phase4HistoryMotivation: {
      h2hHistory: [
        `2025: ${home} 1 - 1 ${away}`,
        `2024: ${away} 2 - 0 ${home}`
      ],
      motivationContextHome: "High incentive to secure safety points in league standings.",
      motivationContextAway: "Pushing for top tier qualification criteria.",
      motivationAnalysis: "Both squads arrive under major motivational constraints, indicating a tightly contested defensive fixture.",
      recentFormHome: ["D", "W", "L", "W", "D"],
      recentFormAway: ["W", "L", "W", "W", "D"]
    },
    phase5Engine: {
      baselineXgHome: 1.45,
      baselineXgAway: 1.35,
      adjustedXgHome: 1.38,
      adjustedXgAway: 1.28,
      explanationOfAdjustments: "Fine margins adjusted; home advantage provides a slight 0.10 xG elevation for the hosts.",
      winProbabilityHome: 39,
      winProbabilityDraw: 29,
      winProbabilityAway: 32,
      scorelineProjections: [
        { score: "1 - 1", probability: 14.5 },
        { score: "1 - 0", probability: 11.2 },
        { score: "0 - 1", probability: 10.4 },
        { score: "2 - 1", probability: 9.8 },
        { score: "1 - 2", probability: 8.7 }
      ],
      monteCarloConfidence: "Hosts win 39% of 10,000 matches with confidence interval ± 5.2%"
    },
    marketEdge: {
      oddsHomeMarket: "+156 (2.56)",
      oddsDrawMarket: "+220 (3.20)",
      oddsAwayMarket: "+180 (2.80)",
      oddsHomeModel: "+156 (2.56)",
      oddsDrawModel: "+244 (3.44)",
      oddsAwayModel: "+212 (3.12)",
      edgeHome: 0.1,
      edgeDraw: 1.5,
      edgeAway: -1.6,
      analyticalEdgeExplanation: "The odds reflect a close symmetry. Model and market are in near alignment, providing minor margins of value.",
      recommendation: "Draw No Bet (DNB) for the Home side or Under 2.5 Goals represents the best defensive overlay."
    }
  };
}

// Prediction Route with API fallback
app.post("/api/predict", async (req, res) => {
  const { homeTeam, awayTeam, isManualInput } = req.body;
  if (!homeTeam || !awayTeam) {
    return res.status(400).json({ error: "homeTeam and awayTeam parameters are required" });
  }

  // Gracefully handle missing API key or use of offline dummy key
  if (!API_KEY || API_KEY === "MY_GEMINI_API_KEY") {
    console.log(`GEMINI_API_KEY is not set. Serving highly-structured mock result for: ${homeTeam} vs ${awayTeam}`);
    const prediction = getMockPrediction(homeTeam, awayTeam);
    return res.json({ prediction, isMock: true });
  }

  try {
    const ai = getGeminiClient();
    console.log(`Calling Gemini API with Search Grounding for Matchup: ${homeTeam} vs ${awayTeam}`);

    const promptText = `
You are STRATOS, an elite data-driven Football Match Predictor and Analytics Engine.
Analyze the following football matchup:
Home Team: "${homeTeam}"
Away Team: "${awayTeam}"

You MUST search the web to extract real-world, up-to-date data for this fixture if it has a real-world counterpart.
Analyze the match by systematically filtering through our 5-Phase Analysis Framework:
- Phase 1 (Squad depth, injuries, suspensions, fatigue levels, squad morale, travel times).
- Phase 2 (Tactics, formations, PPDA, positional synergies, set piece dominance).
- Phase 3 (Altitude, weather details, travel penalty, referee metrics, Fortress Factor home advantage).
- Phase 4 (History, recent H2H results, recent form, motivation context e.g. relegation/title boost, send-off friendly, etc.).
- Phase 5 (Calculate baseline and adjusted expected goals (xG) profiles. Simulate 10,000 runs to output Win/Draw/Away probabilities that sum precisely to 100%. Generate the top 5 most likely exact scorelines using Poisson calculations with their individual percentage probabilities. Highlight betting edge relative to standard bookmaker odds like Bet365/Pinnacle, and provide actionable recommendation!).

Return a perfectly formatted raw JSON object conforming EXACTLY to the specified JSON schema. Do not wrap the JSON output inside any markdown code blocks. Returns raw JSON only.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: soccerPredictionSchema,
        temperature: 0.2, // low temperature for precise analytics
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
