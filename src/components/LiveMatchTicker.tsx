import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tv, X, Minimize2, Maximize2, Activity, Play, RefreshCw, Sparkles } from 'lucide-react';

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string; // e.g., "45", "45+2", "73"
  isHalftime: boolean;
  isFinished?: boolean;
}

interface LiveMatchTickerProps {
  onMatchSelect?: (match: LiveMatch) => void;
}

export const LiveMatchTicker: React.FC<LiveMatchTickerProps> = ({ onMatchSelect }) => {
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [tickerSpeed, setTickerSpeed] = useState<number>(1); // simulation speed multiplier
  const [matches, setMatches] = useState<LiveMatch[]>([
    { id: "1", homeTeam: "Spain", awayTeam: "Germany", homeScore: 1, awayScore: 0, minute: "43", isHalftime: false },
    { id: "2", homeTeam: "Sweden", awayTeam: "USA", homeScore: 1, awayScore: 2, minute: "45+1", isHalftime: false },
    { id: "3", homeTeam: "Mexico", awayTeam: "France", homeScore: 0, awayScore: 0, minute: "HT", isHalftime: true },
    { id: "4", homeTeam: "Brazil", awayTeam: "Japan", homeScore: 2, awayScore: 1, minute: "87", isHalftime: false }
  ]);
  const [recentGoal, setRecentGoal] = useState<{ team: string; matchId: string; time: string } | null>(null);

  // Dynamic ticking simulator
  useEffect(() => {
    const intervalTime = 8000 / tickerSpeed; // default 8s per game minute tick
    const timer = setInterval(() => {
      setMatches(prevMatches => {
        return prevMatches.map(match => {
          if (match.isFinished) return match;

          let nextMin = match.minute;
          let nextHomeScore = match.homeScore;
          let nextAwayScore = match.awayScore;
          let nextIsHalftime = match.isHalftime;
          let nextIsFinished = match.isFinished;

          // Standard parsing of match minutes
          if (match.minute === "HT") {
            // 15% chance to resume to 2nd half 46'
            if (Math.random() < 0.25) {
              nextMin = "46";
              nextIsHalftime = false;
            }
          } else if (match.minute.includes("+")) {
            // Stoppage time parsing e.g. "45+2"
            const parts = match.minute.split("+");
            const base = parseInt(parts[0], 10);
            const extra = parseInt(parts[1], 10);
            if (extra >= 4) {
              nextMin = "HT";
              nextIsHalftime = true;
            } else {
              nextMin = `${base}+${extra + 1}`;
            }
          } else if (match.minute === "90" || match.minute === "90+4") {
            const isNinetieth = match.minute === "90";
            if (isNinetieth) {
              nextMin = "90+1";
            } else {
              nextMin = "FT";
              nextIsFinished = true;
            }
          } else if (match.minute.startsWith("90+")) {
            const extra = parseInt(match.minute.split("+")[1], 10);
            if (extra >= 4) {
              nextMin = "FT";
              nextIsFinished = true;
            } else {
              nextMin = `90+${extra + 1}`;
            }
          } else {
            const numericMin = parseInt(match.minute, 10);
            if (numericMin === 45) {
              nextMin = "45+1";
            } else {
              const inc = numericMin + 1;
              nextMin = String(inc);

              // Accidental goal trigger! 4% probability on each tick
              if (Math.random() < 0.04) {
                const isHomeGoal = Math.random() < 0.55;
                if (isHomeGoal) {
                  nextHomeScore += 1;
                  triggerGoalToast(match.homeTeam, match.id, nextMin);
                } else {
                  nextAwayScore += 1;
                  triggerGoalToast(match.awayTeam, match.id, nextMin);
                }
              }
            }
          }

          return {
            ...match,
            minute: nextMin,
            homeScore: nextHomeScore,
            awayScore: nextAwayScore,
            isHalftime: nextIsHalftime,
            isFinished: nextIsFinished
          };
        });
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [tickerSpeed]);

  const triggerGoalToast = (team: string, id: string, minuteStr: string) => {
    setRecentGoal({ team, matchId: id, time: minuteStr });
    setTimeout(() => {
      setRecentGoal(null);
    }, 4500);
  };

  const handleMatchClick = (match: LiveMatch) => {
    if (onMatchSelect) {
      onMatchSelect(match);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm w-full sm:w-[320px]" id="live-match-ticker-panel">
      {/* Toast Notification for Live Goals */}
      <AnimatePresence>
        {recentGoal && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mb-2 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-lg p-2.5 shadow-2xl border border-emerald-500/30 flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <span className="text-yellow-300 animate-bounce">⚡</span>
              <div>
                <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-emerald-100 opacity-80">GOAL ALERT</div>
                <div className="text-xs font-bold leading-normal">{recentGoal.team} scores! ({recentGoal.time}')</div>
              </div>
            </div>
            <button 
              onClick={() => setRecentGoal(null)} 
              className="text-white/60 hover:text-white p-0.5 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-slate-950/90 border border-slate-900 rounded-lg shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-350">
        {/* Header Grid */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-900 bg-slate-950/95">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono font-bold flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-rose-500" />
                In-Play Feeds Live
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5">
            {/* Speed toggle */}
            <button
              onClick={() => setTickerSpeed(prev => prev === 1 ? 3 : prev === 3 ? 6 : 1)}
              className="bg-slate-900 text-[8px] font-mono text-slate-400 px-1.5 py-0.5 rounded border border-slate-800 hover:border-slate-700 active:bg-slate-800 hover:text-white transition-colors"
              title="Change game minute progression pace"
            >
              SPEED: {tickerSpeed}x
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-slate-405 hover:text-slate-100 p-1 hover:bg-slate-900 rounded transition-colors"
              id="ticker-toggle-min"
              aria-label="Toggle live widget size"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Matches Body container */}
        <AnimatePresence initial={false}>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-2 space-y-1.5 max-h-[190px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-900 pr-1 select-none">
                {matches.map((match) => (
                  <div 
                    key={match.id} 
                    onClick={() => handleMatchClick(match)}
                    className="group flex items-center justify-between bg-slate-900/40 border border-slate-900 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all rounded px-2.5 py-2 cursor-pointer relative overflow-hidden"
                  >
                    {/* Hover glow effect line */}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-200" />

                    <div className="flex-1 flex flex-col space-y-1.5 text-xs font-semibold text-slate-205">
                      <div className="flex justify-between items-center pr-3">
                        <span className="truncate max-w-[120px] text-slate-350 tracking-wide text-[11px] font-sans group-hover:text-white transition-colors">{match.homeTeam}</span>
                        <span className="font-mono font-bold text-center text-[12px] text-emerald-400 w-4 bg-slate-950/45 rounded py-0.5 px-1">{match.homeScore}</span>
                      </div>
                      <div className="flex justify-between items-center pr-3">
                        <span className="truncate max-w-[120px] text-slate-350 tracking-wide text-[11px] font-sans group-hover:text-white transition-colors">{match.awayTeam}</span>
                        <span className="font-mono font-bold text-center text-[12px] text-emerald-400 w-4 bg-slate-950/45 rounded py-0.5 px-1">{match.awayScore}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end pl-2.5 border-l border-slate-900/90 h-8 justify-center min-w-[54px]">
                      <span className={`text-[10px] font-mono font-bold ${
                        match.isFinished 
                          ? 'text-slate-500' 
                          : match.isHalftime 
                            ? 'text-amber-450 animate-pulse' 
                            : 'text-emerald-400'
                      }`}>
                        {match.minute === 'FT' ? 'FT' : match.minute === 'HT' ? 'HT' : `${match.minute}'`}
                      </span>
                      <span className="text-[7.5px] text-slate-505 font-mono tracking-wider font-semibold opacity-70 group-hover:opacity-100 group-hover:text-emerald-400 transition-all flex items-center gap-0.5 mt-0.5">
                        {match.isFinished ? (
                          'ENDED'
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                            ANALYZE
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-3 py-1.5 border-t border-slate-900 bg-slate-950/90 text-center text-[8.5px] text-slate-500 font-mono tracking-wide leading-relaxed">
                <span className="text-emerald-505 font-bold">PRO-TIP:</span> Click any live match card above to immediately inject and trigger a real-time 10k deep-pass assessment.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isMinimized && (
          <div 
            onClick={() => setIsMinimized(false)}
            className="p-2 text-center text-[9px] font-mono font-bold text-slate-300 hover:text-white bg-slate-955/80 cursor-pointer flex items-center justify-center gap-1.5 hover:bg-slate-900/60 transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>EXSTEND IN-PLAY TELEMETRY ({matches.filter(m => !m.isFinished).length} ACTIVE)</span>
          </div>
        )}
      </div>
    </div>
  );
};
