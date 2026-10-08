import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';

import { WeekData, PlayerId, NFLGame, GameChangeLogEntry } from './types';
import { 
  loadSavedWeeks, 
  saveWeeksToStorage, 
  resetToSpreadsheetDefaults, 
  ensureFull18Weeks, 
  stripSyntheticPicks, 
  downloadSeasonJsonBackup,
  loadChangeLogFromStorage,
  saveChangeLogToStorage,
  recordLocalChangeLogEntry
} from './services/storageService';
import { INITIAL_WEEKS, getDefaultDraftOrderFirst } from './data/initialSeasonData';
import {
  subscribeToSeasonWeeks,
  syncWeekToFirestore,
  syncAllWeeksToFirestore,
  seedSeasonIfEmpty,
  resetAllWeeksInFirestore,
  validateFirestoreConnection,
  recordChangeLogInFirestore,
  subscribeToChangeLog
} from './services/firestoreService';
import { computePlayerStats, computeSeasonStats, getGameWinner, getSeasonActiveWeekNum, computeNextOnTheClock } from './services/scoringEngine';
import { fetchEspnScores } from './services/espnApi';
import { initAuth } from './services/driveService';

import { Navbar } from './components/Navbar';
import { CumulativeSeasonBanner } from './components/CumulativeSeasonBanner';
import { WeekAdminBar } from './components/WeekAdminBar';
import { WeekMatchupSnapshot } from './components/WeekMatchupSnapshot';
import { GameCard } from './components/GameCard';
import { DataViewContainer } from './components/DataViewContainer';
import { DriveModal } from './components/DriveModal';
import { RulesModal } from './components/RulesModal';
import { PowerUpsModal } from './components/PowerUpsModal';
import { DraftOptimizerPane } from './components/DraftOptimizerPane';
import { ChangeLogModal } from './components/ChangeLogModal';
import { EditGameModal } from './components/EditGameModal';
import { ResetDraftModal } from './components/ResetDraftModal';

import { Shield, Sparkles, Trophy, RotateCcw, Download, Lock, CheckCircle2, AlertTriangle, Info, X, History } from 'lucide-react';

