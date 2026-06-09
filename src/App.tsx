/**
 * STRATOS v2: Elite Football Intelligence and Predictive Decision Engine
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertCircle, 
  Calendar, 
  ChevronRight, 
  Cpu, 
  DollarSign, 
  TrendingUp, 
  CloudRain, 
  Sun, 
  Cloud, 
  Wind, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Database, 
  AlertTriangle, 
  Scale, 
  Target, 
  User, 
  Award,
  CircleDot,
  Info,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { MatchPrediction } from './types';
import ReactMarkdown from 'react-markdown';


export default function App() {
  // Inputs
  const [homeTeamInput, setHomeTeamInput] = useState('');
  const [awayTeamInput, setAwayTeamInput] = useState('');
  
  // App state
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<MatchPrediction | null>(null);
  const [isOfflineMock, setIsOfflineMock] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<'tier1' | 'tier2'>('tier2');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'baselines' | 'tactical' | 'modifiers' | 'validation' | 'stratosV2'>('dashboard');
  
  // Dynamic Football Feed state
  const [footballCategory, setFootballCategory] = useState<'mens' | 'womens'>('mens');
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [systemDate, setSystemDate] = useState<string>('');

  // World Cup 2026 Venue environmental modifier states
  const [selectedVenue, setSelectedVenue] = useState<string>('Soldier Field, Chicago, IL');
  const [kickoffTime, setKickoffTime] = useState<string>('15:00'); // Kickoff pre 6:00 PM local
  const [altitudeCampHome, setAltitudeCampHome] = useState<boolean>(false);
  const [altitudeCampAway, setAltitudeCampAway] = useState<boolean>(false);
  const [pitchMoisture, setPitchMoisture] = useState<string>('Standard');
  const [matchTemperature, setMatchTemperature] = useState<number>(22);

  // 10-Phase Sequential Loading Logs for STRATOS v2 Engine calibration
  const loadingLogs = [
    "Phase 1: Establishing ELO strength baselines, custom xG trends, and historical gender slates...",
    "Phase 2: Tactical Matchup simulation: calibrating formations, passing velocities, PPDA, and block styles...",
    "Phase 3: Auditing Squad Availability, injury personnel reducers, and depth sustainability indexes...",
    "Phase 4: Calibrating Formation Stability, structural consistency quotients, and last 5 squads...",
    "Phase 5: Calculating Travel Stress, flights, timezone crossing deltas, and fatigue decay...",
    "Phase 6: Assessing Climate Adaptation, temperature coefficients, humidity decays, and adaptive profiles...",
    "Phase 7: Scraping Stadium Intelligence, altitude meters, thin-air aerodynamic physics, and turf coefficients...",
    "Phase 8: Weighting Tournament Psychology, situational stakes, and derby tension tension factors...",
    "Phase 9: Bootstrapping Monte Carlo Simulations: 10,000 algorithmic seed runs for Poisson scorelines...",
    "Phase 10: Isolating Value Bet Detection Overlay: comparing STRATOS odds against public bookmaker margins..."
  ];

  // Trigger prediction model
  const handlePredict = async (
    home: string, 
    away: string,
    venueOverride?: string,
    kickoffOverride?: string,
    altHomeOverride?: boolean,
    altAwayOverride?: boolean,
    moistureOverride?: string,
    tempOverride?: number,
    modeOverride?: 'tier1' | 'tier2'
  ) => {
    if (!home.trim() || !away.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    setErrorMessage(null);
    setPrediction(null);

    const activeMode = modeOverride || simulationMode;
    const isTier1 = activeMode === 'tier1';
    const tickSpeed = isTier1 ? 60 : 400;
    const endTimeout = isTier1 ? 600 : 3600;

    // Dynamic loading interval for tactical suspense - 9 steps
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingLogs.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, tickSpeed);

    const matchVenue = venueOverride !== undefined ? venueOverride : selectedVenue;
    const kickoff = kickoffOverride !== undefined ? kickoffOverride : kickoffTime;
    const altHome = altHomeOverride !== undefined ? altHomeOverride : altitudeCampHome;
    const altAway = altAwayOverride !== undefined ? altAwayOverride : altitudeCampAway;
    const moisture = moistureOverride !== undefined ? moistureOverride : pitchMoisture;
    const temp = tempOverride !== undefined ? tempOverride : matchTemperature;

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          homeTeam: home, 
          awayTeam: away,
          venue: matchVenue,
          kickoffTime: kickoff,
          altitudeCampHome: altHome,
          altitudeCampAway: altAway,
          pitchMoisture: moisture,
          matchTemperature: temp,
          simulationMode: activeMode
        }),
      });

      if (!res.ok) {
        throw new Error(`Execution failure: ${res.statusText}`);
      }

      const data = await res.json();
      
      // Delay slightly at the end to make it feel deliberate
      setTimeout(() => {
        clearInterval(interval);
        setPrediction(data.prediction);
        setIsOfflineMock(!!data.isMock);
        setApiWarning(data.apiError || null);
        setLoading(false);
        setActiveTab('dashboard');
      }, endTimeout);

    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'An error occurred during model evaluation.');
      setLoading(false);
    }
  };

  // Synchronize fixtures based on Category selection
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res = await fetch(`/api/fixtures?category=${footballCategory}`);
        if (res.ok) {
          const data = await res.json();
          setFixtures(data.fixtures);
          setSystemDate(data.date);
          
          if (data.fixtures && data.fixtures.length > 0) {
            // Predict the primary featured match on category change
            const featuredMatch = data.fixtures.find((f: any) => f.featured) || data.fixtures[0];
            setSelectedVenue(featuredMatch.venue);
            handlePredict(featuredMatch.home, featuredMatch.away, featuredMatch.venue);
          }
        }
      } catch (err) {
        console.error("Stratos Error: Failed to fetch dynamic real time fixtures feed:", err);
      }
    };
    fetchFixtures();
  }, [footballCategory]);

  // Weather icon picker
  const renderWeatherIcon = (icon: string) => {
    switch (icon?.toLowerCase()) {
      case 'rain': return <CloudRain className="w-8 h-8 text-blue-400" id="weather-icon-el" />;
      case 'sun': return <Sun className="w-8 h-8 text-amber-400" id="weather-icon-el" />;
      case 'cloud': return <Cloud className="w-8 h-8 text-slate-400" id="weather-icon-el" />;
      case 'wind': return <Wind className="w-8 h-8 text-teal-400" id="weather-icon-el" />;
      default: return <Sun className="w-8 h-8 text-amber-350" id="weather-icon-el" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950" id="stratos-container">
      
      {/* Top Telemetry Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 sm:px-6" id="app-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">STRATOS <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-medium">v2.1</span></h1>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
              </div>
              <p className="text-xs text-slate-400 mt-1">9-Phase Predictive Intelligence Decision Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <div className="hidden md:flex flex-col items-end border-r border-slate-900 pr-4">
              <span>SYSTEM STATE: <span className="text-emerald-400 font-bold font-mono">READY</span></span>
              <span>COMPUTE ENGINE: <span className="text-emerald-400 font-mono">GEMINI-3.5-FLASH</span></span>
            </div>
            <div className="text-right">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
              <span>{systemDate || "Scheduled Today"} // Intel Feed Live</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-8" id="app-main">
        
        {/* Banner explaining simulation params */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-xl border border-slate-900 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="intro-banner">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-sm font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Football Intelligence & Market Overlay</h2>
            <p className="text-sm text-slate-300">
              STRATOS v2 is a high fidelity Sports Decision Engine. By conducting sequential 9-phase quantitative sweeps, we isolate value mismatches against live market indices.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 font-mono text-center">
              <div className="text-[10px] text-slate-500 uppercase">Venue State</div>
              <div className="text-xs font-bold text-slate-300">Mode A vs B</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-center">
              <div className="text-[10px] text-slate-505 uppercase">Monte Carlo</div>
              <div className={`text-xs font-bold ${simulationMode === 'tier1' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {simulationMode === 'tier1' ? '500 Seeds' : '10,000 Seeds'}
              </div>
            </div>
          </div>
        </div>

        {/* Prediction Input & Preset Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="interaction-panel">
          
          {/* Preset Selector Panel */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4" id="presets-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">1. Select Match Case</h3>
              {isOfflineMock && (
                <span className="text-[10px] bg-amber-500/10 text-amber-455 border border-amber-500/20 px-2 py-0.5 rounded font-mono">MOCK MODE</span>
              )}
            </div>

            {/* Computational Pass Engine Toggle (Tier 1 vs Tier 2) */}
            <div className="space-y-1.5" id="simulation-tier-control">
              <div className="flex bg-slate-900/40 p-1 rounded-lg border border-slate-900" id="simulation-mode-selector">
                <button
                  onClick={() => setSimulationMode('tier1')}
                  className={`flex-1 py-1 text-xs font-mono font-semibold rounded transition-all text-center flex items-center justify-center gap-1 ${
                    simulationMode === 'tier1'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="500-iteration fast-pass macro-assessment"
                >
                  <CircleDot className="w-3.5 h-3.5" />
                  <span>Tier 1: Browse (500)</span>
                </button>
                <button
                  onClick={() => setSimulationMode('tier2')}
                  className={`flex-1 py-1 text-xs font-mono font-semibold rounded transition-all text-center flex items-center justify-center gap-1 ${
                    simulationMode === 'tier2'
                      ? 'bg-emerald-505 bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-405 text-slate-400 hover:text-slate-200'
                  }`}
                  title="10,000-pass comprehensive Monte Carlo simulation"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Tier 2: Deep (10k)</span>
                </button>
              </div>
            </div>

            {/* Gender/Category Filter Toggle */}
            <div className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-900" id="category-filter-toggle">
              <button
                onClick={() => setFootballCategory('mens')}
                className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded transition-all text-center ${
                  footballCategory === 'mens'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Men's Slates
              </button>
              <button
                onClick={() => setFootballCategory('womens')}
                className={`flex-1 py-1.5 text-xs font-mono font-semibold rounded transition-all text-center ${
                  footballCategory === 'womens'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Women's Slates
              </button>
            </div>
            
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {fixtures.map((matchObj, idx) => {
                const isActive = prediction && 
                  prediction.matchInfo.homeTeam?.toLowerCase().includes(matchObj.home.toLowerCase()) && 
                  prediction.matchInfo.awayTeam?.toLowerCase().includes(matchObj.away.toLowerCase());
                return (
                  <button
                    key={idx}
                    id={`preset-btn-${idx}`}
                    onClick={() => {
                      setSelectedVenue(matchObj.venue);
                      handlePredict(matchObj.home, matchObj.away, matchObj.venue);
                    }}
                    disabled={loading}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]' 
                        : 'bg-slate-900/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 font-semibold text-slate-200 text-xs sm:text-sm">
                        <span>{matchObj.home}</span>
                        <span className="text-xs font-mono font-normal text-slate-600">vs</span>
                        <span>{matchObj.away}</span>
                        {matchObj.featured && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded uppercase tracking-widest font-mono font-semibold">Today's Pick</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                        <span className="truncate max-w-[120px]">{matchObj.venue}</span>
                        <span>•</span>
                        <span>{matchObj.date}</span>
                      </div>
                    </div>
                    <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-950 text-slate-600'}`}>
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* World Cup 2026 Environmental Calibration */}
            <div className="pt-4 border-t border-slate-900/60 space-y-3" id="env-calibrator">
              <h4 className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> 
                2. Calibrate Environment
              </h4>

              {/* Host City Venue Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Host Venue City</label>
                <select
                  value={selectedVenue}
                  onChange={(e) => setSelectedVenue(e.target.value)}
                  className="w-full bg-slate-905 border border-slate-900 hover:border-slate-800 focus:border-slate-750 text-slate-350 bg-slate-900 rounded px-2.5 py-1.5 text-xs font-mono font-semibold select-none focus:outline-none transition-colors"
                >
                  <option value="Soldier Field, Chicago, IL">Chicago (Soldier Field) [Natural Grass]</option>
                  <option value="Estadio Azteca, Mexico City">Mexico City (Estadio Azteca) [2,240m Altitude]</option>
                  <option value="Estadio Akron, Guadalajara">Guadalajara (Estadio Akron) [1,566m Altitude]</option>
                  <option value="Hard Rock Stadium, Miami">Miami (Hard Rock Stadium) [Open-air, Heat Alert]</option>
                  <option value="NRG Stadium, Houston">Houston (NRG Stadium) [Open-air, Heat Alert]</option>
                  <option value="Arrowhead Stadium, Kansas City">Kansas City (Arrowhead) [Open-air, Heat Alert]</option>
                  <option value="Estadio BBVA, Monterrey">Monterrey (Estadio BBVA) [Open-air, Heat Alert]</option>
                  <option value="AT&T Stadium, Dallas">Dallas (AT&T Stadium) [Indoor, Climate Controlled]</option>
                  <option value="Mercedes-Benz Stadium, Atlanta">Atlanta (Mercedes-Benz) [Indoor, Climate Controlled]</option>
                </select>
              </div>

              {/* Kickoff / Matchday Timing Selector */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Scheduled Kickoff local time</label>
                <select
                  value={kickoffTime}
                  onChange={(e) => setKickoffTime(e.target.value)}
                  className="w-full border border-slate-900 hover:border-slate-800 focus:border-slate-755 text-slate-350 bg-slate-900 rounded px-2.5 py-1.5 text-xs font-mono font-semibold select-none focus:outline-none transition-colors"
                >
                  <option value="15:00">Before 6:00 PM (3:00 PM) [Triggers Peak Summer Heat Penalties]</option>
                  <option value="20:00">After 6:00 PM (8:00 PM) [Bypasses Summer Heat Penalties]</option>
                </select>
              </div>

              {/* Pitch Moisture State Option Selection */}
              <div className="space-y-1.5" id="pitch-moisture-selector">
                <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Pitch Moisture State</label>
                <div className="grid grid-cols-3 gap-1 px-1 py-1 bg-slate-900 rounded border border-slate-900">
                  {['Standard', 'Wet/Raining', 'Dry/Long Grass'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPitchMoisture(opt)}
                      className={`py-1 text-[10px] font-mono font-bold rounded text-center transition-all ${
                        pitchMoisture === opt
                          ? 'bg-emerald-500/15 text-emerald-405 border border-emerald-500/30 text-emerald-400'
                          : 'text-slate-500 hover:text-slate-300 border border-transparent'
                      }`}
                    >
                      {opt === 'Standard' ? 'Standard' : opt === 'Wet/Raining' ? 'Wet/Rain' : 'Dry/Grass'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Temperature Slider with Live Fahrenheit Translations Block */}
              <div className="space-y-1.5 font-mono" id="temperature-slider-container">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400">Matchday Temperature</label>
                  <span className={`text-[11px] font-bold ${matchTemperature > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {matchTemperature}°C / {Math.round(matchTemperature * 1.8 + 32)}°F
                  </span>
                </div>
                <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded border border-slate-900">
                  <input
                    type="range"
                    min="10"
                    max="40"
                    step="1"
                    value={matchTemperature}
                    onChange={(e) => setMatchTemperature(parseInt(e.target.value))}
                    className="flex-1 accent-emerald-500 cursor-pointer h-1 rounded-lg bg-slate-800"
                  />
                  <span className="text-[9px] font-bold uppercase select-none leading-none">
                    {matchTemperature > 30 ? (
                      <span className="text-amber-400">⚠️ Heat Penalty</span>
                    ) : (
                      <span className="text-slate-500">Perfect</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Altitude Preparatory Camp Switches */}
              {(selectedVenue.toLowerCase().includes("mexico city") || selectedVenue.toLowerCase().includes("guadalajara") || selectedVenue.toLowerCase().includes("azteca") || selectedVenue.toLowerCase().includes("akron")) && (
                <div className="bg-emerald-950/10 border border-emerald-500/20 rounded p-2.5 space-y-2 animate-fade-in" id="altitude-camp-controls">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold block">
                    ▲ ALTITUDE MODE CALIBRATED
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={altitudeCampHome}
                        onChange={(e) => setAltitudeCampHome(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 h-3.5 w-3.5 cursor-pointer accent-emerald-500"
                      />
                      <span className="font-mono text-[11px]">Home squad (&gt;14 days altitude camp prep)</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={altitudeCampAway}
                        onChange={(e) => setAltitudeCampAway(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950 h-3.5 w-3.5 cursor-pointer accent-emerald-500"
                      />
                      <span className="font-mono text-[11px]">Away squad (&gt;14 days altitude camp prep)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Manual Run Module */}
            <div className="pt-4 border-t border-slate-900/60" id="manual-inputs">
              <h4 className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-3">3. Execute Custom Simulation</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Home Team</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Manchester City"
                    value={homeTeamInput}
                    onChange={(e) => setHomeTeamInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-900 hover:border-slate-800 focus:border-slate-700 rounded px-3 py-2 text-xs font-semibold tracking-wide text-slate-200 focus:outline-none transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Away Team</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Real Madrid"
                    value={awayTeamInput}
                    onChange={(e) => setAwayTeamInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-900 hover:border-slate-800 focus:border-slate-700 rounded px-3 py-2 text-xs font-semibold tracking-wide text-slate-200 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <button
                id="analyse-btn"
                onClick={() => {
                  if (homeTeamInput && awayTeamInput) {
                    handlePredict(homeTeamInput, awayTeamInput);
                  }
                }}
                disabled={loading || !homeTeamInput.trim() || !awayTeamInput.trim()}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-450 active:scale-[0.99] text-slate-950 font-bold rounded text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-55 disabled:scale-100"
              >
                <Cpu className="w-4 h-4" />
                <span>Initialize STRATOS v2 9-Phase Core</span>
              </button>
            </div>
          </div>

          {/* Core Prediction Processing / Visualization Screen */}
          <div className="lg:col-span-8" id="results-and-loading-panel">
            
            {/* Loading Stage Terminal */}
            {loading && (
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 min-h-[500px] flex flex-col justify-between font-mono" id="engine-preloader">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping"></span>
                      MODEL COMPUTATION IN PROGRESS
                    </span>
                    <span className="text-xs font-mono text-amber-500">{Math.round(((loadingStep + 1) / loadingLogs.length) * 100)}%</span>
                  </div>
                  
                  {/* Staged micro-terminal execution stack */}
                  <div className="space-y-3.5 text-xs leading-relaxed">
                    {loadingLogs.map((log, i) => {
                      const isPast = i < loadingStep;
                      const isCurrent = i === loadingStep;
                      return (
                        <div key={i} className={`flex items-start gap-2.5 transition-opacity duration-300 ${isPast ? 'text-slate-400' : isCurrent ? 'text-emerald-400 font-semibold' : 'text-slate-700'}`}>
                          <span>{isPast ? '✓' : isCurrent ? '▶' : '•'}</span>
                          <span className="flex-1 font-mono text-[11px]">{log}</span>
                          {isPast && <span className="text-[10px] text-slate-500 font-mono">OK</span>}
                          {isCurrent && <span className="text-[10px] text-emerald-400 animate-pulse font-mono">Running...</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-slate-900/60 mt-6">
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 ease-out"
                      style={{ width: `${((loadingStep + 1) / loadingLogs.length) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-550">
                    <span className="font-mono text-slate-400 text-[10px]">STRATOS RE-ESTABLISHING MATRICES</span>
                    <span className="font-mono text-emerald-400 text-[10px] uppercase">
                      {simulationMode === 'tier1' ? '500 Fast-pass Iterations Seeded' : '10,000 Monte Carlo Iterations Seeded'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Layout */}
            {errorMessage && !loading && (
              <div className="bg-rose-950/10 border border-rose-900/40 rounded-xl p-6 min-h-[460px] flex flex-col justify-center items-center text-center space-y-4" id="error-alert">
                <div className="bg-rose-950/20 text-rose-500 p-3 rounded-full border border-rose-900/40">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h3 className="font-bold text-slate-200 font-mono">Simulation Error</h3>
                  <p className="text-xs text-rose-400">{errorMessage}</p>
                </div>
                <button
                  onClick={() => handlePredict("USA", "Germany")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-semibold rounded text-slate-300 border border-slate-800 transition-colors"
                >
                  Rerun Reference Standard (USA vs Germany)
                </button>
              </div>
            )}

            {/* Empty Context */}
            {!loading && !prediction && !errorMessage && (
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 min-h-[460px] flex flex-col justify-center items-center text-center space-y-4" id="blank-dashboard">
                <div className="bg-slate-900 text-slate-500 p-3 rounded-full animate-bounce">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-300 font-mono">Stratos Sports Intelligence Engine</h3>
                  <p className="text-xs text-slate-500 max-w-sm">Select a fixture or enter custom slates in the selectors to begin simulation.</p>
                </div>
              </div>
            )}

            {/* Prediction Display Dashboard */}
            {prediction && !loading && !errorMessage && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-fade-in" id="dashboard-layout-group">
                <div className="xl:col-span-8 bg-slate-950 border border-slate-900 rounded-xl overflow-hidden flex flex-col justify-between min-h-[500px]" id="prediction-dashboard">
                
                {/* Simulated Pitch Title Section */}
                <div className="bg-slate-900/40 px-5 py-4 border-b border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" id="dashboard-header-match">
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">10-PHASE STRATOS CALIBRATION</span>
                      {prediction.simulationMode === 'tier1' ? (
                        <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-semibold border border-amber-500/20 flex items-center gap-1">
                          <CircleDot className="w-3 h-3 text-amber-400" />
                          <span>Tier 1: 500 Runs</span>
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-505 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-emerald-400" />
                          <span>Tier 2: 10,000 Runs</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{prediction.matchInfo.homeTeam}</span>
                      <span className="text-slate-600 font-mono text-xs">vs</span>
                      <span>{prediction.matchInfo.awayTeam}</span>
                    </h3>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-mono text-slate-200">{prediction.matchInfo.venue}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{prediction.matchInfo.date} • {prediction.matchInfo.surface}</div>
                  </div>
                </div>

                {isOfflineMock && (
                  <div className="bg-amber-500/5 border-b border-slate-900 px-5 py-3.5 flex items-start gap-3.5 text-xs text-amber-200" id="quota-warning-banner">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-400 font-mono">Local Standalone Cache Enabled</p>
                      <p className="text-[11px] leading-relaxed text-amber-300/80">
                        {apiWarning ? `Gemini prediction service reported: "${apiWarning}".` : "Primary API credentials unconfigured in container."} 
                        {" "}The engine has triggered precalculated 10-Phase simulations to preserve UI functionality and Poisson estimates.
                      </p>
                    </div>
                  </div>
                )}

                {/* Sub Tab Selection bar */}
                <div className="border-b border-slate-900 flex text-xs font-mono bg-slate-950 h-11" id="tabs-bar">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Sim & Value (P9-10)
                  </button>
                  <button 
                    onClick={() => setActiveTab('stratosV2')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'stratosV2' ? 'border-amber-500 text-amber-500 bg-slate-900/20 font-semibold' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    ★ EXECUTIVE OVERLAYS
                  </button>
                  <button 
                    onClick={() => setActiveTab('baselines')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'baselines' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Baselines & Matchups (P1-2)
                  </button>
                  <button 
                    onClick={() => setActiveTab('tactical')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'tactical' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Squads & Stability (P3-4)
                  </button>
                  <button 
                    onClick={() => setActiveTab('modifiers')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'modifiers' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Travel & Climate (P5-6)
                  </button>
                  <button 
                    onClick={() => setActiveTab('validation')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'validation' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Stadium & Psychology (P7-8)
                  </button>
                </div>

                {/* Interchanging tab views */}
                <div className="p-5 flex-1" id="tab-content-area">                  {/* ====== TAB 1: EXECUTIVE SUMMARY, SIMULATIONS, CONFIDENCE, AND VALUE ====== */}
                  {activeTab === 'dashboard' && (
                    <>
                      <div className="space-y-6 animate-fade-in" id="dashboard-tab">
                      
                      {/* Venue Status Block */}
                      <div className="p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                           <CircleDot className="w-3.5 h-3.5" />
                           <span>Matchday Context Validation</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                          <div>
                            <span className="text-slate-500 block uppercase text-[10px]">State Mode</span>
                            <span className="text-slate-200 font-bold">{prediction.matchdayContext?.venueStatus || "Standard Mode A Match"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[10px]">Venue Influence & Crowd takeover</span>
                            <span className="text-slate-300 leading-normal block text-[11px] font-sans italic">
                              {prediction.matchdayContext?.venueInfluenceIndex || "Standard Home Ground multipliers applied."}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans border-t border-slate-900/50 pt-1.5 leading-normal">
                          <strong>Environmental Adjustments:</strong> {prediction.matchdayContext?.environmentalAdjustments || "No limiting microclimatic variables simulated."}
                        </p>
                      </div>

                      {/* Probabilities Metric Matrix */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">STRATOS Metric Matrix OUTCOMES</h4>
                          <span className="text-[10px] font-mono text-slate-500">10,000 simulations</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 relative overflow-hidden group">
                            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 truncate">Home Win ({prediction.matchInfo.homeTeam})</div>
                            <div className="text-2xl font-bold tracking-tight text-white font-mono">{prediction.phase9MonteCarlo.winProbabilityHome}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${prediction.phase9MonteCarlo.winProbabilityHome}%` }} />
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 relative overflow-hidden group">
                            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 truncate">🤝 Draw</div>
                            <div className="text-2xl font-bold tracking-tight text-white font-mono">{prediction.phase9MonteCarlo.winProbabilityDraw}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-500 h-full" style={{ width: `${prediction.phase9MonteCarlo.winProbabilityDraw}%` }} />
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 relative overflow-hidden group">
                            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 truncate">Away Win ({prediction.matchInfo.awayTeam})</div>
                            <div className="text-2xl font-bold tracking-tight text-white font-mono">{prediction.phase9MonteCarlo.winProbabilityAway}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${prediction.phase9MonteCarlo.winProbabilityAway}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Projections & Confidence */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Box 1: Poisson Scorelines & Confidence Block */}
                        <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Most Likely Poisson Scorelines</h4>
                            <span className="text-[10px] text-slate-500 font-mono">Poisson curves 1-3</span>
                          </div>
                          
                          <div className="space-y-3">
                            {prediction.phase9MonteCarlo.scorelineProjections?.slice(0, 3).map((p, i) => (
                              <div key={i} className="flex items-center justify-between text-xs font-mono">
                                <span className={`font-bold ${i === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>#{i+1} Score: {p.score}</span>
                                <div className="flex-1 mx-3 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                  <div className={`h-full ${i === 0 ? 'bg-emerald-500' : 'bg-slate-700'}`} style={{ width: `${p.probability * 5}%` }} />
                                </div>
                                <span className={i === 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{p.probability}%</span>
                              </div>
                            ))}
                          </div>

                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 space-y-2 mt-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Confidence Engine Rating</span>
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                                {prediction.phase9MonteCarlo.predictionConfidenceScore}% Accuracy Expected
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-normal">
                              {prediction.phase9MonteCarlo.predictionConfidenceExplanation || "Stable modeling limits based on low parameter discrepancy indices."}
                            </p>
                          </div>
                        </div>

                        {/* Box 2: Betting Odds & Value overlay */}
                        <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Value Bet detection</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                prediction.phase10ValueBetDetection.edgeVerdict === '🟢 VALUE OPPORTUNITY'
                                  ? 'bg-emerald-500/10 text-emerald-440 border border-emerald-505/25 animate-pulse'
                                  : 'bg-slate-800 text-slate-405 border border-slate-700'
                              }`}>
                                {prediction.phase10ValueBetDetection.edgeVerdict === '🟢 VALUE OPPORTUNITY' ? '🟢 VALUE OPPORTUNITY' : '⚠️ SKIP MATCH'}
                              </span>
                            </div>

                            <div className="space-y-2 text-[11px] font-mono">
                              <div className="grid grid-cols-4 gap-2 text-[9px] text-slate-500 uppercase font-bold text-center border-b border-slate-950 pb-1">
                                <span>Selection</span>
                                <span>Stratos Fair</span>
                                <span>Bookie Odds</span>
                                <span>Edge Margin</span>
                              </div>
                              <div className="grid grid-cols-4 gap-2 items-center text-center py-0.5 border-b border-slate-900/30">
                                <span className="text-slate-405 font-semibold text-left truncate">{prediction.matchInfo.homeTeam}</span>
                                <span className="text-emerald-450 font-semibold">{prediction.phase10ValueBetDetection.calculatedOddsHome}</span>
                                <span className="text-slate-350">{prediction.phase10ValueBetDetection.bookmakerOddsHome}</span>
                                <span className={`font-bold ${prediction.phase10ValueBetDetection.valueMarginHome >= 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {prediction.phase10ValueBetDetection.valueMarginHome >= 0 ? `+${prediction.phase10ValueBetDetection.valueMarginHome}%` : `${prediction.phase10ValueBetDetection.valueMarginHome}%`}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-2 items-center text-center py-0.5 border-b border-slate-900/30">
                                <span className="text-slate-405 font-semibold text-left">Draw 🤝</span>
                                <span className="text-emerald-450 font-semibold">{prediction.phase10ValueBetDetection.calculatedOddsDraw}</span>
                                <span className="text-slate-350">{prediction.phase10ValueBetDetection.bookmakerOddsDraw}</span>
                                <span className={`font-bold ${prediction.phase10ValueBetDetection.valueMarginDraw >= 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {prediction.phase10ValueBetDetection.valueMarginDraw >= 0 ? `+${prediction.phase10ValueBetDetection.valueMarginDraw}%` : `${prediction.phase10ValueBetDetection.valueMarginDraw}%`}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-2 items-center text-center py-0.5 text-slate-300">
                                <span className="text-slate-405 font-semibold text-left truncate">{prediction.matchInfo.awayTeam}</span>
                                <span className="text-emerald-450 font-semibold">{prediction.phase10ValueBetDetection.calculatedOddsAway}</span>
                                <span className="text-slate-350">{prediction.phase10ValueBetDetection.bookmakerOddsAway}</span>
                                <span className={`font-bold ${prediction.phase10ValueBetDetection.valueMarginAway >= 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                                  {prediction.phase10ValueBetDetection.valueMarginAway >= 0 ? `+${prediction.phase10ValueBetDetection.valueMarginAway}%` : `${prediction.phase10ValueBetDetection.valueMarginAway}%`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2.5 border border-slate-900 rounded-lg leading-relaxed mt-1">
                            <strong>Edge Discrepancy details:</strong> {prediction.phase10ValueBetDetection.exactDiscrepancyExplanation}
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Recommendation Panel */}
                      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/10 to-indigo-950/20 border border-indigo-950/40 rounded-xl p-4" id="recommendation-badge">
                        <div className="flex items-start gap-3.5">
                          <div className="p-2.5 bg-indigo-505/10 border border-indigo-500/25 text-indigo-400 rounded-lg shrink-0">
                            <Target className="w-5 h-5 text-indigo-400" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-[11px] uppercase font-bold font-mono tracking-wider text-indigo-400">STRATOS OPTIMAL PLAY PLAYBOOK</h4>
                            <p className="text-sm font-bold text-slate-105">{prediction.phase10ValueBetDetection.valueRecommendation}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                    {/* ====== TAB 2: BASELINES & MATCHUPS ====== */}
                  {activeTab === 'baselines' && (
                    <div className="space-y-6 animate-fade-in" id="baselines-tab">
                      
                      {/* Phase 1: ELO Strength */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 1: ELO & FOUNDATIONAL TEAM STRENGTH</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">Historical baseline stats</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-mono">{prediction.matchInfo.homeTeam} Profile</span>
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                                ELO: {prediction.phase1EloStrength.homeElo}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Roster Value Value</span>
                                <span className="font-bold text-slate-200 font-mono text-[11px]">{prediction.phase1EloStrength.rosterValueHome}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Historical xG Trend</span>
                                <span className="font-bold text-slate-200 font-mono text-[11px]">+{prediction.phase1EloStrength.historicalXgTrendHome} xG/90</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-mono">{prediction.matchInfo.awayTeam} Profile</span>
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                                ELO: {prediction.phase1EloStrength.awayElo}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Roster Value Value</span>
                                <span className="font-bold text-slate-200 font-mono text-[11px]">{prediction.phase1EloStrength.rosterValueAway}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Historical xG Trend</span>
                                <span className="font-bold text-slate-200 font-mono text-[11px]">+{prediction.phase1EloStrength.historicalXgTrendAway} xG/90</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg flex flex-col gap-1">
                          <span className="text-[10px] font-mono font-bold text-slate-550 block uppercase">Gender-Specific slate Context</span>
                          <span className="text-[11px] font-mono text-emerald-400 font-semibold">{prediction.phase1EloStrength.genderBaselineHistory}</span>
                          <p className="text-xs text-slate-300 italic mt-1 bg-slate-950/40 p-2 rounded border border-slate-900">"{prediction.phase1EloStrength.analysis}"</p>
                        </div>
                      </div>

                      {/* Phase 2: Tactical Matchup */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 2: TACTICAL MATCHUP ENGINE</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">Pressing, Block & Formations</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <span className="font-bold text-white font-mono block border-b border-slate-900 pb-1.5 text-xs uppercase">{prediction.matchInfo.homeTeam} Tactical Profile</span>
                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Formation Shape</span>
                                <span className="font-bold text-slate-200 font-mono text-xs">{prediction.phase2TacticalMatchup.homeFormation}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Passing Velocity</span>
                                <span className="font-bold text-slate-200 font-mono text-xs">{prediction.phase2TacticalMatchup.passingVelocityHome}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Pressing (PPDA)</span>
                                <span className="font-bold text-slate-200 font-mono text-xs">{prediction.phase2TacticalMatchup.homePpda} PPDA</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Defensive Block STYLE</span>
                                <span className="font-bold text-slate-200 font-mono text-xs truncate block">{prediction.phase2TacticalMatchup.defensiveBlockStyleHome}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <span className="font-bold text-white font-mono block border-b border-slate-900 pb-1.5 text-xs uppercase">{prediction.matchInfo.awayTeam} Tactical Profile</span>
                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Formation Shape</span>
                                <span className="font-bold text-slate-200 font-mono text-xs">{prediction.phase2TacticalMatchup.awayFormation}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Passing Velocity</span>
                                <span className="font-bold text-slate-200 font-mono text-xs">{prediction.phase2TacticalMatchup.passingVelocityAway}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Pressing (PPDA)</span>
                                <span className="font-bold text-slate-200 font-mono text-xs">{prediction.phase2TacticalMatchup.awayPpda} PPDA</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Defensive Block STYLE</span>
                                <span className="font-bold text-slate-200 font-mono text-xs truncate block">{prediction.phase2TacticalMatchup.defensiveBlockStyleAway}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg">
                          <span className="text-[10px] font-mono text-slate-550 block uppercase mb-1 font-bold">Formation & Tactical Compatibility Analysis</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase2TacticalMatchup.formationCompatibilityAnalysis}"</p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ====== TAB 3: SQUADS & STABILITY ====== */}
                  {activeTab === 'tactical' && (
                    <div className="space-y-6 animate-fade-in" id="tactical-tab">
                      
                      {/* Phase 3: Squad Availability */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 3: SQUAD AVAILABILITY INDEX</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">Injury lists & sustainability modifiers</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-950 pb-2">
                              <span className="font-bold text-white font-mono text-xs uppercase">{prediction.matchInfo.homeTeam} Availability</span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${prediction.phase3SquadAvailability.availabilityDeltaHome >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'}`}>
                                DELTA: {prediction.phase3SquadAvailability.availabilityDeltaHome >= 0 ? `+${prediction.phase3SquadAvailability.availabilityDeltaHome}` : prediction.phase3SquadAvailability.availabilityDeltaHome} Rating Points
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-mono block">Depth Sustainability Score</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${prediction.phase3SquadAvailability.depthSustainabilityScoreHome}%` }} />
                                  </div>
                                  <span className="font-bold font-mono text-slate-300">{prediction.phase3SquadAvailability.depthSustainabilityScoreHome}/100</span>
                                </div>
                              </div>
                              <div className="pt-1">
                                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Confirmed Missing Personnel</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {prediction.phase3SquadAvailability.missingPersonnelHome?.length ? (
                                    prediction.phase3SquadAvailability.missingPersonnelHome.map((p, i) => (
                                      <span key={i} className="text-[9px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase">
                                        ❌ {p}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-emerald-440 font-semibold font-sans">🟢 Full squad available</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-950 pb-2">
                              <span className="font-bold text-white font-mono text-xs uppercase">{prediction.matchInfo.awayTeam} Availability</span>
                              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${prediction.phase3SquadAvailability.availabilityDeltaAway >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-450'}`}>
                                DELTA: {prediction.phase3SquadAvailability.availabilityDeltaAway >= 0 ? `+${prediction.phase3SquadAvailability.availabilityDeltaAway}` : prediction.phase3SquadAvailability.availabilityDeltaAway} Rating Points
                              </span>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-500 uppercase font-mono block">Depth Sustainability Score</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex-1 bg-slate-950 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${prediction.phase3SquadAvailability.depthSustainabilityScoreAway}%` }} />
                                  </div>
                                  <span className="font-bold font-mono text-slate-300">{prediction.phase3SquadAvailability.depthSustainabilityScoreAway}/100</span>
                                </div>
                              </div>
                              <div className="pt-1">
                                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Confirmed Missing Personnel</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {prediction.phase3SquadAvailability.missingPersonnelAway?.length ? (
                                    prediction.phase3SquadAvailability.missingPersonnelAway.map((p, i) => (
                                      <span key={i} className="text-[9px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase">
                                        ❌ {p}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-emerald-440 font-semibold font-sans">🟢 Full squad available</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg">
                          <span className="text-[10px] font-mono text-slate-550 block uppercase mb-1 font-bold">Squad Availability Analysis</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase3SquadAvailability.analysis}"</p>
                        </div>
                      </div>

                      {/* Phase 4: Formation Stability */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 4: FORMATION STABILITY ENGINE</span>
                          <span className="text-[10px] text-slate-550 font-mono font-bold">Formation consistency & tactical predictability</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-950 pb-2">
                              <span className="font-bold text-white font-mono text-xs uppercase">{prediction.matchInfo.homeTeam} Stability</span>
                              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                                PENALTY: {prediction.phase4FormationStability.instabilityPenaltyHome} Rating Points
                              </span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                  <span className="text-[9px] text-slate-500 uppercase block">Expected formation</span>
                                  <span className="text-emerald-400 font-bold block text-sm mt-0.5">{prediction.phase4FormationStability.expectedFormationHome}</span>
                                </div>
                                <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                  <span className="text-[9px] text-slate-500 uppercase block">Stability level</span>
                                  <span className="text-slate-200 font-bold block text-sm mt-0.5">{prediction.phase4FormationStability.stabilityRatingHome}%</span>
                                </div>
                              </div>
                              <div className="pt-1">
                                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Rotation History (Last 5)</span>
                                <div className="flex gap-1.5">
                                  {prediction.phase4FormationStability.last5FormationsHome?.map((fm, i) => (
                                    <span key={i} className="text-[9px] font-mono bg-slate-950 text-slate-350 border border-slate-900 px-2 py-0.5 rounded font-semibold">
                                      {fm}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center border-b border-slate-950 pb-2">
                              <span className="font-bold text-white font-mono text-xs uppercase">{prediction.matchInfo.awayTeam} Stability</span>
                              <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                                PENALTY: {prediction.phase4FormationStability.instabilityPenaltyAway} Rating Points
                              </span>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                  <span className="text-[9px] text-slate-500 uppercase block">Expected formation</span>
                                  <span className="text-emerald-400 font-bold block text-sm mt-0.5">{prediction.phase4FormationStability.expectedFormationAway}</span>
                                </div>
                                <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                  <span className="text-[9px] text-slate-500 uppercase block">Stability level</span>
                                  <span className="text-slate-200 font-bold block text-sm mt-0.5">{prediction.phase4FormationStability.stabilityRatingAway}%</span>
                                </div>
                              </div>
                              <div className="pt-1">
                                <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Rotation History (Last 5)</span>
                                <div className="flex gap-1.5">
                                  {prediction.phase4FormationStability.last5FormationsAway?.map((fm, i) => (
                                    <span key={i} className="text-[9px] font-mono bg-slate-950 text-slate-350 border border-slate-900 px-2 py-0.5 rounded font-semibold">
                                      {fm}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg">
                          <span className="text-[10px] font-mono text-slate-550 block uppercase mb-1 font-bold">Predictability & stability Analysis</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase4FormationStability.analysis}"</p>
                        </div>
                      </div>

                    </div>
                  )}
                  {/* ====== TAB 4: TRAVEL & CLIMATE ====== */}
                  {activeTab === 'modifiers' && (
                    <div className="space-y-6 animate-fade-in" id="modifiers-tab">
                      
                      {/* Phase 5: Travel Stress */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 5: TRAVEL STRESS INDEX (TSI)</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold font-mono text-[10px]">Transit distance & recovery profiles</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <span className="font-bold text-white font-mono block border-b border-slate-950 pb-1.5 text-xs uppercase">{prediction.matchInfo.homeTeam} Transit Status</span>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Flight Distance</span>
                                <span className="font-bold text-slate-200 block text-xs mt-0.5">{prediction.phase5TravelStress.flightDistanceMilesHome} miles</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Timezones Crossed</span>
                                <span className="font-bold text-slate-200 block text-xs mt-0.5">{prediction.phase5TravelStress.timeZonesCrossedHome}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Recovery Rest Time</span>
                                <span className="font-bold text-slate-200 block text-xs mt-0.5">{prediction.phase5TravelStress.recoveryRestHoursHome} hours</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Travel Fatigue Score</span>
                                <span className="font-bold text-rose-450 block text-xs mt-0.5">{prediction.phase5TravelStress.travelFatigueScoreHome}/100</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <span className="font-bold text-white font-mono block border-b border-slate-950 pb-1.5 text-xs uppercase">{prediction.matchInfo.awayTeam} Transit Status</span>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Flight Distance</span>
                                <span className="font-bold text-slate-200 block text-xs mt-0.5">{prediction.phase5TravelStress.flightDistanceMilesAway} miles</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Timezones Crossed</span>
                                <span className="font-bold text-slate-200 block text-xs mt-0.5">{prediction.phase5TravelStress.timeZonesCrossedAway}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-505 uppercase block">Recovery Rest Time</span>
                                <span className="font-bold text-slate-200 block text-xs mt-0.5">{prediction.phase5TravelStress.recoveryRestHoursAway} hours</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-505 uppercase block">Travel Fatigue Score</span>
                                <span className="font-bold text-rose-450 block text-xs mt-0.5">{prediction.phase5TravelStress.travelFatigueScoreAway}/100</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg">
                          <span className="text-[10px] font-mono text-slate-550 block uppercase mb-1 font-bold font-mono">Travel Stress Analysis</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase5TravelStress.analysis}"</p>
                        </div>
                      </div>

                      {/* Phase 6: Climate Adaptation */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 6: CLIMATE ADAPTATION ENGINE</span>
                          <span className="text-[10px] text-slate-550 font-mono font-bold font-mono text-[10px]">Meteorological thresholds & decay adjustments</span>
                        </h4>

                        <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl grid grid-cols-3 gap-3 text-center mb-1">
                          <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Matchday Temp</span>
                            <span className="text-emerald-400 font-bold block text-sm mt-0.5">{prediction.phase6ClimateAdaptation.matchdayTempCelsius}°C</span>
                          </div>
                          <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Relative Humidity</span>
                            <span className="text-indigo-400 font-bold block text-sm mt-0.5">{prediction.phase6ClimateAdaptation.matchdayHumidityPercent}%</span>
                          </div>
                          <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Wind Velocity</span>
                            <span className="text-amber-400 font-bold block text-sm mt-0.5">{prediction.phase6ClimateAdaptation.matchdayWindKmh} km/h</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-2">
                            <span className="font-bold text-white font-mono block border-b border-slate-950 pb-1 text-xs uppercase">{prediction.matchInfo.homeTeam} Matchday Profile</span>
                            <div className="space-y-1 text-xs">
                              <div><strong>Adaptation Strategy:</strong> <span className="text-slate-300">{prediction.phase6ClimateAdaptation.adaptationProfileHome}</span></div>
                              <div className="pt-1.5 border-t border-slate-950 mt-1.5 flex justify-between items-center bg-slate-950/40 p-1.5 rounded font-mono text-[11px]">
                                <span className="text-slate-500 uppercase">Climate Decay Rating Factor</span>
                                <span className="text-rose-450 font-bold">-{prediction.phase6ClimateAdaptation.climateDecayFactorHome * 100}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-2">
                            <span className="font-bold text-white font-mono block border-b border-slate-950 pb-1 text-xs uppercase">{prediction.matchInfo.awayTeam} Matchday Profile</span>
                            <div className="space-y-1 text-xs">
                              <div><strong>Adaptation Strategy:</strong> <span className="text-slate-300">{prediction.phase6ClimateAdaptation.adaptationProfileAway}</span></div>
                              <div className="pt-1.5 border-t border-slate-950 mt-1.5 flex justify-between items-center bg-slate-950/40 p-1.5 rounded font-mono text-[11px]">
                                <span className="text-slate-500 uppercase">Climate Decay Rating Factor</span>
                                <span className="text-rose-455 font-bold">-{prediction.phase6ClimateAdaptation.climateDecayFactorAway * 100}%</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg">
                          <span className="text-[10px] font-mono text-slate-550 block uppercase mb-1 font-bold">Climate Adaptation Summary</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase6ClimateAdaptation.analysis}"</p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ====== TAB 5: STADIUM & PSYCHOLOGY ====== */}
                  {activeTab === 'validation' && (
                    <div className="space-y-6 animate-fade-in" id="validation-tab">
                      
                      {/* Phase 7: Stadium Intelligence */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 7: STADIUM INTELLIGENCE LAYER</span>
                          <span className="text-[10px] text-emerald-400 font-mono font-bold">Atmospheric density & microclimates</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <span className="font-bold text-white font-mono block border-b border-slate-950 pb-1.5 text-xs uppercase text-slate-400">Atmosphere Specs</span>
                            <div className="space-y-2 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Elevation Level</span>
                                <span className="font-bold text-slate-200 block text-xs mt-0.5">{prediction.phase7StadiumIntelligence.altitudeMeters} meters ALT</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Roof & Enclosure</span>
                                <span className="font-bold text-slate-205 block text-xs mt-0.5">{prediction.phase7StadiumIntelligence.roofEnclosureState}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 uppercase block">Turf Friction Coefficient</span>
                                <span className="font-bold text-slate-205 block text-xs mt-0.5">{prediction.phase7StadiumIntelligence.pitchSurfaceFriction}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3 md:col-span-2">
                            <span className="font-bold text-white font-mono block border-b border-slate-950 pb-1.5 text-xs uppercase text-slate-400">Biomechanical Stamina Drainage</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                              <div className="bg-slate-950/65 p-3 rounded-lg border border-slate-900">
                                <span className="text-[9px] font-mono font-bold text-emerald-400 block tracking-wide mb-1 uppercase">{prediction.matchInfo.homeTeam} Aerobic Impact</span>
                                <p className="text-slate-300 font-sans leading-normal">{prediction.phase7StadiumIntelligence.altitudeStaminaImpactHome}</p>
                              </div>
                              <div className="bg-slate-950/65 p-3 rounded-lg border border-slate-900">
                                <span className="text-[9px] font-mono font-bold text-emerald-400 block tracking-wide mb-1 uppercase">{prediction.matchInfo.awayTeam} Aerobic Impact</span>
                                <p className="text-slate-300 font-sans leading-normal">{prediction.phase7StadiumIntelligence.altitudeStaminaImpactAway}</p>
                              </div>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-xs text-indigo-305 font-mono">
                              <strong>Ball Physics Surcharge:</strong> {prediction.phase7StadiumIntelligence.altitudeBallPhysicsAdjustment}
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg">
                          <span className="text-[10px] font-mono text-slate-550 block uppercase mb-1 font-bold">Biometric & Aerobic Analysis</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase7StadiumIntelligence.stadiumAnalysis}"</p>
                        </div>
                      </div>

                      {/* Phase 8: Tournament Psychology */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 8: TOURNAMENT PSYCHOLOGY & STAKES</span>
                          <span className="text-[10px] text-slate-550 font-mono font-bold">Coaching defensive postures & rivalry pressure indicators</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-2.5 text-xs">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold">Motivation Profile</span>
                            <div><strong>Home Stakes:</strong> <span className="text-slate-200">{prediction.phase8TournamentPsychology.motivationContextHome}</span></div>
                            <div className="border-t border-slate-950 pt-2 mt-2"><strong>Away Stakes:</strong> <span className="text-slate-200">{prediction.phase8TournamentPsychology.motivationContextAway}</span></div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3 text-xs">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold">Defensive Risk Management</span>
                            <div className="space-y-2 leading-none">
                              <div><strong>Home Posture:</strong> <p className="text-slate-300 leading-normal text-[11px] font-mono mt-1">{prediction.phase8TournamentPsychology.riskMitigationBehaviorHome}</p></div>
                              <div className="pt-2 border-t border-slate-950 mt-2"><strong>Away Posture:</strong> <p className="text-slate-300 leading-normal text-[11px] font-mono mt-1">{prediction.phase8TournamentPsychology.riskMitigationBehaviorAway}</p></div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-2.5 flex flex-col justify-between text-xs">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block font-mono">Situational Pressure Index</span>
                              <div className="flex justify-between items-center text-xs font-mono bg-slate-950 p-2 border border-slate-900 rounded mt-1">
                                <span className="text-[10px] text-slate-500">DERBY TENSION</span>
                                <span className="text-amber-500 font-bold">{prediction.phase8TournamentPsychology.derbyTensionLevel}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 uppercase font-mono mt-2.5 block">Competition Weighting</div>
                              <div className="text-xs font-semibold text-slate-200">{prediction.phase8TournamentPsychology.competitionContext}</div>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal italic pt-2 border-t border-slate-950">
                              "{prediction.phase8TournamentPsychology.behavioralLogicAnalysis}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ====== TAB 6: PREMIUM STRATOS v2 MATCH DAY SYSTEM ====== */}
                  {activeTab === 'stratosV2' && (() => {
                    const s2 = {
                      matchStressReport: {
                        venueName: prediction.matchInfo.venue,
                        localTime: kickoffTime || "15:00",
                        roofStatus: prediction.phase7StadiumIntelligence?.roofEnclosureState === "CLOSED" ? "Closed Dome" : "Open-air Mode",
                        environmentalStressIndex: prediction.summaryDataBlocks?.matchStressAndContext?.esiIndex || "LOW",
                        temperatureCelsius: matchTemperature !== undefined ? matchTemperature : 22,
                        humidityPercentage: pitchMoisture === "Wet/Raining" ? 85 : 55,
                        solarRadiation: "Standard Solar Level",
                        airQualityIndex: "Good (AQI 32)",
                        altitudeMeters: (prediction.matchInfo.venue.toLowerCase().includes("mexico") ? 2240 : prediction.matchInfo.venue.toLowerCase().includes("guada") ? 1566 : 100),
                        haiHomeScore: prediction.matchdayContext?.motivationIndexHome !== undefined ? prediction.matchdayContext.motivationIndexHome : 90,
                        haiHomePerformanceDrop: prediction.matchdayContext?.absenceImpactHome !== undefined ? prediction.matchdayContext.absenceImpactHome : 2,
                        haiAwayScore: prediction.matchdayContext?.motivationIndexAway !== undefined ? prediction.matchdayContext.motivationIndexAway : 90,
                        haiAwayPerformanceDrop: prediction.matchdayContext?.absenceImpactAway !== undefined ? prediction.matchdayContext.absenceImpactAway : 2,
                        mostAffectedPositions: ["Central Midfielders", "Wingbacks"],
                        substituteImportanceAnalysis: `Important match event official: ${prediction.matchdayContext?.refereeName || "Szymon Marciniak"} with average of ${prediction.matchdayContext?.cardsPerMatch || 4.8} cards and penalty rate of ${prediction.matchdayContext?.penaltyFrequencyPct || 24.5}%. Context stakes: ${prediction.matchdayContext?.importanceMultiplier || 1.5}x weight.`,
                        travelDistanceMilesHome: prediction.phase5TravelStress?.flightDistanceMilesHome || 300,
                        travelDistanceMilesAway: prediction.phase5TravelStress?.flightDistanceMilesAway || 3000,
                        timeZoneDeltaHome: prediction.phase5TravelStress?.timeZonesCrossedHome || 0,
                        timeZoneDeltaAway: -(prediction.phase5TravelStress?.timeZonesCrossedAway || 5),
                        restDaysHome: prediction.phase5TravelStress?.recoveryRestHoursHome ? Math.round(prediction.phase5TravelStress.recoveryRestHoursHome / 24) : 6,
                        restDaysAway: prediction.phase5TravelStress?.recoveryRestHoursAway ? Math.round(prediction.phase5TravelStress.recoveryRestHoursAway / 24) : 5,
                        benchSustainabilityScoreHome: prediction.phase3SquadAvailability?.depthSustainabilityScoreHome || 80,
                        benchSustainabilityScoreAway: prediction.phase3SquadAvailability?.depthSustainabilityScoreAway || 80
                      },
                      valueBetOverlay: {
                        targetMarket: prediction.phase10ValueBetDetection?.targetMarketSelection || "Draw-No-Bet",
                        edgePercentage: Math.max(prediction.phase10ValueBetDetection?.valueMarginHome || 0, prediction.phase10ValueBetDetection?.valueMarginAway || 0),
                        calculatedOdds: prediction.phase10ValueBetDetection?.calculatedOddsHome || "+150",
                        marketOdds: prediction.phase10ValueBetDetection?.bookmakerOddsHome || "+180",
                        verdict: prediction.phase10ValueBetDetection?.edgeVerdict === "🟢 VALUE OPPORTUNITY" ? "VALUE OPPORTUNITY" as const : "MARKET ALIGNED" as const
                      }
                    };
                    return (
                      <div className="space-y-6 animate-fade-in" id="stratos-v2-tab">
                        
                        {/* Section 0: STRATOS COGNITIVE EXPLAINABILITY INTEL */}
                        {prediction.cognitiveNarrative && (
                          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl space-y-3 font-sans">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center justify-between border-b border-slate-800 pb-2">
                              <span>COGNITIVE INTERPRETATION & TACTICAL REPORT (STRATOS v2 LAYER)</span>
                              <span className="text-[9px] font-mono font-bold text-amber-500">Live AI Reasoning Layer</span>
                            </h4>
                            <div className="text-slate-300 text-xs leading-relaxed max-w-none prose prose-invert prose-xs markdown-body space-y-2">
                              <ReactMarkdown>{prediction.cognitiveNarrative}</ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* Section 1: MATCH STRESS REPORT */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                            <span>SECTION 1: BIOMECHANICAL MATCH STRESS REPORT & AUDIT</span>
                            <span className={`text-[10px] font-mono leading-none tracking-wider font-bold px-2 py-1 rounded border ${
                              s2.matchStressReport.environmentalStressIndex === 'SEVERE'
                                 ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                                 : s2.matchStressReport.environmentalStressIndex === 'MODERATE'
                                   ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                   : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}>
                              ESI Stress: {s2.matchStressReport.environmentalStressIndex}
                            </span>
                          </h4>

                          {/* Venue Specific Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Audited Venue</span>
                              <span className="text-xs font-bold text-slate-200">{s2.matchStressReport.venueName}</span>
                            </div>
                            <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Local Time Frame</span>
                              <span className="text-xs font-bold text-slate-205">{s2.matchStressReport.localTime}</span>
                            </div>
                            <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Enclosure Structure</span>
                              <span className="text-xs font-bold text-slate-205">{s2.matchStressReport.roofStatus}</span>
                            </div>
                          </div>

                          {/* Meteorological Stress Parameters Row */}
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                            <div className="bg-slate-900/20 border border-slate-900 p-2.5 rounded-lg">
                              <span className="text-[9px] text-slate-500 font-mono block uppercase mb-1">Temperature</span>
                              <span className="text-sm font-extrabold text-slate-205 font-mono block">
                                {s2.matchStressReport.temperatureCelsius}°C
                                <span className="text-[10px] font-normal text-slate-550 block mt-0.5">({Math.round(s2.matchStressReport.temperatureCelsius * 1.8 + 32)}°F)</span>
                              </span>
                            </div>
                            <div className="bg-slate-900/20 border border-slate-900 p-2.5 rounded-lg">
                              <span className="text-[9px] text-slate-500 font-mono block uppercase mb-1">Humidity</span>
                              <span className="text-sm font-extrabold text-indigo-400 font-mono block">
                                {s2.matchStressReport.humidityPercentage}%
                                <span className="text-[9px] font-normal text-slate-500 block mt-0.5 font-sans">Relative</span>
                              </span>
                            </div>
                            <div className="bg-slate-900/20 border border-slate-900 p-2.5 rounded-lg">
                              <span className="text-[9px] text-slate-500 font-mono block uppercase mb-1">Alt. Elevation</span>
                              <span className="text-sm font-extrabold text-slate-205 font-mono block">
                                {s2.matchStressReport.altitudeMeters}m
                                <span className="text-[9px] font-normal text-slate-500 block mt-0.5">({Math.round(s2.matchStressReport.altitudeMeters * 3.28)} ft)</span>
                              </span>
                            </div>
                            <div className="bg-slate-900/20 border border-slate-900 p-2.5 rounded-lg">
                              <span className="text-[9px] text-slate-500 font-mono block uppercase mb-1">Solar Energy</span>
                              <span className="text-xs font-bold text-amber-500 font-sans block truncate max-w-full" title={s2.matchStressReport.solarRadiation}>
                                {s2.matchStressReport.solarRadiation}
                                <span className="text-[9px] font-normal text-slate-500 block mt-0.5 font-mono">Radiation</span>
                              </span>
                            </div>
                            <div className="bg-slate-900/20 border border-slate-900 p-2.5 rounded-lg">
                              <span className="text-[9px] text-slate-500 font-mono block uppercase mb-1">Air Quality</span>
                              <span className="text-xs font-bold text-emerald-450 font-sans block truncate max-w-full">
                                {s2.matchStressReport.airQualityIndex}
                                <span className="text-[9px] font-normal text-slate-500 block mt-0.5 font-mono">AQI Index</span>
                              </span>
                            </div>
                          </div>

                          {/* Physiological Heat/Altitude Adaptation Index (HAI) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Home HAI */}
                            <div className="bg-gradient-to-b from-slate-900/40 to-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                                <span className="text-[11px] font-bold font-mono text-emerald-400 uppercase tracking-widest">{prediction.matchInfo.homeTeam} HAI INDEX</span>
                                <span className="text-xs font-bold font-mono text-slate-300">{s2.matchStressReport.haiHomeScore}/100</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center rounded-full bg-slate-950 border-2 border-slate-900">
                                  <span className={`text-[11px] font-mono font-bold ${s2.matchStressReport.haiHomePerformanceDrop > 5 ? 'text-rose-455' : 'text-emerald-400'}`}>
                                    -{s2.matchStressReport.haiHomePerformanceDrop}%
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Physiological Impact Surcharge</span>
                                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                    {s2.matchStressReport.haiHomePerformanceDrop > 0 
                                      ? `Expected -${s2.matchStressReport.haiHomePerformanceDrop}% baseline aerobic efficiency penalty. High altitude or heat exhaustion risks mapped.`
                                      : "Acclimatization threshold met. Flawless physiological adaptation simulated."
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Away HAI */}
                            <div className="bg-gradient-to-b from-slate-900/40 to-slate-950 border border-slate-900 rounded-xl p-4 space-y-3">
                              <div className="flex justify-between items-center border-b border-slate-950 pb-2">
                                <span className="text-[11px] font-bold font-mono text-emerald-400 uppercase tracking-widest">{prediction.matchInfo.awayTeam} HAI INDEX</span>
                                <span className="text-xs font-bold font-mono text-slate-300">{s2.matchStressReport.haiAwayScore}/100</span>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="relative w-14 h-14 shrink-0 flex items-center justify-center rounded-full bg-slate-950 border-2 border-slate-900">
                                  <span className={`text-[11px] font-mono font-bold ${s2.matchStressReport.haiAwayPerformanceDrop > 5 ? 'text-rose-455' : 'text-emerald-400'}`}>
                                    -{s2.matchStressReport.haiAwayPerformanceDrop}%
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Physiological Impact Surcharge</span>
                                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                    {s2.matchStressReport.haiAwayPerformanceDrop > 0 
                                      ? `Expected -${s2.matchStressReport.haiAwayPerformanceDrop}% baseline aerobic efficiency penalty. High altitude or heat exhaustion risks mapped.`
                                      : "Acclimatization threshold met. Flawless physiological adaptation simulated."
                                    }
                                  </p>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* Logistics, Distance & rest delta */}
                          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4">
                            <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider block mb-3 border-b border-slate-900 pb-1.5 font-bold">LOGISTICAL OVERLOAD SURCHARGES</span>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              <div className="bg-slate-950 p-2.5 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Home Rest Period</span>
                                <span className="font-extrabold text-slate-200 font-mono">{s2.matchStressReport.restDaysHome} Days Rest</span>
                              </div>
                              <div className="bg-slate-950 p-2.5 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Away Rest Period</span>
                                <span className="font-extrabold text-slate-200 font-mono">{s2.matchStressReport.restDaysAway} Days Rest</span>
                              </div>
                              <div className="bg-slate-950 p-2.5 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Home Travel Distance</span>
                                <span className="font-extrabold text-slate-200 font-mono">{s2.matchStressReport.travelDistanceMilesHome} Miles</span>
                              </div>
                              <div className="bg-slate-950 p-2.5 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 uppercase font-mono block mb-0.5">Away Travel Distance</span>
                                <span className="font-extrabold text-slate-200 font-mono">{s2.matchStressReport.travelDistanceMilesAway} Miles</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs">
                              <div className="bg-slate-950/60 p-2 border border-slate-900/50 rounded flex justify-between items-center px-3">
                                <span className="text-slate-500 font-mono uppercase text-[9px]">Home Timezone Delta</span>
                                <span className="font-bold text-slate-350">{s2.matchStressReport.timeZoneDeltaHome === 0 ? "No Jetlag (Iso-ground)" : `${s2.matchStressReport.timeZoneDeltaHome > 0 ? '+' : ''}${s2.matchStressReport.timeZoneDeltaHome} hrs`}</span>
                              </div>
                              <div className="bg-slate-950/60 p-2 border border-slate-900/50 rounded flex justify-between items-center px-3">
                                <span className="text-slate-500 font-mono uppercase text-[9px]">Away Timezone Delta</span>
                                <span className="font-bold text-slate-350">{s2.matchStressReport.timeZoneDeltaAway === 0 ? "No Jetlag" : `${s2.matchStressReport.timeZoneDeltaAway > 0 ? '+' : ''}${s2.matchStressReport.timeZoneDeltaAway} hrs delta`}</span>
                              </div>
                            </div>
                          </div>

                          {/* Tactical positions hit by physical exhaustion first & substitute analysis */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-3 md:col-span-1">
                              <span className="text-[10px] font-mono uppercase text-amber-500 tracking-wider font-bold block border-b border-slate-900 pb-1.5 flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5" /> High exhaustion positions
                              </span>
                              <div className="flex flex-col gap-1.5">
                                {s2.matchStressReport.mostAffectedPositions?.map((pos, idx) => (
                                  <div key={idx} className="flex items-center gap-2 p-1.5 px-3 bg-rose-500/5 text-rose-300 rounded border border-rose-500/10 text-xs font-mono font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-505 animate-pulse" />
                                    <span>{pos}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-3 md:col-span-2 flex flex-col justify-between">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono uppercase text-indigo-400 tracking-wider font-bold block border-b border-slate-900 pb-1.5 flex items-center gap-1">
                                  <Zap className="w-3.5 h-3.5" /> physical depth & substitution playbook
                                </span>
                                <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium">
                                  {s2.matchStressReport.substituteImportanceAnalysis}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                                <div className="bg-slate-950 p-2.5 border border-slate-900 rounded">
                                  <span className="text-[9px] text-slate-550 font-mono block mb-0.5">Home Bench Sustainability</span>
                                  <span className="font-extrabold text-emerald-400 font-mono text-sm">{s2.matchStressReport.benchSustainabilityScoreHome}/100</span>
                                </div>
                                <div className="bg-slate-950 p-2.5 border border-slate-900 rounded">
                                  <span className="text-[9px] text-slate-550 font-mono block mb-0.5">Away Bench Sustainability</span>
                                  <span className="font-extrabold text-emerald-400 font-mono text-sm">{s2.matchStressReport.benchSustainabilityScoreAway}/100</span>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Section 2: THE EXPLAINABILITY LAYER (Top Drivers) */}
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                            <span>SECTION 2: STRATOS EXPLAINABILITY PANEL (DRIVERS & FATIGUE DROPS)</span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">Non-linear physical adjustments</span>
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Positive Drivers Grid */}
                            <div className="bg-emerald-950/10 border border-emerald-950/20 rounded-xl p-4 space-y-3">
                              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block tracking-wider flex items-center gap-1.5 mb-1">
                                📈 POSITIVE MODEL DRIVERS
                              </span>
                              <div className="space-y-2">
                                {prediction.explainabilityLayer?.positiveDrivers?.map((driver, idx) => (
                                  <div key={idx} className="flex items-start gap-2.5 bg-slate-950/40 p-2.5 rounded border border-emerald-900/30 text-xs text-slate-205 leading-relaxed font-sans">
                                    <span className="text-emerald-400 font-bold font-mono">{(idx + 1).toString().padStart(2, "0")}.</span>
                                    <span>{driver}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Negative Factors Grid */}
                            <div className="bg-rose-955/5 border border-rose-950/15 rounded-xl p-4 space-y-3">
                              <span className="text-[10px] uppercase font-mono font-bold text-rose-450 block tracking-wider flex items-center gap-1.5 mb-1">
                                📉 CONSTRAINTS & SQUAD CORROSION FACTORS
                              </span>
                              <div className="space-y-2">
                                {prediction.explainabilityLayer?.negativeFactors?.map((factor, idx) => (
                                  <div key={idx} className="flex items-start gap-2.5 bg-slate-950/40 p-2.5 rounded border border-rose-950/15 text-xs text-slate-205 leading-relaxed font-sans">
                                    <span className="text-rose-455 font-bold font-mono">{(idx + 1).toString().padStart(2, "0")}.</span>
                                    <span>{factor}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3: THE "WHY NOT?" ENGINE (Prediction Failure Conditions) */}
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                            <span>SECTION 3: THE "WHY NOT?" BREAKDOWN (MODEL SHIELD BREAKS)</span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">Chaos thresholds</span>
                          </h4>

                          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-4 space-y-3">
                            <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 block tracking-wider mb-1">
                              TACTICAL FAILURES OR RANDOM EXOGENOUS CRITICAL ANCHORS:
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
                              {prediction.whyNotEngine?.failureConditions?.map((cond, idx) => (
                                <div key={idx} className="flex gap-3 bg-slate-950 p-3 rounded border border-slate-900 items-start">
                                  <div className="w-5 h-5 bg-indigo-500/10 text-indigo-400 shrink-0 font-mono rounded flex items-center justify-center font-bold text-[10px]">
                                    !
                                  </div>
                                  <p className="font-sans font-medium text-slate-350 leading-relaxed">{cond}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Section 4: STRATOS METRIC MATRIX (Match Day Outcomes & Confidence) */}
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-950 pb-2">
                            <span>SECTION 4: STRATOS METRIC OUTCOMES & METRIC COUPLING MATRIX</span>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">Outcome probabilities</span>
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            {/* Projections */}
                            <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-3">
                              <span className="text-[10px] uppercase font-mono font-bold text-slate-505 block border-b border-slate-900 pb-1 mb-2">Adjusted Outright Projections</span>
                              <div className="space-y-2 text-xs font-mono">
                                <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded border border-slate-900">
                                  <span>{prediction.matchInfo.homeTeam} Win</span>
                                  <span className="font-bold text-emerald-400">{prediction.phase9MonteCarlo.winProbabilityHome}%</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded border border-slate-900">
                                  <span>Draw Chance</span>
                                  <span className="font-bold text-amber-500">{prediction.phase9MonteCarlo.winProbabilityDraw}%</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-slate-950/40 rounded border border-slate-900">
                                  <span>{prediction.matchInfo.awayTeam} Win</span>
                                  <span className="font-bold text-blue-400">{prediction.phase9MonteCarlo.winProbabilityAway}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Confidence rating */}
                            <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-3">
                              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block border-b border-slate-900 pb-1 mb-2 font-bold">Calibration Limits & Confidence</span>
                              <div className="space-y-2 flex flex-col justify-between h-24">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-slate-400">Confidence Score</span>
                                  <span className="text-xs font-bold text-emerald-450 bg-emerald-500/10 px-2.5 py-0.5 rounded font-mono border border-emerald-500/20 font-bold">
                                    {prediction.phase9MonteCarlo.predictionConfidenceScore}% Accuracy Expected
                                  </span>
                                </div>
                                <p className="text-[11px] leading-relaxed text-slate-400 italic font-sans">
                                  {prediction.phase9MonteCarlo.predictionConfidenceExplanation}
                                </p>
                              </div>
                            </div>

                            {/* Projections scorelines */}
                            <div className="bg-slate-900/20 border border-slate-900 p-4 rounded-xl space-y-3 font-mono">
                              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block border-b border-slate-900 pb-1 mb-2">Likeliest Poisson Scorelines</span>
                              <div className="space-y-2 text-xs">
                                {prediction.phase9MonteCarlo.scorelineProjections?.slice(0, 3).map((p, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-950/40 rounded border border-slate-900 font-mono">
                                    <span className={idx === 0 ? "text-emerald-400 font-bold" : "text-slate-400"}>#{idx+1} Scoreline: {p.score}</span>
                                    <span className="font-bold text-slate-205">{p.probability}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Section 5: VALUE BET DETECTION OVERLAY */}
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                            <span>SECTION 5: VALUE BET DETECTION & OVERLAY ALIGNMENT</span>
                            <span className={`text-[10px] font-mono leading-none tracking-wider font-bold px-2.5 py-1 rounded border ${
                              s2.valueBetOverlay.verdict === 'VALUE OPPORTUNITY'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {s2.valueBetOverlay.verdict === 'VALUE OPPORTUNITY' ? '🟢 VALUE OPPORTUNITY' : '⚪ MARKET ALIGNED'}
                            </span>
                          </h4>

                          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/15 border border-amber-500/35 rounded-xl p-5 space-y-4">
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900 pb-3">
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-mono text-amber-400 font-bold tracking-widest block">STRATOS REAL MARKET OVERLAY ADVANCEMENTS</span>
                                <h5 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                                  <Target className="w-4 h-4 text-amber-500 shrink-0" />
                                  <span>Suggested Action Slates: <span className="text-amber-400 font-normal">{s2.valueBetOverlay.targetMarket}</span></span>
                                </h5>
                              </div>
                              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3.5 py-1.5 rounded-lg text-center font-mono shrink-0">
                                <span className="text-[9px] block uppercase text-amber-500 font-bold mb-0.5">Calculated Edge</span>
                                <span className="text-base font-bold font-mono text-amber-400">+{s2.valueBetOverlay.edgePercentage}% Overlay</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-lg">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">STRATOS Derived Fair Odds</span>
                                <span className="text-base font-extrabold text-emerald-400 font-mono block tracking-tight">{s2.valueBetOverlay.calculatedOdds}</span>
                              </div>
                              <div className="bg-slate-950 p-3.5 border border-slate-900 rounded-lg">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block mb-1">Public Bookmaker (Commercial) Odds</span>
                                <span className="text-base font-extrabold text-slate-200 font-mono block tracking-tight">{s2.valueBetOverlay.marketOdds}</span>
                              </div>
                            </div>

                            <div className="bg-slate-950 p-3 flex items-center gap-3 border border-slate-900 rounded-xl">
                              <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg shrink-0">
                                <TrendingUp className="w-4 h-4 text-amber-500" />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block">Expected Value (EV+) Action Protocol</span>
                                <p className="text-xs font-bold text-slate-100 font-sans">{prediction.phase10ValueBetDetection.valueRecommendation}</p>
                              </div>
                            </div>

                          </div>
                        </div>

                      </div>
                    );
                  })()}

                </div>

                {/* Footer Disclaimer */}
                <div className="bg-slate-900/40 px-5 py-3 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2" id="prediction-footer">
                  <span>SYSTEM CALIBRATION ID: STR-WORLD-CUP-26-V2</span>
                  <span>Calculations are illustrative simulation outputs governed by 9-Phase calibration weights</span>
                </div>

              </div>

              {/* Side Panel: Focus Dashboard metrics (Explainability, Context, Why NOT?) */}
              <div className="xl:col-span-4 bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-5 flex flex-col justify-between h-full" id="pre-match-intelligence-feed">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <h4 className="text-xs uppercase font-bold tracking-wider font-mono text-slate-200">
                      STRATOS Explainability Matrix
                    </h4>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    
                    {/* The Matchday Context State Summary */}
                    <div className="space-y-1.5 p-3 rounded bg-slate-900/40 border border-slate-905">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-400 font-mono text-[10px] uppercase tracking-wider">
                        <span>🌍</span>
                        <span>CONTEXT METRIC INDICATOR</span>
                      </div>
                      <div className="text-slate-300 text-[11px] font-mono leading-relaxed lowercase truncate">
                        {prediction.matchdayContext?.venueStatus || "Standard Mode A Match"}
                      </div>
                    </div>

                    {/* Explainability Layer: Positive Drivers */}
                    <div className="space-y-2 p-3.5 rounded bg-emerald-950/15 border border-emerald-900/40">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono text-[10px] uppercase tracking-wider">
                        <span>📈</span>
                        <span>Positive Drivers (+)</span>
                      </div>
                      <ul className="space-y-1 text-slate-300 text-[11px] list-none">
                        {prediction.explainabilityLayer?.positiveDrivers?.map((driver, idx) => (
                          <li key={idx} className="flex items-start gap-1 font-sans">
                            <span className="text-emerald-500 shrink-0 font-bold">•</span>
                            <span className="leading-normal">{driver}</span>
                          </li>
                        )) || <li className="italic text-slate-500">None calculated</li>}
                      </ul>
                    </div>

                    {/* Explainability Layer: Negative Factors */}
                    <div className="space-y-2 p-3.5 rounded bg-rose-950/12 border border-rose-900/30">
                      <div className="flex items-center gap-1.5 font-bold text-rose-450 font-mono text-[10px] uppercase tracking-wider">
                        <span>📉</span>
                        <span>Negative Factors (-)</span>
                      </div>
                      <ul className="space-y-1 text-slate-350 text-[11px] list-none">
                        {prediction.explainabilityLayer?.negativeFactors?.map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-1 font-sans">
                            <span className="text-rose-400 shrink-0 font-bold">•</span>
                            <span className="leading-normal">{factor}</span>
                          </li>
                        )) || <li className="italic text-slate-500">None calculated</li>}
                      </ul>
                    </div>

                    {/* Why Not Engine Failure risks */}
                    <div className="space-y-2 p-3.5 rounded bg-amber-950/15 border border-amber-900/35">
                      <div className="flex items-center gap-1.5 font-bold text-amber-400 font-mono text-[10px] uppercase tracking-wider">
                        <span>⚠️</span>
                        <span>The "Why Not?" Engine</span>
                      </div>
                      <p className="text-[10px] text-slate-450 font-mono leading-tight mb-1">
                        (Prediction Failure Conditions modeled)
                      </p>
                      <ul className="space-y-1.5 text-slate-300 text-[11px] list-none">
                        {prediction.whyNotEngine?.failureConditions?.map((cond, idx) => (
                          <li key={idx} className="flex items-start gap-1 p-1 bg-slate-900/50 rounded border border-slate-900/30 font-sans">
                            <span className="text-amber-500 font-mono font-bold shrink-0">{idx+1}.</span>
                            <span className="leading-normal text-slate-300">{cond}</span>
                          </li>
                        )) || <li className="italic text-slate-500">None modeled</li>}
                      </ul>
                    </div>

                  </div>
                </div>

                {/* Integration info box */}
                <div className="bg-gradient-to-r from-emerald-950/20 to-teal-950/25 border border-emerald-950/45 p-3 rounded-lg space-y-1 mt-4">
                  <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-emerald-400 block">
                    Telemetry Sync state
                  </span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Stratos models match play with Search Grounding enabled. Real time injuries/incidents are modeled securely.
                  </p>
                </div>
              </div>

            </div>
          )}

          </div>
        </div>

      </main>

      <footer className="max-w-7xl mx-auto px-4 py-8 sm:px-6 border-t border-slate-900 mt-12 text-center text-xs text-slate-500 space-y-2" id="app-footer">
        <p>© 2026 Stratos Football Modelling Framework. All projections calculated securely with 10k Poisson Monte Carlo seeds.</p>
        <p className="font-mono text-[10px] text-slate-650">Gemini model grounding enabled via official Google Search capabilities.</p>
      </footer>
    </div>
  );
}
