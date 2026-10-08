import React from 'react';
import { CumulativeSeasonStats } from '../types';
import { Crown } from 'lucide-react';

interface CumulativeSeasonBannerProps {
  seasonStats: CumulativeSeasonStats;
}

export const CumulativeSeasonBanner: React.FC<CumulativeSeasonBannerProps> = ({
  seasonStats,
}) => {
  const isCoreyLeadingSeason = seasonStats.leader === 'Corey';
  const isJoelLeadingSeason = seasonStats.leader === 'Joel';

  return (
    <section className="bg-slate-900 border-b border-slate-800/80 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg">
          
          {/* Header row: title and status badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Cumulative Season Standings
                </h2>
                <p className="text-[11px] text-slate-400">
                  Full 18-week cumulative progression &amp; leaderboard
                </p>
              </div>
            </div>

            <div className="text-xs font-semibold">
              {seasonStats.leader === 'Tied' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <span>Dead Heat (Tied Overall)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 border border-slate-700 text-slate-300">
                  <strong className={isCoreyLeadingSeason ? 'text-emerald-400' : 'text-amber-400'}>
                    {seasonStats.leader}
                  </strong>{' '}
                  leads by{' '}
                  <strong className="text-white">{seasonStats.pointDifferential} pts</strong>
                </span>
              )}
            </div>
          </div>

          {/* Head to Head Player Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            
            {/* Corey Card */}
            <div
              className={`relative rounded-xl p-3.5 border transition-all ${
                isCoreyLeadingSeason
                  ? 'bg-gradient-to-br from-emerald-950/50 to-slate-900/90 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                  : 'bg-slate-900/60 border-slate-700/60'
              }`}
            >
              {isCoreyLeadingSeason && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-black uppercase text-slate-950 shadow">
                  Season Leader
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow">
                    C
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight flex items-center gap-1.5">
                      Corey
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {seasonStats.Corey.weeksWon} {seasonStats.Corey.weeksWon === 1 ? 'Week' : 'Weeks'} Won
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {seasonStats.Corey.totalPts}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    / {seasonStats.Corey.totalPot} pot
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/50 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Pt %</span>
                  <span className="font-bold text-slate-200">{seasonStats.Corey.ptPct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Gm %</span>
                  <span className="font-bold text-slate-200">{seasonStats.Corey.gmPct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Record</span>
                  <span className="font-bold text-slate-200">
                    {seasonStats.Corey.totalWins}-{seasonStats.Corey.totalLosses}
                  </span>
                </div>
              </div>
            </div>

            {/* Joel Card */}
            <div
              className={`relative rounded-xl p-3.5 border transition-all ${
                isJoelLeadingSeason
                  ? 'bg-gradient-to-br from-amber-950/50 to-slate-900/90 border-amber-500/50 shadow-md shadow-amber-950/30'
                  : 'bg-slate-900/60 border-slate-700/60'
              }`}
            >
              {isJoelLeadingSeason && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-[10px] font-black uppercase text-slate-950 shadow">
                  Season Leader
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-black text-sm shadow">
                    J
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white leading-tight flex items-center gap-1.5">
                      Joel
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {seasonStats.Joel.weeksWon} {seasonStats.Joel.weeksWon === 1 ? 'Week' : 'Weeks'} Won
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">
                    {seasonStats.Joel.totalPts}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-1">
                    / {seasonStats.Joel.totalPot} pot
                  </span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-700/50 grid grid-cols-3 text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Pt %</span>
                  <span className="font-bold text-slate-200">{seasonStats.Joel.ptPct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Gm %</span>
                  <span className="font-bold text-slate-200">{seasonStats.Joel.gmPct}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Record</span>
                  <span className="font-bold text-slate-200">
                    {seasonStats.Joel.totalWins}-{seasonStats.Joel.totalLosses}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
