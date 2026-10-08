import { WeekData, NFLGame, GameChangeLogEntry } from '../types';
import { INITIAL_WEEKS, getDefaultDraftOrderFirst } from '../data/initialSeasonData';
import { INITIAL_CHANGE_LOGS } from '../data/initialChangeLogs';
import { computePlayerStats, computeNextOnTheClock } from './scoringEngine';

const STORAGE_KEY = 'nfl_pickem_2026_27_user_data_v1';
const CHANGE_LOG_KEY = 'nfl_pickem_2026_27_change_log_v1';

/**
 * Strips synthetic auto-drafted optimizer picks if needed.
 * Now a safe pass-through so real user-entered picks are NEVER deleted or stripped.
 */
export function stripSyntheticPicks(games: NFLGame[]): NFLGame[] {
  if (!Array.isArray(games)) return [];
  return games;
}

/**
 * Normalizes weeks to ensure:
 * 1. Alternating draft order (Week 1 Joel, Week 2 Corey, alternating)
 * 2. Unstarted draft weeks have onTheClock set to their week's first picker
 * 3. All user picks, pickers, and completed game scores are strictly preserved
 * 4. Player and week statistics are accurately computed
 */
export function normalizeAndProtectWeeks(weeks: WeekData[]): WeekData[] {
  return weeks.map((w) => {
    const expectedFirst = getDefaultDraftOrderFirst(w.weekNumber);
    const defaultWeek = INITIAL_WEEKS.find((dw) => dw.weekNumber === w.weekNumber);
    let games = w.games || [];

    // If default games exist for this week, merge in verified team metadata/scores
    // while strictly preserving all user-chosen picks and pickers
    if (defaultWeek && defaultWeek.games) {
      games = defaultWeek.games.map((defGame) => {
        const existingGame = games.find(
          (eg) =>
            eg.id === defGame.id ||
            (eg.homeAbbr === defGame.homeAbbr && eg.awayAbbr === defGame.awayAbbr)
        );
        if (!existingGame) return defGame;

        // Determine if defaultWeek has verified score/status updates
        const hasVerifiedResult =
          (defGame.status === 'post' && existingGame.status !== 'post') ||
          (defGame.status === 'in' && existingGame.status === 'pre') ||
          ((defGame.homeScore > 0 || defGame.awayScore > 0) &&
            existingGame.homeScore === 0 &&
            existingGame.awayScore === 0);

        // Crucial: Always prioritize existing user-chosen picker & pick!
        // Fall back to defGame if existingGame has no pick AND defGame has historical baseline (Weeks 1 & 2)
        const userPicker = existingGame.picker || ((w.weekNumber === 1 || w.weekNumber === 2) ? defGame.picker : null);
        const userPick = existingGame.pick || ((w.weekNumber === 1 || w.weekNumber === 2) ? defGame.pick : null);

        return {
          ...existingGame,
          picker: userPicker,
          pick: userPick,
          isExtraPick: existingGame.isExtraPick ?? defGame.isExtraPick ?? false,
          homeScore: hasVerifiedResult ? defGame.homeScore : existingGame.homeScore,
          awayScore: hasVerifiedResult ? defGame.awayScore : existingGame.awayScore,
          status: hasVerifiedResult ? defGame.status : (existingGame.status || defGame.status),
          quarter: hasVerifiedResult ? defGame.quarter : (existingGame.quarter || defGame.quarter),
          clock: hasVerifiedResult ? defGame.clock : (existingGame.clock || defGame.clock),
          odds: existingGame.odds || defGame.odds,
          spread: existingGame.spread ?? defGame.spread,
          favoriteAbbr: existingGame.favoriteAbbr || defGame.favoriteAbbr,
          broadcast: existingGame.broadcast || defGame.broadcast,
          isPrimeTime: existingGame.isPrimeTime ?? defGame.isPrimeTime,
        };
      });
    }

    const hasPicks = games.some((g) => g.picker);

    // If Week 1 or Week 2 is completely empty in storage, seed official baseline picks
    if ((w.weekNumber === 1 || w.weekNumber === 2) && defaultWeek && !hasPicks) {
      return {
        ...defaultWeek,
        draftOrderFirst: expectedFirst,
        onTheClock: expectedFirst,
        stats: {
          Corey: computePlayerStats(defaultWeek.games, 'Corey'),
          Joel: computePlayerStats(defaultWeek.games, 'Joel'),
        },
      };
    }

    const draftOrderFirst = hasPicks ? (w.draftOrderFirst || expectedFirst) : expectedFirst;
    const computedOnClock = computeNextOnTheClock(games, draftOrderFirst);

    return {
      ...w,
      games,
      draftOrderFirst,
      onTheClock: hasPicks ? (w.onTheClock || computedOnClock) : computedOnClock,
      stats: {
        Corey: computePlayerStats(games, 'Corey'),
        Joel: computePlayerStats(games, 'Joel'),
      },
    };
  });
}

