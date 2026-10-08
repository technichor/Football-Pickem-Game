import React, { useState, useMemo } from 'react';
import { GameChangeLogEntry, ChangeLogType } from '../types';
import { 
  History, 
  X, 
  Filter, 
  Calendar, 
  Download, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  Search, 
  Clock, 
  Sparkles, 
  FileText,
  RotateCcw,
  RefreshCw,
  Edit3,
  Layers,
  Database
} from 'lucide-react';
import { downloadChangeLogExport } from '../services/storageService';

interface ChangeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: GameChangeLogEntry[];
  selectedWeekNum: number;
}

export type FilterChangeCategory = 
  | 'all' 
  | 'pick_game'      // Assigning a game to Corey / Joel ('picker' | 'picker_and_pick')
  | 'pick_team'      // Picking a winner team ('pick')
  | 'game_edit'      // Changing a game or team ('game_edit')
  | 'export_backup'  // Exporting or backing up results ('export_backup')
  | 'reset_clear'    // Draft resets & cleared assignments ('reset' | 'clear')
  | 'system';        // Score refresh, auto-draft, system updates

export const ChangeLogModal: React.FC<ChangeLogModalProps> = ({
  isOpen,
  onClose,
  entries,
  selectedWeekNum,
}) => {
  // Always default to 'all' so user sees all changes across all weeks
  const [weekFilter, setWeekFilter] = useState<'all' | number>('all');
  const [typeFilter, setTypeFilter] = useState<FilterChangeCategory>('all');
  const [playerFilter, setPlayerFilter] = useState<'all' | 'Corey' | 'Joel'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Count items by category for badge indicators
  const typeCounts = useMemo(() => {
    const counts = {
      all: entries.length,
      pick_game: 0,
      pick_team: 0,
      game_edit: 0,
      export_backup: 0,
      reset_clear: 0,
      system: 0,
    };
    for (const e of entries) {
      if (e.changeType === 'picker' || e.changeType === 'picker_and_pick') {
        counts.pick_game++;
      } else if (e.changeType === 'pick') {
        counts.pick_team++;
      } else if (e.changeType === 'game_edit') {
        counts.game_edit++;
      } else if (e.changeType === 'export_backup') {
        counts.export_backup++;
      } else if (e.changeType === 'reset' || e.changeType === 'clear') {
        counts.reset_clear++;
      } else {
        counts.system++;
      }
    }
    return counts;
  }, [entries]);

  // Comprehensive multi-facet filtering across all weeks, change types, players, and search
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Week Filter
      if (weekFilter !== 'all' && entry.weekNumber !== weekFilter) {
        return false;
      }

      // 2. Change Type Filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'pick_game') {
          if (entry.changeType !== 'picker' && entry.changeType !== 'picker_and_pick') return false;
        } else if (typeFilter === 'pick_team') {
          if (entry.changeType !== 'pick') return false;
        } else if (typeFilter === 'game_edit') {
          if (entry.changeType !== 'game_edit') return false;
        } else if (typeFilter === 'export_backup') {
          if (entry.changeType !== 'export_backup') return false;
        } else if (typeFilter === 'reset_clear') {
          if (entry.changeType !== 'reset' && entry.changeType !== 'clear') return false;
        } else if (typeFilter === 'system') {
          if (
            entry.changeType !== 'score_refresh' && 
            entry.changeType !== 'auto_draft' && 
            entry.changeType !== 'system'
          ) return false;
        }
      }

      // 3. Player Filter
      if (playerFilter !== 'all') {
        const matchesCurrent = entry.current?.picker === playerFilter;
        const matchesPrev = entry.previous?.picker === playerFilter;
        const matchesAuthor = entry.author === playerFilter;
        const matchesSummary = entry.summary.toLowerCase().includes(playerFilter.toLowerCase());
        if (!matchesCurrent && !matchesPrev && !matchesAuthor && !matchesSummary) {
          return false;
        }
      }

      // 4. Search Query across matchup, summary, details, and author
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesMatchup = entry.matchup.toLowerCase().includes(q);
        const matchesSummary = entry.summary.toLowerCase().includes(q);
        const matchesDetails = entry.details?.toLowerCase().includes(q) ?? false;
        const matchesAuthor = entry.author?.toLowerCase().includes(q) ?? false;
        if (!matchesMatchup && !matchesSummary && !matchesDetails && !matchesAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [entries, weekFilter, typeFilter, playerFilter, searchQuery]);

  const hasActiveFilters = weekFilter !== 'all' || typeFilter !== 'all' || playerFilter !== 'all' || searchQuery.trim().length > 0;

  const handleClearFilters = () => {
    setWeekFilter('all');
    setTypeFilter('all');
    setPlayerFilter('all');
    setSearchQuery('');
  };

  const renderTypeBadge = (type: ChangeLogType) => {
    switch (type) {
      case 'pick':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-950/80 text-blue-300 border border-blue-800/50 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
            <span>Picking Team</span>
          </span>
        );
      case 'picker':
      case 'picker_and_pick':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-950/80 text-purple-300 border border-purple-800/50 flex items-center gap-1">
            <User className="w-2.5 h-2.5 text-purple-400" />
            <span>Picking Game</span>
          </span>
        );
      case 'game_edit':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/50 flex items-center gap-1">
            <Edit3 className="w-2.5 h-2.5 text-amber-400" />
            <span>Changing Game/Team</span>
          </span>
        );
      case 'export_backup':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
            <Download className="w-2.5 h-2.5 text-emerald-400" />
            <span>Export & Backup</span>
          </span>
        );
      case 'reset':
      case 'clear':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/50 flex items-center gap-1">
            <RotateCcw className="w-2.5 h-2.5 text-rose-400" />
            <span>Reset / Clear</span>
          </span>
        );
      case 'score_refresh':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-sky-950/80 text-sky-300 border border-sky-800/50 flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5 text-sky-400" />
            <span>Scores Sync</span>
          </span>
        );
      case 'auto_draft':
        return (
          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-indigo-950/80 text-indigo-300 border border-indigo-800/50 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
            <span>Auto-Draft</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
            <Database className="w-2.5 h-2.5 text-slate-400" />
            <span>System</span>
          </span>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white">
                  Pick'em Change &amp; Audit Log
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  {filteredEntries.length === entries.length
                    ? `${entries.length} total events`
                    : `${filteredEntries.length} of ${entries.length} events`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Complete audit trail of all picks, team selections, game edits, and backups across all weeks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => downloadChangeLogExport(filteredEntries.length > 0 ? filteredEntries : entries)}
              disabled={entries.length === 0}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-40 transition cursor-pointer"
              title="Download change log audit report as JSON file"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export Log</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close change log modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dense Multi-Facet Filter Controls Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col gap-2.5 text-xs">
          
          {/* Row 1: Primary Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            
            {/* 1. Week Filter */}
            <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-0.5">Week</span>
                <select
                  id="changelog-week-select"
                  value={weekFilter}
                  onChange={(e) => setWeekFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="all" className="bg-slate-900 text-white font-medium">All 18 Weeks</option>
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w} className="bg-slate-900 text-white font-medium">
                      Week {w} {w === selectedWeekNum ? '(Active Slate)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Change Type Filter (Explicitly requested by user) */}
            <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
              <Filter className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-0.5">Type of Change</span>
                <select
                  id="changelog-type-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as FilterChangeCategory)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="all" className="bg-slate-900 text-white font-medium">
                    All Types ({typeCounts.all})
                  </option>
                  <option value="pick_team" className="bg-slate-900 text-blue-300 font-medium">
                    Picking a Team ({typeCounts.pick_team})
                  </option>
                  <option value="pick_game" className="bg-slate-900 text-purple-300 font-medium">
                    Picking a Game ({typeCounts.pick_game})
                  </option>
                  <option value="game_edit" className="bg-slate-900 text-amber-300 font-medium">
                    Changing Game or Team ({typeCounts.game_edit})
                  </option>
                  <option value="export_backup" className="bg-slate-900 text-emerald-300 font-medium">
                    Exporting or Backing Up ({typeCounts.export_backup})
                  </option>
                  <option value="reset_clear" className="bg-slate-900 text-rose-300 font-medium">
                    Resets &amp; Clears ({typeCounts.reset_clear})
                  </option>
                  <option value="system" className="bg-slate-900 text-slate-300 font-medium">
                    Score Sync &amp; System ({typeCounts.system})
                  </option>
                </select>
              </div>
            </div>

            {/* 3. Picker Filter */}
            <div className="flex items-center gap-2 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-0.5">Chosen By</span>
                <select
                  id="changelog-picker-select"
                  value={playerFilter}
                  onChange={(e) => setPlayerFilter(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer py-0.5"
                >
                  <option value="all" className="bg-slate-900 text-white font-medium">All Pickers</option>
                  <option value="Corey" className="bg-slate-900 text-emerald-400 font-medium">Corey</option>
                  <option value="Joel" className="bg-slate-900 text-amber-400 font-medium">Joel</option>
                </select>
              </div>
            </div>

            {/* 4. Search Bar */}
            <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3" />
              <input
                id="changelog-search-input"
                type="text"
                placeholder="Search team, odds, note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-500 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Row 2: Quick Filter Pills & Active State Reset */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap text-[11px]">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-semibold">Quick Filters:</span>
              
              {/* All Weeks Pill */}
              <button
                onClick={() => setWeekFilter('all')}
                className={`px-2 py-0.5 rounded-lg border transition font-bold ${
                  weekFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                All Weeks
              </button>

              {/* Current Selected Week Pill */}
              <button
                onClick={() => setWeekFilter(selectedWeekNum)}
                className={`px-2 py-0.5 rounded-lg border transition font-bold ${
                  weekFilter === selectedWeekNum
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Week {selectedWeekNum} Only
              </button>

              {/* Type Category Pills */}
              <button
                onClick={() => setTypeFilter((prev) => prev === 'pick_team' ? 'all' : 'pick_team')}
                className={`px-2 py-0.5 rounded-lg border transition font-bold ${
                  typeFilter === 'pick_team'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Team Picks
              </button>

              <button
                onClick={() => setTypeFilter((prev) => prev === 'pick_game' ? 'all' : 'pick_game')}
                className={`px-2 py-0.5 rounded-lg border transition font-bold ${
                  typeFilter === 'pick_game'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Game Picks
              </button>

              <button
                onClick={() => setTypeFilter((prev) => prev === 'game_edit' ? 'all' : 'game_edit')}
                className={`px-2 py-0.5 rounded-lg border transition font-bold ${
                  typeFilter === 'game_edit'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Game Edits
              </button>

              <button
                onClick={() => setTypeFilter((prev) => prev === 'export_backup' ? 'all' : 'export_backup')}
                className={`px-2 py-0.5 rounded-lg border transition font-bold ${
                  typeFilter === 'export_backup'
                    ? 'bg-emerald-600 text-white border-emerald-500'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                Backups
              </button>
            </div>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-bold shrink-0 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

        </div>

        {/* Entries List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-300">
                {entries.length === 0 ? 'No changes recorded yet' : 'No matching entries found'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {entries.length === 0
                  ? 'All pick selections, assignments, edits, and backups across all weeks will automatically appear here with a permanent timestamp.'
                  : 'Try clearing or widening your week or change type filter to view other recorded events.'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-sm mt-2"
                >
                  Show All Events Across All Weeks
                </button>
              )}
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const picker = entry.current?.picker || entry.previous?.picker || (entry.author === 'Corey' || entry.author === 'Joel' ? entry.author : null);
              return (
                <div
                  key={entry.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      
                      {/* Week Badge */}
                      <span className="px-2 py-0.5 rounded-md font-black bg-blue-950/80 text-blue-300 border border-blue-800/50 text-[11px]">
                        Week {entry.weekNumber}
                      </span>

                      {/* Type Badge */}
                      {renderTypeBadge(entry.changeType)}

                      {/* Matchup */}
                      <span className="font-bold text-slate-200">
                        {entry.matchup}
                      </span>

                      {/* Picker Tag */}
                      {picker && (
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            picker === 'Corey'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                          }`}
                        >
                          {picker}
                        </span>
                      )}

                      {/* Timestamp */}
                      <span className="text-[11px] text-slate-500 ml-auto sm:ml-0 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {entry.formattedTime}
                      </span>
                    </div>

                    {/* Summary */}
                    <div className="text-sm font-semibold text-white">
                      {entry.summary}
                    </div>

                    {/* Details Note */}
                    {entry.details && (
                      <p className="text-xs text-slate-400 italic">
                        "{entry.details}"
                      </p>
                    )}
                  </div>

                  {/* Previous vs New State Pill */}
                  {(entry.previous || entry.current) && (
                    <div className="flex items-center gap-2 shrink-0 bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px]">
                      <div className="text-slate-400">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Was</span>
                        <span className="font-semibold text-slate-300">
                          {entry.previous?.picker ? `${entry.previous.picker}: ` : ''}
                          {entry.previous?.pick || 'None'}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      <div className="text-emerald-400">
                        <span className="text-slate-500 block text-[9px] uppercase font-bold">Now</span>
                        <span className="font-bold text-white">
                          {entry.current?.picker ? `${entry.current.picker}: ` : ''}
                          {entry.current?.pick || 'None'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">All changes across all weeks are recorded permanently</span>
            <span className="sm:hidden">Audited across all weeks</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
