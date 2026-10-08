import React, { useState } from 'react';
import { WeekData, CumulativeSeasonStats } from '../types';
import { computePlayerStats } from '../services/scoringEngine';
import { Trophy, ArrowRight, Download, Copy, Check } from 'lucide-react';

interface SeasonTotalsTableProps {
  weeks: WeekData[];
  seasonStats: CumulativeSeasonStats;
  currentWeek: number;
  onSelectWeekAndSwitchToSlate?: (week: number) => void;
}

export const SeasonTotalsTable: React.FC<SeasonTotalsTableProps> = ({
  weeks,
  seasonStats,
  currentWeek,
  onSelectWeekAndSwitchToSlate,
}) => {
  const [copied, setCopied] = useState(false);

  // Compute row data for each week
  const weekRows = weeks.map((week) => {
    const c = computePlayerStats(week.games, 'Corey');
    const j = computePlayerStats(week.games, 'Joel');
    const isSelected = week.weekNumber === currentWeek;
    const weekWinner =
      c.pts > j.pts ? 'Corey' : j.pts > c.pts ? 'Joel' : c.pts > 0 ? 'Tie' : 'Pending';

    return {
      weekNumber: week.weekNumber,
      corey: c,
      joel: j,
      isSelected,
      weekWinner,
      diff: Math.abs(c.pts - j.pts),
      hasGames: week.games.length > 0,
    };
  });

  // Export CSV of season totals
  const handleExportCSV = () => {
    const headers = [
      'Week',
      'Corey Pts',
      'Corey Pot',
      'Corey Pt Pct',
      'Corey Gm Pct',
      'Corey Wins',
      'Joel Pts',
      'Joel Pot',
      'Joel Pt Pct',
      'Joel Gm Pct',
      'Joel Wins',
      'Winner',
    ];

    const rows = weekRows.map((r) => [
      r.weekNumber,
      r.corey.pts,
      r.corey.pot,
      `${r.corey.ptPct}%`,
      `${r.corey.gmPct}%`,
      r.corey.wins,
      r.joel.pts,
      r.joel.pot,
      `${r.joel.ptPct}%`,
      `${r.joel.gmPct}%`,
      r.joel.wins,
      r.weekWinner,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFL-Pickem-Season-Totals-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy TSV to clipboard
  const handleCopyTSV = () => {
    const headers = [
      'Week',
      'Corey Pts',
      'Corey Pot',
      'Corey Pt Pct',
      'Corey Gm Pct',
      'Joel Pts',
      'Joel Pot',
      'Joel Pt Pct',
      'Joel Gm Pct',
      'Winner',
    ];

    const rows = weekRows.map((r) => [
      `Week ${r.weekNumber}`,
      r.corey.pts,
      r.corey.pot,
      `${r.corey.ptPct}%`,
      `${r.corey.gmPct}%`,
      r.joel.pts,
      r.joel.pot,
      `${r.joel.ptPct}%`,
      `${r.joel.gmPct}%`,
      r.weekWinner,
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Banner Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Season Totals &amp; Weekly Aggregated Ledger</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Week-by-week aggregated performance comparison across all 18 regular season slates.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyTSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition"
            title="Copy season totals table (paste into Excel or Google Sheets)"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy to Sheets'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition active:scale-95"
            title="Download Season Totals as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregated Week-by-Week Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="p-3.5 font-bold">Week</th>
                <th className="p-3.5 font-bold text-blue-400 bg-blue-950/20">Corey Pts</th>
                <th className="p-3.5 font-bold text-slate-400 bg-blue-950/10">Corey Pot</th>
                <th className="p-3.5 font-bold text-slate-400 bg-blue-950/10">Corey Pt%</th>
                <th className="p-3.5 font-bold text-slate-400 bg-blue-950/10">Corey Gm%</th>
                <th className="p-3.5 font-bold text-rose-400 border-l border-slate-800 bg-rose-950/20">Joel Pts</th>
                <th className="p-3.5 font-bold text-slate-400 bg-rose-950/10">Joel Pot</th>
                <th className="p-3.5 font-bold text-slate-400 bg-rose-950/10">Joel Pt%</th>
                <th className="p-3.5 font-bold text-slate-400 bg-rose-950/10">Joel Gm%</th>
                <th className="p-3.5 font-bold text-slate-300 border-l border-slate-800 text-center">Weekly Winner</th>
                {onSelectWeekAndSwitchToSlate && (
                  <th className="p-3.5 font-bold text-right">Draft Slate</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
              {weekRows.map((r) => {
                return (
                  <tr
                    key={r.weekNumber}
                    className={`hover:bg-slate-800/50 transition ${
                      r.isSelected ? 'bg-indigo-950/40' : ''
                    }`}
                  >
                    <td className="p-3.5 font-bold text-white font-sans flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200">
                        Week {r.weekNumber}
                      </span>
                      {r.isSelected && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Corey Stats */}
                    <td className="p-3.5 font-black text-blue-400 text-sm bg-blue-950/10">
                      {r.corey.pts}
                    </td>
                    <td className="p-3.5 text-slate-400 bg-blue-950/5">
                      {r.corey.pot}
                    </td>
                    <td className="p-3.5 text-slate-300 bg-blue-950/5">
                      {r.corey.ptPct}%
                    </td>
                    <td className="p-3.5 text-slate-300 bg-blue-950/5">
                      {r.corey.gmPct}% ({r.corey.wins}w)
                    </td>

                    {/* Joel Stats */}
                    <td className="p-3.5 font-black text-rose-400 text-sm border-l border-slate-800 bg-rose-950/10">
                      {r.joel.pts}
                    </td>
                    <td className="p-3.5 text-slate-400 bg-rose-950/5">
                      {r.joel.pot}
                    </td>
                    <td className="p-3.5 text-slate-300 bg-rose-950/5">
                      {r.joel.ptPct}%
                    </td>
                    <td className="p-3.5 text-slate-300 bg-rose-950/5">
                      {r.joel.gmPct}% ({r.joel.wins}w)
                    </td>

                    {/* Weekly Winner */}
                    <td className="p-3.5 font-bold border-l border-slate-800 font-sans text-center whitespace-nowrap">
                      {r.weekWinner === 'Corey' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-bold">
                          Corey (+{r.diff} pts)
                        </span>
                      ) : r.weekWinner === 'Joel' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-bold">
                          Joel (+{r.diff} pts)
                        </span>
                      ) : r.weekWinner === 'Tie' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold">
                          Tied
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>

                    {/* Action to Jump to Slate */}
                    {onSelectWeekAndSwitchToSlate && (
                      <td className="p-3.5 text-right font-sans whitespace-nowrap">
                        <button
                          onClick={() => onSelectWeekAndSwitchToSlate(r.weekNumber)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center gap-1 transition"
                          title={`Switch to Week ${r.weekNumber} Draft Slate`}
                        >
                          <span>Go to Slate</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>

            {/* Total Footer Row */}
            <tfoot className="bg-slate-950 border-t-2 border-slate-700 font-mono text-xs font-bold">
              <tr>
                <td className="p-3.5 text-white font-sans uppercase">Season Totals</td>
                <td className="p-3.5 text-blue-400 text-base">{seasonStats.Corey.totalPts}</td>
                <td className="p-3.5 text-slate-400">{seasonStats.Corey.totalPot}</td>
                <td className="p-3.5 text-slate-200">{seasonStats.Corey.ptPct}%</td>
                <td className="p-3.5 text-slate-200">{seasonStats.Corey.gmPct}% ({seasonStats.Corey.totalWins}w)</td>
                
                <td className="p-3.5 text-rose-400 text-base border-l border-slate-800">{seasonStats.Joel.totalPts}</td>
                <td className="p-3.5 text-slate-400">{seasonStats.Joel.totalPot}</td>
                <td className="p-3.5 text-slate-200">{seasonStats.Joel.ptPct}%</td>
                <td className="p-3.5 text-slate-200">{seasonStats.Joel.gmPct}% ({seasonStats.Joel.totalWins}w)</td>

                <td className="p-3.5 border-l border-slate-800 text-center font-sans">
                  {seasonStats.leader === 'Tied' ? (
                    <span className="text-amber-400">Tied Overall</span>
                  ) : (
                    <span className={seasonStats.leader === 'Corey' ? 'text-blue-400' : 'text-rose-400'}>
                      {seasonStats.leader} (+{seasonStats.pointDifferential} pts)
                    </span>
                  )}
                </td>

                {onSelectWeekAndSwitchToSlate && <td className="p-3.5"></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
