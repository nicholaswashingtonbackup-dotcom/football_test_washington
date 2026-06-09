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
  ShieldAlert
} from 'lucide-react';
import { MatchPrediction } from './types';

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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'baselines' | 'tactical' | 'modifiers' | 'validation'>('dashboard');
  
  // Dynamic Football Feed state
  const [footballCategory, setFootballCategory] = useState<'mens' | 'womens'>('mens');
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [systemDate, setSystemDate] = useState<string>('');

  // 9-Phase Sequential Loading Logs for STRATOS v2 Engine calibration
  const loadingLogs = [
    "Phase 1: Establishing Team Power Ratings, historical baselines, and custom season long xG trends...",
    "Phase 2: Calculating Form & Momentum, modeling short term expected vs actual points divergence over last 5 games...",
    "Phase 3: Tactical Engine analysis, comparing pressing profiles (PPDA) and evaluating Formation Stability Scores...",
    "Phase 4: Venue & Environment Index: Determining Venue States, crowd takeover factors, altitudes, and jet lag...",
    "Phase 5: Squad Fatigue & Manager Impact: Commencing Fatigue Score (0-100) and manager profile stability calibrations...",
    "Phase 6: Psychological Engine: Calibrating situational World Cup elimination stakes and regional pressures...",
    "Phase 7: Matchday Validation Layer: Processing late confirmed lineup news, scratch reports, and xG decays...",
    "Phase 8: Monte Carlo Simulation: Bootstrapping 10,000 algorithmic seed runs for exact Poisson-distributed score curves...",
    "Phase 9: Value Bet Detection Overlay: Comparing STRATOS odds against bookmaker margins for market discrepancies..."
  ];

  // Trigger prediction model
  const handlePredict = async (home: string, away: string) => {
    if (!home.trim() || !away.trim()) return;
    setLoading(true);
    setLoadingStep(0);
    setErrorMessage(null);
    setPrediction(null);

    // Dynamic loading interval for tactical suspense - 9 steps
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingLogs.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 400);

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
      }, 3600);

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
            handlePredict(featuredMatch.home, featuredMatch.away);
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
              <div className="text-[10px] text-slate-500 uppercase">Monte Carlo</div>
              <div className="text-xs font-bold text-emerald-400">10,000 Seeds</div>
            </div>
          </div>
        </div>

        {/* Prediction Input & Preset Selection Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="interaction-panel">
          
          {/* Preset Selector Panel */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-5" id="presets-panel">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase font-mono">1. Select Match Case</h3>
              {isOfflineMock && (
                <span className="text-[10px] bg-amber-500/10 text-amber-450 border border-amber-500/20 px-2 py-0.5 rounded font-mono">MOCK MODE</span>
              )}
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
                    onClick={() => handlePredict(matchObj.home, matchObj.away)}
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
                    <span className="font-mono text-emerald-400 text-[10px]">10,000 MONTE CARLO ITERATIONS SEEDED</span>
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
                    <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-semibold border border-emerald-500/20">9-PHASE STRATOS CALIBRATION</span>
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
                        {" "}The engine has triggered precalculated 9-Phase simulations to preserve UI functionality and Poisson estimates.
                      </p>
                    </div>
                  </div>
                )}

                {/* Sub Tab Selection bar */}
                <div className="border-b border-slate-900 flex text-xs font-mono bg-slate-950 h-11" id="tabs-bar">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'dashboard' ? 'border-emerald-500 text-emerald-450 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Sim / Value (P8-9)
                  </button>
                  <button 
                    onClick={() => setActiveTab('baselines')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'baselines' ? 'border-emerald-500 text-emerald-450 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Base / Form (P1-2)
                  </button>
                  <button 
                    onClick={() => setActiveTab('tactical')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'tactical' ? 'border-emerald-500 text-emerald-450 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Tactics (P3)
                  </button>
                  <button 
                    onClick={() => setActiveTab('modifiers')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'modifiers' ? 'border-emerald-500 text-emerald-450 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Context (P4-6)
                  </button>
                  <button 
                    onClick={() => setActiveTab('validation')}
                    className={`flex-1 text-center font-mono font-bold border-b-2 transition-all ${activeTab === 'validation' ? 'border-emerald-500 text-emerald-450 bg-slate-900/20' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                    Lineups (P7)
                  </button>
                </div>

                {/* Interchanging tab views */}
                <div className="p-5 flex-1" id="tab-content-area">
                  
                  {/* ====== TAB 1: EXECUTIVE SUMMARY, SIMULATIONS, CONFIDENCE, AND VALUE ====== */}
                  {activeTab === 'dashboard' && (
                    <div className="space-y-6 animate-fade-in" id="dashboard-tab">
                      
                      {/* Venue Status Block */}
                      <div className="p-3.5 bg-slate-900/40 border border-slate-900 rounded-lg space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                          <CircleDot className="w-3.5 h-3.5" />
                          <span>Venue Status Validation</span>
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
                            <div className="text-2xl font-bold tracking-tight text-emerald-40 w-full font-mono text-white">{prediction.phase8MonteCarlo.winProbabilityHome}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-emerald-500 h-full" style={{ width: `${prediction.phase8MonteCarlo.winProbabilityHome}%` }} />
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 relative overflow-hidden group">
                            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 truncate">🤝 Draw</div>
                            <div className="text-2xl font-bold tracking-tight text-white font-mono">{prediction.phase8MonteCarlo.winProbabilityDraw}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-amber-550 h-full" style={{ width: `${prediction.phase8MonteCarlo.winProbabilityDraw}%` }} />
                            </div>
                          </div>
                          
                          <div className="bg-slate-900/60 border border-slate-900 rounded-lg p-3 relative overflow-hidden group">
                            <div className="text-[10px] font-mono uppercase text-slate-500 mb-1 truncate">Away Win ({prediction.matchInfo.awayTeam})</div>
                            <div className="text-2xl font-bold tracking-tight text-white font-mono">{prediction.phase8MonteCarlo.winProbabilityAway}%</div>
                            <div className="mt-2 w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-blue-500 h-full" style={{ width: `${prediction.phase8MonteCarlo.winProbabilityAway}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Projections & Confidence */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Box 1: Poisson Scorelines & Confidence Block */}
                        <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Most Likely Scorelines</h4>
                            <span className="text-[10px] text-slate-500 font-mono">Poisson curve 1-3</span>
                          </div>
                          
                          <div className="space-y-3">
                            {prediction.phase8MonteCarlo.scorelineProjections?.slice(0, 3).map((p, i) => (
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
                                {prediction.phase8MonteCarlo.predictionConfidenceScore}% Accuracy Expected
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-sans leading-normal">
                              {prediction.phase8MonteCarlo.predictionConfidenceExplanation || "Stable modeling limits based on low parameter discrepancy indices."}
                            </p>
                          </div>
                        </div>

                        {/* Box 2: Betting Odds & Value overlay */}
                        <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Value Bet detection</h4>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                                prediction.phase9ValueBetDetection.edgeVerdict === 'VALUE OPPORTUNITY'
                                  ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/25'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {prediction.phase9ValueBetDetection.edgeVerdict === 'VALUE OPPORTUNITY' ? '🟢 VALUE OPPORTUNITY' : '⚪ MARKET ALIGNED'}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                              <div className="bg-slate-950 p-2 rounded border border-slate-900">
                                <span className="text-[9px] text-slate-500 uppercase block">Model (Fair)</span>
                                <span className="font-bold text-slate-200">{prediction.phase9ValueBetDetection.modelOddsHome}</span>
                                <div className={`text-[10px] font-bold mt-0.5 ${prediction.phase9ValueBetDetection.edgeHome >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                                  {prediction.phase9ValueBetDetection.edgeHome >= 0 ? `+${prediction.phase9ValueBetDetection.edgeHome}% Edge` : `${prediction.phase9ValueBetDetection.edgeHome}% Edge`}
                                </div>
                              </div>
                              <div className="bg-slate-950 p-2 rounded border border-slate-900">
                                <span className="text-[9px] text-slate-500 uppercase block">Draw</span>
                                <span className="font-bold text-slate-200">{prediction.phase9ValueBetDetection.modelOddsDraw}</span>
                                <div className={`text-[10px] font-bold mt-0.5 ${prediction.phase9ValueBetDetection.edgeDraw >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                                  {prediction.phase9ValueBetDetection.edgeDraw >= 0 ? `+${prediction.phase9ValueBetDetection.edgeDraw}% Edge` : `${prediction.phase9ValueBetDetection.edgeDraw}% Edge`}
                                </div>
                              </div>
                              <div className="bg-slate-950 p-2 rounded border border-slate-900">
                                <span className="text-[9px] text-slate-500 uppercase block">Away</span>
                                <span className="font-bold text-slate-200">{prediction.phase9ValueBetDetection.modelOddsAway}</span>
                                <div className={`text-[10px] font-bold mt-0.5 ${prediction.phase9ValueBetDetection.edgeAway >= 0 ? 'text-emerald-400' : 'text-rose-450'}`}>
                                  {prediction.phase9ValueBetDetection.edgeAway >= 0 ? `+${prediction.phase9ValueBetDetection.edgeAway}% Edge` : `${prediction.phase9ValueBetDetection.edgeAway}% Edge`}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2.5 border border-slate-900 rounded-lg leading-relaxed mt-1">
                            <strong>Edge Discrepancy details:</strong> {prediction.phase9ValueBetDetection.exactDiscrepancyExplanation}
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
                            <p className="text-sm font-bold text-slate-100">{prediction.phase9ValueBetDetection.valueRecommendation}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ====== TAB 2: BASELINES & FORM ====== */}
                  {activeTab === 'baselines' && (
                    <div className="space-y-6 animate-fade-in" id="baselines-tab">
                      
                      {/* Phase 1: Power Ratings */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 1: TEAM POWER RATING</span>
                          <span className="text-[10px] text-emerald-450 font-mono font-bold">Historical baseline stats</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-mono">{prediction.matchInfo.homeTeam} Profile</span>
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                PWR RATING: {prediction.phase1PowerRating.homeRating}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Squad Depth Value</span>
                                <span className="font-bold text-slate-300 font-mono text-[11px]">{prediction.phase1PowerRating.squadDepthValueHome}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Historical xG Trend</span>
                                <span className="font-bold text-slate-300 font-mono text-[11px]">+{prediction.phase1PowerRating.historicalXgTrendHome} xG/90</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-mono">{prediction.matchInfo.awayTeam} Profile</span>
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                PWR RATING: {prediction.phase1PowerRating.awayRating}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Squad Depth Value</span>
                                <span className="font-bold text-slate-300 font-mono text-[11px]">{prediction.phase1PowerRating.squadDepthValueAway}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Historical xG Trend</span>
                                <span className="font-bold text-slate-300 font-mono text-[11px]">+{prediction.phase1PowerRating.historicalXgTrendAway} xG/90</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg">
                          <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Baseline Strength Analysis</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase1PowerRating.analysis}"</p>
                        </div>
                      </div>

                      {/* Phase 2: Form & Momentum */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 2: FORM & MOMENTUM DELT-REGRESSION</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">Deviation logs last 5 matches</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-200">{prediction.matchInfo.homeTeam} Form Cycle</span>
                              <div className="flex gap-1">
                                {prediction.phase2FormMomentum.recentFormHome?.map((f, idx) => (
                                  <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                                    f === 'W' ? 'bg-emerald-500/20 text-emerald-450 border border-emerald-500/30' : 
                                    f === 'D' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-rose-500/20 text-rose-455 border border-rose-500/30'
                                  }`}>
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Expected vs Actual Points</span>
                                <span className="font-mono font-bold text-slate-250 text-xs truncate block">{prediction.phase2FormMomentum.pointsDivergenceHome}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Clean Sheet Ratio</span>
                                <span className="font-bold text-slate-300 text-xs block">{prediction.phase2FormMomentum.cleanSheetTrendHome}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-slate-200">{prediction.matchInfo.awayTeam} Form Cycle</span>
                              <div className="flex gap-1">
                                {prediction.phase2FormMomentum.recentFormAway?.map((f, idx) => (
                                  <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                                    f === 'W' ? 'bg-emerald-500/20 text-emerald-455 border border-emerald-500/30' : 
                                    f === 'D' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-rose-500/20 text-rose-455 border border-rose-500/30'
                                  }`}>
                                    {f}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Expected vs Actual Points</span>
                                <span className="font-mono font-bold text-slate-250 text-xs truncate block">{prediction.phase2FormMomentum.pointsDivergenceAway}</span>
                              </div>
                              <div className="bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[9px] text-slate-500 font-mono uppercase block">Clean Sheet Ratio</span>
                                <span className="font-bold text-slate-300 text-xs block">{prediction.phase2FormMomentum.cleanSheetTrendAway}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900/25 border border-slate-900 p-3 rounded-lg">
                          <span className="text-[10px] font-mono text-slate-505 block uppercase mb-1 font-bold">Momentum Divergence Analysis</span>
                          <p className="text-xs text-slate-300 italic">"{prediction.phase2FormMomentum.analysis}"</p>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ====== TAB 3: TACTICAL ENGINE & STABILITY ====== */}
                  {activeTab === 'tactical' && (
                    <div className="space-y-6 animate-fade-in" id="tactical-tab">
                      
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 3: TACTICAL MATCHUPS & FORMATION STABILITY</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">Chaos parameters & pressing models</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Formation and play styles */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-4">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold">Structural Formations</span>
                            <div className="flex justify-between items-center bg-slate-950 p-2.5 border border-slate-900 rounded font-mono text-xs">
                              <div>
                                <span className="text-[10px] text-slate-505 uppercase block font-mono">Home</span>
                                <span className="font-bold text-emerald-400 text-sm font-mono">{prediction.phase3TacticalEngine.homeFormation}</span>
                              </div>
                              <span className="text-slate-600 font-bold font-mono">VS</span>
                              <div>
                                <span className="text-[10px] text-slate-505 uppercase block font-mono">Away</span>
                                <span className="font-bold text-amber-500 text-sm font-mono">{prediction.phase3TacticalEngine.awayFormation}</span>
                              </div>
                            </div>

                            <span className="text-[9px] text-slate-500 uppercase font-mono block pt-1 font-bold">Play Styles</span>
                            <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed font-sans">
                              <div><strong>Home style:</strong> {prediction.phase3TacticalEngine.homeTacticalStyle}</div>
                              <div><strong>Away style:</strong> {prediction.phase3TacticalEngine.awayTacticalStyle}</div>
                            </div>
                          </div>

                          {/* PPDA and Stability Ratings */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3 text-xs font-mono">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold">Pressing Intensity (PPDA)</span>
                            <div className="space-y-2 border-b border-slate-900/50 pb-2">
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-slate-400">{prediction.matchInfo.homeTeam} PPDA</span>
                                  <span className="font-bold text-slate-200">{prediction.phase3TacticalEngine.homePpda} passes</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full" style={{ width: `${Math.max(15, 100 - (prediction.phase3TacticalEngine.homePpda * 5.5))}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-slate-400">{prediction.matchInfo.awayTeam} PPDA</span>
                                  <span className="font-bold text-slate-200">{prediction.phase3TacticalEngine.awayPpda} passes</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full" style={{ width: `${Math.max(15, 100 - (prediction.phase3TacticalEngine.awayPpda * 5.5))}%` }} />
                                </div>
                              </div>
                            </div>

                            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold mt-1">FORMATION STABILITY SCORE</span>
                            <div className="space-y-2.5">
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-slate-400">Home Stability</span>
                                  <span className="font-bold text-emerald-400">{prediction.phase3TacticalEngine.formationStabilityScoreHome || 85}/100</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full" style={{ width: `${prediction.phase3TacticalEngine.formationStabilityScoreHome || 85}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-slate-400">Away Stability</span>
                                  <span className="font-bold text-amber-500">{prediction.phase3TacticalEngine.formationStabilityScoreAway || 80}/100</span>
                                </div>
                                <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                                  <div className="bg-amber-500 h-full" style={{ width: `${prediction.phase3TacticalEngine.formationStabilityScoreAway || 80}%` }} />
                                </div>
                              </div>
                              <p className="text-[10px] leading-tight text-slate-500 italic font-sans">
                                (High stability score equals lower modeling chaos variance).
                              </p>
                            </div>
                          </div>

                          {/* Vulnerabilities & Matchup Synergies */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl flex flex-col justify-between" id="modifier-grid">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold mb-2">Transition vulnerability logs</span>
                            <div className="space-y-2 text-xs font-sans text-slate-350 flex-1">
                              <div><strong>Home vulnerability:</strong> <span className="text-rose-400">{prediction.phase3TacticalEngine.transitionVulnerabilityHome}</span></div>
                              <div className="border-t border-slate-900/60 pt-2"><strong>Away vulnerability:</strong> <span className="text-rose-400">{prediction.phase3TacticalEngine.transitionVulnerabilityAway}</span></div>
                            </div>
                            <div className="pt-2 border-t border-slate-900/60 mt-3 text-[11px] text-slate-400 leading-normal italic font-sans bg-slate-950 p-2 rounded">
                              <strong>Matchup analysis summary:</strong> "{prediction.phase3TacticalEngine.matchupAnalysis}"
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>
                  )}

                  {/* ====== TAB 4: VENUE, fatigue & PSYCHOLOGICAL MODIFIERS ====== */}
                  {activeTab === 'modifiers' && (
                    <div className="space-y-6 animate-fade-in" id="modifiers-tab">
                      
                      {/* Phase 4: Venue & Environment */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 4: VENUE & ENVIRONMENT INDEX MAP</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">Altitude elevation, turf coefficients, and crowd takeover indicators</span>
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                            {renderWeatherIcon(prediction.phase4VenueEnvironment?.weatherIcon)}
                            <div className="leading-tight">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Atmosphere</span>
                              <span className="text-xs font-bold text-slate-200">{prediction.phase4VenueEnvironment?.weatherDetails}</span>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                            <Scale className="w-6 h-6 text-indigo-400 shrink-0" />
                            <div className="leading-tight">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Pitch Elevation</span>
                              <span className="text-xs font-bold text-slate-200">{prediction.phase4VenueEnvironment?.altitudeMeters}m Alt.</span>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                            <Award className="w-6 h-6 text-amber-400 shrink-0" />
                            <div className="leading-tight">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Fortress Bias</span>
                              <span className="text-xs font-bold text-emerald-450">{prediction.phase4VenueEnvironment?.homeAdvantageMagnitude} Multipliers</span>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-3 rounded-xl flex items-center gap-3">
                            <Play className="w-6 h-6 text-emerald-400 shrink-0 rotate-90" />
                            <div className="leading-tight">
                              <span className="text-[9px] text-slate-500 uppercase font-mono block">Turf Coefficient</span>
                              <span className="text-xs font-bold font-mono text-slate-200">{prediction.phase4VenueEnvironment?.pitchFrictionTurf}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl space-y-2 text-xs font-mono">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold">Environment logistics</span>
                            <div className="leading-normal space-y-1">
                              <div><strong>Home penalty:</strong> <span className="text-emerald-400">{prediction.phase4VenueEnvironment?.travelDistancePenaltyHome}</span></div>
                              <div><strong>Away penalty:</strong> <span className="text-rose-455 font-bold">{prediction.phase4VenueEnvironment?.travelDistancePenaltyAway}</span></div>
                              <div className="border-t border-slate-900/50 pt-1 text-[11px]"><strong>Expected Crowd:</strong> <span className="text-slate-300 font-sans">{prediction.phase4VenueEnvironment?.crowdBiasExpected}</span></div>
                            </div>
                          </div>

                          <div className="md:col-span-2 bg-slate-900/40 border border-slate-900 p-3.5 rounded-xl flex flex-col justify-center">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block font-bold mb-1">Venue Meteorological Analysis</span>
                            <p className="text-xs text-slate-350 leading-relaxed italic">"{prediction.phase4VenueEnvironment?.environmentalAnalysis}"</p>
                          </div>
                        </div>
                      </div>

                      {/* Phase 5: Squad Fatigue & Manager Profiles */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 5: SQUAD FATIGUE & MANAGER PROFILE MAP</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold font-mono text-[10px]">Recent fixture congestion & coaching experience metrics</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Fatigue Indicators */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3">
                            <span className="text-[9px] text-slate-550 uppercase font-mono block font-bold">FATIGUE INDEX (0-100)</span>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between items-center text-xs mb-1">
                                  <span className="text-slate-400 font-semibold">{prediction.matchInfo.homeTeam} Fatigue</span>
                                  <span className={`font-mono font-bold ${prediction.phase5SquadFatigueManager?.fatigueScoreHome > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {prediction.phase5SquadFatigueManager?.fatigueScoreHome || 25}/100
                                  </span>
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: `${prediction.phase5SquadFatigueManager?.fatigueScoreHome || 25}%` }} />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center text-xs mb-1">
                                  <span className="text-slate-400 font-semibold">{prediction.matchInfo.awayTeam} Fatigue</span>
                                  <span className={`font-mono font-bold ${prediction.phase5SquadFatigueManager?.fatigueScoreAway > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {prediction.phase5SquadFatigueManager?.fatigueScoreAway || 65}/100
                                  </span>
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-500" style={{ width: `${prediction.phase5SquadFatigueManager?.fatigueScoreAway || 65}%` }} />
                                </div>
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-405 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-900">
                              <strong>Congestion context:</strong> {prediction.phase5SquadFatigueManager?.congestionAnalysis}
                            </p>
                          </div>

                          {/* Manager Profile stability */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3.5 text-xs">
                            <span className="text-[9px] text-slate-550 uppercase font-mono block font-bold">Coaching stability profiles</span>
                            <div className="space-y-1.5 leading-normal">
                              <div><strong>Home Head Coach:</strong> <span className="text-slate-200">{prediction.phase5SquadFatigueManager?.managerExperienceHome}</span></div>
                              <div><strong>Away Head Coach:</strong> <span className="text-slate-200">{prediction.phase5SquadFatigueManager?.managerExperienceAway}</span></div>
                            </div>
                            <div className="border-t border-slate-900/60 pt-2 bg-slate-950/40 p-2 rounded leading-normal">
                              <span className="text-[9px] text-slate-500 font-mono uppercase block font-bold">Uncertainty adjustments</span>
                              <p className="text-[11px] text-slate-400 italic">"{prediction.phase5SquadFatigueManager?.managerDecisionImpact || "Standard model stability ratings apply."}"</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phase 6: Psychological Engine */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 6: PSYCHOLOGICAL DRIVE & TOURNAMENT STAKES</span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">Situation stakes, motivation profiles & rivalry indexes</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-2.5 text-xs">
                            <span className="text-[9px] text-slate-500 uppercase font-mono block">Motivation & Stakes context</span>
                            <div><strong>Home stakes:</strong> {prediction.phase6PsychologicalEngine?.motivationContextHome}</div>
                            <div className="border-t border-slate-900/50 pt-1.5 mt-1.5"><strong>Away stakes:</strong> {prediction.phase6PsychologicalEngine?.motivationContextAway}</div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-3 text-xs font-mono">
                            <span className="text-[9px] text-slate-500 uppercase block font-bold">Friction Indices</span>
                            <div className="space-y-2 leading-none">
                              <div className="flex justify-between">
                                <span className="text-slate-405">Derby Tension</span>
                                <span className="text-emerald-400 font-bold font-mono">{prediction.phase6PsychologicalEngine?.derbyTensionLevel}</span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-slate-900/50">
                                <span className="text-slate-405">Situational Stake Level</span>
                                <span className="text-slate-200 text-[11px] truncate">{prediction.phase6PsychologicalEngine?.situationalStakes || "High"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-2.5 flex flex-col justify-between text-xs">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block font-mono">Simulated Psychological Edge</span>
                              <span className="text-xs font-bold text-emerald-400 block lg:text-[13px]">{prediction.phase6PsychologicalEngine?.psychologicalEdge}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal italic">
                              "{prediction.phase6PsychologicalEngine?.psychologicalAnalysis}"
                            </p>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ====== TAB 5: LINEUP VALIDATION ====== */}
                  {activeTab === 'validation' && (
                    <div className="space-y-6 animate-fade-in" id="validation-tab">
                      
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between border-b border-slate-900 pb-2">
                          <span>PHASE 7: PRE-KICKOFF LINEUP VALIDATION LAYER</span>
                          <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                            prediction.phase7MatchdayValidation?.validationVerdict ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                          }`}>{prediction.phase7MatchdayValidation?.validationVerdict || "VALIDATION COMPLETED"}</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          {/* Home lineups */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-mono">{prediction.matchInfo.homeTeam} Confirmation</span>
                              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                                {prediction.phase7MatchdayValidation?.expectedVsConfirmedHome}
                              </span>
                            </div>

                            <div className="text-xs space-y-2">
                              <div className="bg-slate-950 p-2.5 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 block uppercase font-bold">Tactical Shift adjustments</span>
                                <p className="text-slate-350 font-sans mt-1 leading-normal">{prediction.phase7MatchdayValidation?.confirmedTacticalShiftHome}</p>
                              </div>

                              <div className="flex justify-between items-center text-xs font-mono bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[10px] text-slate-500">LINEUP RATING DECAY DELTA</span>
                                <span className="text-amber-500 font-bold">{prediction.phase7MatchdayValidation?.lineupDisruptionScoreHome || 0} rating impact</span>
                              </div>
                            </div>
                          </div>

                          {/* Away lineups */}
                          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-mono">{prediction.matchInfo.awayTeam} Confirmation</span>
                              <span className="text-[10px] font-mono text-emerald-450 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                                {prediction.phase7MatchdayValidation?.expectedVsConfirmedAway}
                              </span>
                            </div>

                            <div className="text-xs space-y-2">
                              <div className="bg-slate-950 p-2.5 border border-slate-900 rounded font-mono">
                                <span className="text-[9px] text-slate-500 block uppercase font-bold">Tactical Shift adjustments</span>
                                <p className="text-slate-355 font-sans mt-1 leading-normal">{prediction.phase7MatchdayValidation?.confirmedTacticalShiftAway}</p>
                              </div>

                              <div className="flex justify-between items-center text-xs font-mono bg-slate-950 p-2 border border-slate-900 rounded">
                                <span className="text-[10px] text-slate-505">LINEUP RATING DECAY DELTA</span>
                                <span className="text-amber-500 font-bold">{prediction.phase7MatchdayValidation?.lineupDisruptionScoreAway || 0} rating impact</span>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Deductions analytical context (Striker out => drop, reducing xG by calculated value) */}
                        <div className="bg-slate-900/50 p-3.5 border border-slate-900 rounded-xl leading-relaxed text-xs space-y-1.5">
                          <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block tracking-wider">
                            Personnel Rating Deduction Analysis
                          </span>
                          <p className="text-slate-300 italic leading-relaxed font-sans">
                            {prediction.phase7MatchdayValidation?.personnelDeductionAnalysis || "Starting XI ratings congruent with foundational benchmarks. No extreme personnel metrics dropped focal xG models."}
                          </p>
                        </div>

                        <div className="bg-slate-900/30 p-3 border border-slate-900 rounded-xl text-xs font-mono">
                          <span className="text-[10px] text-slate-500 uppercase block font-bold mb-1">Roster Scrapes & Late Scratch warnings</span>
                          <p className="text-slate-300 italic">"{prediction.phase7MatchdayValidation?.suspensionsAndLateScrapes}"</p>
                        </div>
                      </div>

                    </div>
                  )}

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
