import React from 'react';
import { WeekData, CumulativeSeasonStats } from '../types';
import { computePlayerStats } from '../services/scoringEngine';
import { X, Trophy, ArrowRight } from 'lucide-react';

interface CumulativeStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: WeekData[];
  seasonStats: CumulativeSeasonStats;
  currentWeek: number;
  onSelectWeek: (week: number) => void;
}

export const CumulativeStatsModal: React.FC<CumulativeStatsModalProps> = ({
  isOpen,
  onClose,
  weeks,
  seasonStats,
  currentWeek,
  onSelectWeek,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Season Leaderboard &amp; Weekly Log</h2>
              <p className="text-xs text-slate-400">
                Official 2026–27 cumulative performance ledger
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Table */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Cumulative Totals Top Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Corey Overall Box */}
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                    C
                  </span>
                  <span className="font-bold text-white text-base">Corey</span>
                  {seasonStats.leader === 'Corey' && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500 text-slate-950">
                      Overall Leader
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2 space-y-0.5">
                  <div>Points Pct: <strong className="text-slate-200">{seasonStats.Corey.ptPct}%</strong></div>
                  <div>Game Win Pct: <strong className="text-slate-200">{seasonStats.Corey.gmPct}%</strong> ({seasonStats.Corey.totalWins}-{seasonStats.Corey.totalLosses})</div>
                  <div>Weeks Won: <strong className="text-emerald-400">{seasonStats.Corey.weeksWon}</strong></div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-emerald-400">{seasonStats.Corey.totalPts}</span>
                <span className="text-sm text-slate-400 block font-medium">/ {seasonStats.Corey.totalPot} Pot</span>
              </div>
            </div>

            {/* Joel Overall Box */}
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
                    J
                  </span>
                  <span className="font-bold text-white text-base">Joel</span>
                  {seasonStats.leader === 'Joel' && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                      Overall Leader
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2 space-y-0.5">
                  <div>Points Pct: <strong className="text-slate-200">{seasonStats.Joel.ptPct}%</strong></div>
                  <div>Game Win Pct: <strong className="text-slate-200">{seasonStats.Joel.gmPct}%</strong> ({seasonStats.Joel.totalWins}-{seasonStats.Joel.totalLosses})</div>
                  <div>Weeks Won: <strong className="text-amber-400">{seasonStats.Joel.weeksWon}</strong></div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-black text-amber-400">{seasonStats.Joel.totalPts}</span>
                <span className="text-sm text-slate-400 block font-medium">/ {seasonStats.Joel.totalPot} Pot</span>
              </div>
            </div>

          </div>

          {/* Detailed Week by Week Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <th className="p-3 font-bold uppercase tracking-wider">Week</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-emerald-400">Corey Pts</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-400">Corey Pot</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-400">Corey Pt%</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-400">Corey Gm%</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-amber-400 border-l border-slate-800">Joel Pts</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-400">Joel Pot</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-400">Joel Pt%</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-400">Joel Gm%</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-slate-300 border-l border-slate-800">Winner</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {weeks.map((week) => {
                    const c = computePlayerStats(week.games, 'Corey');
                    const j = computePlayerStats(week.games, 'Joel');
                    const isSelected = week.weekNumber === currentWeek;
                    const weekWinner =
                      c.pts > j.pts ? 'Corey' : j.pts > c.pts ? 'Joel' : c.pts > 0 ? 'Tie' : 'Pending';

                    return (
                      <tr
                        key={week.weekNumber}
                        className={`hover:bg-slate-800/40 transition cursor-pointer ${
                          isSelected ? 'bg-indigo-950/30' : ''
                        }`}
                        onClick={() => {
                          onSelectWeek(week.weekNumber);
                          onClose();
                        }}
                      >
                        <td className="p-3 font-bold text-white flex items-center gap-1.5">
                          <span>Week {week.weekNumber}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          )}
                        </td>
                        <td className="p-3 font-black text-emerald-400 text-sm">{c.pts}</td>
                        <td className="p-3 text-slate-400">{c.pot}</td>
                        <td className="p-3 text-slate-300">{c.ptPct}%</td>
                        <td className="p-3 text-slate-300">{c.gmPct}%</td>
                        
                        <td className="p-3 font-black text-amber-400 text-sm border-l border-slate-800">{j.pts}</td>
                        <td className="p-3 text-slate-400">{j.pot}</td>
                        <td className="p-3 text-slate-300">{j.ptPct}%</td>
                        <td className="p-3 text-slate-300">{j.gmPct}%</td>

                        <td className="p-3 font-bold border-l border-slate-800">
                          {weekWinner === 'Corey' ? (
                            <span className="text-emerald-400">Corey (+{c.pts - j.pts})</span>
                          ) : weekWinner === 'Joel' ? (
                            <span className="text-amber-400">Joel (+{j.pts - c.pts})</span>
                          ) : weekWinner === 'Tie' ? (
                            <span className="text-blue-400">Tied</span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectWeek(week.weekNumber);
                              onClose();
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
