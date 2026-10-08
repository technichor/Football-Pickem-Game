import { NFLGame, PlayerId, PlayerWeekStats, CumulativeSeasonStats, WeekData } from '../types';

/**
 * Calculates potential points for a specific pick on a game:
 * - 1 base point
 * - +1 if chosen team is the underdog
 * - +1 if prime time game
 * Total: 1 to 3 points
 */
export function calculatePotentialPoints(game: NFLGame, pickedTeam: string | null): number {
  if (!pickedTeam) return 1;

  let points = 1;

  // Prime time bonus
  if (game.isPrimeTime) {
    points += 1;
  }

  // Underdog bonus
  const isUnderdog = isTeamUnderdog(game, pickedTeam);
  if (isUnderdog) {
    points += 1;
  }

  return points;
}

/**
 * Checks if the specified team is the underdog based on game odds
 */
export function isTeamUnderdog(game: NFLGame, teamAbbr: string): boolean {
  if (!game.favoriteAbbr || game.spread <= 0) return false;
  // If the picked team is NOT the favorite, they are the underdog
  return teamAbbr !== game.favoriteAbbr;
}

/**
 * Determines winner of a game
 */
export function getGameWinner(game: NFLGame): string | null {
  if (game.status !== 'post') return null;
  if (game.homeScore > game.awayScore) return game.homeAbbr;
  if (game.awayScore > game.homeScore) return game.awayAbbr;
  return 'TIE';
}

/**
 * Checks if a game pick won
 */
export function isPickWinner(game: NFLGame): boolean | null {
  if (!game.pick || game.status !== 'post') return null;
  const winner = getGameWinner(game);
  if (!winner) return null;
  return game.pick === winner;
}

/**
 * Returns points earned for this game pick
 */
export function getEarnedPoints(game: NFLGame): number {
  if (!game.pick || game.status !== 'post') return 0;
  const winner = getGameWinner(game);
  if (winner && game.pick === winner) {
    return calculatePotentialPoints(game, game.pick);
  }
  return 0;
}

/**
 * Compute weekly statistics for a player
 */
export function computePlayerStats(games: NFLGame[], player: PlayerId): PlayerWeekStats {
  const playerGames = games.filter((g) => g.picker === player);

  let pts = 0;
  let pot = 0;
  let pos = 0;
  let wins = 0;
  let losses = 0;
  let pending = 0;

  let liveLeadingPts = 0;
  let liveGamesCount = 0;
  let upcomingGamesCount = 0;
  let liveLeadingCount = 0;
  let liveTrailingCount = 0;
  let liveTiedCount = 0;
  let pointsInPlay = 0;
  let pointsUpcoming = 0;
  let underdogPicksCount = 0;
  let primeTimePicksCount = 0;

  for (const game of playerGames) {
    const potential = calculatePotentialPoints(game, game.pick);
    pot += potential;

    if (game.pick && isTeamUnderdog(game, game.pick)) {
      underdogPicksCount += 1;
    }
    if (game.isPrimeTime) {
      primeTimePicksCount += 1;
    }

    if (game.status === 'post') {
      const winner = getGameWinner(game);
      if (game.pick && winner === game.pick) {
        pts += potential;
        wins += 1;
      } else {
        losses += 1;
      }
    } else if (game.status === 'in') {
      // In-progress / Live game
      pending += 1;
      pos += potential;
      pointsInPlay += potential;
      liveGamesCount += 1;

      if (game.pick) {
        const isAway = game.pick === game.awayAbbr;
        const isHome = game.pick === game.homeAbbr;
        if ((isHome && game.homeScore > game.awayScore) || (isAway && game.awayScore > game.homeScore)) {
          liveLeadingPts += potential;
          liveLeadingCount += 1;
        } else if ((isHome && game.homeScore < game.awayScore) || (isAway && game.awayScore < game.homeScore)) {
          liveTrailingCount += 1;
        } else {
          liveTiedCount += 1;
        }
      }
    } else {
      // Scheduled / Pre-game
      pending += 1;
      pos += potential;
      pointsUpcoming += potential;
      upcomingGamesCount += 1;
    }
  }

  const finishedGames = wins + losses;
  const ptPct = pot > 0 ? Math.round((pts / pot) * 100) : 0;
  const gmPct = finishedGames > 0 ? Math.round((wins / finishedGames) * 100) : 0;

  const forecastedPts = pts + liveLeadingPts;
  const bestCasePts = pts + pos;
  const worstCasePts = pts;

  return {
    pts,
    pot,
    pos,
    ptPct,
    gmPct,
    wins,
    losses,
    pending,
    totalGames: playerGames.length,
    liveLeadingPts,
    forecastedPts,
    bestCasePts,
    worstCasePts,
    liveGamesCount,
    upcomingGamesCount,
    liveLeadingCount,
    liveTrailingCount,
    liveTiedCount,
    pointsInPlay,
    pointsUpcoming,
    underdogPicksCount,
    primeTimePicksCount,
  };
}

