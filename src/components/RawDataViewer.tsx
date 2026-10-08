import React, { useState, useMemo } from 'react';
import { WeekData, NFLGame } from '../types';
import { getGameWinner, calculatePotentialPoints, isTeamUnderdog } from '../services/scoringEngine';
import { 
  Table, 
  Search, 
  Download, 
  Filter, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Copy, 
  Check,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

interface RawDataViewerProps {
  weeks: WeekData[];
  selectedWeekNum: number;
  onSelectWeek: (week: number) => void;
}

type SortField = 'week' | 'date' | 'favorite' | 'spread' | 'picker' | 'winner' | 'status' | 'potential' | 'earned';
type SortOrder = 'asc' | 'desc';

interface FlattenedGameRecord {
  id: string;
  week: number;
  date: string;
  time: string;
  matchup: string;
  awayTeam: string;
  awayAbbr: string;
  homeTeam: string;
  homeAbbr: string;
  awayScore: number;
  homeScore: number;
  scoreDisplay: string;
  status: 'pre' | 'in' | 'post';
  quarter?: string;
  clock?: string;
  odds: string;
  favoriteAbbr: string;
  spread: number;
  broadcast: string;
  isPrimeTime: boolean;
  picker: 'Corey' | 'Joel' | null;
  pick: string | null;
  winner: string | null;
  isCorrect: boolean | null;
  isUnderdogPick: boolean;
  potentialPoints: number;
  potentialBreakdown: string[];
  earnedPoints: number;
  game: NFLGame;
}

export const RawDataViewer: React.FC<RawDataViewerProps> = ({
  weeks,
  selectedWeekNum,
  onSelectWeek,
}) => {
  // Query Filters & Controls
  const [weekFilter, setWeekFilter] = useState<number | 'all'>('all');
  const [pickerFilter, setPickerFilter] = useState<'all' | 'Corey' | 'Joel' | 'unassigned'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pre' | 'in' | 'post'>('all');
  const [resultFilter, setResultFilter] = useState<'all' | 'correct' | 'incorrect' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('week');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Copy state
  const [copied, setCopied] = useState<boolean>(false);

  // Flatten all games across the entire season
  const allFlattenedGames = useMemo<FlattenedGameRecord[]>(() => {
    const list: FlattenedGameRecord[] = [];

    weeks.forEach((w) => {
      w.games.forEach((g) => {
        const winner = getGameWinner(g);
        let isCorrect: boolean | null = null;
        if (g.status === 'post' && g.pick) {
          isCorrect = winner === g.pick;
        }

        const isUnderdogPick = Boolean(
          g.pick && g.favoriteAbbr && g.pick !== g.favoriteAbbr
        );

        // Calculate potential points
        // If a team is picked: calculate for that team.
        // If no team is picked yet: calculate maximum potential (1 base + 1 prime + 1 underdog) or default baseline
        const potentialPoints = g.pick
          ? calculatePotentialPoints(g, g.pick)
          : (1 + (g.isPrimeTime ? 1 : 0) + (g.spread > 0 ? 1 : 0));

        const breakdown: string[] = ['1 pt Base'];
        if (g.isPrimeTime) {
          breakdown.push('+1 Prime Time');
        }
        if (g.pick) {
          if (isUnderdogPick) {
            breakdown.push(`+1 Underdog (${g.pick})`);
          }
        } else if (g.spread > 0) {
          breakdown.push(`+1 if Underdog chosen`);
        }

        const earnedPoints = isCorrect ? potentialPoints : 0;

        list.push({
          id: g.id,
          week: w.weekNumber,
          date: g.date,
          time: g.time,
          matchup: `${g.awayAbbr} @ ${g.homeAbbr}`,
          awayTeam: g.awayTeam,
          awayAbbr: g.awayAbbr,
          homeTeam: g.homeTeam,
          homeAbbr: g.homeAbbr,
          awayScore: g.awayScore,
          homeScore: g.homeScore,
          scoreDisplay: g.status === 'pre' ? 'vs' : `${g.awayScore} - ${g.homeScore}`,
          status: g.status,
          quarter: g.quarter,
          clock: g.clock,
          odds: g.odds,
          favoriteAbbr: g.favoriteAbbr,
          spread: g.spread,
          broadcast: g.broadcast,
          isPrimeTime: g.isPrimeTime,
          picker: g.picker,
          pick: g.pick,
          winner,
          isCorrect,
          isUnderdogPick,
          potentialPoints,
          potentialBreakdown: breakdown,
          earnedPoints,
          game: g,
        });
      });
    });

    return list;
  }, [weeks]);

  // Apply search & multi-column filters
  const filteredRecords = useMemo(() => {
    return allFlattenedGames.filter((rec) => {
      // Week filter
      if (weekFilter !== 'all' && rec.week !== weekFilter) {
        return false;
      }

      // Picker filter
      if (pickerFilter === 'unassigned' && rec.picker !== null) return false;
      if (pickerFilter === 'Corey' && rec.picker !== 'Corey') return false;
      if (pickerFilter === 'Joel' && rec.picker !== 'Joel') return false;

      // Status filter
      if (statusFilter !== 'all' && rec.status !== statusFilter) return false;

      // Result filter
      if (resultFilter === 'correct' && rec.isCorrect !== true) return false;
      if (resultFilter === 'incorrect' && rec.isCorrect !== false) return false;
      if (resultFilter === 'pending' && rec.isCorrect !== null) return false;

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesMatchup = rec.matchup.toLowerCase().includes(query);
        const matchesAway = rec.awayTeam.toLowerCase().includes(query) || rec.awayAbbr.toLowerCase().includes(query);
        const matchesHome = rec.homeTeam.toLowerCase().includes(query) || rec.homeAbbr.toLowerCase().includes(query);
        const matchesOdds = rec.odds.toLowerCase().includes(query);
        const matchesBroadcast = rec.broadcast.toLowerCase().includes(query);
        const matchesPicker = (rec.picker || '').toLowerCase().includes(query);
        const matchesPick = (rec.pick || '').toLowerCase().includes(query);
        
        if (!matchesMatchup && !matchesAway && !matchesHome && !matchesOdds && !matchesBroadcast && !matchesPicker && !matchesPick) {
          return false;
        }
      }

      return true;
    });
  }, [allFlattenedGames, weekFilter, pickerFilter, statusFilter, resultFilter, searchQuery]);

  // Apply sorting
  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'week':
          comparison = a.week - b.week;
          break;
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'favorite':
          comparison = a.favoriteAbbr.localeCompare(b.favoriteAbbr);
          break;
        case 'spread':
          comparison = a.spread - b.spread;
          break;
        case 'picker':
          comparison = (a.picker || '').localeCompare(b.picker || '');
          break;
        case 'winner':
          comparison = (a.winner || '').localeCompare(b.winner || '');
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'potential':
          comparison = a.potentialPoints - b.potentialPoints;
          break;
        case 'earned':
          comparison = a.earnedPoints - b.earnedPoints;
          break;
        default:
          comparison = a.week - b.week;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredRecords, sortField, sortOrder]);

  // Aggregate summary stats for the current filtered view
  const summaryStats = useMemo(() => {
    const total = filteredRecords.length;
    const coreyPicks = filteredRecords.filter((r) => r.picker === 'Corey');
    const joelPicks = filteredRecords.filter((r) => r.picker === 'Joel');
    const finalGames = filteredRecords.filter((r) => r.status === 'post');

    const coreyCorrect = coreyPicks.filter((r) => r.isCorrect === true).length;
    const joelCorrect = joelPicks.filter((r) => r.isCorrect === true).length;
    const coreyPts = coreyPicks.reduce((acc, r) => acc + r.earnedPoints, 0);
    const joelPts = joelPicks.reduce((acc, r) => acc + r.earnedPoints, 0);
    const unassigned = filteredRecords.filter((r) => r.picker === null).length;

    return {
      total,
      finalCount: finalGames.length,
      coreyTotal: coreyPicks.length,
      coreyWins: coreyCorrect,
      coreyPts,
      joelTotal: joelPicks.length,
      joelWins: joelCorrect,
      joelPts,
      unassigned,
    };
  }, [filteredRecords]);

  // Toggle sorting column
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const setOrder = (order: SortOrder) => {
    setSortOrder(order);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Week',
      'Date',
      'Time',
      'Away Team',
      'Away Abbr',
      'Away Score',
      'Home Team',
      'Home Abbr',
      'Home Score',
      'Status',
      'Favorite',
      'Spread',
      'Odds',
      'Broadcast',
      'Prime Time',
      'Picker',
      'Pick (Winner Choice)',
      'Game Winner',
      'Result',
      'Underdog Pick',
      'Potential Pts',
      'Earned Pts',
      'Point Rules Breakdown',
    ];

    const rows = sortedRecords.map((r) => [
      r.week,
      `"${r.date}"`,
      `"${r.time}"`,
      `"${r.awayTeam}"`,
      r.awayAbbr,
      r.status === 'pre' ? '' : r.awayScore,
      `"${r.homeTeam}"`,
      r.homeAbbr,
      r.status === 'pre' ? '' : r.homeScore,
      r.status,
      r.favoriteAbbr,
      r.spread,
      `"${r.odds}"`,
      `"${r.broadcast}"`,
      r.isPrimeTime ? 'YES' : 'NO',
      r.picker || 'Unassigned',
      r.pick || 'None',
      r.winner || '',
      r.isCorrect === true ? 'WIN' : r.isCorrect === false ? 'LOSS' : 'PENDING',
      r.isUnderdogPick ? 'YES' : 'NO',
      r.potentialPoints,
      r.status === 'post' && r.pick ? r.earnedPoints : 'Pending',
      `"${r.potentialBreakdown.join(', ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nfl_pickem_raw_data_${weekFilter === 'all' ? 'season' : `week_${weekFilter}`}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy TSV (Spreadsheet pasteable)
  const handleCopyTSV = () => {
    const headers = [
      'Week',
      'Date',
      'Matchup',
      'Away Score',
      'Home Score',
      'Status',
      'Odds',
      'Spread',
      'Broadcast',
      'Picker',
      'Pick',
      'Potential Pts',
      'Earned Pts',
      'Breakdown',
      'Winner',
      'Result',
    ];

    const rows = sortedRecords.map((r) => [
      r.week,
      r.date,
      r.matchup,
      r.status === 'pre' ? '' : r.awayScore,
      r.status === 'pre' ? '' : r.homeScore,
      r.status,
      r.odds,
      r.spread,
      r.broadcast,
      r.picker || '-',
      r.pick || '-',
      r.potentialPoints,
      r.status === 'post' && r.pick ? r.earnedPoints : '-',
      r.potentialBreakdown.join(' | '),
      r.winner || '-',
      r.isCorrect === true ? 'WIN' : r.isCorrect === false ? 'LOSS' : '-',
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((row) => row.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      
      {/* Top Filter & Control Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-sm">
        
        {/* Row 1: Search & Major Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
          
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="raw-data-search"
              type="text"
              placeholder="Search team, matchup, odds, network, or picker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Action Buttons: CSV & Copy TSV */}
          <div className="flex items-center gap-2">
            <button
              id="copy-tsv-btn"
              onClick={handleCopyTSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition"
              title="Copy tab-separated table to clipboard (paste directly into Excel or Google Sheets)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy to Sheets'}</span>
            </button>

            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition active:scale-95"
              title="Download filtered records as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Row 2: Dense Filter Dropdowns & Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80 text-xs">
          
          {/* Week Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Week
            </label>
            <select
              id="filter-week-select"
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-slate-950 border border-slate-700/90 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-medium"
            >
              <option value="all">All 18 Weeks ({allFlattenedGames.length} Games)</option>
              {weeks.map((w) => (
                <option key={w.weekNumber} value={w.weekNumber}>
                  Week {w.weekNumber} ({w.games.length} Games)
                </option>
              ))}
            </select>
          </div>

          {/* Picker Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Chosen By
            </label>
            <select
              id="filter-picker-select"
              value={pickerFilter}
              onChange={(e) => setPickerFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/90 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-medium"
            >
              <option value="all">All Picks</option>
              <option value="Corey">Corey Only</option>
              <option value="Joel">Joel Only</option>
              <option value="unassigned">Unassigned Games</option>
            </select>
          </div>

          {/* Game Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Game Status
            </label>
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/90 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="post">Final / Completed</option>
              <option value="in">In-Progress / Live</option>
              <option value="pre">Upcoming / Scheduled</option>
            </select>
          </div>

          {/* Outcome Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pick Result
            </label>
            <select
              id="filter-result-select"
              value={resultFilter}
              onChange={(e) => setResultFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-700/90 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs font-medium"
            >
              <option value="all">All Results</option>
              <option value="correct">Won Pick</option>
              <option value="incorrect">Lost Pick</option>
              <option value="pending">Pending / Live</option>
            </select>
          </div>
        </div>

        {/* Row 3: Active Filter Quick Stat Summary */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>
              Showing <strong className="text-white font-bold">{sortedRecords.length}</strong> of {allFlattenedGames.length} total season games
            </span>
            {summaryStats.finalCount > 0 && (
              <span className="hidden sm:inline">
                Completed: <strong className="text-slate-200">{summaryStats.finalCount}</strong>
              </span>
            )}
            {summaryStats.coreyTotal > 0 && (
              <span className="text-blue-400 font-medium">
                Corey: <strong>{summaryStats.coreyWins}</strong>/{summaryStats.coreyTotal} W/L (<strong className="text-blue-300">{summaryStats.coreyPts} pts</strong>)
              </span>
            )}
            {summaryStats.joelTotal > 0 && (
              <span className="text-rose-400 font-medium">
                Joel: <strong>{summaryStats.joelWins}</strong>/{summaryStats.joelTotal} W/L (<strong className="text-rose-300">{summaryStats.joelPts} pts</strong>)
              </span>
            )}
          </div>

          {/* Reset Filters shortcut if filtered */}
          {(weekFilter !== 'all' || pickerFilter !== 'all' || statusFilter !== 'all' || resultFilter !== 'all' || searchQuery !== '') && (
            <button
              onClick={() => {
                setWeekFilter('all');
                setPickerFilter('all');
                setStatusFilter('all');
                setResultFilter('all');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold underline text-[11px]"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Dense Database Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200 border-collapse">
            
            {/* Table Header */}
            <thead className="bg-slate-950/90 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800 select-none sticky top-0 z-20">
              <tr>
                <th
                  onClick={() => handleSort('week')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Wk</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Schedule</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Away Team</th>
                <th className="py-3 px-3 whitespace-nowrap">Home Team</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Score / Status</th>
                <th
                  onClick={() => handleSort('favorite')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Spread / Odds</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('picker')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Chosen By</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Selected Pick</th>
                <th
                  onClick={() => handleSort('potential')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition whitespace-nowrap text-center"
                  title="Potential points for a win (1 Base + 1 Underdog + 1 Prime Time)"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Potential Pts</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('winner')}
                  className="py-3 px-3 cursor-pointer hover:text-white transition whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Result / Pts</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-3 whitespace-nowrap">Network</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px] sm:text-xs">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-sans">
                    No games match the current query filters.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((r, idx) => {
                  const isCorey = r.picker === 'Corey';
                  const isJoel = r.picker === 'Joel';
                  const isEven = idx % 2 === 0;

                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-800/60 transition ${
                        isEven ? 'bg-slate-900/40' : 'bg-slate-900/90'
                      }`}
                    >
                      {/* Week Column */}
                      <td className="py-2.5 px-3 font-bold text-slate-300 whitespace-nowrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-sans text-[11px]">
                          W{r.week}
                        </span>
                      </td>

                      {/* Schedule: Date & Time */}
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap font-sans">
                        <div className="text-slate-200 font-medium">{r.date}</div>
                        <div className="text-[10px] text-slate-500">{r.time}</div>
                      </td>

                      {/* Away Team */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold font-sans ${r.pick === r.awayAbbr ? 'text-amber-300 font-black' : 'text-slate-200'}`}>
                            {r.awayTeam}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">({r.awayAbbr})</span>
                          {r.favoriteAbbr === r.awayAbbr && (
                            <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-sans">
                              FAV
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Home Team */}
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold font-sans ${r.pick === r.homeAbbr ? 'text-amber-300 font-black' : 'text-slate-200'}`}>
                            {r.homeTeam}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">({r.homeAbbr})</span>
                          {r.favoriteAbbr === r.homeAbbr && (
                            <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-sans">
                              FAV
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Score / Live State */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {r.status === 'pre' ? (
                          <span className="text-slate-500 font-sans text-[11px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            Upcoming
                          </span>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                            <span className={`font-black ${r.awayScore > r.homeScore ? 'text-emerald-400' : 'text-slate-300'}`}>
                              {r.awayScore}
                            </span>
                            <span className="text-slate-600">-</span>
                            <span className={`font-black ${r.homeScore > r.awayScore ? 'text-emerald-400' : 'text-slate-300'}`}>
                              {r.homeScore}
                            </span>
                            {r.status === 'in' && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping ml-1" />
                            )}
                            {r.status === 'post' && (
                              <span className="text-[10px] text-slate-500 font-sans ml-1">F</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Spread / Odds */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                        <span className="font-semibold text-slate-300">{r.odds}</span>
                        <span className="text-[10px] text-slate-500 ml-1.5">
                          ({r.spread > 0 ? `-${r.spread}` : 'PK'})
                        </span>
                      </td>

                      {/* Chosen By (Picker) */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                        {isCorey && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-950/70 border border-blue-700/60 text-blue-300 font-semibold text-[11px]">
                            Corey
                          </span>
                        )}
                        {isJoel && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-950/70 border border-rose-700/60 text-rose-300 font-semibold text-[11px]">
                            Joel
                          </span>
                        )}
                        {!r.picker && (
                          <span className="text-slate-500 text-[11px] italic">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Selected Pick */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans">
                        {r.pick ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-amber-300 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[11px]">
                              {r.pick}
                            </span>
                            {r.isUnderdogPick && (
                              <span className="text-[9px] font-bold px-1 rounded bg-purple-950 text-purple-300 border border-purple-800" title="Underdog Pick (+1 pt)">
                                DOG
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Potential Points Column */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                        <div
                          className="inline-flex flex-col items-center group relative cursor-help"
                          title={r.potentialBreakdown.join(' • ')}
                        >
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700/80">
                            <span className={`text-xs font-black ${
                              r.potentialPoints === 3 
                                ? 'text-amber-400 font-extrabold' 
                                : r.potentialPoints === 2 
                                ? 'text-sky-300' 
                                : 'text-slate-300'
                            }`}>
                              {r.potentialPoints} {r.potentialPoints === 1 ? 'pt' : 'pts'}
                            </span>
                            {r.potentialPoints === 3 && (
                              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                            )}
                          </div>

                          {/* Mini breakdown indicator tags */}
                          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-500 font-mono">
                            <span className="text-slate-400">1</span>
                            {r.isPrimeTime && (
                              <span className="text-amber-400 font-bold" title="+1 Prime Time">
                                +1★
                              </span>
                            )}
                            {r.isUnderdogPick && (
                              <span className="text-purple-400 font-bold" title="+1 Underdog">
                                +1🐕
                              </span>
                            )}
                            {!r.pick && r.spread > 0 && (
                              <span className="text-slate-600 text-[8px]" title="Possible underdog bonus">
                                (+1?)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Result / Outcome */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-sans">
                        {r.status === 'post' ? (
                          r.pick ? (
                            r.isCorrect ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-600/70 text-emerald-300 font-bold text-[11px] shadow-sm shadow-emerald-950">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>WIN (+{r.potentialPoints} {r.potentialPoints === 1 ? 'pt' : 'pts'})</span>
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-center">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-700/60 text-rose-400 font-bold text-[10px]">
                                  <XCircle className="w-3 h-3" />
                                  <span>LOSS (0 pts)</span>
                                </span>
                              </div>
                            )
                          ) : (
                            <span className="text-slate-500 text-[10px]">No Pick</span>
                          )
                        ) : (
                          <span className="text-slate-500 text-[10px] flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 text-slate-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      {/* Network Broadcast */}
                      <td className="py-2.5 px-3 whitespace-nowrap font-sans text-slate-400 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/60">
                          {r.broadcast}
                        </span>
                        {r.isPrimeTime && (
                          <span className="ml-1 text-[9px] text-amber-400 font-bold">
                            ★
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info within table container */}
        <div className="bg-slate-950/80 px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span><strong>Scoring Rules:</strong> 1 base point + 1 underdog bonus + 1 prime time bonus (up to 3 pts).</span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span>Hover or sort <strong>Potential Pts</strong> to view itemized rule bonuses.</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            Rows: {sortedRecords.length}
          </div>
        </div>
      </div>

    </div>
  );
};
