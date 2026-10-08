import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerWeekStats, NFLGame } from '../types';
import { 
  Target, 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Trophy, 
  BarChart3, 
  Activity, 
  Sparkles,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface WeekMatchupSnapshotProps {
  currentWeek: number;
  coreyWeekStats: PlayerWeekStats;
  joelWeekStats: PlayerWeekStats;
  games?: NFLGame[];
}

export const WeekMatchupSnapshot: React.FC<WeekMatchupSnapshotProps> = ({
  currentWeek,
  coreyWeekStats,
  joelWeekStats,
  games = [],
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const isCoreyLeadingWeek = coreyWeekStats.pts > joelWeekStats.pts;
  const isJoelLeadingWeek = joelWeekStats.pts > coreyWeekStats.pts;
  const isTied = coreyWeekStats.pts === joelWeekStats.pts;
  const pointDiff = Math.abs(coreyWeekStats.pts - joelWeekStats.pts);

  // Remaining potential points
  const coreyRemaining = coreyWeekStats.pos ?? (coreyWeekStats.pot - coreyWeekStats.pts);
  const joelRemaining = joelWeekStats.pos ?? (joelWeekStats.pot - joelWeekStats.pts);
  const totalRemaining = coreyRemaining + joelRemaining;

  // Forecasted points (if games ended right now: locked pts + live leading)
  const coreyForecast = coreyWeekStats.forecastedPts ?? (coreyWeekStats.pts + (coreyWeekStats.liveLeadingPts ?? 0));
  const joelForecast = joelWeekStats.forecastedPts ?? (joelWeekStats.pts + (joelWeekStats.liveLeadingPts ?? 0));
  const forecastDiff = Math.abs(coreyForecast - joelForecast);

  // Best-case scenario points (Ceiling: win all remaining)
  const coreyBestCase = coreyWeekStats.bestCasePts ?? (coreyWeekStats.pts + coreyRemaining);
  const joelBestCase = joelWeekStats.bestCasePts ?? (joelWeekStats.pts + joelRemaining);

  // Worst-case scenario points (Floor: lose all remaining)
  const coreyWorstCase = coreyWeekStats.worstCasePts ?? coreyWeekStats.pts;
  const joelWorstCase = joelWeekStats.worstCasePts ?? joelWeekStats.pts;

  // Live and finished game status
  const totalLiveGames = (coreyWeekStats.liveGamesCount ?? 0) + (joelWeekStats.liveGamesCount ?? 0);
  const totalDecidedGames = coreyWeekStats.wins + coreyWeekStats.losses + joelWeekStats.wins + joelWeekStats.losses;
  const totalGamesInWeek = games.length > 0 ? games.length : (coreyWeekStats.totalGames + joelWeekStats.totalGames);
  const isWeekComplete = totalRemaining === 0 && totalDecidedGames > 0;

  // Clinch mathematical logic
  const coreyClinched = coreyWeekStats.pts > joelBestCase && totalDecidedGames > 0;
  const joelClinched = joelWeekStats.pts > coreyBestCase && totalDecidedGames > 0;

  // Magic points required to guarantee victory
  const coreyMagicNumber = Math.max(0, joelBestCase - coreyWeekStats.pts + 1);
  const joelMagicNumber = Math.max(0, coreyBestCase - joelWeekStats.pts + 1);

  return (
    <section className="bg-slate-950/90 border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-md">
          
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                Week {currentWeek} Matchup Snapshot
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              {totalLiveGames > 0 && (
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>{totalLiveGames} Live Now</span>
                </span>
              )}

              {isWeekComplete ? (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/60 border border-blue-600/40 text-blue-300 font-medium">
                  <Lock className="w-3 h-3 text-blue-400" />
                  <span>Finalized</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                  {totalDecidedGames} of {totalGamesInWeek} Final
                </span>
              )}

              {totalRemaining > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                  {totalRemaining} pts left on board
                </span>
              )}
            </div>
          </div>

          {/* Head to Head Matchup Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            
            {/* Corey Card */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isCoreyLeadingWeek
                  ? 'bg-gradient-to-br from-blue-950/60 to-slate-900/90 border-blue-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow">
                    C
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-blue-300 leading-tight">Corey</span>
                      {isCoreyLeadingWeek && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          +{pointDiff} pts
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {coreyWeekStats.wins}W - {coreyWeekStats.losses}L
                      {coreyWeekStats.pending > 0 && ` • ${coreyWeekStats.pending} to play`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-2xl font-black text-blue-400">{coreyWeekStats.pts}</span>
                    <span className="text-xs text-slate-400">pts</span>
                  </div>

                  {/* Remaining Potential Points Pill */}
                  <div className="mt-0.5 flex items-center justify-end gap-1">
                    {coreyRemaining > 0 ? (
                      <span 
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md"
                        title={`${coreyRemaining} potential points can still be earned in live and upcoming games`}
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>+{coreyRemaining} remaining</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                        0 remaining
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 ml-1">/ {coreyWeekStats.pot} pot</span>
                  </div>
                </div>
              </div>

              {/* Quick Glance Metrics Row */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/70 grid grid-cols-3 gap-1 text-[11px] text-slate-400">
                <div>
                  <span className="text-[10px] text-slate-500 block">Pt Rate</span>
                  <strong className="text-slate-200 font-semibold">{coreyWeekStats.ptPct}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Win Rate</span>
                  <strong className="text-slate-200 font-semibold">{coreyWeekStats.gmPct}%</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Ceiling (Max)</span>
                  <strong className="text-emerald-400 font-bold">{coreyBestCase} pts</strong>
                </div>
              </div>
            </div>

            {/* Joel Card */}
            <div
              className={`p-3.5 rounded-xl border transition ${
                isJoelLeadingWeek
                  ? 'bg-gradient-to-br from-rose-950/60 to-slate-900/90 border-rose-500/50 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-rose-600 text-white text-xs font-black flex items-center justify-center shadow">
                    J
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-rose-300 leading-tight">Joel</span>
                      {isJoelLeadingWeek && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          +{pointDiff} pts
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {joelWeekStats.wins}W - {joelWeekStats.losses}L
                      {joelWeekStats.pending > 0 && ` • ${joelWeekStats.pending} to play`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="text-2xl font-black text-rose-400">{joelWeekStats.pts}</span>
                    <span className="text-xs text-slate-400">pts</span>
                  </div>

                  {/* Remaining Potential Points Pill */}
                  <div className="mt-0.5 flex items-center justify-end gap-1">
                    {joelRemaining > 0 ? (
                      <span 
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md"
                        title={`${joelRemaining} potential points can still be earned in live and upcoming games`}
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>+{joelRemaining} remaining</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                        0 remaining
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 ml-1">/ {joelWeekStats.pot} pot</span>
                  </div>
                </div>
              </div>

              {/* Quick Glance Metrics Row */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/70 grid grid-cols-3 gap-1 text-[11px] text-slate-400">
                <div>
                  <span className="text-[10px] text-slate-500 block">Pt Rate</span>
                  <strong className="text-slate-200 font-semibold">{joelWeekStats.ptPct}%</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Win Rate</span>
                  <strong className="text-slate-200 font-semibold">{joelWeekStats.gmPct}%</strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Ceiling (Max)</span>
                  <strong className="text-emerald-400 font-bold">{joelBestCase} pts</strong>
                </div>
              </div>
            </div>

          </div>

          {/* Current Matchup Narrative Ribbon */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300 font-medium">
                {isTied ? (
                  <span>
                    Matchup is currently <strong className="text-amber-300 font-bold">all square</strong> at{' '}
                    <strong className="text-white">{coreyWeekStats.pts} pts</strong>
                  </span>
                ) : isCoreyLeadingWeek ? (
                  <span>
                    <strong className="text-blue-400 font-bold">Corey</strong> leads by{' '}
                    <strong className="text-white">{pointDiff} pt{pointDiff > 1 ? 's' : ''}</strong>
                    {joelRemaining > 0 && (
                      <span className="text-slate-400 ml-1.5">
                        (Joel has <strong className="text-amber-300">{joelRemaining} pts</strong> remaining)
                      </span>
                    )}
                  </span>
                ) : (
                  <span>
                    <strong className="text-rose-400 font-bold">Joel</strong> leads by{' '}
                    <strong className="text-white">{pointDiff} pt{pointDiff > 1 ? 's' : ''}</strong>
                    {coreyRemaining > 0 && (
                      <span className="text-slate-400 ml-1.5">
                        (Corey has <strong className="text-amber-300">{coreyRemaining} pts</strong> remaining)
                      </span>
                    )}
                  </span>
                )}
              </span>
            </div>

            {/* Quick Live Forecast Pill */}
            {!isWeekComplete && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-cyan-400" />
                <span>Live Pace Forecast:</span>
                <strong className={coreyForecast > joelForecast ? 'text-blue-300' : coreyForecast < joelForecast ? 'text-rose-300' : 'text-amber-300'}>
                  {coreyForecast > joelForecast 
                    ? `Corey ${coreyForecast} - ${joelForecast} (+${forecastDiff})`
                    : joelForecast > coreyForecast 
                    ? `Joel ${joelForecast} - ${coreyForecast} (+${forecastDiff})`
                    : `Tie ${coreyForecast} - ${joelForecast}`}
                </strong>
              </span>
            )}
          </div>

          {/* Toggle Collapsible "More" Button */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              id="toggle-week-analytics-btn"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>
                  {isExpanded 
                    ? 'Hide Advanced Week Analytics & Projections' 
                    : 'Show More Week Analytics (Forecasts, Best-Case Ceilings & Point Matrix)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isExpanded && (
                  <span className="text-[10px] text-slate-400 font-normal px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/60 hidden sm:inline-block">
                    Live Forecast • Ceilings • Clinch Math
                  </span>
                )}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
                )}
              </div>
            </button>
          </div>

          {/* Collapsible Expanded Analytical Sub-Section */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3 pt-3 border-t border-slate-800/90 space-y-3"
              >
                {/* 1. Projections & Scenarios Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Forecast: If Games Ended Right Now */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Live Forecast</span>
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded font-medium">
                          If Ended Now
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mb-3">
                        Points earned + live in-progress games where your pick is currently ahead.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                        <span className="text-blue-300 font-semibold">Corey</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px]">({coreyWeekStats.pts} locked + {coreyWeekStats.liveLeadingPts ?? 0} live) =</span>
                          <strong className="text-blue-400 font-bold text-sm">{coreyForecast} pts</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                        <span className="text-rose-300 font-semibold">Joel</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px]">({joelWeekStats.pts} locked + {joelWeekStats.liveLeadingPts ?? 0} live) =</span>
                          <strong className="text-rose-400 font-bold text-sm">{joelForecast} pts</strong>
                        </div>
                      </div>

                      <div className="text-center pt-1 text-[11px]">
                        {coreyForecast > joelForecast ? (
                          <span className="text-blue-300 font-medium">
                            Corey on track to win by <strong>{forecastDiff} pt{forecastDiff > 1 ? 's' : ''}</strong>
                          </span>
                        ) : joelForecast > coreyForecast ? (
                          <span className="text-rose-300 font-medium">
                            Joel on track to win by <strong>{forecastDiff} pt{forecastDiff > 1 ? 's' : ''}</strong>
                          </span>
                        ) : (
                          <span className="text-amber-300 font-medium">
                            Projected dead heat tie at {coreyForecast} pts
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Best-Case Scenario (Ceiling) */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Best-Case Scenario</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-1.5 py-0.2 rounded font-medium">
                          Ceiling
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mb-3">
                        Maximum possible points achievable if player wins 100% of remaining games.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                        <span className="text-blue-300 font-semibold">Corey Max</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px]">({coreyWeekStats.pts} + {coreyRemaining} rem) =</span>
                          <strong className="text-emerald-400 font-bold text-sm">{coreyBestCase} pts</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900/90 border border-slate-800">
                        <span className="text-rose-300 font-semibold">Joel Max</span>
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-[11px]">({joelWeekStats.pts} + {joelRemaining} rem) =</span>
                          <strong className="text-emerald-400 font-bold text-sm">{joelBestCase} pts</strong>
                        </div>
                      </div>

                      <div className="text-center pt-1 text-[11px] text-slate-400">
                        Floor (Worst-Case): Corey <strong className="text-slate-200">{coreyWorstCase}</strong> • Joel <strong className="text-slate-200">{joelWorstCase}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Clinch & Mathematical Status */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Clinch &amp; Outcome Math</span>
                        </span>
                        <span className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded font-medium">
                          Week Math
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-tight mb-3">
                        Magic points needed to secure the weekly matchup victory.
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      {isWeekComplete ? (
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-center">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                          <span className="font-bold text-white block">Week {currentWeek} Complete</span>
                          <span className="text-[11px] text-slate-400">
                            {isCoreyLeadingWeek ? 'Corey won the week' : isJoelLeadingWeek ? 'Joel won the week' : 'Week ended in a tie'}
                          </span>
                        </div>
                      ) : coreyClinched ? (
                        <div className="p-2 rounded-lg bg-blue-950/70 border border-blue-500/50 text-center">
                          <Trophy className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                          <span className="font-bold text-blue-200 block">Corey Clinched Victory!</span>
                          <span className="text-[11px] text-blue-300/80">Uncatchable lead for Week {currentWeek}</span>
                        </div>
                      ) : joelClinched ? (
                        <div className="p-2 rounded-lg bg-rose-950/70 border border-rose-500/50 text-center">
                          <Trophy className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                          <span className="font-bold text-rose-200 block">Joel Clinched Victory!</span>
                          <span className="text-[11px] text-rose-300/80">Uncatchable lead for Week {currentWeek}</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-400">Corey clinch target:</span>
                            <span className="font-bold text-blue-300">
                              {coreyMagicNumber > 0 ? `${coreyMagicNumber} more pts` : 'Clinched'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-slate-400">Joel clinch target:</span>
                            <span className="font-bold text-rose-300">
                              {joelMagicNumber > 0 ? `${joelMagicNumber} more pts` : 'Clinched'}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 text-center pt-1">
                        Bonus: Underdog (+1 pt) &amp; Prime Time (+1 pt)
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. Detailed Point & Slate Breakdown Matrix */}
                <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Point Allocation &amp; Slate Matrix</span>
                  </h4>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-400">
                          <th className="pb-1.5 font-semibold text-blue-400">Corey</th>
                          <th className="pb-1.5 text-center font-semibold text-slate-300">Metric</th>
                          <th className="pb-1.5 text-right font-semibold text-rose-400">Joel</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850 text-slate-300 text-xs">
                        <tr>
                          <td className="py-1.5 font-bold text-blue-400">{coreyWeekStats.pts} pts</td>
                          <td className="py-1.5 text-center text-slate-400">Points Finalized &amp; Locked</td>
                          <td className="py-1.5 text-right font-bold text-rose-400">{joelWeekStats.pts} pts</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-semibold text-amber-300">+{coreyWeekStats.pointsInPlay ?? 0} pts</td>
                          <td className="py-1.5 text-center text-slate-400">Points Currently In-Play (Live)</td>
                          <td className="py-1.5 text-right font-semibold text-amber-300">+{joelWeekStats.pointsInPlay ?? 0} pts</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-semibold text-slate-300">+{coreyWeekStats.pointsUpcoming ?? 0} pts</td>
                          <td className="py-1.5 text-center text-slate-400">Points Upcoming (Scheduled)</td>
                          <td className="py-1.5 text-right font-semibold text-slate-300">+{joelWeekStats.pointsUpcoming ?? 0} pts</td>
                        </tr>
                        <tr className="bg-slate-900/60 font-bold">
                          <td className="py-1.5 text-amber-400">+{coreyRemaining} pts</td>
                          <td className="py-1.5 text-center text-slate-200">Total Potential Points Remaining</td>
                          <td className="py-1.5 text-right text-amber-400">+{joelRemaining} pts</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 font-bold text-slate-200">{coreyWeekStats.pot} pts</td>
                          <td className="py-1.5 text-center text-slate-400">Maximum Total Slate Pot</td>
                          <td className="py-1.5 text-right font-bold text-slate-200">{joelWeekStats.pot} pts</td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-slate-300">
                            {coreyWeekStats.wins}W - {coreyWeekStats.losses}L
                          </td>
                          <td className="py-1.5 text-center text-slate-400">Record in Completed Games</td>
                          <td className="py-1.5 text-right text-slate-300">
                            {joelWeekStats.wins}W - {joelWeekStats.losses}L
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-slate-300">
                            {coreyWeekStats.liveGamesCount ?? 0} live ({coreyWeekStats.liveLeadingCount ?? 0} ahead)
                          </td>
                          <td className="py-1.5 text-center text-slate-400">Active Live Games Breakdown</td>
                          <td className="py-1.5 text-right text-slate-300">
                            {joelWeekStats.liveGamesCount ?? 0} live ({joelWeekStats.liveLeadingCount ?? 0} ahead)
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1.5 text-slate-300">
                            {coreyWeekStats.underdogPicksCount ?? 0} dog / {coreyWeekStats.primeTimePicksCount ?? 0} prime
                          </td>
                          <td className="py-1.5 text-center text-slate-400">Underdog &amp; Prime Time Picks</td>
                          <td className="py-1.5 text-right text-slate-300">
                            {joelWeekStats.underdogPicksCount ?? 0} dog / {joelWeekStats.primeTimePicksCount ?? 0} prime
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Underdog / Prime Time Rule Reminder Footer */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800/80">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Underdog (+1 pt) &amp; Prime Time (+1 pt) bonus scoring active</span>
            </span>
            <span className="font-semibold text-slate-300">Max 3 pts / game</span>
          </div>

        </div>
      </div>
    </section>
  );
};
