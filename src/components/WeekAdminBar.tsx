import React from 'react';
import { PlayerId, NFLGame } from '../types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  RotateCcw, 
  CheckCircle2,
  Lock,
  Unlock,
} from 'lucide-react';

interface WeekAdminBarProps {
  currentWeek: number;
  totalWeeks: number;
  currentActiveWeekNum: number;
  isCurrentActiveWeek: boolean;
  onSelectWeek: (week: number) => void;
  onJumpToActiveWeek: () => void;
  onTheClock: PlayerId;
  onChangeClock: (player: PlayerId) => void;
  games: NFLGame[];
  onResetDraft: () => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}

export const WeekAdminBar: React.FC<WeekAdminBarProps> = ({
  currentWeek,
  totalWeeks,
  currentActiveWeekNum,
  isCurrentActiveWeek,
  onSelectWeek,
  onJumpToActiveWeek,
  onTheClock,
  onChangeClock,
  games,
  onResetDraft,
  isEditMode,
  onToggleEditMode,
}) => {
  const coreyGamesCount = games.filter((g) => g.picker === 'Corey').length;
  const joelGamesCount = games.filter((g) => g.picker === 'Joel').length;
  const unassignedCount = games.filter((g) => !g.picker).length;
  const totalGames = games.length;
  const isWeekCompleted = games.length > 0 && games.every((g) => g.status === 'post');

  const otherPlayer: PlayerId = onTheClock === 'Corey' ? 'Joel' : 'Corey';

  return (
    <div className="bg-slate-900/95 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          
          {/* Left Cluster: Week Selector & On The Clock */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Week Selector Stepper */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-700/80 shadow-inner">
              <button
                id="prev-week-admin-btn"
                onClick={() => onSelectWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek <= 1}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <select
                  id="week-admin-select"
                  value={currentWeek}
                  onChange={(e) => onSelectWeek(Number(e.target.value))}
                  className="bg-transparent text-xs sm:text-sm font-black text-white focus:outline-none cursor-pointer py-0.5"
                >
                  {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w} className="bg-slate-900 text-white font-medium">
                      Week {w} {w === currentActiveWeekNum ? '★ Active' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="next-week-admin-btn"
                onClick={() => onSelectWeek(Math.min(totalWeeks, currentWeek + 1))}
                disabled={currentWeek >= totalWeeks}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Jump back if on past/future week */}
            {!isCurrentActiveWeek && (
              <div className="flex items-center gap-2">
                <button
                  id="jump-to-active-week-btn"
                  onClick={onJumpToActiveWeek}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition shadow-sm cursor-pointer"
                  title={`Jump back to active Week ${currentActiveWeekNum}`}
                >
                  <span>← Back to Active Week {currentActiveWeekNum}</span>
                </button>
                <span className="hidden sm:inline text-[11px] text-slate-400 font-medium">
                  {currentWeek < currentActiveWeekNum ? '(Past Week)' : '(Future Week)'}
                </span>
              </div>
            )}

            {/* On the Clock Switcher (Shortened to icon and player name only) */}
            <div 
              className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-inner"
              title={`On the clock: ${onTheClock}. Click to switch to ${otherPlayer}`}
            >
              <Clock className={`w-3.5 h-3.5 ${isCurrentActiveWeek ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
              <button
                id="toggle-clock-admin-btn"
                onClick={() => onChangeClock(otherPlayer)}
                className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                  onTheClock === 'Corey'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                }`}
                title={`On the clock: ${onTheClock}. Click to switch to ${otherPlayer}`}
              >
                {onTheClock}
              </button>
            </div>

            {/* Completed Week Set In Stone Badge */}
            {isWeekCompleted && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold shadow-sm">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Results Set in Stone</span>
              </div>
            )}

            {/* Allocation Count Badges */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-lg bg-blue-950/50 border border-blue-800/40 text-blue-300 font-medium">
                Corey: <strong className="text-white">{coreyGamesCount}</strong>
              </span>
              <span className="px-2 py-1 rounded-lg bg-rose-950/50 border border-rose-800/40 text-rose-300 font-medium">
                Joel: <strong className="text-white">{joelGamesCount}</strong>
              </span>
              {unassignedCount > 0 ? (
                <span className="px-2 py-1 rounded-lg bg-amber-950/50 border border-amber-800/40 text-amber-300 font-semibold">
                  {unassignedCount} to draft
                </span>
              ) : (
                <span className="px-2 py-1 rounded-lg bg-slate-800 text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>All {totalGames} Drafted</span>
                </span>
              )}
            </div>

          </div>

          {/* Right Cluster: Consolidated Edit/Draft Mode + Reset */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto w-full lg:w-auto justify-between lg:justify-end">
            
            {/* Consolidated Edit / Draft Mode Toggle */}
            <button
              id="toggle-edit-mode-btn"
              onClick={onToggleEditMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isEditMode
                  ? 'bg-amber-400 border-amber-300 text-slate-950 font-black shadow-lg shadow-amber-400/25 ring-1 ring-amber-300/40'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title={
                isEditMode
                  ? isCurrentActiveWeek
                    ? 'Drafting & Editing ON: Click to lock against accidental changes'
                    : 'Editing Unlocked: Click to lock past results'
                  : isCurrentActiveWeek
                  ? 'Locked: Click to enable drafting & pick editing'
                  : 'Locked: Click to enable editing past picks'
              }
            >
              {isEditMode ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-950" />
                  <span>{isCurrentActiveWeek && unassignedCount > 0 ? 'Draft Mode ON' : 'Edit Mode ON'}</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Mode OFF</span>
                </>
              )}
            </button>

            {/* Reset Draft Allocations for Current Week */}
            <button
              id="reset-draft-btn"
              onClick={onResetDraft}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-rose-950/60 hover:border-rose-700 text-slate-400 hover:text-rose-300 transition cursor-pointer"
              title={`Reset draft assignments for Week ${currentWeek} (requires confirmation)`}
              aria-label={`Reset draft assignments for Week ${currentWeek}`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};
