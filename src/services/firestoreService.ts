import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
  onSnapshot,
  getDocFromServer,
  Unsubscribe,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { WeekData, GameChangeLogEntry } from '../types';
import { INITIAL_WEEKS, getDefaultDraftOrderFirst } from '../data/initialSeasonData';
import { computePlayerStats, computeNextOnTheClock } from './scoringEngine';
import { stripSyntheticPicks } from './storageService';

export const CURRENT_SEASON_ID = '2026-27';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Removes undefined values recursively so Firestore's set/update does not reject payloads.
 */
export function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (value === undefined ? null : value))
  );
}

/**
 * Validates Firestore server connectivity as required by Firebase skill
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore client is currently offline. Changes will queue locally.');
      return false;
    }
    return true;
  }
}

// Alias for backwards compatibility
export const validateFirestoreConnection = testConnection;

/**
 * Initialize 18 weeks into Firestore if empty or seed any missing weeks into season.
 * Strictly preserves existing weeks and their picks/scores while backfilling missing weeks.
 */
export async function seedSeasonIfEmpty(): Promise<WeekData[]> {
  const weeksColPath = `seasons/${CURRENT_SEASON_ID}/weeks`;
  try {
    const snap = await getDocs(collection(db, 'seasons', CURRENT_SEASON_ID, 'weeks'));
    
    // Map any existing weeks currently in Firestore so we never overwrite existing user work
    const existingMap = new Map<number, WeekData>();
    snap.forEach((d) => {
      const data = d.data() as WeekData;
      if (data && typeof data.weekNumber === 'number') {
        existingMap.set(data.weekNumber, data);
      }
    });

    const batch = writeBatch(db);
    let batchHasWrites = false;

    // Season doc
    const seasonRef = doc(db, 'seasons', CURRENT_SEASON_ID);
    batch.set(
      seasonRef,
      {
        seasonYear: 2026,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'system',
      },
      { merge: true }
    );

    const fullWeeks: WeekData[] = [];

    // Ensure all 18 weeks are present in both return value and Firestore
    for (const defaultWeek of INITIAL_WEEKS) {
      const existing = existingMap.get(defaultWeek.weekNumber);
      if (existing && existing.games && existing.games.length > 0) {
        fullWeeks.push(existing);
      } else {
        // Missing from Firestore: backfill into Firestore
        const weekRef = doc(db, 'seasons', CURRENT_SEASON_ID, 'weeks', `w${defaultWeek.weekNumber}`);
        const cleanPayload = sanitizeForFirestore({
          weekNumber: defaultWeek.weekNumber,
          onTheClock: defaultWeek.onTheClock,
          draftOrderFirst: defaultWeek.draftOrderFirst,
          games: defaultWeek.games,
          stats: defaultWeek.stats,
          lastUpdated: new Date().toISOString(),
          updatedBy: auth.currentUser?.email || 'system',
        });
        batch.set(weekRef, cleanPayload);
        batchHasWrites = true;
        fullWeeks.push(defaultWeek);
      }
    }

    if (batchHasWrites) {
      console.log('Seeding missing weeks into Firestore batch...');
      await batch.commit();
    }

    fullWeeks.sort((a, b) => a.weekNumber - b.weekNumber);
    return fullWeeks;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, weeksColPath);
  }
}

/**
 * Subscribe to real-time updates for all weeks across devices.
 * Always guarantees a full 18-week schedule (1..18).
 */