/**
 * Compute cumulative season statistics across all weeks
 */
export function computeSeasonStats(weeks: WeekData[]): CumulativeSeasonStats {
  const corey = {
    totalPts: 0,
    totalPot: 0,
    totalPos: 0,
    ptPct: 0,
    gmPct: 0,
    totalWins: 0,
    totalLosses: 0,
    totalGames: 0,
    weeksWon: 0,
  };

  const joel = {
    totalPts: 0,
    totalPot: 0,
    totalPos: 0,
    ptPct: 0,
    gmPct: 0,
    totalWins: 0,
    totalLosses: 0,
    totalGames: 0,
    weeksWon: 0,
  };

  for (const week of weeks) {
    const coreyWeek = computePlayerStats(week.games, 'Corey');
    const joelWeek = computePlayerStats(week.games, 'Joel');

    corey.totalPts += coreyWeek.pts;
    corey.totalPot += coreyWeek.pot;
    corey.totalPos += coreyWeek.pos;
    corey.totalWins += coreyWeek.wins;
    corey.totalLosses += coreyWeek.losses;
    corey.totalGames += coreyWeek.totalGames;

    joel.totalPts += joelWeek.pts;
    joel.totalPot += joelWeek.pot;
    joel.totalPos += joelWeek.pos;
    joel.totalWins += joelWeek.wins;
    joel.totalLosses += joelWeek.losses;
    joel.totalGames += joelWeek.totalGames;

    if (coreyWeek.pts > joelWeek.pts && (coreyWeek.wins > 0 || joelWeek.wins > 0)) {
      corey.weeksWon += 1;
    } else if (joelWeek.pts > coreyWeek.pts && (coreyWeek.wins > 0 || joelWeek.wins > 0)) {
      joel.weeksWon += 1;
    }
  }

  corey.ptPct = corey.totalPot > 0 ? Math.round((corey.totalPts / corey.totalPot) * 100) : 0;
  joel.ptPct = joel.totalPot > 0 ? Math.round((joel.totalPts / joel.totalPot) * 100) : 0;

  const coreyFinished = corey.totalWins + corey.totalLosses;
  const joelFinished = joel.totalWins + joel.totalLosses;

  corey.gmPct = coreyFinished > 0 ? Math.round((corey.totalWins / coreyFinished) * 100) : 0;
  joel.gmPct = joelFinished > 0 ? Math.round((joel.totalWins / joelFinished) * 100) : 0;

  let leader: PlayerId | 'Tied' = 'Tied';
  if (corey.totalPts > joel.totalPts) leader = 'Corey';
  else if (joel.totalPts > corey.totalPts) leader = 'Joel';

  const pointDifferential = Math.abs(corey.totalPts - joel.totalPts);

  return {
    Corey: corey,
    Joel: joel,
    leader,
    pointDifferential,
  };
}

/**
 * Automatically computes the current active week number for the season.
 * A week is considered finalized/complete when it contains games and 100% of those
 * games have status === 'post'.
 *
 * Current active week rolls over to the earliest week that is not yet 100% finalized.
 * If all 18 weeks are finalized, defaults to Week 18.
 */
export function getSeasonActiveWeekNum(weeks: WeekData[]): number {
  if (!Array.isArray(weeks) || weeks.length === 0) return 1;

  const sorted = [...weeks].sort((a, b) => a.weekNumber - b.weekNumber);

  for (const week of sorted) {
    const games = week.games || [];
    const isWeekComplete = games.length > 0 && games.every((g) => g.status === 'post');
    if (!isWeekComplete) {
      return week.weekNumber;
    }
  }

  return sorted[sorted.length - 1]?.weekNumber || 18;
}

/**
 * Automatically computes which player is On The Clock for a given week.
 * Follows the strict rule: Picks always alternate between Corey and Joel after each chooses a game.
 * If draftOrderFirst is Joel:
 *  - 0 picks: Joel
 *  - Joel has chosen more games than Corey: Corey
 *  - Corey has chosen more games than Joel: Joel
 *  - Equal games chosen: Joel (the starter)
 * If draftOrderFirst is Corey:
 *  - 0 picks: Corey
 *  - Corey has chosen more games than Joel: Joel
 *  - Joel has chosen more games than Corey: Corey
 *  - Equal games chosen: Corey (the starter)
 */
export function computeNextOnTheClock(
  games: NFLGame[],
  draftOrderFirst: PlayerId
): PlayerId {
  const otherPlayer: PlayerId = draftOrderFirst === 'Corey' ? 'Joel' : 'Corey';
  const firstCount = (games || []).filter((g) => g.picker === draftOrderFirst).length;
  const otherCount = (games || []).filter((g) => g.picker === otherPlayer).length;

  if (firstCount > otherCount) {
    return otherPlayer;
  }
  if (otherCount > firstCount) {
    return draftOrderFirst;
  }
  return draftOrderFirst;
}

