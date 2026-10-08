import React, { useState, useMemo } from 'react';
import { NFLGame, PlayerId } from '../types';
import { getOptimizedDraftRankings, OptimizedGameRanking } from '../services/draftOptimizer';
import { 
  X, 
  Sparkles, 
  HelpCircle, 
  Check, 
  Filter, 
  ChevronRight, 
  Flame, 
  Zap, 
  TrendingUp,
  Layers,
  ArrowUpDown
} from 'lucide-react';

interface DraftOptimizerPaneProps {
  isOpen: boolean;
  onClose: () => void;
  games: NFLGame[];
  selectedWeekNum: number;
  onSelectPick?: (gameId: string, teamAbbr: string) => void;
  onAssignPicker?: (gameId: string, picker: PlayerId | null) => void;
  isDraftMode?: boolean;
  onTheClock?: PlayerId;
  isCurrentActiveWeek?: boolean;
  isCommissionerMode?: boolean;
}

export const DraftOptimizerPane: React.FC<DraftOptimizerPaneProps> = ({
  isOpen,
  onClose,
  games,
  selectedWeekNum,
  onSelectPick,
  isDraftMode = false,
  onTheClock,
  isCurrentActiveWeek = false,
  isCommissionerMode = false,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'available'>('all');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState<boolean>(false);

  // Calculate algorithmic EV rankings for the current slate
  const rankings = useMemo(() => {
    return getOptimizedDraftRankings(games);
  }, [games]);

  const filteredRankings = useMemo(() => {
    if (filterMode === 'available') {
      return rankings.filter((r) => r.isAvailable);
    }
    return rankings;
  }, [rankings, filterMode]);

  // Find min and max score for accurate green heatmap interpolation
  const { minScore, maxScore } = useMemo(() => {
    if (rankings.length === 0) return { minScore: 0.7, maxScore: 1.4 };
    let min = Infinity;
    let max = -Infinity;
    rankings.forEach((r) => {
      if (r.maxExpPts < min) min = r.maxExpPts;
      if (r.maxExpPts > max) max = r.maxExpPts;
    });
    return { minScore: min, maxScore: max };
  }, [rankings]);

  // Compute heatmap background color matching the spreadsheet visual
  const getScoreBgStyle = (score: number) => {
    const range = maxScore - minScore || 0.6;
    const normalized = Math.max(0, Math.min(1, (score - minScore) / range));
    // Color interpolation from light mint green (#a7f3d0) to intense emerald green (#059669)
    // In dark theme: soft emerald gradient
    if (score >= 1.3) {
      return 'bg-emerald-600/90 text-white font-black shadow-sm';
    } else if (score >= 1.0) {
      return 'bg-emerald-600/70 text-emerald-100 font-extrabold';
    } else if (score >= 0.85) {
      return 'bg-emerald-600/40 text-emerald-200 font-bold';
    } else if (score >= 0.75) {
      return 'bg-emerald-600/25 text-emerald-300 font-semibold';
    }
    return 'bg-emerald-950/40 text-emerald-400 font-medium';
  };

  if (!isOpen) return null;

  return (
    /* Non-overlay right-docked drawer: pointer-events-auto on panel, NO backdrop */
    <aside
      className="fixed top-16 right-0 bottom-0 w-full sm:w-[460px] z-30 bg-slate-900/95 backdrop-blur-md border-l border-slate-700/90 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-200 select-text"
      aria-label="Secret Draft Optimizer"
    >
      {/* Pane Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-wide uppercase text-white">
                Draft Optimizer
              </h2>
              <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Secret EV
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Week {selectedWeekNum} Algorithmic Value Board
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowFormulaInfo((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition ${
              showFormulaInfo
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
            }`}
            title="Formula & Math Breakdown"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Close Secret Pane"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formula Explanation Collapsible Card */}
      {showFormulaInfo && (
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 text-xs space-y-2 text-slate-300">
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              Expected Score Math:
            </span>
            <span className="text-[10px] text-slate-400">P(Win) × Potential Points</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            For each game, win probabilities are derived from consensus Vegas point spreads. 
            Potential payout includes base (1pt), underdog bonus (+1pt), and prime time (+1pt).
            The side yielding the highest mathematical Expected Value is recommended.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="font-semibold text-slate-200">Favorite EV</div>
              <div className="text-slate-400 font-mono">P(Fav) × (1 + Prime)</div>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <div className="font-semibold text-slate-200">Underdog EV</div>
              <div className="text-slate-400 font-mono">(1 - P(Fav)) × (2 + Prime)</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Quick Summary Bar */}
      <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 rounded-md font-semibold text-xs transition ${
              filterMode === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            All Games ({rankings.length})
          </button>
          <button
            onClick={() => setFilterMode('available')}
            className={`px-2.5 py-1 rounded-md font-semibold text-xs transition ${
              filterMode === 'available'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            Undrafted ({rankings.filter((r) => r.isAvailable).length})
          </button>
        </div>

        {isDraftMode && onTheClock && (
          <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {onTheClock} on the clock
          </div>
        )}
      </div>

      {/* Main Table: Exact spreadsheet replica columns */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header matching the screenshot */}
          <thead className="sticky top-0 bg-slate-950 text-slate-300 font-bold border-b border-slate-800 shadow-sm z-10 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Odds</th>
              <th className="py-2.5 px-2.5">Favorite</th>
              <th className="py-2.5 px-2.5">Dog</th>
              <th className="py-2.5 px-3 text-center">Pick</th>
              <th className="py-2.5 px-3 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredRankings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No games match this filter.
                </td>
              </tr>
            ) : (
              filteredRankings.map((row, idx) => {
                const isExpanded = expandedGameId === row.id;
                const isPickedByCorey = row.picker === 'Corey';
                const isPickedByJoel = row.picker === 'Joel';
                const isDogPick = row.recommendedPick === row.underdogAbbr;

                return (
                  <React.Fragment key={row.id}>
                    <tr
                      onClick={() => setExpandedGameId(isExpanded ? null : row.id)}
                      className={`hover:bg-slate-800/60 transition cursor-pointer ${
                        !row.isAvailable ? 'opacity-70 bg-slate-950/30' : ''
                      } ${isExpanded ? 'bg-slate-800/70 ring-1 ring-emerald-500/30' : ''}`}
                    >
                      {/* 1. Odds */}
                      <td className="py-2.5 px-3 font-semibold text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{row.oddsDisplay}</span>
                          {row.isPrimeTime && (
                            <Zap
                              className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0"
                              title="Prime Time (+1 Pt Bonus)"
                            />
                          )}
                        </div>
                      </td>

                      {/* 2. Favorite */}
                      <td className="py-2.5 px-2.5 font-bold text-slate-200">
                        {row.favoriteAbbr}
                      </td>

                      {/* 3. Dog */}
                      <td className="py-2.5 px-2.5 font-medium text-slate-400">
                        {row.underdogAbbr}
                      </td>

                      {/* 4. Pick (Bolded Recommended Winner) */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-1 font-black text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80">
                          {isDogPick && (
                            <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                          )}
                          <span>{row.recommendedPick}</span>
                        </div>
                      </td>

                      {/* 5. Score (Heat-mapped Expected Value) */}
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`inline-block min-w-[54px] text-center px-2 py-1 rounded text-xs tracking-tight ${getScoreBgStyle(
                            row.maxExpPts
                          )}`}
                        >
                          {row.maxExpPts.toFixed(row.maxExpPts % 1 === 0 ? 1 : 3)}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable Game Detail Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90 border-b border-emerald-500/20">
                        <td colSpan={5} className="p-3 text-[11px] space-y-2">
                          <div className="flex items-center justify-between text-slate-400">
                            <div>
                              <strong className="text-white">
                                {row.game.awayAbbr} @ {row.game.homeAbbr}
                              </strong>{' '}
                              • {row.game.date} {row.game.time}
                            </div>
                            <div>
                              {row.isAvailable ? (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  Available to Draft
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold">
                                  Drafted by <strong className="text-white">{row.picker}</strong> ({row.currentPick})
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Probability & EV Breakdown Matrix */}
                          <div className="grid grid-cols-2 gap-2 text-slate-300">
                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-300">
                                  {row.favoriteAbbr} (Fav)
                                </span>
                                <span className="text-slate-400 font-mono">
                                  {(row.favWinPct * 100).toFixed(1)}% win
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-slate-400">
                                <span>EV:</span>
                                <span className="font-mono text-white font-bold">
                                  {row.favExpPts.toFixed(3)} pts
                                </span>
                              </div>
                            </div>

                            <div className="p-2 rounded bg-slate-900 border border-slate-800">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-orange-400 flex items-center gap-1">
                                  <Flame className="w-3 h-3" />
                                  {row.underdogAbbr} (Dog)
                                </span>
                                <span className="text-slate-400 font-mono">
                                  {(row.dogWinPct * 100).toFixed(1)}% win
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-slate-400">
                                <span>EV:</span>
                                <span className="font-mono text-white font-bold">
                                  {row.dogExpPts.toFixed(3)} pts
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Draft Action */}
                          {row.isAvailable && onSelectPick && (isCurrentActiveWeek || isCommissionerMode) && (
                            <div className="pt-1 flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectPick(row.id, row.recommendedPick);
                                }}
                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Quick Draft Recommended ({row.recommendedPick})
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pane Footer Info */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-emerald-400" />
          Sorted by Expected Score (EV)
        </span>
        <span className="text-slate-500">
          Secret: Hold Rules (?) for 2.5s
        </span>
      </div>
    </aside>
  );
};
