import React from 'react';
import { CumulativeSeasonStats, PlayerWeekStats } from '../types';
import { Crown, Flame, Target } from 'lucide-react';

interface StandingsHeaderProps {
  seasonStats: CumulativeSeasonStats;
  currentWeek: number;
  coreyWeekStats: PlayerWeekStats;
  joelWeekStats: PlayerWeekStats;
}

export const StandingsHeader: React.FC<StandingsHeaderProps> = ({
  seasonStats,
  currentWeek,
  coreyWeekStats,
  joelWeekStats,
}) => {
  const isCoreyLeadingSeason = seasonStats.leader === 'Corey';
  const isJoelLeadingSeason = seasonStats.leader === 'Joel';

  const isCoreyLeadingWeek = coreyWeekStats.pts > joelWeekStats.pts;
  const isJoelLeadingWeek = joelWeekStats.pts > coreyWeekStats.pts;

  return (
    <div className="bg-slate-900 border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        
        {/* Top summary row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Season Leaderboard Banner */}
          <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Cumulative Season Standings
                </span>
              </div>
              <div className="text-xs font-medium text-slate-400">
                {seasonStats.leader === 'Tied' ? (
                  <span className="text-amber-400 font-bold">Dead Heat (Tied)</span>
                ) : (
                  <span>
                    <strong className="text-amber-300">{seasonStats.leader}</strong> leads by{' '}
                    <strong className="text-white">{seasonStats.pointDifferential} pts</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Head to Head Cards */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Corey Card */}
              <div
                className={`relative rounded-xl p-3 border transition-all ${
                  isCoreyLeadingSeason
                    ? 'bg-gradient-to-br from-emerald-950/60 to-slate-800/80 border-emerald-500/50 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                {isCoreyLeadingSeason && (
                  <div className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black uppercase text-slate-950 shadow">
                    Leader
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                      C
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white leading-tight">Corey</h4>
                      <p className="text-[11px] text-slate-400">
                        {seasonStats.Corey.weeksWon} Weeks Won
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-400">
                      {seasonStats.Corey.totalPts}
                    </span>
                    <span className="text-xs text-slate-400 font-medium ml-1">
                      / {seasonStats.Corey.totalPot}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pt %</span>
                    <span className="font-bold text-slate-200">{seasonStats.Corey.ptPct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gm %</span>
                    <span className="font-bold text-slate-200">{seasonStats.Corey.gmPct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Record</span>
                    <span className="font-bold text-slate-200">
                      {seasonStats.Corey.totalWins}-{seasonStats.Corey.totalLosses}
                    </span>
                  </div>
                </div>
              </div>

              {/* Joel Card */}
              <div
                className={`relative rounded-xl p-3 border transition-all ${
                  isJoelLeadingSeason
                    ? 'bg-gradient-to-br from-amber-950/60 to-slate-800/80 border-amber-500/50 shadow-md shadow-amber-950/40'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                {isJoelLeadingSeason && (
                  <div className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-[10px] font-black uppercase text-slate-950 shadow">
                    Leader
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-xs">
                      J
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white leading-tight">Joel</h4>
                      <p className="text-[11px] text-slate-400">
                        {seasonStats.Joel.weeksWon} Weeks Won
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-amber-400">
                      {seasonStats.Joel.totalPts}
                    </span>
                    <span className="text-xs text-slate-400 font-medium ml-1">
                      / {seasonStats.Joel.totalPot}
                    </span>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/50 grid grid-cols-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Pt %</span>
                    <span className="font-bold text-slate-200">{seasonStats.Joel.ptPct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Gm %</span>
                    <span className="font-bold text-slate-200">{seasonStats.Joel.gmPct}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Record</span>
                    <span className="font-bold text-slate-200">
                      {seasonStats.Joel.totalWins}-{seasonStats.Joel.totalLosses}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Week Snapshot Banner */}
          <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Week {currentWeek} Battle
                </span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
                {coreyWeekStats.wins + joelWeekStats.wins} Wins Logged
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Corey Week */}
              <div
                className={`p-2.5 rounded-xl border ${
                  isCoreyLeadingWeek
                    ? 'bg-emerald-950/40 border-emerald-500/40'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300">Corey</span>
                  <span className="text-lg font-black text-white">{coreyWeekStats.pts} pts</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Pot: {coreyWeekStats.pot}</span>
                  <span>Pos: {coreyWeekStats.pos}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Pt: {coreyWeekStats.ptPct}%</span>
                  <span>Win: {coreyWeekStats.wins}g</span>
                </div>
              </div>

              {/* Joel Week */}
              <div
                className={`p-2.5 rounded-xl border ${
                  isJoelLeadingWeek
                    ? 'bg-amber-950/40 border-amber-500/40'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Joel</span>
                  <span className="text-lg font-black text-white">{joelWeekStats.pts} pts</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Pot: {joelWeekStats.pot}</span>
                  <span>Pos: {joelWeekStats.pos}</span>
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between">
                  <span>Pt: {joelWeekStats.ptPct}%</span>
                  <span>Win: {joelWeekStats.wins}g</span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Underdog (+1) &amp; Prime Time (+1) bonuses active
              </span>
              <span className="font-semibold text-slate-300">Max 3 pts/game</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