/**
 * Guarantees all 18 weeks (1..18) are present.
 * If any weeks are missing from existing data, fills them in from INITIAL_WEEKS
 * while strictly preserving all user picks and completed games for existing weeks.
 */
export function ensureFull18Weeks(existingWeeks: WeekData[]): WeekData[] {
  const existingMap = new Map<number, WeekData>();
  if (Array.isArray(existingWeeks)) {
    for (const w of existingWeeks) {
      if (w && typeof w.weekNumber === 'number') {
        existingMap.set(w.weekNumber, w);
      }
    }
  }

  const full: WeekData[] = [];
  for (let weekNum = 1; weekNum <= 18; weekNum++) {
    const existing = existingMap.get(weekNum);
    if (existing && existing.games && existing.games.length > 0) {
      full.push(existing);
    } else {
      const defaultWeek = INITIAL_WEEKS.find((w) => w.weekNumber === weekNum);
      if (defaultWeek) {
        full.push(defaultWeek);
      }
    }
  }

  return normalizeAndProtectWeeks(full);
}

export function loadSavedWeeks(): WeekData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return ensureFull18Weeks(parsed);
      }
    }
  } catch (err) {
    console.error('Failed to parse saved weeks from localStorage:', err);
  }
  return ensureFull18Weeks(INITIAL_WEEKS);
}

export function saveWeeksToStorage(weeks: WeekData[]): void {
  try {
    if (!Array.isArray(weeks) || weeks.length === 0) return;
    const full = ensureFull18Weeks(weeks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
  } catch (err) {
    console.error('Failed to save weeks to localStorage:', err);
  }
}

export function resetToSpreadsheetDefaults(): WeekData[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error(err);
  }
  return normalizeAndProtectWeeks(INITIAL_WEEKS);
}

/**
 * Download a timestamped full JSON backup of the entire 18-week season
 * with all picks, games, scores, and statistics.
 */
export function downloadSeasonJsonBackup(weeks: WeekData[]): void {
  const full = ensureFull18Weeks(weeks);
  const backupPayload = {
    exportDate: new Date().toISOString(),
    seasonYear: 2026,
    version: '2026-27-v1',
    weeks: full,
  };
  const jsonStr = JSON.stringify(backupPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NFL-Pickem-Season-Backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse an uploaded JSON backup file and return validated 18-week season data
 */
export function parseUploadedSeasonJson(jsonStr: string): WeekData[] {
  const parsed = JSON.parse(jsonStr);
  let weeksArray: any[] = [];
  if (Array.isArray(parsed)) {
    weeksArray = parsed;
  } else if (parsed && Array.isArray(parsed.weeks)) {
    weeksArray = parsed.weeks;
  } else {
    throw new Error('Invalid backup file format. Expected a list of weeks.');
  }

  if (weeksArray.length === 0) {
    throw new Error('Uploaded JSON file contains no week data.');
  }

  return ensureFull18Weeks(weeksArray);
}

/**
 * Load change log entries from localStorage cache
 */
export function loadChangeLogFromStorage(): GameChangeLogEntry[] {
  try {
    const raw = localStorage.getItem(CHANGE_LOG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse change log from localStorage:', err);
  }
  // Default to comprehensive initial change logs across all weeks
  saveChangeLogToStorage(INITIAL_CHANGE_LOGS);
  return INITIAL_CHANGE_LOGS;
}

/**
 * Save change log entries to localStorage cache
 */
export function saveChangeLogToStorage(entries: GameChangeLogEntry[]): void {
  try {
    if (!Array.isArray(entries)) return;
    localStorage.setItem(CHANGE_LOG_KEY, JSON.stringify(entries.slice(0, 500)));
  } catch (err) {
    console.error('Failed to save change log to localStorage:', err);
  }
}

/**
 * Prepend a change log entry locally and persist to storage
 */
export function recordLocalChangeLogEntry(entry: GameChangeLogEntry): GameChangeLogEntry[] {
  const existing = loadChangeLogFromStorage();
  const filtered = existing.filter((e) => e.id !== entry.id);
  const updated = [entry, ...filtered].slice(0, 500);
  saveChangeLogToStorage(updated);
  return updated;
}

/**
 * Download a timestamped full JSON / text export of the complete change log
 */
export function downloadChangeLogExport(entries: GameChangeLogEntry[]): void {
  const jsonStr = JSON.stringify(
    {
      exportDate: new Date().toISOString(),
      season: '2026-27 NFL Pick\'em',
      totalEntries: entries.length,
      entries,
    },
    null,
    2
  );
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `NFL-Pickem-ChangeLog-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

