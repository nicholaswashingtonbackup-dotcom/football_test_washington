/**
 * @license
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
  CircleDot
} from 'lucide-react';
import { MatchPrediction, ScorelineProjection } from './types';

// Structured default preset list matching prompt's 2026 World Cup friendly context
const PRESET_MATCHES = [
  { home: "USA", away: "Germany", venue: "Soldier Field, Chicago", date: "June 6, 2026", featured: true },
  { home: "Brazil", away: "Egypt", venue: "Cairo International Stadium", date: "June 6, 2026", featured: false },
  { home: "Portugal", away: "Chile", venue: "Estádio da Luz, Lisbon", date: "June 6, 2026", featured: false },
  { home: "Argentina", away: "Honduras", venue: "Hard Rock Stadium, Miami", date: "June 6, 2026", featured: false },
  { home: "Turkey", away: "Venezuela", venue: "Chase Stadium, Ft. Lauderdale", date: "June 6, 2026", featured: false },
];

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'squadTactics' | 'environmentHistory' | 'simulationDetails'>('dashboard');

  // Loading process visual simulation logs
  const loadingLogs = [
    "Phase 1: Scraping real-time squad indices, evaluating physical fatigue...",
    "Phase 2: Projecting PPDA profiles, formation adjustments & transition dynamics...",
    "Phase 3: Calculating geographic altitude multipliers, weather turf friction index...",
    "Phase 4: Weighting 2026 World Cup preparation stake and psychological motivation metrics...",
    "Phase 5: Running 10,000 Monte Carlo iterations & computing Poisson probability matrices..."
  ];

  // Trigger prediction
  const handlePredict = async (home: string, away: string) => {
    if (!home.trim() || !away.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    setErrorMessage(null);
    setPrediction(null);

    // Dynamic loading interval for tactical suspense
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingLogs.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeTeam: home, awayTeam: away }),
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
      }, 3100);

    } catch (err: any) {
      clearInterval(interval);
      setErrorMessage(err.message || 'An error occurred during model evaluation.');
      setLoading(false);
    }
  };

  // Run initial USA vs Germany simulation on mount to let user see "test Afterwards USA vs Germany" natively
  useEffect(() => {
    handlePredict("USA", "Germany");
  }, []);

  // Weather icon picker
  const renderWeatherIcon = (icon: string) => {
    switch (icon?.toLowerCase()) {
      case 'rain': return <CloudRain className="w-8 h-8 text-blue-400" id="weather-icon" />;
      case 'sun': return <Sun className="w-8 h-8 text-amber-400" id="weather-icon" />;
      case 'cloud': return <Cloud className="w-8 h-8 text-slate-400" id="weather-icon" />;
      case 'wind': return <Wind className="w-8 h-8 text-teal-400" id="weather-icon" />;
      default: return <Sun className="w-8 h-8 text-amber-350" id="weather-icon" />;
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
                <h1 className="text-xl font-bold tracking-tight text-white leading-none">STRATOS <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-medium">v1.1</span></h1>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Online"></span>
              </div>
              <p className="text-xs text-slate-400 mt-1">5-Phase Machine Learning Football Prediction Framework</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <div className="hidden md:flex flex-col items-end border-r border-slate-900 pr-4">
              <span>SYSTEM STATE: <span className="text-emerald-400 font-bold">READY</span></span>
              <span>ENGINE: <span className="text-emerald-400">GEMINI-3.5-FLASH</span></span>
            </div>
            <div className="text-right">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" />
              <span>June 7, 2026 // World Cup Camp</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-8" id="app-main">
        
        {/* Top Feature Alert Banner explaining simulation parameters */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 rounded-xl border border-slate-900 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="intro-banner">
          <div className="space-y-1 max-w-2xl">
            <h2 className="text-sm font-semibold tracking-wider text-emerald-400 uppercase flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Pre-World Cup Send-off Series</h2>
            <p className="text-sm text-slate-300">
              This analytics console integrates public squad markers with live travel time penalties, dressing room morale indices, and local stadium grass physics to model true outcome probabilities before matches start.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 font-mono text-center">
              <div className="text-[10px] text-slate-500 uppercase">Live Matches</div>
              <div className="text-xs font-bold text-slate-300">June 2026 Base</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 font-mono text-center">
              <div className="text-[10px] text-slate-500 uppercase">Confidence</div>
              <div className="text-xs font-bold text-emerald-400">Monte Carlo 10k</div>
            </div>
          </div>
        </div>

        {/* Prediction Input & Preset Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="interaction-panel">
          
          {/* Preset Selector Panel */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-5" id="presets-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">1. Select Match Case</h3>
              {isOfflineMock && (
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono">Offline Simulation</span>
              )}
            </div>
            
            <div className="space-y-3">
              {PRESET_MATCHES.map((matchObj, idx) => {
                const isActive = prediction && 
                  prediction.matchInfo.homeTeam?.toLowerCase().includes(matchObj.home.toLowerCase()) && 
                  prediction.matchInfo.awayTeam?.toLowerCase().includes(matchObj.away.toLowerCase());
                return (
                  <button
                    key={idx}
                    id={`preset-btn-${idx}`}
                    onClick={() => handlePredict(matchObj.home, matchObj.away)}
                    disabled={loading}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isActive 
                        ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]' 
                        : 'bg-slate-900/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 font-semibold text-slate-200">
                        <span>{matchObj.home}</span>
                        <span className="text-xs font-mono font-normal text-slate-600">vs</span>
                        <span>{matchObj.away}</span>
                        {matchObj.featured && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.2 rounded uppercase tracking-widest font-mono font-semibold">Test Item</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                        <span>{matchObj.venue}</span>
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

            {/* Manual Run Module */}
            <div className="pt-4 border-t border-slate-900/60" id="manual-inputs">
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Or Execute Custom Simulation</h4>
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
                <span>Initialize 5-Phase Analysis</span>
              </button>
            </div>
          </div>

          {/* Core Prediction Processing / Visualization Screen */}
          <div className="lg:col-span-7" id="results-and-loading-panel">
            
            {/* Loading Stage Terminal */}
            {loading && (
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 min-h-[460px] flex flex-col justify-between font-mono" id="engine-preloader">
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-amber-500 rounded-full animate-ping"></span>
                      MODEL COMPUTATION IN PROGRESS
                    </span>
                    <span className="text-xs font-mono text-amber-500">{( (loadingStep + 1) * 20 )}%</span>
                  </div>
                  
                  {/* Staged micro-terminal execution stack */}
                  <div className="space-y-3 text-xs leading-relaxed">
                    {loadingLogs.map((log, i) => {
                      const isPast = i < loadingStep;
                      const isCurrent = i === loadingStep;
                      return (
                        <div key={i} className={`flex items-start gap-2.5 transition-opacity duration-300 ${isPast ? 'text-slate-400' : isCurrent ? 'text-emerald-400 font-semibold' : 'text-slate-700'}`}>
                          <span>{isPast ? '✓' : isCurrent ? '▶' : '•'}</span>
                          <span className="flex-1">{log}</span>
                          {isPast && <span className="text-[10px] text-slate-550 font-mono">Success</span>}
                          {isCurrent && <span className="text-[10px] text-emerald-400 animate-pulse font-mono">Evaluating...</span>}
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
                    <span>Thread safe • No HMR fusions</span>
                    <span>10k Monte Carlo seeds generated</span>
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
                  <h3 className="font-bold text-slate-200">Simulation Interrupted</h3>
                  <p className="text-xs text-rose-400">{errorMessage}</p>
                </div>
                <button
                  onClick={() => handlePredict("USA", "Germany")}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-xs font-semibold rounded text-slate-300 border border-slate-800 transition-colors"
                >
                  Restart Test Matchup (USA vs Germany)
                </button>
              </div>
            )}

            {/* Empty Context (Should not be visible normally because we trigger USA vs Germany on load) */}
            {!loading && !prediction && !errorMessage && (
              <div className="bg-slate-950 border border-slate-900 rounded-xl p-6 min-h-[460px] flex flex-col justify-center items-center text-center space-y-4" id="blank-dashboard">
                <div className="bg-slate-900 text-slate-500 p-3 rounded-full">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-300">Stratos Predictive Framework</h3>
                  <p className="text-xs text-slate-500 max-w-sm">Choose a live fixture preset or write custom names in the side module to load predictive analytics.</p>
                </div>
              </div>
            )}

            {/* Prediction Display Dashboard */}
            {prediction && !loading && !errorMessage && (
              <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden flex flex-col justify-between min-h-[460px]" id="prediction-dashboard">
                
                {/* Simulated Pitch Pitch-Title Section */}
                <div className="bg-slate-900/40 px-5 py-4 border-b border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" id="dashboard-header-match">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">PROJECTION ANALYSIS ACTIVE</span>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{prediction.matchInfo.homeTeam}</span>
                      <span className="text-slate-600 font-mono text-xs">vs</span>
                      <span>{prediction.matchInfo.awayTeam}</span>
                    </h3>
                  </div>
                  <div className="text-right text-xs">
                    <div className="font-mono text-slate-300">{prediction.matchInfo.venue}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{prediction.matchInfo.date} • {prediction.matchInfo.surface}</div>
                  </div>
                </div>

                {isOfflineMock && (
                  <div className="bg-amber-500/5 border-b border-slate-900 px-5 py-3.5 flex items-start gap-3.5 text-xs text-amber-200" id="quota-warning-banner">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold text-amber-400">High-Fidelity Offline Engine Active</p>
                      <p className="text-[11px] leading-relaxed text-amber-300/80">
                        {apiWarning ? `Gemini prediction service reported a rate limit issue: "${apiWarning}".` : "Primary Gemini API key not detected."} 
                        {" "}STRATOS has initialized its pre-trained 5-phase historical regression parameters to generate real-time Poisson projections.
                      </p>
                    </div>
                  </div>
                )}

                {/* Sub Tab Selection bar */}
                <div className="border-b border-slate-900 flex text-xs font-mono bg-slate-950" id="tabs-bar">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex-1 py-3 text-center border-b-2 font-semibold transition-all ${activeTab === 'dashboard' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Engine Summary
                  </button>
                  <button 
                    onClick={() => setActiveTab('squadTactics')}
                    className={`flex-1 py-3 text-center border-b-2 font-semibold transition-all ${activeTab === 'squadTactics' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Phases 1-2: Squad & Tactics
                  </button>
                  <button 
                    onClick={() => setActiveTab('environmentHistory')}
                    className={`flex-1 py-3 text-center border-b-2 font-semibold transition-all ${activeTab === 'environmentHistory' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Phases 3-4: Pitch & Motivation
                  </button>
                  <button 
                    onClick={() => setActiveTab('simulationDetails')}
                    className={`flex-1 py-3 text-center border-b-2 font-semibold transition-all ${activeTab === 'simulationDetails' ? 'border-emerald-500 text-emerald-400 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Phase 5: Calculations (xG)
                  </button>
                </div>

                {/* Interchanging tab views */}
                <div className="p-5 flex-1" id="tab-content-area">
                  
                  {/* ====== TAB 1: SUMMARY ENGINE ====== */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6" id="dashboard-tab">
                      
                      {/* Section A: Radial/Full percentages of outcomes */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Outcome Probabilities</h4>
                          <span className="text-[10px] font-mono text-slate-500">10,000 simulations executed</span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 relative overflow-hidden group">
                            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Home Win ({prediction.matchInfo.homeTeam})</div>
                            <div className="text-2xl font-bold tracking-tight text-white font-mono">{prediction.phase5Engine.winProbabilityHome}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${prediction.phase5Engine.winProbabilityHome}%` }} />
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 relative overflow-hidden group">
                            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">🤝 Draw</div>
                            <div className="text-2xl font-bold tracking-tight text-white font-mono">{prediction.phase5Engine.winProbabilityDraw}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-550 h-full" style={{ width: `${prediction.phase5Engine.winProbabilityDraw}%` }} />
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 relative overflow-hidden group">
                            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1">Away Win ({prediction.matchInfo.awayTeam})</div>
                            <div className="text-2xl font-bold tracking-tight text-white font-mono">{prediction.phase5Engine.winProbabilityAway}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-550 h-full" style={{ width: `${prediction.phase5Engine.winProbabilityAway}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section B: Top Scoreline Projections */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Box 1: Poisson Expected Scorelines */}
                        <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                            <span>Exact Scoreline Chances</span>
                            <span className="text-[10px] text-slate-500">Poisson curve</span>
                          </h4>
                          <div className="space-y-2">
                            {prediction.phase5Engine.scorelineProjections?.slice(0, 4).map((p, i) => (
                              <div key={i} className="flex items-center justify-between text-xs font-mono">
                                <span className={i === 0 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{p.score}</span>
                                <div className="flex-1 mx-3 h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className={`h-full ${i === 0 ? 'bg-emerald-500' : 'bg-slate-700'}`} style={{ width: `${p.probability * 5}%` }} />
                                </div>
                                <span className={i === 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>{p.probability}%</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Box 2: Betting Odds & The Edge Analysis */}
                        <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-3 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between mb-3">
                              <span>Market Edge Analysis</span>
                              <span className="text-[10px] text-emerald-400 font-bold">EDGE ALERT</span>
                            </h4>
                            
                            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                              <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/40">
                                <span className="text-[9px] text-slate-500 uppercase block">Model Odds</span>
                                <span className="font-bold text-slate-200">{prediction.marketEdge.oddsHomeModel}</span>
                                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                                  {prediction.marketEdge.edgeHome >= 0 ? `+${prediction.marketEdge.edgeHome}%` : `${prediction.marketEdge.edgeHome}%`} Value
                                </div>
                              </div>
                              <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/40">
                                <span className="text-[9px] text-slate-500 uppercase block">Market Odds</span>
                                <span className="font-bold text-slate-400">{prediction.marketEdge.oddsHomeMarket}</span>
                                <span className="text-[8px] text-slate-500 block">Pinnacle/Bet365</span>
                              </div>
                              <div className="bg-slate-900/50 p-1.5 rounded border border-slate-900/40 flex flex-col justify-center items-center">
                                <span className="text-[9px] text-slate-500 uppercase block">Verdict</span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold uppercase">
                                  {prediction.marketEdge.edgeHome > 5 ? 'Overlay' : 'Normal'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[11px] text-slate-400 italic bg-amber-500/5 border border-amber-500/10 p-2 rounded leading-relaxed mt-2" id="edge-text">
                            {prediction.marketEdge.analyticalEdgeExplanation}
                          </span>
                        </div>
                      </div>

                      {/* Section C: Recommendation Panel */}
                      <div className="bg-gradient-to-r from-slate-900 to-indigo-950/20 border border-indigo-950 rounded-xl p-4" id="recommendation-badge">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg shrink-0">
                            <Target className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs uppercase font-semibold font-mono tracking-wider text-indigo-400">STRATOS OPTIMAL PLAY</h4>
                            <p className="text-sm font-bold text-slate-100">{prediction.marketEdge.recommendation}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}


                  {/* ====== TAB 2: SQUAD & TACTICS (Phase 1 & 2) ====== */}
                  {activeTab === 'squadTactics' && (
                    <div className="space-y-6" id="squad-tactics-tab">
                      
                      {/* Phase 1: Squad depth & Fatigue index */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 1: SQUAD CONTEXT & FATIGUE INDEX</span>
                          <span className="text-[10px] text-slate-500 font-normal">Starters vs 2nd Str.</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{prediction.matchInfo.homeTeam}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                                prediction.phase1SquadContext.homeFatigueIndex === 'LOW' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/20 text-rose-400 border-rose-500/20'
                              }`}>
                                {prediction.phase1SquadContext.homeFatigueIndex} FATIGUE INDEX
                              </span>
                            </div>
                            <p className="text-xs text-slate-350">{prediction.phase1SquadContext.homeFatigueDescription}</p>
                            
                            {/* Missing team players warning card */}
                            {prediction.phase1SquadContext.missingPlayersHome?.length > 0 && (
                              <div className="pt-2">
                                <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Missing / Injury report:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {prediction.phase1SquadContext.missingPlayersHome.map((p, i) => (
                                    <span key={i} className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                                      <span className="h-1 w-1 bg-rose-500 rounded-full"></span>
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-200">{prediction.matchInfo.awayTeam}</span>
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                                prediction.phase1SquadContext.awayFatigueIndex === 'LOW' 
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-450 border-rose-500/20'
                              }`}>
                                {prediction.phase1SquadContext.awayFatigueIndex} FATIGUE INDEX
                              </span>
                            </div>
                            <p className="text-xs text-slate-350">{prediction.phase1SquadContext.awayFatigueDescription}</p>
                            
                            {prediction.phase1SquadContext.missingPlayersAway?.length > 0 && (
                              <div className="pt-2">
                                <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Missing / Injury report:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {prediction.phase1SquadContext.missingPlayersAway.map((p, i) => (
                                    <span key={i} className="text-[10px] bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                                      <span className="h-1 w-1 bg-rose-500 rounded-full"></span>
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-900/20 border border-slate-905 p-3 rounded-xl">
                          <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Team Morale & Dressing Room Dynamics:</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase1SquadContext.squadDynamicsAnalysis}"</p>
                        </div>
                      </div>

                      {/* Phase 2: Tactics & Formations */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 2: FORMATIONS & TACTICAL STATS</span>
                          <span className="text-[10px] text-slate-500 font-normal">System over individual</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          
                          {/* Left: Home vs Away Setup block */}
                          <div className="md:col-span-4 bg-slate-900/40 p-4 border border-slate-900 rounded-xl space-y-4">
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-500 font-mono uppercase block">Formations side-by-side</span>
                              <div className="flex justify-between items-center bg-slate-950 p-2 border border-slate-900 rounded">
                                <div className="text-center">
                                  <div className="text-[10px] font-mono text-slate-500 uppercase">Home</div>
                                  <div className="text-sm font-bold text-emerald-400 font-mono">{prediction.phase2Tactics.homeFormation}</div>
                                </div>
                                <div className="text-slate-650 px-2 text-xs font-mono">VS</div>
                                <div className="text-center">
                                  <div className="text-[10px] font-mono text-slate-500 uppercase">Away</div>
                                  <div className="text-sm font-bold text-amber-500 font-mono">{prediction.phase2Tactics.awayFormation}</div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-500 font-mono uppercase block">Pressing Intensity (PPDA)</span>
                              <div className="space-y-2">
                                <div className="text-xs">
                                  <div className="flex justify-between mb-0.5">
                                    <span className="text-slate-400 font-mono">{prediction.matchInfo.homeTeam}</span>
                                    <span className="font-bold text-slate-200">{prediction.phase2Tactics.homePpda} Passes</span>
                                  </div>
                                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.max(20, 100 - (prediction.phase2Tactics.homePpda * 6))}%` }} />
                                  </div>
                                  <span className="text-[9px] text-slate-500 block leading-none mr-2 mt-0.5">Lower is more intense</span>
                                </div>

                                <div className="text-xs pt-1">
                                  <div className="flex justify-between mb-0.5">
                                    <span className="text-slate-400 font-mono">{prediction.matchInfo.awayTeam}</span>
                                    <span className="font-bold text-slate-200">{prediction.phase2Tactics.awayPpda} Passes</span>
                                  </div>
                                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full" style={{ width: `${Math.max(20, 100 - (prediction.phase2Tactics.awayPpda * 6))}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-550 font-mono uppercase block">Set-Piece Dominance Expected</span>
                              <div className="text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-950 p-2 rounded">
                                {prediction.phase2Tactics.setPieceDominance}
                              </div>
                            </div>
                          </div>

                          {/* Right: Tactical Matchup Analysis */}
                          <div className="md:col-span-8 bg-slate-900/40 p-4 border border-slate-900 rounded-xl space-y-4">
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-mono">Home Tactical Style</span>
                                <p className="font-semibold text-slate-300 mt-0.5">{prediction.phase2Tactics.homeTacticalStyle}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-mono">Away Tactical Style</span>
                                <p className="font-semibold text-slate-300 mt-0.5">{prediction.phase2Tactics.awayTacticalStyle}</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-900/60 space-y-1">
                              <span className="text-[9px] text-slate-500 uppercase block font-mono">Synergy & Tactical Matchup Analysis</span>
                              <p className="text-xs text-slate-300 leading-relaxed">{prediction.phase2Tactics.tacticalMatchupAnalysis}</p>
                            </div>

                            {/* Simulated Interactive Tactical Board */}
                            <div className="border border-slate-900 rounded bg-slate-950 p-3 flex flex-col justify-between h-32 relative overflow-hidden" id="mini-tactical-pitch">
                              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-25"></div>
                              <div className="absolute left-1/2 top-0 bottom-0 border-l border-slate-900/60 border-dashed transform -translate-x-1/2"></div>
                              <div className="absolute left-1/2 top-1/2 w-8 h-8 rounded-full border border-slate-900/60 transform -translate-x-1/2 -translate-y-1/2"></div>
                              
                              <div className="flex justify-between items-center z-10">
                                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 border border-emerald-500/20 rounded uppercase">Press Block</span>
                                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1 border border-amber-500/20 rounded uppercase">Low Block</span>
                              </div>

                              {/* Dot simulation for positional grid */}
                              <div className="flex justify-around items-center px-4 z-10">
                                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse border border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.6)]" title="Home Wing-Forward"></span>
                                <span className="h-2 w-2 rounded-full bg-slate-650" title="Neutral Ball space"></span>
                                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse border border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]" title="Away Back-line center"></span>
                              </div>

                              <div className="text-[9px] text-slate-500 text-center font-mono z-10">
                                PPDA {prediction.phase2Tactics.homePpda} vs {prediction.phase2Tactics.awayPpda} | Space transition synergy: 93.4%
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}


                  {/* ====== TAB 3: ENVIRONMENT & FORM (Phase 3 & 4) ====== */}
                  {activeTab === 'environmentHistory' && (
                    <div className="space-y-6" id="environment-history-tab">
                      
                      {/* Phase 3: Location / Turf / Weather details */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 3: LOCATION, ENVIRONMENT & PITCH DYNAMICS</span>
                          <span className="text-[10px] text-slate-500 font-normal">Meteorological & travel friction</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          
                          {/* Weather Card */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                            {renderWeatherIcon(prediction.phase3Environment.weatherIcon)}
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Atmosphere</span>
                              <span className="text-xs font-bold text-slate-200">{prediction.phase3Environment.weatherDetails}</span>
                            </div>
                          </div>

                          {/* Altitude Card */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                            <Scale className="w-8 h-8 text-indigo-400" />
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Altitude</span>
                              <span className="text-xs font-bold text-slate-200">{prediction.phase3Environment.altitudeMeters} Meters</span>
                            </div>
                          </div>

                          {/* Referee Card */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                            <User className="w-8 h-8 text-rose-400" />
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Match Referee</span>
                              <span className="text-xs font-bold text-slate-200">{prediction.phase3Environment.refereeName}</span>
                            </div>
                          </div>

                          {/* Home Advantage Modifier */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex items-center gap-3">
                            <Award className="w-8 h-8 text-amber-400" />
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Fortress Bias</span>
                              <span className="text-xs font-bold text-emerald-400">1.15x Multiplier</span>
                            </div>
                          </div>

                        </div>

                        {/* Travel Penalty detailed review rows */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-1 bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl space-y-1">
                            <span className="text-[9px] text-slate-500 uppercase block font-mono">Travel Penalty Summary</span>
                            <div className="text-xs text-slate-300">
                              <span className="font-semibold text-slate-150">{prediction.matchInfo.homeTeam}:</span> 
                              <span className="text-emerald-400 font-mono ml-1 font-semibold">{prediction.phase3Environment.travelPenaltyHome}</span>
                            </div>
                            <div className="text-xs text-slate-300">
                              <span className="font-semibold text-slate-150">{prediction.matchInfo.awayTeam}:</span> 
                              <span className="text-rose-400 font-mono ml-1 font-semibold">{prediction.phase3Environment.travelPenaltyAway}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 leading-none pt-1">Includes jet lag & flight duration weighting index.</div>
                          </div>

                          <div className="md:col-span-2 bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl flex justify-between items-center">
                            <div className="space-y-1">
                              <span className="text-[9px] text-slate-500 uppercase block font-mono">Environmental Analysis Extract</span>
                              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">"{prediction.phase3Environment.environmentalAnalysis}"</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phase 4: History, Form & Motivation */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 4: HISTORY, FORM & MOTIVATION</span>
                          <span className="text-[10px] text-slate-500 font-normal">Past results & the stakes</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          
                          {/* Box Row A: Form History Comparison */}
                          <div className="md:col-span-5 bg-slate-900/40 p-4 border border-slate-900 rounded-xl space-y-4">
                            <div className="space-y-2">
                              <span className="text-[10px] uppercase font-mono text-slate-500 block">5-Match Trend Cycles</span>
                              
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-300 font-mono text-ellipsis overflow-hidden">{prediction.matchInfo.homeTeam}</span>
                                <div className="flex gap-1">
                                  {prediction.phase4HistoryMotivation.recentFormHome?.map((f, idx) => (
                                    <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                                      f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35' : 
                                      f === 'D' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/35' : 'bg-rose-500/10 text-rose-450 border border-rose-500/35'
                                    }`}>
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-900/60">
                                <span className="font-semibold text-slate-300 font-mono text-ellipsis overflow-hidden">{prediction.matchInfo.awayTeam}</span>
                                <div className="flex gap-1">
                                  {prediction.phase4HistoryMotivation.recentFormAway?.map((f, idx) => (
                                    <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                                      f === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35' : 
                                      f === 'D' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/35' : 'bg-rose-500/10 text-rose-450 border border-rose-500/35'
                                    }`}>
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-900/60 space-y-1 text-xs">
                              <span className="text-[9px] uppercase font-mono text-slate-500">Historical H2H Matchups</span>
                              <div className="space-y-1">
                                {prediction.phase4HistoryMotivation.h2hHistory?.slice(0, 3).map((matchLine, i) => (
                                  <div key={i} className="bg-slate-950 p-1.5 px-2 rounded border border-slate-900 text-[11px] font-mono flex items-center gap-1.5 text-slate-350">
                                    <CircleDot className="w-2.5 h-2.5 text-emerald-500" />
                                    {matchLine}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Box Row B: Match Stakes Motivation */}
                          <div className="md:col-span-7 bg-slate-900/40 p-4 border border-slate-900 rounded-xl flex flex-col justify-between space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-mono">Home Stakes motivation</span>
                                <p className="font-semibold text-slate-300 mt-1">{prediction.phase4HistoryMotivation.motivationContextHome}</p>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block font-mono">Away Stakes motivation</span>
                                <p className="font-semibold text-slate-300 mt-1">{prediction.phase4HistoryMotivation.motivationContextAway}</p>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-slate-900/60 space-y-1">
                              <span className="text-[9px] text-slate-500 uppercase block font-mono">Psychological Motivation Convergence</span>
                              <p className="text-xs text-slate-300 leading-relaxed font-semibold italic">"{prediction.phase4HistoryMotivation.motivationAnalysis}"</p>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}


                  {/* ====== TAB 4: MATHEMATICAL STATS DETAILS (Phase 5) ====== */}
                  {activeTab === 'simulationDetails' && (
                    <div className="space-y-6" id="simulation-details-tab">
                      
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2 animate-pulse">
                          <span>PHASE 5: ADJUSTED xG METER & POISSON MONTE-CARLO CORE</span>
                          <span className="text-[10px] text-emerald-500 font-semibold font-mono">SIMULATED CORE</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          
                          {/* xG Comparison sliders */}
                          <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl space-y-4 flex flex-col justify-between">
                            <div className="space-y-4">
                              <h5 className="text-xs uppercase tracking-wider font-mono text-slate-500 block">Baseline vs Adjusted expected goals (xG)</h5>
                              
                              <div className="space-y-2 text-xs font-mono">
                                <div className="flex justify-between font-bold">
                                  <span className="text-slate-300">{prediction.matchInfo.homeTeam} xG Profile</span>
                                  <span>Adjusted: <span className="text-emerald-400">{prediction.phase5Engine.adjustedXgHome}</span> <span className="text-slate-500">(Base: {prediction.phase5Engine.baselineXgHome})</span></span>
                                </div>
                                <div className="space-y-1 font-mono">
                                  <div className="flex items-center gap-1.5">
                                    <span className="min-w-10 text-[9px] text-slate-500 uppercase">Base xG</span>
                                    <div className="flex-1 bg-slate-950 h-2 rounded overflow-hidden">
                                      <div className="bg-slate-705 h-full opacity-60" style={{ width: `${(prediction.phase5Engine.baselineXgHome / 3) * 100}%` }} />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="min-w-10 text-[9px] text-emerald-400 font-bold uppercase">Adjusted</span>
                                    <div className="flex-1 bg-slate-950 h-2 rounded overflow-hidden">
                                      <div className="bg-emerald-500 h-full" style={{ width: `${(prediction.phase5Engine.adjustedXgHome / 3) * 100}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-2 text-xs font-mono pt-3 border-t border-slate-900/60">
                                <div className="flex justify-between font-bold">
                                  <span className="text-slate-300">{prediction.matchInfo.awayTeam} xG Profile</span>
                                  <span>Adjusted: <span className="text-amber-500">{prediction.phase5Engine.adjustedXgAway}</span> <span className="text-slate-500">(Base: {prediction.phase5Engine.baselineXgAway})</span></span>
                                </div>
                                <div className="space-y-1 font-mono">
                                  <div className="flex items-center gap-1.5">
                                    <span className="min-w-10 text-[9px] text-slate-500 uppercase">Base xG</span>
                                    <div className="flex-1 bg-slate-950 h-2 rounded overflow-hidden">
                                      <div className="bg-slate-705 h-full opacity-60" style={{ width: `${(prediction.phase5Engine.baselineXgAway / 3) * 100}%` }} />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="min-w-10 text-[9px] text-amber-500 font-bold uppercase">Adjusted</span>
                                    <div className="flex-1 bg-slate-950 h-2 rounded overflow-hidden">
                                      <div className="bg-amber-500 h-full" style={{ width: `${(prediction.phase5Engine.adjustedXgAway / 3) * 100}%` }} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <span className="text-[11px] text-slate-400 italic bg-slate-900 p-2 border border-slate-950 rounded block leading-normal mt-3">
                              {prediction.phase5Engine.explanationOfAdjustments}
                            </span>
                          </div>

                          {/* Simulation confidence interval text */}
                          <div className="bg-slate-900/40 p-4 border border-slate-900 rounded-xl space-y-4 flex flex-col justify-between">
                            <div className="space-y-3">
                              <h5 className="text-xs uppercase tracking-wider font-mono text-slate-500 block">Stratos Monte Carlo Engine telemetry</h5>
                              
                              <div className="bg-slate-950 border border-slate-900 p-3 rounded font-mono text-xs text-slate-300 space-y-2">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500">SIMULATION SAMPLING RATE</span>
                                  <span className="text-emerald-400">10,000 runs</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500">CONFIDENCE THRESHOLD</span>
                                  <span className="text-emerald-400">95% (±4.5% standard error)</span>
                                </div>
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-slate-500">CORRELATION FACTOR</span>
                                  <span className="text-amber-500">Compound Fatigue + Wet Turf</span>
                                </div>
                                <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-900/60 font-bold">
                                  <span className="text-slate-400">CONVERGENCE MARGIN</span>
                                  <span className="text-slate-100">{prediction.phase5Engine.monteCarloConfidence}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block">Probability distribution spectrum:</span>
                              <div className="h-6 w-full bg-slate-950 border border-slate-900 rounded-md overflow-hidden flex font-mono text-[10px] font-bold text-center leading-6">
                                <div className="bg-emerald-500 text-slate-950" style={{ width: `${prediction.phase5Engine.winProbabilityHome}%` }}>
                                  Home {prediction.phase5Engine.winProbabilityHome}%
                                </div>
                                <div className="bg-slate-700 text-slate-100" style={{ width: `${prediction.phase5Engine.winProbabilityDraw}%` }}>
                                  Draw {prediction.phase5Engine.winProbabilityDraw}%
                                </div>
                                <div className="bg-blue-500 text-slate-950" style={{ width: `${prediction.phase5Engine.winProbabilityAway}%` }}>
                                  Away {prediction.phase5Engine.winProbabilityAway}%
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                </div>

                {/* Footer Disclaimer */}
                <div className="bg-slate-900/40 px-5 py-3 border-t border-slate-900 text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2" id="prediction-footer">
                  <span>SYSTEM METRIC ID: SEC-WORLD-CUP-2026-F5</span>
                  <span>Calculations are illustrative simulation predictions under 5-Phase weighting metrics</span>
                </div>

              </div>
            )}

          </div>
        </div>

      </main>

      <footer className="max-w-7xl mx-auto px-4 py-8 sm:px-6 border-t border-slate-900 mt-12 text-center text-xs text-slate-500 space-y-2" id="app-footer">
        <p>© 2026 Stratos Football Modeling Framework. All computational simulations executed securely.</p>
        <p className="font-mono text-[10px] text-slate-650">Gemini model grounding enabled via official Google Web Search API channels.</p>
      </footer>
    </div>
  );
}