export default function App() {
  const [weeks, setWeeks] = useState<WeekData[]>(() => loadSavedWeeks());
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(() => {
    const loaded = loadSavedWeeks();
    return getSeasonActiveWeekNum(loaded);
  });
  const [hasUserNavigated, setHasUserNavigated] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slate' | 'data'>('slate');
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [refreshNotification, setRefreshNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'error';
    timestamp: number;
  } | null>(null);
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');

  // Auto-dismiss refresh notification after 5 seconds
  useEffect(() => {
    if (!refreshNotification) return;
    const timer = setTimeout(() => {
      setRefreshNotification(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [refreshNotification]);

  // Modals state
  const [isDriveOpen, setIsDriveOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isPowerUpsOpen, setIsPowerUpsOpen] = useState<boolean>(false);
  const [changeLogs, setChangeLogs] = useState<GameChangeLogEntry[]>(() => loadChangeLogFromStorage());
  const [isChangeLogOpen, setIsChangeLogOpen] = useState<boolean>(false);
  const [editingGame, setEditingGame] = useState<NFLGame | null>(null);
  const [isEditGameOpen, setIsEditGameOpen] = useState<boolean>(false);
  const [isResetDraftModalOpen, setIsResetDraftModalOpen] = useState<boolean>(false);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => setGoogleUser(user),
      () => setGoogleUser(null)
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Validate Firestore and set up real-time live synchronization
  useEffect(() => {
    let isMounted = true;
    let unsubFn: (() => void) | null = null;
    let unsubLogsFn: (() => void) | null = null;

    const setupFirestore = async () => {
      // 1. Run connection probe as required by Firebase skill
      validateFirestoreConnection().catch((err) => {
        console.warn('Initial connection probe:', err);
      });

      // Proactively ensure all 18 weeks exist in Firestore
      seedSeasonIfEmpty().catch((err) => {
        console.warn('Proactive season seed verification:', err);
      });

      // 2. Set up real-time change log listener
      try {
        unsubLogsFn = subscribeToChangeLog((cloudLogs) => {
          if (!isMounted) return;
          if (cloudLogs && cloudLogs.length > 0) {
            setChangeLogs(cloudLogs);
            saveChangeLogToStorage(cloudLogs);
          }
        });
      } catch (err) {
        console.warn('Change log init note:', err);
      }

      // 3. Set up real-time Firestore listener with cache and server updates
      try {
        unsubFn = subscribeToSeasonWeeks(
          (cloudWeeks, fromCache) => {
            if (!isMounted) return;

            if (cloudWeeks && cloudWeeks.length > 0) {
              const fullWeeks = ensureFull18Weeks(cloudWeeks);
              setWeeks(fullWeeks);
              setCloudSyncStatus(fromCache ? 'syncing' : 'synced');
              if (!hasUserNavigated) {
                setSelectedWeekNum(getSeasonActiveWeekNum(fullWeeks));
              }
            } else {
              // Database collection is brand new / empty: seed default 18 weeks
              seedSeasonIfEmpty()
                .then((seeded) => {
                  if (isMounted && seeded && seeded.length > 0) {
                    const full = ensureFull18Weeks(seeded);
                    setWeeks(full);
                    setCloudSyncStatus('synced');
                    if (!hasUserNavigated) {
                      setSelectedWeekNum(getSeasonActiveWeekNum(full));
                    }
                  }
                })
                .catch((seedErr) => {
                  console.warn('Initial database seed:', seedErr);
                  if (isMounted) setCloudSyncStatus('offline');
                });
            }
          },
          (err) => {
            console.warn('Firestore subscription status:', err);
            if (isMounted) setCloudSyncStatus('offline');
          }
        );
      } catch (err) {
        console.error('Firestore init failed:', err);
        if (isMounted) setCloudSyncStatus('offline');
      }
    };

    setupFirestore();

    return () => {
      isMounted = false;
      if (unsubFn) unsubFn();
      if (unsubLogsFn) unsubLogsFn();
    };
  }, [hasUserNavigated]);

  // Save to localStorage as secondary backup
  useEffect(() => {
    saveWeeksToStorage(weeks);
  }, [weeks]);

  // Dynamically compute the current active week based on game completion
  const currentActiveWeekNum = useMemo(() => {
    return getSeasonActiveWeekNum(weeks);
  }, [weeks]);

  const isCurrentActiveWeek = selectedWeekNum === currentActiveWeekNum;

  // Current active week data
  const currentWeekData = useMemo(() => {
    return (
      weeks.find((w) => w.weekNumber === selectedWeekNum) ||
      INITIAL_WEEKS.find((w) => w.weekNumber === selectedWeekNum) ||
      weeks[0] ||
      INITIAL_WEEKS[0]
    );
  }, [weeks, selectedWeekNum]);

  // Check if current week has any games still waiting to be drafted
  const hasUnassignedGames = currentWeekData.games.some((g) => !g.picker || !g.pick);

  // Player statistics for current week
  const coreyWeekStats = useMemo(() => {
    return computePlayerStats(currentWeekData.games, 'Corey');
  }, [currentWeekData]);

  const joelWeekStats = useMemo(() => {
    return computePlayerStats(currentWeekData.games, 'Joel');
  }, [currentWeekData]);

  // Full season cumulative stats
  const seasonStats = useMemo(() => {
    return computeSeasonStats(weeks);
  }, [weeks]);

  // Central Audit & Change Logger
  const logGameChange = (
    weekNum: number,
    game: NFLGame,
    previousGame: { picker: PlayerId | null; pick: string | null } | undefined,
    changeType: GameChangeLogEntry['changeType'],
    summary: string,
    details?: string,
    author?: string
  ) => {
    const now = Date.now();
    const formattedTime = new Date(now).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const entry: GameChangeLogEntry = {
      id: `log_${now}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now,
      formattedTime,
      weekNumber: weekNum,
      gameId: game.id,
      matchup: `${game.awayAbbr} @ ${game.homeAbbr}`,
      changeType,
      summary,
      details,
      author: author || game.picker || 'Commissioner',
      previous: previousGame,
      current: { picker: game.picker, pick: game.pick },
    };

    setChangeLogs((prev) => [entry, ...prev.filter((e) => e.id !== entry.id)].slice(0, 500));
    recordLocalChangeLogEntry(entry);
    recordChangeLogInFirestore(entry).catch((err) => {
      console.warn('Change log write:', err);
    });
  };

  // Handler: Assign game to picker
  const handleAssignPicker = (gameId: string, picker: PlayerId | null) => {
    let targetGame: NFLGame | undefined;
    let oldPicker: PlayerId | null = null;
    let oldPick: string | null = null;

    setWeeks((prev) => {
      const updated = prev.map((w) => {
        if (w.weekNumber !== selectedWeekNum) return w;
        targetGame = w.games.find((g) => g.id === gameId);
        if (targetGame) {
          oldPicker = targetGame.picker;
          oldPick = targetGame.pick;
        }
        const newGames = w.games.map((g) => {
          if (g.id !== gameId) return g;
          return {
            ...g,
            picker,
            pick: picker === null ? null : g.pick ?? null,
          };
        });
        const stats = {
          Corey: computePlayerStats(newGames, 'Corey'),
          Joel: computePlayerStats(newGames, 'Joel'),
        };
        const nextOnClock = computeNextOnTheClock(newGames, w.draftOrderFirst || getDefaultDraftOrderFirst(w.weekNumber));
        return {
          ...w,
          onTheClock: nextOnClock,
          games: newGames,
          stats,
        };
      });
      const updatedWeek = updated.find((w) => w.weekNumber === selectedWeekNum);
      if (updatedWeek) {
        setCloudSyncStatus('syncing');
        syncWeekToFirestore(updatedWeek)
          .then(() => setCloudSyncStatus('synced'))
          .catch((err) => {
            console.error('Firestore sync error:', err);
            setCloudSyncStatus('offline');
          });
      }
      return updated;
    });

    if (targetGame) {
      const summary = picker === null
        ? `Cleared assignment on ${targetGame.awayAbbr} @ ${targetGame.homeAbbr} (was ${oldPicker || 'None'})`
        : oldPicker && oldPicker !== picker
        ? `Switched picker on ${targetGame.awayAbbr} @ ${targetGame.homeAbbr} from ${oldPicker} to ${picker}`
        : `Assigned ${targetGame.awayAbbr} @ ${targetGame.homeAbbr} to ${picker}`;

      const updatedGameForLog: NFLGame = {
        ...targetGame,
        picker,
        pick: picker === null ? null : targetGame.pick,
      };

      logGameChange(
        selectedWeekNum,
        updatedGameForLog,
        { picker: oldPicker, pick: oldPick },
        picker === null ? 'clear' : 'picker',
        summary,
        undefined,
        picker || 'Commissioner'
      );
    }
  };

  // Handler: Select team winner pick
  const handleSelectPick = (gameId: string, teamAbbr: string) => {
    let targetGame: NFLGame | undefined;
    let oldPicker: PlayerId | null = null;
    let oldPick: string | null = null;
    let finalPicker: PlayerId = 'Corey';
    let finalPick: string | null = null;

    setWeeks((prev) => {
      const updated = prev.map((w) => {
        if (w.weekNumber !== selectedWeekNum) return w;
        targetGame = w.games.find((g) => g.id === gameId);
        if (targetGame) {
          oldPicker = targetGame.picker;
          oldPick = targetGame.pick;
        }
        const assignedPicker = targetGame?.picker || w.onTheClock || w.draftOrderFirst || getDefaultDraftOrderFirst(w.weekNumber);
        finalPicker = assignedPicker;
        const newPick = targetGame?.pick === teamAbbr ? null : teamAbbr;
        finalPick = newPick;

        const newGames = w.games.map((g) => {
          if (g.id !== gameId) return g;
          return {
            ...g,
            picker: newPick === null && targetGame?.picker === null ? null : assignedPicker,
            pick: newPick,
          };
        });
        const stats = {
          Corey: computePlayerStats(newGames, 'Corey'),
          Joel: computePlayerStats(newGames, 'Joel'),
        };
        // Always alternate the clock to the other player after choosing a game pick!
        const nextOnClock = computeNextOnTheClock(newGames, w.draftOrderFirst || getDefaultDraftOrderFirst(w.weekNumber));
        return {
          ...w,
          onTheClock: nextOnClock,
          games: newGames,
          stats,
        };
      });
      const updatedWeek = updated.find((w) => w.weekNumber === selectedWeekNum);
      if (updatedWeek) {
        setCloudSyncStatus('syncing');
        syncWeekToFirestore(updatedWeek)
          .then(() => setCloudSyncStatus('synced'))
          .catch((err) => {
            console.error('Firestore sync error:', err);
            setCloudSyncStatus('offline');
          });
      }
      return updated;
    });

    if (targetGame) {
      const summary = finalPick === null
        ? `${finalPicker} cleared pick on ${targetGame.awayAbbr} @ ${targetGame.homeAbbr}`
        : `${finalPicker} picked ${finalPick} in ${targetGame.awayAbbr} @ ${targetGame.homeAbbr} (${targetGame.odds || 'PK'})`;

      const updatedGameForLog: NFLGame = {
        ...targetGame,
        picker: finalPicker,
        pick: finalPick,
      };

      logGameChange(
        selectedWeekNum,
        updatedGameForLog,
        { picker: oldPicker, pick: oldPick },
        'pick',
        summary,
        undefined,
        finalPicker
      );
    }
  };

  // Handler: Quick Draft Game
  const handleQuickDraft = (gameId: string, teamAbbr?: string) => {
    const currentOnClock = currentWeekData.onTheClock;
    let targetGame: NFLGame | undefined;

    setWeeks((prev) => {
      const updated = prev.map((w) => {
        if (w.weekNumber !== selectedWeekNum) return w;
        targetGame = w.games.find((g) => g.id === gameId);
        const newGames = w.games.map((g) => {
          if (g.id !== gameId) return g;
          return {
            ...g,
            picker: currentOnClock,
            pick: teamAbbr !== undefined ? teamAbbr : g.pick,
          };
        });
        const stats = {
          Corey: computePlayerStats(newGames, 'Corey'),
          Joel: computePlayerStats(newGames, 'Joel'),
        };
        const nextOnClock = computeNextOnTheClock(newGames, w.draftOrderFirst || getDefaultDraftOrderFirst(w.weekNumber));
        return {
          ...w,
          onTheClock: nextOnClock,
          games: newGames,
          stats,
        };
      });

      const updatedWeek = updated.find((w) => w.weekNumber === selectedWeekNum);
      if (updatedWeek) {
        setCloudSyncStatus('syncing');
        syncWeekToFirestore(updatedWeek)
          .then(() => setCloudSyncStatus('synced'))
          .catch((err) => {
            console.error('Firestore sync error:', err);
            setCloudSyncStatus('offline');
          });
      }

      return updated;
    });

    if (targetGame) {
      const team = teamAbbr !== undefined ? teamAbbr : targetGame.pick;
      const summary = `${currentOnClock} drafted ${team ? `${team} in ` : ''}${targetGame.awayAbbr} @ ${targetGame.homeAbbr}`;
      const updatedGameForLog: NFLGame = {
        ...targetGame,
        picker: currentOnClock,
        pick: team,
      };
      logGameChange(
        selectedWeekNum,
        updatedGameForLog,
        { picker: targetGame.picker, pick: targetGame.pick },
        'picker_and_pick',
        summary,
        'Draft pick',
        currentOnClock
      );
    }

    confetti({
      particleCount: 25,
      spread: 40,
      origin: { y: 0.8 },
      colors: currentOnClock === 'Corey' ? ['#10B981', '#34D399'] : ['#F59E0B', '#FBBF24'],
    });
  };

  // Handler: Change On the Clock Player
  const handleChangeClock = (player: PlayerId) => {
    setWeeks((prev) => {
      const updated = prev.map((w) => {
        if (w.weekNumber !== selectedWeekNum) return w;
        return { ...w, onTheClock: player };
      });
      const updatedWeek = updated.find((w) => w.weekNumber === selectedWeekNum);
      if (updatedWeek) {
        setCloudSyncStatus('syncing');
        syncWeekToFirestore(updatedWeek)
          .then(() => setCloudSyncStatus('synced'))
          .catch((err) => {
            console.error('Firestore sync error:', err);
            setCloudSyncStatus('offline');
          });
      }
      return updated;
    });

    setRefreshNotification({
      message: `On the Clock switched to ${player}!`,
      type: 'info',
      timestamp: Date.now(),
    });
  };

  // Handler: Change 1st Pick (Week Starter)
  const handleChangeDraftOrderFirst = (player: PlayerId) => {
    setWeeks((prev) => {
      const updated = prev.map((w) => {
        if (w.weekNumber !== selectedWeekNum) return w;
        const nextClock = computeNextOnTheClock(w.games, player);
        return {
          ...w,
          draftOrderFirst: player,
          onTheClock: nextClock,
        };
      });
      const updatedWeek = updated.find((w) => w.weekNumber === selectedWeekNum);
      if (updatedWeek) {
        setCloudSyncStatus('syncing');
        syncWeekToFirestore(updatedWeek)
          .then(() => setCloudSyncStatus('synced'))
          .catch((err) => {
            console.error('Firestore sync error:', err);
            setCloudSyncStatus('offline');
          });
      }
      return updated;
    });

    setRefreshNotification({
      message: `Week ${selectedWeekNum} 1st pick switched to ${player}!`,
      type: 'info',
      timestamp: Date.now(),
    });
  };

  // Handler: Reset Week Draft (opens confirmation dialog)
  const handleResetDraft = () => {
    setIsResetDraftModalOpen(true);
  };

  // Handler: Confirmed Reset Week Draft
  const handleConfirmResetDraft = () => {
    const defaultFirst = currentWeekData.draftOrderFirst || getDefaultDraftOrderFirst(selectedWeekNum);

    setWeeks((prev) => {
      const updated = prev.map((w) => {
        if (w.weekNumber !== selectedWeekNum) return w;
        return {
          ...w,
          onTheClock: defaultFirst,
          games: w.games.map((g) => {
            if (g.status === 'post') return g; // Preserve finalized games
            return {
              ...g,
              picker: null,
              pick: null,
            };
          }),
        };
      });

      const updatedWeek = updated.find((w) => w.weekNumber === selectedWeekNum);
      if (updatedWeek) {
        setCloudSyncStatus('syncing');
        syncWeekToFirestore(updatedWeek)
          .then(() => setCloudSyncStatus('synced'))
          .catch((err) => {
            console.error('Firestore sync error:', err);
            setCloudSyncStatus('offline');
          });
      }

      return updated;
    });

    // Ensure Edit Mode is active so user can immediately make picks
    setIsEditMode(true);
    setIsResetDraftModalOpen(false);

    // Permanent audit logging of draft reset across weeks
    const now = Date.now();
    const date = new Date(now);
    const formattedTime = `${date.toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    const resetEntry: GameChangeLogEntry = {
      id: `log_reset_${now}`,
      timestamp: now,
      formattedTime,
      weekNumber: selectedWeekNum,
      gameId: `week-${selectedWeekNum}-reset`,
      matchup: `Week ${selectedWeekNum} Slate`,
      changeType: 'reset',
      summary: `Reset draft picks on Week ${selectedWeekNum} (on the clock: ${defaultFirst})`,
      details: 'Draft assignments reset via confirmed prompt modal',
      author: googleUser?.displayName || 'User',
    };
    setChangeLogs((prev) => [resetEntry, ...prev].slice(0, 500));
    recordLocalChangeLogEntry(resetEntry);
    recordChangeLogInFirestore(resetEntry).catch((err) => console.warn(err));

    setRefreshNotification({
      message: `Week ${selectedWeekNum} draft assignments reset. On the clock: ${defaultFirst}.`,
      type: 'info',
      timestamp: Date.now(),
    });
  };

  // Handler: Save Edited Game directly from EditGameModal
  const handleSaveEditedGame = (updatedGame: NFLGame, logNote?: string) => {
    let prevGame: NFLGame | undefined;
    setWeeks((prev) => {
      const updated = prev.map((w) => {
        if (w.weekNumber !== selectedWeekNum) return w;
        prevGame = w.games.find((g) => g.id === updatedGame.id);
        const newGames = w.games.map((g) => (g.id === updatedGame.id ? updatedGame : g));
        const stats = {
          Corey: computePlayerStats(newGames, 'Corey'),
          Joel: computePlayerStats(newGames, 'Joel'),
        };
        const nextOnClock = computeNextOnTheClock(newGames, w.draftOrderFirst || getDefaultDraftOrderFirst(w.weekNumber));
        return {
          ...w,
          onTheClock: nextOnClock,
          games: newGames,
          stats,
        };
      });

      const updatedWeek = updated.find((w) => w.weekNumber === selectedWeekNum);
      if (updatedWeek) {
        setCloudSyncStatus('syncing');
        syncWeekToFirestore(updatedWeek)
          .then(() => setCloudSyncStatus('synced'))
          .catch((err) => {
            console.error('Firestore sync error:', err);
            setCloudSyncStatus('offline');
          });
      }
      return updated;
    });

    let summary = `Edited ${updatedGame.awayAbbr} @ ${updatedGame.homeAbbr}`;
    if (prevGame) {
      if (prevGame.picker !== updatedGame.picker && prevGame.pick !== updatedGame.pick) {
        summary = `Updated ${updatedGame.awayAbbr} @ ${updatedGame.homeAbbr}: Picker is ${updatedGame.picker || 'None'}, Pick is ${updatedGame.pick || 'None'}`;
      } else if (prevGame.picker !== updatedGame.picker) {
        summary = `Reassigned ${updatedGame.awayAbbr} @ ${updatedGame.homeAbbr} from ${prevGame.picker || 'None'} to ${updatedGame.picker || 'Unassigned'}`;
      } else if (prevGame.pick !== updatedGame.pick) {
        summary = `${updatedGame.picker || 'Picker'} changed pick on ${updatedGame.awayAbbr} @ ${updatedGame.homeAbbr} from ${prevGame.pick || 'None'} to ${updatedGame.pick || 'None'}`;
      }
    }

    logGameChange(
      selectedWeekNum,
      updatedGame,
      prevGame ? { picker: prevGame.picker, pick: prevGame.pick } : undefined,
      'game_edit',
      summary,
      logNote,
      updatedGame.picker || 'Commissioner'
    );

    setRefreshNotification({
      message: `Game edited and recorded to Change Log! (${summary})`,
      type: 'success',
      timestamp: Date.now(),
    });
  };

  // Handler: Week selection with tracking
  const handleSelectWeek = (weekNum: number) => {
    setSelectedWeekNum(weekNum);
    setHasUserNavigated(true);
    const target = weeks.find((w) => w.weekNumber === weekNum);
    const hasUnpicked = target?.games.some((g) => !g.picker || !g.pick);
    if (weekNum === currentActiveWeekNum || hasUnpicked) {
      setIsEditMode(true);
    }
  };

  // Handler: Jump directly to the current active week
  const handleJumpToActiveWeek = () => {
    setSelectedWeekNum(currentActiveWeekNum);
    setHasUserNavigated(false);
  };

  // Handler: Toggle consolidated Edit/Draft Mode
  const handleToggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  // Handler: Live Scores & Spreads Refresh from ESPN API across all relevant weeks
  const handleRefreshScores = async (refreshAll = true) => {
    setIsRefreshing(true);
    try {
      const maxWeekToFetch = Math.min(18, Math.max(selectedWeekNum, currentActiveWeekNum));
      const weekNums = refreshAll
        ? Array.from({ length: maxWeekToFetch }, (_, i) => i + 1)
        : [selectedWeekNum];

      const espnResults = await Promise.all(
        weekNums.map(async (wn) => {
          try {
            const res = await fetchEspnScores(wn);
            return { weekNum: wn, res };
          } catch (e: any) {
            return {
              weekNum: wn,
              res: { success: false, games: [], source: 'cache' as const, lastUpdated: '', error: e.message },
            };
          }
        })
      );

      let totalGamesSynced = 0;
      let spreadsUpdatedCount = 0;

      setWeeks((prev) => {
        const updatedWeeksList: WeekData[] = [];

        const updated = prev.map((w) => {
          const fetched = espnResults.find((r) => r.weekNum === w.weekNumber);
          if (!fetched || !fetched.res.success || fetched.res.games.length === 0) {
            return w;
          }

          const isHistoricalWeek = w.weekNumber < currentActiveWeekNum;
          const hasAnyGameStarted =
            w.games.some((g) => g.status === 'in' || g.status === 'post') ||
            fetched.res.games.some((lg) => lg.status === 'in' || lg.status === 'post');
          const isDraftDisabled = !isEditMode;
          const canUpdateWeekSpreads = !isHistoricalWeek && !(hasAnyGameStarted && isDraftDisabled);

          const defaultWeek = INITIAL_WEEKS.find((dw) => dw.weekNumber === w.weekNumber);
          const updatedGames = w.games.map((g) => {
            const defGame = defaultWeek?.games?.find(
              (dg) =>
                dg.id === g.id ||
                (dg.homeAbbr === g.homeAbbr && dg.awayAbbr === g.awayAbbr)
            );
            const live = fetched.res.games.find(
              (lg) =>
                lg.id === g.id ||
                (lg.homeAbbr === g.homeAbbr && lg.awayAbbr === g.awayAbbr) ||
                (lg.homeTeam === g.homeTeam && lg.awayTeam === g.awayTeam)
            );
            if (!live) {
              return {
                ...g,
                picker: g.picker || defGame?.picker || null,
                pick: g.pick || defGame?.pick || null,
              };
            }

            totalGamesSynced++;

            // Set in stone: never revert completed games back to 'pre'
            const effectiveStatus =
              g.status === 'post' && live.status !== 'post' ? g.status : (live.status || g.status);

            const isGameStartedOrPlayed =
              g.status === 'in' || g.status === 'post' || live.status === 'in' || live.status === 'post';

            const shouldUpdateGameSpread =
              canUpdateWeekSpreads &&
              !isGameStartedOrPlayed &&
              live.spread !== undefined &&
              live.odds !== undefined;

            if (
              shouldUpdateGameSpread &&
              (g.spread !== live.spread || g.favoriteAbbr !== live.favoriteAbbr || g.odds !== live.odds)
            ) {
              spreadsUpdatedCount++;
            }

            return {
              ...g,
              // Strictly preserve user picks first, fallback to official backup picks
              picker: g.picker || defGame?.picker || null,
              pick: g.pick || defGame?.pick || null,
              homeScore: live.homeScore !== undefined ? live.homeScore : g.homeScore,
              awayScore: live.awayScore !== undefined ? live.awayScore : g.awayScore,
              status: effectiveStatus,
              quarter: live.quarter || g.quarter,
              clock: live.clock || g.clock,
              broadcast: live.broadcast || g.broadcast,
              odds: shouldUpdateGameSpread && live.odds ? live.odds : g.odds,
              favoriteAbbr:
                shouldUpdateGameSpread && live.favoriteAbbr !== undefined ? live.favoriteAbbr : g.favoriteAbbr,
              spread: shouldUpdateGameSpread && live.spread !== undefined ? live.spread : g.spread,
            };
          });

          const finalUpdatedGames = stripSyntheticPicks(updatedGames);
          const updatedStats = {
            Corey: computePlayerStats(finalUpdatedGames, 'Corey'),
            Joel: computePlayerStats(finalUpdatedGames, 'Joel'),
          };

          const fullUpdatedWeek: WeekData = { ...w, games: finalUpdatedGames, stats: updatedStats };
          updatedWeeksList.push(fullUpdatedWeek);
          return fullUpdatedWeek;
        });

        // Batch sync updated weeks to Firestore so cloud database stays in sync without data loss
        if (updatedWeeksList.length > 0) {
          setCloudSyncStatus('syncing');
          syncAllWeeksToFirestore(updatedWeeksList)
            .then(() => setCloudSyncStatus('synced'))
            .catch((err) => {
              console.error('Firestore batch sync error:', err);
              setCloudSyncStatus('offline');
            });
        }

        setRefreshNotification({
          message:
            refreshAll
              ? `Results verified & restored from ESPN: ${totalGamesSynced} games across Weeks 1–${maxWeekToFetch}`
              : `Week ${selectedWeekNum}: ${totalGamesSynced} games refreshed from ESPN`,
          type: 'success',
          timestamp: Date.now(),
        });

        return updated;
      });

      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('Refresh scores failed:', err);
      setRefreshNotification({
        message: `Failed to refresh from ESPN: ${err?.message || 'Network error'}`,
        type: 'error',
        timestamp: Date.now(),
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Proactively verify and sync official results from ESPN on initial load
  useEffect(() => {
    const initialSyncTimer = setTimeout(() => {
      handleRefreshScores(true);
    }, 2500);

    // Periodic live score refresh every 90 seconds if live games are ongoing
    const intervalTimer = setInterval(() => {
      const hasLive = weeks.some((w) => w.games.some((g) => g.status === 'in'));
      if (hasLive) {
        handleRefreshScores(true);
      }
    }, 90000);

    return () => {
      clearTimeout(initialSyncTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  // Handler: Reset to factory spreadsheet defaults in both local and cloud
  const handleResetAllDefaults = async () => {
    if (
      window.confirm(
        'Reset all 18 weeks and standings back to the original 2026-27 NFL Pick\'em season state in Cloud Firestore and locally?'
      )
    ) {
      setCloudSyncStatus('syncing');
      try {
        await resetAllWeeksInFirestore();
        const fresh = resetToSpreadsheetDefaults();
        setWeeks(fresh);
        setSelectedWeekNum(1);
        setCloudSyncStatus('synced');
      } catch (err) {
        console.error('Reset all failed:', err);
        const fresh = resetToSpreadsheetDefaults();
        setWeeks(fresh);
        setSelectedWeekNum(1);
        setCloudSyncStatus('offline');
      }
    }
  };

  // Handler: Download local JSON backup
  const handleDownloadBackup = () => {
    const jsonStr = JSON.stringify({ title: "2026-27 NFL Pick'em", weeks }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2026-27-NFL-Pickem-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handler to jump to a specific week in Slate view
  const handleSwitchToSlateWeek = (weekNum: number) => {
    setSelectedWeekNum(weekNum);
    setHasUserNavigated(true);
    if (weekNum !== currentActiveWeekNum) {
      setIsEditMode(false);
    }
    setViewMode('slate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handler: Manual Cloud Reconnect & Probe
  const handleRetryCloudSync = async () => {
    setCloudSyncStatus('syncing');
    try {
      await validateFirestoreConnection();
      await seedSeasonIfEmpty();
      setCloudSyncStatus('synced');
    } catch (err) {
      console.warn('Manual cloud sync retry:', err);
      setCloudSyncStatus('offline');
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 transition-[padding] duration-200 ${isOptimizerOpen ? 'xl:pr-[460px]' : ''}`}>
      
      {/* 1. Top App Header / Navbar with Slate vs Data Tabs */}
      <Navbar
        onRefreshScores={handleRefreshScores}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        onOpenDrive={() => setIsDriveOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenPowerUps={() => setIsPowerUpsOpen(true)}
        onToggleOptimizer={() => setIsOptimizerOpen((prev) => !prev)}
        onDownloadBackup={() => {
          downloadSeasonJsonBackup(weeks);
          const now = Date.now();
          const date = new Date(now);
          const formattedTime = `${date.toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
          const backupEntry: GameChangeLogEntry = {
            id: `log_backup_${now}`,
            timestamp: now,
            formattedTime,
            weekNumber: selectedWeekNum,
            gameId: 'all',
            matchup: 'Full Season',
            changeType: 'export_backup',
            summary: `Exported complete season JSON backup file (${weeks.length} weeks)`,
            author: 'User',
          };
          setChangeLogs((prev) => [backupEntry, ...prev].slice(0, 500));
          recordLocalChangeLogEntry(backupEntry);
          recordChangeLogInFirestore(backupEntry).catch((err) => console.warn(err));
        }}
        onOpenChangeLog={() => setIsChangeLogOpen(true)}
        changeLogCount={changeLogs.length}
        googleUser={googleUser}
        cloudSyncStatus={cloudSyncStatus}
        onRetryCloudSync={handleRetryCloudSync}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* 2. Top Cumulative Full Season Section (NOT impacted by any week picker) */}
      <CumulativeSeasonBanner seasonStats={seasonStats} />

      {/* ESPN Refresh Scores & Spreads Feedback Notification */}
      {refreshNotification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-3 w-full animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold shadow-lg ${
              refreshNotification.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                : refreshNotification.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                : 'bg-slate-900/90 border-blue-500/30 text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {refreshNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : refreshNotification.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span>{refreshNotification.message}</span>
            </div>
            <button
              onClick={() => setRefreshNotification(null)}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition ml-3"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Conditional Content Based on View Mode */}
      {viewMode === 'data' ? (
        /* Data Tab: Consolidated Season Totals Table & Raw Database Game Table */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <DataViewContainer
            weeks={weeks}
            seasonStats={seasonStats}
            selectedWeekNum={selectedWeekNum}
            onSelectWeek={handleSelectWeek}
            onSwitchToSlate={handleSwitchToSlateWeek}
          />
        </main>
      ) : (
        /* Slate Tab: Week Picker + Week Snapshot + Draft Controls + Matchup Cards */
        <>
          {/* Unified Week Task & Admin Bar */}
          <WeekAdminBar
            currentWeek={selectedWeekNum}
            totalWeeks={Math.max(18, weeks.length)}
            currentActiveWeekNum={currentActiveWeekNum}
            isCurrentActiveWeek={isCurrentActiveWeek}
            onSelectWeek={handleSelectWeek}
            onJumpToActiveWeek={handleJumpToActiveWeek}
            onTheClock={currentWeekData.onTheClock}
            onChangeClock={handleChangeClock}
            games={currentWeekData.games}
            onResetDraft={handleResetDraft}
            isEditMode={isEditMode}
            onToggleEditMode={handleToggleEditMode}
          />

          {/* Week Matchup Snapshot immediately below the Admin Bar */}
          <WeekMatchupSnapshot
            currentWeek={selectedWeekNum}
            coreyWeekStats={coreyWeekStats}
            joelWeekStats={joelWeekStats}
            games={currentWeekData.games}
          />

          {/* Main Game Slate Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            
            {/* Week Games Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  Week {selectedWeekNum} Games ({currentWeekData.games.length})
                </h3>
                {isEditMode && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {isCurrentActiveWeek && hasUnassignedGames ? 'Drafting Active' : 'Edit Mode Active'}
                  </span>
                )}
                {!isEditMode && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-700/60">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Locked
                  </span>
                )}
              </div>

              <div className="text-xs text-slate-400 hidden sm:block">
                Picks earn 1 pt (+1 Underdog, +1 Prime Time, up to 3 pts)
              </div>
            </div>

            {/* Responsive 2-column Game Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {currentWeekData.games.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  onAssignPicker={handleAssignPicker}
                  onSelectPick={handleSelectPick}
                  onQuickDraft={handleQuickDraft}
                  isDraftMode={isEditMode}
                  onTheClock={currentWeekData.onTheClock}
                  isCurrentActiveWeek={isCurrentActiveWeek}
                  onOpenEdit={(g) => {
                    setEditingGame(g);
                    setIsEditGameOpen(true);
                  }}
                />
              ))}
            </div>

          </main>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>NFL Pick'em • 2026–27 Corey vs Joel Season League</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleDownloadBackup}
              className="hover:text-slate-300 flex items-center gap-1 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleResetAllDefaults}
              className="hover:text-rose-400 flex items-center gap-1 transition"
              title="Reset data back to original 2026-27 schedule"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Spreadsheet</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        weeks={weeks}
        onImportWeeks={async (imported) => {
          const full = ensureFull18Weeks(imported);
          setWeeks(full);
          saveWeeksToStorage(full);
          setCloudSyncStatus('syncing');
          try {
            await syncAllWeeksToFirestore(full);
            setCloudSyncStatus('synced');
          } catch (err) {
            console.warn('Firestore backup sync error:', err);
            setCloudSyncStatus('offline');
          }
        }}
        currentUser={googleUser}
        setCurrentUser={setGoogleUser}
        onLogEvent={(summary, changeType) => {
          const now = Date.now();
          const date = new Date(now);
          const formattedTime = `${date.toLocaleDateString('en-US', { weekday: 'short', month: '2-digit', day: '2-digit' })}, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
          const driveEntry: GameChangeLogEntry = {
            id: `log_drive_${now}`,
            timestamp: now,
            formattedTime,
            weekNumber: selectedWeekNum,
            gameId: 'all',
            matchup: 'Google Drive',
            changeType,
            summary,
            author: googleUser?.displayName || 'User',
          };
          setChangeLogs((prev) => [driveEntry, ...prev].slice(0, 500));
          recordLocalChangeLogEntry(driveEntry);
          recordChangeLogInFirestore(driveEntry).catch((err) => console.warn(err));
        }}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <PowerUpsModal
        isOpen={isPowerUpsOpen}
        onClose={() => setIsPowerUpsOpen(false)}
      />

      {/* Permanent Transparent Change Log Modal */}
      <ChangeLogModal
        isOpen={isChangeLogOpen}
        onClose={() => setIsChangeLogOpen(false)}
        entries={changeLogs}
        selectedWeekNum={selectedWeekNum}
      />

      {/* Edit Any Game At Any Time Modal */}
      <EditGameModal
        isOpen={isEditGameOpen}
        onClose={() => {
          setIsEditGameOpen(false);
          setEditingGame(null);
        }}
        game={editingGame}
        weekNumber={selectedWeekNum}
        onSave={handleSaveEditedGame}
      />

      {/* Reset Week Draft Confirmation Modal */}
      <ResetDraftModal
        isOpen={isResetDraftModalOpen}
        onClose={() => setIsResetDraftModalOpen(false)}
        onConfirm={handleConfirmResetDraft}
        weekNumber={selectedWeekNum}
        totalGames={currentWeekData.games.length}
        assignedUnplayedCount={currentWeekData.games.filter((g) => g.picker && g.status !== 'post').length}
        completedGamesCount={currentWeekData.games.filter((g) => g.status === 'post').length}
        firstPicker={currentWeekData.draftOrderFirst || getDefaultDraftOrderFirst(selectedWeekNum)}
      />

      {/* Secret Algorithmic Draft Optimizer Slideout Pane (Non-overlay) */}
      <DraftOptimizerPane
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        games={currentWeekData.games}
        selectedWeekNum={selectedWeekNum}
        onSelectPick={(gameId, pickTeam) => {
          if (isEditMode) {
            handleQuickDraft(gameId, pickTeam);
          } else {
            handleSelectPick(gameId, pickTeam);
          }
        }}
        onAssignPicker={handleAssignPicker}
        isDraftMode={isEditMode}
        onTheClock={currentWeekData.onTheClock}
        isCurrentActiveWeek={isCurrentActiveWeek}
      />

    </div>
  );
}
