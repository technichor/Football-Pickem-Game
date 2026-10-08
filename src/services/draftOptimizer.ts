import { NFLGame, PlayerId } from '../types';

/**
 * Historical NFL Win Probability based on Point Spread (Consensus / User Model)
 */
export const SPREAD_WIN_PROBABILITIES: Record<number, number> = {
  0: 0.500,
  0.5: 0.500,
  1: 0.513,
  1.5: 0.525,
  2: 0.535,
  2.5: 0.545,
  3: 0.594,
  3.5: 0.643,
  4: 0.658,
  4.5: 0.673,
  5: 0.681,
  5.5: 0.690,
  6: 0.707,
  6.5: 0.724,
  7: 0.752,
  7.5: 0.781,
  8: 0.791,
  8.5: 0.802,
  9: 0.807,
  9.5: 0.811,
  10: 0.836,
  10.5: 0.860,
  11: 0.871,
  11.5: 0.882,
  12: 0.885,
  12.5: 0.887,
  13: 0.893,
  13.5: 0.900,
  14: 0.924,
  14.5: 0.949,
  15: 0.956,
  15.5: 0.963,
  16: 0.981,
};

/**
 * Retrieves the favorite's straight-up win percentage for a given point spread.
 * Uses exact lookup or linear interpolation between known benchmarks.
 */
export function getFavoriteWinProbability(spread: number): number {
  const absSpread = Math.abs(spread || 0);

  if (absSpread in SPREAD_WIN_PROBABILITIES) {
    return SPREAD_WIN_PROBABILITIES[absSpread];
  }

  const keys = Object.keys(SPREAD_WIN_PROBABILITIES)
    .map(Number)
    .sort((a, b) => a - b);

  if (absSpread <= keys[0]) return SPREAD_WIN_PROBABILITIES[keys[0]];
  if (absSpread >= keys[keys.length - 1]) return SPREAD_WIN_PROBABILITIES[keys[keys.length - 1]];

  // Linear interpolation between the two nearest points
  for (let i = 0; i < keys.length - 1; i++) {
    const k1 = keys[i];
    const k2 = keys[i + 1];
    if (absSpread >= k1 && absSpread <= k2) {
      const ratio = (absSpread - k1) / (k2 - k1);
      const p1 = SPREAD_WIN_PROBABILITIES[k1];
      const p2 = SPREAD_WIN_PROBABILITIES[k2];
      return p1 + ratio * (p2 - p1);
    }
  }

  return 0.500;
}

export interface OptimizedGameRanking {
  id: string;
  game: NFLGame;
  oddsDisplay: string;
  favoriteAbbr: string;
  underdogAbbr: string;
  spread: number;
  isPrimeTime: boolean;
  bonus: number; // 1 if prime time, else 0
  favWinPct: number;
  dogWinPct: number;
  favExpPts: number;
  dogExpPts: number;
  recommendedPick: string;
  recommendedSide: 'favorite' | 'underdog';
  maxExpPts: number;
  isAvailable: boolean;
  picker: PlayerId | null;
  currentPick: string | null;
}

/**
 * Calculates algorithmic expected value for all games in a slate.
 * Formula:
 * - bonus = isPrimeTime ? 1 : 0
 * - fav_exp_pts = fav_win_pct * (1 + bonus)
 * - dog_exp_pts = (1 - fav_win_pct) * (2 + bonus)
 * - recommended_pick = fav_exp_pts >= dog_exp_pts ? fav : dog
 * - max_exp_pts = max(fav_exp_pts, dog_exp_pts)
 */
export function calculateGameExpectedValue(game: NFLGame): OptimizedGameRanking {
  // Determine favorite and underdog
  const home = game.homeAbbr;
  const away = game.awayAbbr;
  let favoriteAbbr = game.favoriteAbbr;
  let spread = Math.abs(game.spread || 0);

  // If favorite is not explicitly set, determine by odds text or default to home
  if (!favoriteAbbr && game.odds) {
    const parts = game.odds.split('-');
    if (parts.length > 1) {
      favoriteAbbr = parts[0].trim();
      spread = Math.abs(parseFloat(parts[1]?.trim())) || spread;
    }
  }

  if (!favoriteAbbr) {
    favoriteAbbr = home;
  }

  const underdogAbbr = favoriteAbbr === home ? away : home;
  const isPrimeTime = Boolean(game.isPrimeTime);
  const bonus = isPrimeTime ? 1 : 0;

  const favWinPct = getFavoriteWinProbability(spread);
  const dogWinPct = 1 - favWinPct;

  // Expected points calculation
  // Favorite: 1 base pt + bonus
  const favExpPts = favWinPct * (1 + bonus);
  // Underdog: 1 base pt + 1 underdog bonus + bonus = (2 + bonus)
  const dogExpPts = dogWinPct * (2 + bonus);

  const favIsBetter = favExpPts >= dogExpPts;
  const recommendedPick = favIsBetter ? favoriteAbbr : underdogAbbr;
  const recommendedSide: 'favorite' | 'underdog' = favIsBetter ? 'favorite' : 'underdog';
  const maxExpPts = Math.max(favExpPts, dogExpPts);

  const oddsDisplay = game.odds || `${favoriteAbbr} -${spread}`;
  const isAvailable = !game.picker;

  return {
    id: game.id,
    game,
    oddsDisplay,
    favoriteAbbr,
    underdogAbbr,
    spread,
    isPrimeTime,
    bonus,
    favWinPct,
    dogWinPct,
    favExpPts,
    dogExpPts,
    recommendedPick,
    recommendedSide,
    maxExpPts,
    isAvailable,
    picker: game.picker,
    currentPick: game.pick,
  };
}

/**
 * Returns games sorted by Expected Points descending (highest EV first)
 */
export function getOptimizedDraftRankings(games: NFLGame[]): OptimizedGameRanking[] {
  return games
    .map(calculateGameExpectedValue)
    .sort((a, b) => b.maxExpPts - a.maxExpPts);
}