export function subscribeToSeasonWeeks(
  onUpdate: (weeks: WeekData[], fromCache: boolean) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const weeksCol = collection(db, 'seasons', CURRENT_SEASON_ID, 'weeks');

  return onSnapshot(
    weeksCol,
    { includeMetadataChanges: true },
    (snapshot) => {
      const loadedMap = new Map<number, WeekData>();
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as WeekData;
        if (data && typeof data.weekNumber === 'number') {
          loadedMap.set(data.weekNumber, data);
        }
      });

      // Data Preservation: If Week 1 in Firestore has lost its picks or final scores,
      // automatically restore from the verified historical backup and repair Firestore.
      for (const defWeek of INITIAL_WEEKS) {
        if (!defWeek.games.some((g) => g.picker)) continue;
        const loadedWeek = loadedMap.get(defWeek.weekNumber);
        const isMissingPicks = !loadedWeek || !loadedWeek.games || !loadedWeek.games.some((g) => g.picker);
        if (isMissingPicks) {
          console.log(`Restoring Week ${defWeek.weekNumber} historical picks from backup into Firestore...`);
          loadedMap.set(defWeek.weekNumber, defWeek);
          syncWeekToFirestore(defWeek).catch((err) => {
            console.warn(`Could not auto-repair Week ${defWeek.weekNumber} document in Firestore:`, err);
          });
        }
      }

      // Ensure all 18 weeks are present in array and historical scores are restored
      const fullLoaded: WeekData[] = [];
      let hasMissingWeeks = false;

      for (let weekNum = 1; weekNum <= 18; weekNum++) {
        const existing = loadedMap.get(weekNum);
        const defaultWeek = INITIAL_WEEKS.find((w) => w.weekNumber === weekNum);

        if (existing && existing.games && existing.games.length > 0) {
          // Merge official scores from defaultWeek if existing games are missing them,
          // while strictly keeping existing user-chosen picks
          if (defaultWeek && defaultWeek.games) {
            const mergedGames = defaultWeek.games.map((dg) => {
              const eg = existing.games.find(
                (g) => g.id === dg.id || (g.homeAbbr === dg.homeAbbr && g.awayAbbr === dg.awayAbbr)
              );
              if (!eg) return dg;

              const hasVerifiedResult =
                (dg.status === 'post' && eg.status !== 'post') ||
                (dg.status === 'in' && eg.status === 'pre') ||
                ((dg.homeScore > 0 || dg.awayScore > 0) &&
                  eg.homeScore === 0 &&
                  eg.awayScore === 0);

              // Strictly preserve user's existing picker and pick
              const userPicker = eg.picker || ((defaultWeek.weekNumber === 1 || defaultWeek.weekNumber === 2) ? dg.picker : null);
              const userPick = eg.pick || ((defaultWeek.weekNumber === 1 || defaultWeek.weekNumber === 2) ? dg.pick : null);

              return {
                ...eg,
                picker: userPicker,
                pick: userPick,
                isExtraPick: eg.isExtraPick ?? dg.isExtraPick ?? false,
                homeScore: hasVerifiedResult ? dg.homeScore : eg.homeScore,
                awayScore: hasVerifiedResult ? dg.awayScore : eg.awayScore,
                status: hasVerifiedResult ? dg.status : (eg.status || dg.status),
                quarter: hasVerifiedResult ? dg.quarter : (eg.quarter || dg.quarter),
                clock: hasVerifiedResult ? dg.clock : (eg.clock || dg.clock),
                odds: eg.odds || dg.odds,
                spread: eg.spread ?? dg.spread,
                favoriteAbbr: eg.favoriteAbbr || dg.favoriteAbbr,
                broadcast: eg.broadcast || dg.broadcast,
                isPrimeTime: eg.isPrimeTime ?? dg.isPrimeTime,
              };
            });

            const stats = {
              Corey: computePlayerStats(mergedGames, 'Corey'),
              Joel: computePlayerStats(mergedGames, 'Joel'),
            };

            fullLoaded.push({ ...existing, games: mergedGames, stats });
          } else {
            fullLoaded.push(existing);
          }
        } else {
          if (defaultWeek) {
            fullLoaded.push(defaultWeek);
            hasMissingWeeks = true;
          }
        }
      }

      // Proactively backfill missing weeks into Firestore in background so all clients sync up
      if (hasMissingWeeks) {
        seedSeasonIfEmpty().catch((err) => {
          console.warn('Auto-seed missing weeks background sync:', err);
        });
      }

      fullLoaded.sort((a, b) => a.weekNumber - b.weekNumber);

      // Enforce alternating draft order rules and compute real-time player stats
      const normalized = fullLoaded.map((w) => {
        const expectedFirst = getDefaultDraftOrderFirst(w.weekNumber);
        const hasPicks = w.games?.some((g) => g.picker);
        const draftOrderFirst = hasPicks ? (w.draftOrderFirst || expectedFirst) : expectedFirst;
        const computedOnClock = computeNextOnTheClock(w.games || [], draftOrderFirst);
        return {
          ...w,
          draftOrderFirst,
          onTheClock: hasPicks ? (w.onTheClock || computedOnClock) : computedOnClock,
          stats: {
            Corey: computePlayerStats(w.games, 'Corey'),
            Joel: computePlayerStats(w.games, 'Joel'),
          },
        };
      });

      onUpdate(normalized, snapshot.metadata.fromCache);
    },
    (error) => {
      console.warn('Firestore subscription status:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save / sync a single week's state (pick made, score updated, draft passed) to Firestore
 */
export async function syncWeekToFirestore(week: WeekData): Promise<void> {
  const weekPath = `seasons/${CURRENT_SEASON_ID}/weeks/w${week.weekNumber}`;
  try {
    const weekRef = doc(db, 'seasons', CURRENT_SEASON_ID, 'weeks', `w${week.weekNumber}`);
    const cleanPayload = sanitizeForFirestore({
      weekNumber: week.weekNumber,
      onTheClock: week.onTheClock,
      draftOrderFirst: week.draftOrderFirst,
      games: week.games,
      stats: week.stats,
      lastUpdated: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'anonymous',
    });
    await setDoc(weekRef, cleanPayload, { merge: true });

    // Redundant permanent picks archive in Firestore so pick data is never lost
    const backupRef = doc(db, 'seasons', CURRENT_SEASON_ID, 'picks_archive', `w${week.weekNumber}`);
    setDoc(backupRef, cleanPayload, { merge: true }).catch((err) => {
      console.warn('Archive write note:', err);
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, weekPath);
  }
}

/**
 * Sync an entire set of weeks (e.g. from Google Drive or JSON import) to Firestore in a batch
 */
export async function syncAllWeeksToFirestore(weeks: WeekData[]): Promise<void> {
  const seasonPath = `seasons/${CURRENT_SEASON_ID}`;
  try {
    const batch = writeBatch(db);
    weeks.forEach((w) => {
      const weekRef = doc(db, 'seasons', CURRENT_SEASON_ID, 'weeks', `w${w.weekNumber}`);
      const cleanPayload = sanitizeForFirestore({
        weekNumber: w.weekNumber,
        onTheClock: w.onTheClock,
        draftOrderFirst: w.draftOrderFirst,
        games: w.games,
        stats: w.stats,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'sync',
      });
      batch.set(weekRef, cleanPayload, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, seasonPath);
  }
}

/**
 * Overwrite / reset all weeks to clean slate in Firestore
 */
export async function resetAllWeeksInFirestore(): Promise<void> {
  const seasonPath = `seasons/${CURRENT_SEASON_ID}`;
  try {
    const batch = writeBatch(db);

    const seasonRef = doc(db, 'seasons', CURRENT_SEASON_ID);
    batch.set(seasonRef, {
      seasonYear: 2026,
      lastUpdated: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || 'reset',
    });

    INITIAL_WEEKS.forEach((w) => {
      const weekRef = doc(db, 'seasons', CURRENT_SEASON_ID, 'weeks', `w${w.weekNumber}`);
      const cleanPayload = sanitizeForFirestore({
        weekNumber: w.weekNumber,
        onTheClock: w.onTheClock,
        draftOrderFirst: w.draftOrderFirst,
        games: w.games,
        stats: w.stats,
        lastUpdated: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'reset',
      });
      batch.set(weekRef, cleanPayload);
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, seasonPath);
  }
}

/**
 * Record a game or pick modification in the Firestore change log collection
 */
export async function recordChangeLogInFirestore(entry: GameChangeLogEntry): Promise<void> {
  try {
    const logRef = doc(db, 'seasons', CURRENT_SEASON_ID, 'change_log', entry.id);
    const cleanPayload = sanitizeForFirestore({
      ...entry,
      updatedBy: auth.currentUser?.email || entry.author || 'app',
    });
    await setDoc(logRef, cleanPayload);
  } catch (err) {
    console.warn('Failed to record change log to Firestore:', err);
  }
}

/**
 * Subscribe to the change log entries collection in Firestore (ordered newest first)
 */
export function subscribeToChangeLog(
  onUpdate: (logs: GameChangeLogEntry[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const colRef = collection(db, 'seasons', CURRENT_SEASON_ID, 'change_log');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const logs: GameChangeLogEntry[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as GameChangeLogEntry;
        if (data && data.id && data.timestamp) {
          logs.push(data);
        }
      });
      logs.sort((a, b) => b.timestamp - a.timestamp);
      onUpdate(logs);
    },
    (err) => {
      console.warn('Change log subscription error:', err);
      if (onError) onError(err);
    }
  );
}
