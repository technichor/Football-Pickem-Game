import { WeekData, NFLGame } from '../types';
import { computePlayerStats } from '../services/scoringEngine';

// Helper to create game object
function g(
  id: string,
  week: number,
  date: string,
  time: string,
  awayTeam: string,
  awayAbbr: string,
  homeTeam: string,
  homeAbbr: string,
  awayScore: number,
  homeScore: number,
  status: 'pre' | 'in' | 'post',
  quarter: string,
  clock: string,
  odds: string,
  favAbbr: string,
  spread: number,
  broadcast: string,
  isPrimeTime: boolean,
  picker: 'Corey' | 'Joel' | null = null,
  pick: string | null = null,
  isExtraPick = false
): NFLGame {
  return {
    id,
    week,
    date,
    time,
    awayTeam,
    awayAbbr,
    homeTeam,
    homeAbbr,
    awayScore,
    homeScore,
    status,
    quarter,
    clock,
    odds,
    favoriteAbbr: favAbbr,
    spread,
    broadcast,
    isPrimeTime,
    picker,
    pick: pick ?? null,
    isExtraPick,
  };
}

export function getDefaultDraftOrderFirst(weekNumber: number): 'Corey' | 'Joel' {
  // Odd weeks start with Joel (Week 1, 3, 5, 7, ...), even weeks start with Corey (Week 2, 4, 6, 8, ...)
  return weekNumber % 2 === 1 ? 'Joel' : 'Corey';
}

export function buildWeek(
  weekNumber: number,
  firstPlayer: 'Corey' | 'Joel' = getDefaultDraftOrderFirst(weekNumber),
  games: NFLGame[] = [],
  draftOrderFirst: 'Corey' | 'Joel' = firstPlayer
): WeekData {
  return {
    weekNumber,
    onTheClock: firstPlayer,
    draftOrderFirst,
    games,
    stats: {
      Corey: computePlayerStats(games, 'Corey'),
      Joel: computePlayerStats(games, 'Joel'),
    },
  };
}

export const INITIAL_WEEKS: WeekData[] = [
  // ==========================================
  // WEEK 1 (16 Games - Official Historical Results)
  // ==========================================
  buildWeek(1, 'Joel', [
    g('w1-1', 1, 'Wed 09/09/2026', '8:20 PM', 'Patriots', 'NE', 'Seahawks', 'SEA', 10, 13, 'post', 'F', '0:00', 'SEA -3', 'SEA', 3, 'NBC', true, 'Corey', 'NE', false),
    g('w1-2', 1, 'Thu 09/10/2026', '8:35 PM', '49ers', 'SF', 'Rams', 'LAR', 27, 7, 'post', 'F', '0:00', 'LAR -3.5', 'LAR', 3.5, 'Netflix', true, 'Joel', 'LAR', false),
    g('w1-3', 1, 'Sun 09/13/2026', '1:00 PM', 'Buccaneers', 'TB', 'Bengals', 'CIN', 27, 33, 'post', 'F', '0:00', 'CIN -3.5', 'CIN', 3.5, 'FOX', false, 'Corey', 'TB', false),
    g('w1-4', 1, 'Sun 09/13/2026', '1:00 PM', 'Saints', 'NO', 'Lions', 'DET', 30, 31, 'post', 'F-OT', '0:00', 'DET -7', 'DET', 7, 'FOX', false, 'Joel', 'DET', false),
    g('w1-5', 1, 'Sun 09/13/2026', '1:00 PM', 'Jets', 'NYJ', 'Titans', 'TEN', 23, 10, 'post', 'F', '0:00', 'TEN -1.5', 'TEN', 1.5, 'CBS', false, 'Corey', 'NYJ', false),
    g('w1-6', 1, 'Sun 09/13/2026', '1:00 PM', 'Ravens', 'BAL', 'Colts', 'IND', 41, 23, 'post', 'F', '0:00', 'BAL -3.5', 'BAL', 3.5, 'CBS', false, 'Joel', 'IND', false),
    g('w1-7', 1, 'Sun 09/13/2026', '1:00 PM', 'Falcons', 'ATL', 'Steelers', 'PIT', 13, 20, 'post', 'F', '0:00', 'PIT -3.5', 'PIT', 3.5, 'FOX', false, 'Corey', 'ATL', false),
    g('w1-8', 1, 'Sun 09/13/2026', '1:00 PM', 'Bears', 'CHI', 'Panthers', 'CAR', 59, 37, 'post', 'F', '0:00', 'CHI -3', 'CHI', 3, 'FOX', false, 'Corey', 'CHI', false),
    g('w1-9', 1, 'Sun 09/13/2026', '1:00 PM', 'Browns', 'CLE', 'Jaguars', 'JAX', 10, 34, 'post', 'F', '0:00', 'JAX -8.5', 'JAX', 8.5, 'CBS', false, 'Corey', 'JAX', false),
    g('w1-10', 1, 'Sun 09/13/2026', '1:00 PM', 'Bills', 'BUF', 'Texans', 'HOU', 36, 31, 'post', 'F', '0:00', 'BUF -1.5', 'BUF', 1.5, 'CBS', false, 'Joel', 'HOU', false),
    g('w1-11', 1, 'Sun 09/13/2026', '4:25 PM', 'Dolphins', 'MIA', 'Raiders', 'LV', 13, 27, 'post', 'F', '0:00', 'LV -3', 'LV', 3, 'FOX', false, 'Corey', 'LV', false),
    g('w1-12', 1, 'Sun 09/13/2026', '4:25 PM', 'Packers', 'GB', 'Vikings', 'MIN', 22, 39, 'post', 'F', '0:00', 'MIN -1.5', 'MIN', 1.5, 'CBS', false, 'Joel', 'MIN', false),
    g('w1-13', 1, 'Sun 09/13/2026', '4:25 PM', 'Commanders', 'WSH', 'Eagles', 'PHI', 22, 24, 'post', 'F', '0:00', 'PHI -5.5', 'PHI', 5.5, 'FOX', false, 'Joel', 'PHI', false),
    g('w1-14', 1, 'Sun 09/13/2026', '4:25 PM', 'Cardinals', 'ARI', 'Chargers', 'LAC', 26, 14, 'post', 'F', '0:00', 'LAC -9.5', 'LAC', 9.5, 'CBS', false, 'Joel', 'LAC', false),
    g('w1-15', 1, 'Sun 09/13/2026', '8:20 PM', 'Cowboys', 'DAL', 'Giants', 'NYG', 20, 28, 'post', 'F', '0:00', 'DAL -3', 'DAL', 3, 'NBC', true, 'Joel', 'NYG', false),
    g('w1-16', 1, 'Mon 09/14/2026', '8:15 PM', 'Broncos', 'DEN', 'Chiefs', 'KC', 10, 31, 'post', 'F', '0:00', 'KC -3', 'KC', 3, 'ESPN', true, 'Corey', 'DEN', false),
  ], 'Joel'),

  // ==========================================
  // WEEK 2 (16 Games - Restored from Google Drive Backup)
  // ==========================================
  buildWeek(2, 'Corey', [
    g('w2-1', 2, 'Thu 09/17/2026', '8:15 PM', 'Lions', 'DET', 'Bills', 'BUF', 31, 41, 'post', 'F', '0:00', 'BUF -3', 'BUF', 3, 'Prime Video', true, 'Corey', 'DET', false),
    g('w2-2', 2, 'Sun 09/20/2026', '1:00 PM', 'Panthers', 'CAR', 'Falcons', 'ATL', 34, 3, 'post', 'F', '0:00', 'ATL -1.5', 'ATL', 1.5, 'FOX', false, 'Corey', 'CAR', false),
    g('w2-3', 2, 'Sun 09/20/2026', '1:00 PM', 'Vikings', 'MIN', 'Bears', 'CHI', 9, 3, 'post', 'F', '0:00', 'CHI -3', 'CHI', 3, 'FOX', false, 'Corey', 'MIN', false),
    g('w2-4', 2, 'Sun 09/20/2026', '1:00 PM', 'Eagles', 'PHI', 'Titans', 'TEN', 24, 20, 'post', 'F', '0:00', 'PHI -5.5', 'PHI', 5.5, 'FOX', false, 'Joel', 'PHI', false),
    g('w2-5', 2, 'Sun 09/20/2026', '1:00 PM', 'Steelers', 'PIT', 'Patriots', 'NE', 3, 20, 'post', 'F', '0:00', 'NE -4.5', 'NE', 4.5, 'CBS', false, 'Joel', 'NE', false),
    g('w2-6', 2, 'Sun 09/20/2026', '1:00 PM', 'Packers', 'GB', 'Jets', 'NYJ', 20, 17, 'post', 'F-OT', '0:00', 'GB -5.5', 'GB', 5.5, 'FOX', false, 'Corey', 'GB', false),
    g('w2-7', 2, 'Sun 09/20/2026', '1:00 PM', 'Browns', 'CLE', 'Buccaneers', 'TB', 23, 19, 'post', 'F', '0:00', 'TB -6.5', 'TB', 6.5, 'CBS', false, 'Joel', 'TB', false),
    g('w2-8', 2, 'Sun 09/20/2026', '1:00 PM', 'Saints', 'NO', 'Ravens', 'BAL', 24, 17, 'post', 'F', '0:00', 'BAL -7.5', 'BAL', 7.5, 'CBS', false, 'Joel', 'BAL', false),
    g('w2-9', 2, 'Sun 09/20/2026', '1:00 PM', 'Bengals', 'CIN', 'Texans', 'HOU', 20, 6, 'post', 'F', '0:00', 'HOU -2.5', 'HOU', 2.5, 'CBS', false, 'Corey', 'CIN', false),
    g('w2-10', 2, 'Sun 09/20/2026', '4:05 PM', 'Jaguars', 'JAX', 'Broncos', 'DEN', 13, 20, 'post', 'F', '0:00', 'DEN -3', 'DEN', 3, 'CBS', false, 'Corey', 'JAX', false),
    g('w2-11', 2, 'Sun 09/20/2026', '4:05 PM', 'Raiders', 'LV', 'Chargers', 'LAC', 26, 14, 'post', 'F', '0:00', 'LAC -9.5', 'LAC', 9.5, 'CBS', false, 'Corey', 'LAC', false),
    g('w2-12', 2, 'Sun 09/20/2026', '4:25 PM', 'Commanders', 'WSH', 'Cowboys', 'DAL', 20, 37, 'post', 'F', '0:00', 'DAL -4.5', 'DAL', 4.5, 'FOX', false, 'Joel', 'WSH', false),
    g('w2-13', 2, 'Sun 09/20/2026', '4:25 PM', 'Seahawks', 'SEA', 'Cardinals', 'ARI', 31, 7, 'post', 'F', '0:00', 'SEA -10', 'SEA', 10, 'FOX', false, 'Joel', 'SEA', false),
    g('w2-14', 2, 'Sun 09/20/2026', '4:25 PM', 'Dolphins', 'MIA', '49ers', 'SF', 13, 35, 'post', 'F', '0:00', 'SF -10.5', 'SF', 10.5, 'FOX', false, 'Joel', 'SF', false),
    g('w2-15', 2, 'Sun 09/20/2026', '8:20 PM', 'Colts', 'IND', 'Chiefs', 'KC', 30, 33, 'post', 'F-OT', '0:00', 'KC -6.5', 'KC', 6.5, 'NBC', true, 'Joel', 'KC', false),
    g('w2-16', 2, 'Mon 09/21/2026', '8:15 PM', 'Giants', 'NYG', 'Rams', 'LAR', 6, 28, 'post', 'F', '0:00', 'LAR -9.5', 'LAR', 9.5, 'ESPN', true, 'Corey', 'LAR', false),
  ]),

  // ==========================================
  // WEEK 3 (16 Games - Official Results)
  // ==========================================
  buildWeek(3, 'Joel', [
    g('w3-1', 3, 'Thu 09/24/2026', '8:15 PM', 'Falcons', 'ATL', 'Packers', 'GB', 35, 14, 'post', 'F', '0:00', 'GB -7.5', 'GB', 7.5, 'Prime Video', true, null, null, false),
    g('w3-2', 3, 'Sun 09/27/2026', '1:00 PM', 'Chargers', 'LAC', 'Bills', 'BUF', 16, 24, 'post', 'F', '0:00', 'BUF -3', 'BUF', 3, 'FOX', false, null, null, false),
    g('w3-3', 3, 'Sun 09/27/2026', '1:00 PM', 'Panthers', 'CAR', 'Browns', 'CLE', 18, 21, 'post', 'F', '0:00', 'CAR -1.5', 'CAR', 1.5, 'FOX', false, null, null, false),
    g('w3-4', 3, 'Sun 09/27/2026', '1:00 PM', 'Jets', 'NYJ', 'Lions', 'DET', 24, 31, 'post', 'F', '0:00', 'DET -9.5', 'DET', 9.5, 'FOX', false, null, null, false),
    g('w3-5', 3, 'Sun 09/27/2026', '1:00 PM', 'Texans', 'HOU', 'Colts', 'IND', 17, 19, 'post', 'F', '0:00', 'HOU -1.5', 'HOU', 1.5, 'CBS', false, null, null, false),
    g('w3-6', 3, 'Sun 09/27/2026', '1:00 PM', 'Chiefs', 'KC', 'Dolphins', 'MIA', 24, 10, 'post', 'F', '0:00', 'KC -7.5', 'KC', 7.5, 'CBS', false, null, null, false),
    g('w3-7', 3, 'Sun 09/27/2026', '1:00 PM', 'Titans', 'TEN', 'Giants', 'NYG', 7, 12, 'post', 'F', '0:00', 'NYG -3', 'NYG', 3, 'CBS', false, null, null, false),
    g('w3-8', 3, 'Sun 09/27/2026', '1:00 PM', 'Bengals', 'CIN', 'Steelers', 'PIT', 27, 30, 'post', 'F', '0:00', 'CIN -1.5', 'CIN', 1.5, 'CBS', false, null, null, false),
    g('w3-9', 3, 'Sun 09/27/2026', '1:00 PM', 'Seahawks', 'SEA', 'Commanders', 'WSH', 31, 33, 'post', 'F', '0:00', 'SEA -3.5', 'SEA', 3.5, 'FOX', false, null, null, false),
    g('w3-10', 3, 'Sun 09/27/2026', '1:00 PM', 'Patriots', 'NE', 'Jaguars', 'JAX', 6, 35, 'post', 'F', '0:00', 'JAX -1.5', 'JAX', 1.5, 'CBS', false, null, null, false),
    g('w3-11', 3, 'Sun 09/27/2026', '4:05 PM', 'Cardinals', 'ARI', '49ers', 'SF', 30, 36, 'post', 'F', '0:00', 'SF -11.5', 'SF', 11.5, 'FOX', false, null, null, false),
    g('w3-12', 3, 'Sun 09/27/2026', '4:05 PM', 'Vikings', 'MIN', 'Buccaneers', 'TB', 23, 16, 'post', 'F', '0:00', 'EVEN', '', 0, 'FOX', false, null, null, false),
    g('w3-13', 3, 'Sun 09/27/2026', '4:25 PM', 'Ravens', 'BAL', 'Cowboys', 'DAL', 34, 31, 'post', 'F', '0:00', 'BAL -2.5', 'BAL', 2.5, 'CBS', false, null, null, false),
    g('w3-14', 3, 'Sun 09/27/2026', '4:25 PM', 'Raiders', 'LV', 'Saints', 'NO', 35, 27, 'post', 'F', '0:00', 'NO -3.5', 'NO', 3.5, 'CBS', false, null, null, false),
    g('w3-15', 3, 'Sun 09/27/2026', '8:20 PM', 'Rams', 'LAR', 'Broncos', 'DEN', 26, 30, 'post', 'F', '0:00', 'LAR -3', 'LAR', 3, 'NBC', true, null, null, false),
    g('w3-16', 3, 'Mon 09/28/2026', '8:15 PM', 'Eagles', 'PHI', 'Bears', 'CHI', 7, 27, 'post', 'F', '0:00', 'CHI -1.5', 'CHI', 1.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 4 (16 Games - Official Results)
  // ==========================================
  buildWeek(4, 'Corey', [
    g('w4-1', 4, 'Thu 10/01/2026', '8:15 PM', 'Steelers', 'PIT', 'Browns', 'CLE', 24, 27, 'post', 'F', '0:00', 'PIT -2.5', 'PIT', 2.5, 'Prime Video', true, null, null, false),
    g('w4-2', 4, 'Sun 10/04/2026', '9:30 AM', 'Colts', 'IND', 'Commanders', 'WSH', 30, 13, 'post', 'F', '0:00', 'WSH -1.5', 'WSH', 1.5, 'NFL Net', false, null, null, false),
    g('w4-3', 4, 'Sun 10/04/2026', '1:00 PM', 'Patriots', 'NE', 'Bills', 'BUF', 29, 26, 'post', 'F', '0:00', 'BUF -3', 'BUF', 3, 'CBS', false, null, null, false),
    g('w4-4', 4, 'Sun 10/04/2026', '1:00 PM', 'Jets', 'NYJ', 'Bears', 'CHI', 12, 23, 'post', 'F', '0:00', 'CHI -8.5', 'CHI', 8.5, 'FOX', false, null, null, false),
    g('w4-5', 4, 'Sun 10/04/2026', '1:00 PM', 'Jaguars', 'JAX', 'Bengals', 'CIN', 22, 17, 'post', 'F', '0:00', 'CIN -2.5', 'CIN', 2.5, 'CBS', false, null, null, false),
    g('w4-6', 4, 'Sun 10/04/2026', '1:00 PM', 'Cardinals', 'ARI', 'Giants', 'NYG', 24, 36, 'post', 'F', '0:00', 'NYG -7', 'NYG', 7, 'CBS', false, null, null, false),
    g('w4-7', 4, 'Sun 10/04/2026', '1:00 PM', 'Rams', 'LAR', 'Eagles', 'PHI', 24, 20, 'post', 'F', '0:00', 'LAR -1.5', 'LAR', 1.5, 'FOX', false, null, null, false),
    g('w4-8', 4, 'Sun 10/04/2026', '1:00 PM', 'Packers', 'GB', 'Buccaneers', 'TB', 17, 14, 'post', 'F', '0:00', 'GB -1.5', 'GB', 1.5, 'FOX', false, null, null, false),
    g('w4-9', 4, 'Sun 10/04/2026', '1:00 PM', 'Titans', 'TEN', 'Ravens', 'BAL', 18, 24, 'post', 'F', '0:00', 'BAL -8.5', 'BAL', 8.5, 'CBS', false, null, null, false),
    g('w4-10', 4, 'Sun 10/04/2026', '1:00 PM', 'Cowboys', 'DAL', 'Texans', 'HOU', 34, 30, 'post', 'F', '0:00', 'HOU -2.5', 'HOU', 2.5, 'FOX', false, null, null, false),
    g('w4-11', 4, 'Sun 10/04/2026', '4:05 PM', 'Dolphins', 'MIA', 'Vikings', 'MIN', 10, 15, 'post', 'F', '0:00', 'MIN -7.5', 'MIN', 7.5, 'FOX', false, null, null, false),
    g('w4-12', 4, 'Sun 10/04/2026', '4:25 PM', 'Chiefs', 'KC', 'Raiders', 'LV', 30, 27, 'post', 'F', '0:00', 'KC -5.5', 'KC', 5.5, 'CBS', false, null, null, false),
    g('w4-13', 4, 'Sun 10/04/2026', '4:25 PM', 'Broncos', 'DEN', '49ers', 'SF', 14, 24, 'post', 'F', '0:00', 'SF -2.5', 'SF', 2.5, 'CBS', false, null, null, false),
    g('w4-14', 4, 'Sun 10/04/2026', '4:25 PM', 'Chargers', 'LAC', 'Seahawks', 'SEA', 23, 30, 'post', 'F', '0:00', 'SEA -3', 'SEA', 3, 'CBS', false, null, null, false),
    g('w4-15', 4, 'Sun 10/04/2026', '8:20 PM', 'Lions', 'DET', 'Panthers', 'CAR', 26, 32, 'post', 'F', '0:00', 'DET -3', 'DET', 3, 'NBC', true, null, null, false),
    g('w4-16', 4, 'Mon 10/05/2026', '8:15 PM', 'Falcons', 'ATL', 'Saints', 'NO', 7, 0, 'in', '1Q', '10:19', 'NO -2.5', 'NO', 2.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 5 (15 Games)
  // ==========================================
  buildWeek(5, 'Joel', [
    g('w5-1', 5, 'Thu 10/08/2026', '8:15 PM', 'Buccaneers', 'TB', 'Cowboys', 'DAL', 0, 0, 'pre', 'pre', '0:00', 'DAL -3.5', 'DAL', 3.5, 'Prime Video', true, null, null, false),
    g('w5-2', 5, 'Sun 10/11/2026', '9:30 AM', 'Eagles', 'PHI', 'Jaguars', 'JAX', 0, 0, 'pre', 'pre', '0:00', 'PHI -1.5', 'PHI', 1.5, 'NFL Net', false, null, null, false),
    g('w5-3', 5, 'Sun 10/11/2026', '1:00 PM', 'Texans', 'HOU', 'Titans', 'TEN', 0, 0, 'pre', 'pre', '0:00', 'HOU -3.5', 'HOU', 3.5, 'CBS', false, null, null, false),
    g('w5-4', 5, 'Sun 10/11/2026', '1:00 PM', 'Bengals', 'CIN', 'Dolphins', 'MIA', 0, 0, 'pre', 'pre', '0:00', 'CIN -6', 'CIN', 6, 'FOX', false, null, null, false),
    g('w5-5', 5, 'Sun 10/11/2026', '1:00 PM', 'Raiders', 'LV', 'Patriots', 'NE', 0, 0, 'pre', 'pre', '0:00', 'NE -8.5', 'NE', 8.5, 'CBS', false, null, null, false),
    g('w5-6', 5, 'Sun 10/11/2026', '1:00 PM', 'Vikings', 'MIN', 'Saints', 'NO', 0, 0, 'pre', 'pre', '0:00', 'MIN -1.5', 'MIN', 1.5, 'FOX', false, null, null, false),
    g('w5-7', 5, 'Sun 10/11/2026', '1:00 PM', 'Browns', 'CLE', 'Jets', 'NYJ', 0, 0, 'pre', 'pre', '0:00', 'NYJ -2.5', 'NYJ', 2.5, 'CBS', false, null, null, false),
    g('w5-8', 5, 'Sun 10/11/2026', '1:00 PM', 'Colts', 'IND', 'Steelers', 'PIT', 0, 0, 'pre', 'pre', '0:00', 'PIT -2.5', 'PIT', 2.5, 'CBS', false, null, null, false),
    g('w5-9', 5, 'Sun 10/11/2026', '1:00 PM', 'Giants', 'NYG', 'Commanders', 'WSH', 0, 0, 'pre', 'pre', '0:00', 'WSH -1.5', 'WSH', 1.5, 'FOX', false, null, null, false),
    g('w5-10', 5, 'Sun 10/11/2026', '4:05 PM', 'Broncos', 'DEN', 'Chargers', 'LAC', 0, 0, 'pre', 'pre', '0:00', 'LAC -2.5', 'LAC', 2.5, 'CBS', false, null, null, false),
    g('w5-11', 5, 'Sun 10/11/2026', '4:25 PM', 'Bears', 'CHI', 'Packers', 'GB', 0, 0, 'pre', 'pre', '0:00', 'GB -3', 'GB', 3, 'FOX', false, null, null, false),
    g('w5-12', 5, 'Sun 10/11/2026', '4:25 PM', 'Lions', 'DET', 'Cardinals', 'ARI', 0, 0, 'pre', 'pre', '0:00', 'DET -8.5', 'DET', 8.5, 'FOX', false, null, null, false),
    g('w5-13', 5, 'Sun 10/11/2026', '4:25 PM', '49ers', 'SF', 'Seahawks', 'SEA', 0, 0, 'pre', 'pre', '0:00', 'SEA -3.5', 'SEA', 3.5, 'FOX', false, null, null, false),
    g('w5-14', 5, 'Sun 10/11/2026', '8:20 PM', 'Ravens', 'BAL', 'Falcons', 'ATL', 0, 0, 'pre', 'pre', '0:00', 'BAL -4.5', 'BAL', 4.5, 'NBC', true, null, null, false),
    g('w5-15', 5, 'Mon 10/12/2026', '8:15 PM', 'Bills', 'BUF', 'Rams', 'LAR', 0, 0, 'pre', 'pre', '0:00', 'LAR -3', 'LAR', 3, 'ESPN', true, null, null, true),
  ]),

  // ==========================================
  // WEEK 6 (14 Games)
  // ==========================================
  buildWeek(6, 'Corey', [
    g('w6-1', 6, 'Thu 10/15/2026', '8:15 PM', 'Seahawks', 'SEA', 'Broncos', 'DEN', 0, 0, 'pre', 'pre', '0:00', 'SEA -2.5', 'SEA', 2.5, 'Prime Video', true, null, null, false),
    g('w6-2', 6, 'Sun 10/18/2026', '9:30 AM', 'Texans', 'HOU', 'Jaguars', 'JAX', 0, 0, 'pre', 'pre', '0:00', 'JAX -1.5', 'JAX', 1.5, 'NFL Net', false, null, null, false),
    g('w6-3', 6, 'Sun 10/18/2026', '1:00 PM', 'Bears', 'CHI', 'Falcons', 'ATL', 0, 0, 'pre', 'pre', '0:00', 'CHI -3', 'CHI', 3, 'FOX', false, null, null, false),
    g('w6-4', 6, 'Sun 10/18/2026', '1:00 PM', 'Ravens', 'BAL', 'Browns', 'CLE', 0, 0, 'pre', 'pre', '0:00', 'BAL -6.5', 'BAL', 6.5, 'FOX', false, null, null, false),
    g('w6-5', 6, 'Sun 10/18/2026', '1:00 PM', 'Titans', 'TEN', 'Colts', 'IND', 0, 0, 'pre', 'pre', '0:00', 'IND -3.5', 'IND', 3.5, 'FOX', false, null, null, false),
    g('w6-6', 6, 'Sun 10/18/2026', '1:00 PM', 'Jets', 'NYJ', 'Patriots', 'NE', 0, 0, 'pre', 'pre', '0:00', 'NE -9.5', 'NE', 9.5, 'CBS', false, null, null, false),
    g('w6-7', 6, 'Sun 10/18/2026', '1:00 PM', 'Saints', 'NO', 'Giants', 'NYG', 0, 0, 'pre', 'pre', '0:00', 'NYG -2.5', 'NYG', 2.5, 'FOX', false, null, null, false),
    g('w6-8', 6, 'Sun 10/18/2026', '1:00 PM', 'Panthers', 'CAR', 'Eagles', 'PHI', 0, 0, 'pre', 'pre', '0:00', 'PHI -6.5', 'PHI', 6.5, 'CBS', false, null, null, false),
    g('w6-9', 6, 'Sun 10/18/2026', '1:00 PM', 'Steelers', 'PIT', 'Buccaneers', 'TB', 0, 0, 'pre', 'pre', '0:00', 'TB -1.5', 'TB', 1.5, 'CBS', false, null, null, false),
    g('w6-10', 6, 'Sun 10/18/2026', '4:05 PM', 'Cardinals', 'ARI', 'Rams', 'LAR', 0, 0, 'pre', 'pre', '0:00', 'LAR -13.5', 'LAR', 13.5, 'FOX', false, null, null, false),
    g('w6-11', 6, 'Sun 10/18/2026', '4:25 PM', 'Chargers', 'LAC', 'Chiefs', 'KC', 0, 0, 'pre', 'pre', '0:00', 'KC -2.5', 'KC', 2.5, 'CBS', false, null, null, false),
    g('w6-12', 6, 'Sun 10/18/2026', '4:25 PM', 'Bills', 'BUF', 'Raiders', 'LV', 0, 0, 'pre', 'pre', '0:00', 'BUF -6.5', 'BUF', 6.5, 'CBS', false, null, null, false),
    g('w6-13', 6, 'Sun 10/18/2026', '8:20 PM', 'Cowboys', 'DAL', 'Packers', 'GB', 0, 0, 'pre', 'pre', '0:00', 'GB -3', 'GB', 3, 'NBC', true, null, null, false),
    g('w6-14', 6, 'Mon 10/19/2026', '8:15 PM', 'Commanders', 'WSH', '49ers', 'SF', 0, 0, 'pre', 'pre', '0:00', 'SF -5.5', 'SF', 5.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 7 (14 Games)
  // ==========================================
  buildWeek(7, 'Joel', [
    g('w7-1', 7, 'Thu 10/22/2026', '8:15 PM', 'Patriots', 'NE', 'Bears', 'CHI', 0, 0, 'pre', 'pre', '0:00', 'CHI -1.5', 'CHI', 1.5, 'Prime Video', true, null, null, false),
    g('w7-2', 7, 'Sun 10/25/2026', '9:30 AM', 'Steelers', 'PIT', 'Saints', 'NO', 0, 0, 'pre', 'pre', '0:00', 'PIT -2.5', 'PIT', 2.5, 'NFL Net', false, null, null, false),
    g('w7-3', 7, 'Sun 10/25/2026', '1:00 PM', '49ers', 'SF', 'Falcons', 'ATL', 0, 0, 'pre', 'pre', '0:00', 'SF -4.5', 'SF', 4.5, 'FOX', false, null, null, false),
    g('w7-4', 7, 'Sun 10/25/2026', '1:00 PM', 'Browns', 'CLE', 'Titans', 'TEN', 0, 0, 'pre', 'pre', '0:00', 'TEN -2.5', 'TEN', 2.5, 'CBS', false, null, null, false),
    g('w7-5', 7, 'Sun 10/25/2026', '1:00 PM', 'Colts', 'IND', 'Vikings', 'MIN', 0, 0, 'pre', 'pre', '0:00', 'MIN -2.5', 'MIN', 2.5, 'CBS', false, null, null, false),
    g('w7-6', 7, 'Sun 10/25/2026', '1:00 PM', 'Dolphins', 'MIA', 'Jets', 'NYJ', 0, 0, 'pre', 'pre', '0:00', 'NYJ -2.5', 'NYJ', 2.5, 'CBS', false, null, null, false),
    g('w7-7', 7, 'Sun 10/25/2026', '1:00 PM', 'Buccaneers', 'TB', 'Panthers', 'CAR', 0, 0, 'pre', 'pre', '0:00', 'TB -1.5', 'TB', 1.5, 'FOX', false, null, null, false),
    g('w7-8', 7, 'Sun 10/25/2026', '1:00 PM', 'Bengals', 'CIN', 'Ravens', 'BAL', 0, 0, 'pre', 'pre', '0:00', 'BAL -3.5', 'BAL', 3.5, 'CBS', false, null, null, false),
    g('w7-9', 7, 'Sun 10/25/2026', '1:00 PM', 'Giants', 'NYG', 'Texans', 'HOU', 0, 0, 'pre', 'pre', '0:00', 'HOU -5.5', 'HOU', 5.5, 'FOX', false, null, null, false),
    g('w7-10', 7, 'Sun 10/25/2026', '4:05 PM', 'Broncos', 'DEN', 'Cardinals', 'ARI', 0, 0, 'pre', 'pre', '0:00', 'DEN -7.5', 'DEN', 7.5, 'CBS', false, null, null, false),
    g('w7-11', 7, 'Sun 10/25/2026', '4:25 PM', 'Packers', 'GB', 'Lions', 'DET', 0, 0, 'pre', 'pre', '0:00', 'DET -2.5', 'DET', 2.5, 'FOX', false, null, null, false),
    g('w7-12', 7, 'Sun 10/25/2026', '4:25 PM', 'Rams', 'LAR', 'Raiders', 'LV', 0, 0, 'pre', 'pre', '0:00', 'LAR -7.5', 'LAR', 7.5, 'FOX', false, null, null, false),
    g('w7-13', 7, 'Sun 10/25/2026', '8:20 PM', 'Chiefs', 'KC', 'Seahawks', 'SEA', 0, 0, 'pre', 'pre', '0:00', 'SEA -3', 'SEA', 3, 'NBC', true, null, null, false),
    g('w7-14', 7, 'Mon 10/26/2026', '8:15 PM', 'Cowboys', 'DAL', 'Eagles', 'PHI', 0, 0, 'pre', 'pre', '0:00', 'PHI -3', 'PHI', 3, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 8 (14 Games)
  // ==========================================
  buildWeek(8, 'Corey', [
    g('w8-1', 8, 'Thu 10/29/2026', '8:15 PM', 'Panthers', 'CAR', 'Packers', 'GB', 0, 0, 'pre', 'pre', '0:00', 'GB -7', 'GB', 7, 'Prime Video', true, null, null, false),
    g('w8-2', 8, 'Sun 11/01/2026', '1:00 PM', 'Ravens', 'BAL', 'Bills', 'BUF', 0, 0, 'pre', 'pre', '0:00', 'BUF -2.5', 'BUF', 2.5, 'CBS', false, null, null, false),
    g('w8-3', 8, 'Sun 11/01/2026', '1:00 PM', 'Titans', 'TEN', 'Bengals', 'CIN', 0, 0, 'pre', 'pre', '0:00', 'CIN -6.5', 'CIN', 6.5, 'CBS', false, null, null, false),
    g('w8-4', 8, 'Sun 11/01/2026', '1:00 PM', 'Cardinals', 'ARI', 'Cowboys', 'DAL', 0, 0, 'pre', 'pre', '0:00', 'DAL -10.5', 'DAL', 10.5, 'FOX', false, null, null, false),
    g('w8-5', 8, 'Sun 11/01/2026', '1:00 PM', 'Vikings', 'MIN', 'Lions', 'DET', 0, 0, 'pre', 'pre', '0:00', 'DET -4.5', 'DET', 4.5, 'FOX', false, null, null, false),
    g('w8-6', 8, 'Sun 11/01/2026', '1:00 PM', 'Raiders', 'LV', 'Jets', 'NYJ', 0, 0, 'pre', 'pre', '0:00', 'NYJ -1.5', 'NYJ', 1.5, 'FOX', false, null, null, false),
    g('w8-7', 8, 'Sun 11/01/2026', '1:00 PM', 'Browns', 'CLE', 'Steelers', 'PIT', 0, 0, 'pre', 'pre', '0:00', 'PIT -6', 'PIT', 6, 'CBS', false, null, null, false),
    g('w8-8', 8, 'Sun 11/01/2026', '1:00 PM', 'Falcons', 'ATL', 'Buccaneers', 'TB', 0, 0, 'pre', 'pre', '0:00', 'TB -4.5', 'TB', 4.5, 'FOX', false, null, null, false),
    g('w8-9', 8, 'Sun 11/01/2026', '1:00 PM', 'Colts', 'IND', 'Jaguars', 'JAX', 0, 0, 'pre', 'pre', '0:00', 'JAX -4.5', 'JAX', 4.5, 'CBS', false, null, null, false),
    g('w8-10', 8, 'Sun 11/01/2026', '4:05 PM', 'Chargers', 'LAC', 'Rams', 'LAR', 0, 0, 'pre', 'pre', '0:00', 'LAR -3.5', 'LAR', 3.5, 'FOX', false, null, null, false),
    g('w8-11', 8, 'Sun 11/01/2026', '4:25 PM', 'Chiefs', 'KC', 'Broncos', 'DEN', 0, 0, 'pre', 'pre', '0:00', 'DEN -1.5', 'DEN', 1.5, 'CBS', false, null, null, false),
    g('w8-12', 8, 'Sun 11/01/2026', '4:25 PM', 'Patriots', 'NE', 'Dolphins', 'MIA', 0, 0, 'pre', 'pre', '0:00', 'NE -7', 'NE', 7, 'CBS', false, null, null, false),
    g('w8-13', 8, 'Sun 11/01/2026', '8:20 PM', 'Eagles', 'PHI', 'Commanders', 'WSH', 0, 0, 'pre', 'pre', '0:00', 'PHI -1.5', 'PHI', 1.5, 'NBC', true, null, null, false),
    g('w8-14', 8, 'Mon 11/02/2026', '8:15 PM', 'Bears', 'CHI', 'Seahawks', 'SEA', 0, 0, 'pre', 'pre', '0:00', 'SEA -4.5', 'SEA', 4.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 9 (15 Games)
  // ==========================================
  buildWeek(9, 'Joel', [
    g('w9-1', 9, 'Thu 11/05/2026', '8:15 PM', 'Jaguars', 'JAX', 'Ravens', 'BAL', 0, 0, 'pre', 'pre', '0:00', 'BAL -4.5', 'BAL', 4.5, 'Prime Video', true, null, null, false),
    g('w9-2', 9, 'Sun 11/08/2026', '9:30 AM', 'Bengals', 'CIN', 'Falcons', 'ATL', 0, 0, 'pre', 'pre', '0:00', 'CIN -5.5', 'CIN', 5.5, 'NFL Net', false, null, null, false),
    g('w9-3', 9, 'Sun 11/08/2026', '1:00 PM', 'Cowboys', 'DAL', 'Colts', 'IND', 0, 0, 'pre', 'pre', '0:00', 'DAL -1.5', 'DAL', 1.5, 'FOX', false, null, null, false),
    g('w9-4', 9, 'Sun 11/08/2026', '1:00 PM', 'Jets', 'NYJ', 'Chiefs', 'KC', 0, 0, 'pre', 'pre', '0:00', 'KC -9.5', 'KC', 9.5, 'CBS', false, null, null, false),
    g('w9-5', 9, 'Sun 11/08/2026', '1:00 PM', 'Lions', 'DET', 'Dolphins', 'MIA', 0, 0, 'pre', 'pre', '0:00', 'DET -6.5', 'DET', 6.5, 'FOX', false, null, null, false),
    g('w9-6', 9, 'Sun 11/08/2026', '1:00 PM', 'Browns', 'CLE', 'Saints', 'NO', 0, 0, 'pre', 'pre', '0:00', 'NO -3.5', 'NO', 3.5, 'CBS', false, null, null, false),
    g('w9-7', 9, 'Sun 11/08/2026', '1:00 PM', 'Giants', 'NYG', 'Eagles', 'PHI', 0, 0, 'pre', 'pre', '0:00', 'PHI -5.5', 'PHI', 5.5, 'FOX', false, null, null, false),
    g('w9-8', 9, 'Sun 11/08/2026', '1:00 PM', 'Rams', 'LAR', 'Commanders', 'WSH', 0, 0, 'pre', 'pre', '0:00', 'LAR -4.5', 'LAR', 4.5, 'FOX', false, null, null, false),
    g('w9-9', 9, 'Sun 11/08/2026', '1:00 PM', 'Broncos', 'DEN', 'Panthers', 'CAR', 0, 0, 'pre', 'pre', '0:00', 'DEN -3', 'DEN', 3, 'CBS', false, null, null, false),
    g('w9-10', 9, 'Sun 11/08/2026', '4:05 PM', 'Texans', 'HOU', 'Chargers', 'LAC', 0, 0, 'pre', 'pre', '0:00', 'LAC -2.5', 'LAC', 2.5, 'CBS', false, null, null, false),
    g('w9-11', 9, 'Sun 11/08/2026', '4:05 PM', 'Raiders', 'LV', '49ers', 'SF', 0, 0, 'pre', 'pre', '0:00', 'SF -8.5', 'SF', 8.5, 'CBS', false, null, null, false),
    g('w9-12', 9, 'Sun 11/08/2026', '4:25 PM', 'Packers', 'GB', 'Patriots', 'NE', 0, 0, 'pre', 'pre', '0:00', 'NE -1.5', 'NE', 1.5, 'FOX', false, null, null, false),
    g('w9-13', 9, 'Sun 11/08/2026', '4:25 PM', 'Cardinals', 'ARI', 'Seahawks', 'SEA', 0, 0, 'pre', 'pre', '0:00', 'SEA -13.5', 'SEA', 13.5, 'FOX', false, null, null, false),
    g('w9-14', 9, 'Sun 11/08/2026', '8:20 PM', 'Buccaneers', 'TB', 'Bears', 'CHI', 0, 0, 'pre', 'pre', '0:00', 'CHI -3.5', 'CHI', 3.5, 'NBC', true, null, null, false),
    g('w9-15', 9, 'Mon 11/09/2026', '8:15 PM', 'Bills', 'BUF', 'Vikings', 'MIN', 0, 0, 'pre', 'pre', '0:00', 'BUF -3', 'BUF', 3, 'ESPN', true, null, null, true),
  ]),

  // ==========================================
  // WEEK 10 (14 Games)
  // ==========================================
  buildWeek(10, 'Corey', [
    g('w10-1', 10, 'Thu 11/12/2026', '8:15 PM', 'Commanders', 'WSH', 'Giants', 'NYG', 0, 0, 'pre', 'pre', '0:00', 'NYG -1.5', 'NYG', 1.5, 'Prime Video', true, null, null, false),
    g('w10-2', 10, 'Sun 11/15/2026', '9:30 AM', 'Patriots', 'NE', 'Lions', 'DET', 0, 0, 'pre', 'pre', '0:00', 'DET -1.5', 'DET', 1.5, 'FOX', false, null, null, false),
    g('w10-3', 10, 'Sun 11/15/2026', '1:00 PM', 'Chiefs', 'KC', 'Falcons', 'ATL', 0, 0, 'pre', 'pre', '0:00', 'KC -4.5', 'KC', 4.5, 'CBS', false, null, null, false),
    g('w10-4', 10, 'Sun 11/15/2026', '1:00 PM', 'Texans', 'HOU', 'Browns', 'CLE', 0, 0, 'pre', 'pre', '0:00', 'HOU -4.5', 'HOU', 4.5, 'FOX', false, null, null, false),
    g('w10-5', 10, 'Sun 11/15/2026', '1:00 PM', 'Vikings', 'MIN', 'Packers', 'GB', 0, 0, 'pre', 'pre', '0:00', 'GB -4.5', 'GB', 4.5, 'FOX', false, null, null, false),
    g('w10-6', 10, 'Sun 11/15/2026', '1:00 PM', 'Jaguars', 'JAX', 'Titans', 'TEN', 0, 0, 'pre', 'pre', '0:00', 'JAX -2.5', 'JAX', 2.5, 'FOX', false, null, null, false),
    g('w10-7', 10, 'Sun 11/15/2026', '1:00 PM', 'Dolphins', 'MIA', 'Colts', 'IND', 0, 0, 'pre', 'pre', '0:00', 'IND -6.5', 'IND', 6.5, 'CBS', false, null, null, false),
    g('w10-8', 10, 'Sun 11/15/2026', '1:00 PM', 'Panthers', 'CAR', 'Saints', 'NO', 0, 0, 'pre', 'pre', '0:00', 'NO -1.5', 'NO', 1.5, 'FOX', false, null, null, false),
    g('w10-9', 10, 'Sun 11/15/2026', '1:00 PM', 'Bills', 'BUF', 'Jets', 'NYJ', 0, 0, 'pre', 'pre', '0:00', 'BUF -7', 'BUF', 7, 'CBS', false, null, null, false),
    g('w10-10', 10, 'Sun 11/15/2026', '4:05 PM', 'Seahawks', 'SEA', 'Raiders', 'LV', 0, 0, 'pre', 'pre', '0:00', 'SEA -7', 'SEA', 7, 'CBS', false, null, null, false),
    g('w10-11', 10, 'Sun 11/15/2026', '4:05 PM', 'Rams', 'LAR', 'Cardinals', 'ARI', 0, 0, 'pre', 'pre', '0:00', 'LAR -10.5', 'LAR', 10.5, 'CBS', false, null, null, false),
    g('w10-12', 10, 'Sun 11/15/2026', '4:25 PM', '49ers', 'SF', 'Cowboys', 'DAL', 0, 0, 'pre', 'pre', '0:00', 'DAL -1.5', 'DAL', 1.5, 'FOX', false, null, null, false),
    g('w10-13', 10, 'Sun 11/15/2026', '8:20 PM', 'Steelers', 'PIT', 'Bengals', 'CIN', 0, 0, 'pre', 'pre', '0:00', 'CIN -3.5', 'CIN', 3.5, 'NBC', true, null, null, false),
    g('w10-14', 10, 'Mon 11/16/2026', '8:15 PM', 'Chargers', 'LAC', 'Ravens', 'BAL', 0, 0, 'pre', 'pre', '0:00', 'BAL -3.5', 'BAL', 3.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 11 (13 Games)
  // ==========================================
  buildWeek(11, 'Joel', [
    g('w11-1', 11, 'Thu 11/19/2026', '8:15 PM', 'Colts', 'IND', 'Texans', 'HOU', 0, 0, 'pre', 'pre', '0:00', 'HOU -5.5', 'HOU', 5.5, 'Prime Video', true, null, null, false),
    g('w11-2', 11, 'Sun 11/22/2026', '1:00 PM', 'Dolphins', 'MIA', 'Bills', 'BUF', 0, 0, 'pre', 'pre', '0:00', 'BUF -11.5', 'BUF', 11.5, 'FOX', false, null, null, false),
    g('w11-3', 11, 'Sun 11/22/2026', '1:00 PM', 'Saints', 'NO', 'Bears', 'CHI', 0, 0, 'pre', 'pre', '0:00', 'CHI -6.5', 'CHI', 6.5, 'FOX', false, null, null, false),
    g('w11-4', 11, 'Sun 11/22/2026', '1:00 PM', 'Titans', 'TEN', 'Cowboys', 'DAL', 0, 0, 'pre', 'pre', '0:00', 'DAL -6.5', 'DAL', 6.5, 'FOX', false, null, null, false),
    g('w11-5', 11, 'Sun 11/22/2026', '1:00 PM', 'Buccaneers', 'TB', 'Lions', 'DET', 0, 0, 'pre', 'pre', '0:00', 'DET -4.5', 'DET', 4.5, 'CBS', false, null, null, false),
    g('w11-6', 11, 'Sun 11/22/2026', '1:00 PM', 'Cardinals', 'ARI', 'Chiefs', 'KC', 0, 0, 'pre', 'pre', '0:00', 'KC -11.5', 'KC', 11.5, 'CBS', false, null, null, false),
    g('w11-7', 11, 'Sun 11/22/2026', '1:00 PM', 'Jaguars', 'JAX', 'Giants', 'NYG', 0, 0, 'pre', 'pre', '0:00', 'JAX -1.5', 'JAX', 1.5, 'CBS', false, null, null, false),
    g('w11-8', 11, 'Sun 11/22/2026', '1:00 PM', 'Ravens', 'BAL', 'Panthers', 'CAR', 0, 0, 'pre', 'pre', '0:00', 'BAL -4.5', 'BAL', 4.5, 'FOX', false, null, null, false),
    g('w11-9', 11, 'Sun 11/22/2026', '4:05 PM', 'Jets', 'NYJ', 'Chargers', 'LAC', 0, 0, 'pre', 'pre', '0:00', 'LAC -9.5', 'LAC', 9.5, 'FOX', false, null, null, false),
    g('w11-10', 11, 'Sun 11/22/2026', '4:25 PM', 'Raiders', 'LV', 'Broncos', 'DEN', 0, 0, 'pre', 'pre', '0:00', 'DEN -7.5', 'DEN', 7.5, 'CBS', false, null, null, false),
    g('w11-11', 11, 'Sun 11/22/2026', '4:25 PM', 'Steelers', 'PIT', 'Eagles', 'PHI', 0, 0, 'pre', 'pre', '0:00', 'PHI -5.5', 'PHI', 5.5, 'CBS', false, null, null, false),
    g('w11-12', 11, 'Sun 11/22/2026', '8:20 PM', 'Vikings', 'MIN', '49ers', 'SF', 0, 0, 'pre', 'pre', '0:00', 'SF -3.5', 'SF', 3.5, 'NBC', true, null, null, false),
    g('w11-13', 11, 'Mon 11/23/2026', '8:15 PM', 'Bengals', 'CIN', 'Commanders', 'WSH', 0, 0, 'pre', 'pre', '0:00', 'CIN -1.5', 'CIN', 1.5, 'ESPN', true, null, null, true),
  ]),

  // ==========================================
  // WEEK 12 (16 Games)
  // ==========================================
  buildWeek(12, 'Corey', [
    g('w12-1', 12, 'Wed 11/25/2026', '8:00 PM', 'Packers', 'GB', 'Rams', 'LAR', 0, 0, 'pre', 'pre', '0:00', 'LAR -4.5', 'LAR', 4.5, 'Netflix', true, null, null, false),
    g('w12-2', 12, 'Thu 11/26/2026', '1:00 PM', 'Bears', 'CHI', 'Lions', 'DET', 0, 0, 'pre', 'pre', '0:00', 'DET -2.5', 'DET', 2.5, 'CBS', false, null, null, false),
    g('w12-3', 12, 'Thu 11/26/2026', '4:30 PM', 'Eagles', 'PHI', 'Cowboys', 'DAL', 0, 0, 'pre', 'pre', '0:00', 'DAL -1.5', 'DAL', 1.5, 'FOX', false, null, null, false),
    g('w12-4', 12, 'Thu 11/26/2026', '8:20 PM', 'Chiefs', 'KC', 'Bills', 'BUF', 0, 0, 'pre', 'pre', '0:00', 'BUF -2.5', 'BUF', 2.5, 'NBC', true, null, null, false),
    g('w12-5', 12, 'Fri 11/27/2026', '3:00 PM', 'Broncos', 'DEN', 'Steelers', 'PIT', 0, 0, 'pre', 'pre', '0:00', 'DEN -1.5', 'DEN', 1.5, 'Prime Video', false, null, null, false),
    g('w12-6', 12, 'Sun 11/29/2026', '1:00 PM', 'Saints', 'NO', 'Bengals', 'CIN', 0, 0, 'pre', 'pre', '0:00', 'CIN -6.5', 'CIN', 6.5, 'CBS', false, null, null, false),
    g('w12-7', 12, 'Sun 11/29/2026', '1:00 PM', 'Raiders', 'LV', 'Browns', 'CLE', 0, 0, 'pre', 'pre', '0:00', 'CLE -1.5', 'CLE', 1.5, 'FOX', false, null, null, false),
    g('w12-8', 12, 'Sun 11/29/2026', '1:00 PM', 'Giants', 'NYG', 'Colts', 'IND', 0, 0, 'pre', 'pre', '0:00', 'IND -2.5', 'IND', 2.5, 'FOX', false, null, null, false),
    g('w12-9', 12, 'Sun 11/29/2026', '1:00 PM', 'Jets', 'NYJ', 'Dolphins', 'MIA', 0, 0, 'pre', 'pre', '0:00', 'MIA -1.5', 'MIA', 1.5, 'CBS', false, null, null, false),
    g('w12-10', 12, 'Sun 11/29/2026', '1:00 PM', 'Falcons', 'ATL', 'Vikings', 'MIN', 0, 0, 'pre', 'pre', '0:00', 'MIN -4.5', 'MIN', 4.5, 'FOX', false, null, null, false),
    g('w12-11', 12, 'Sun 11/29/2026', '1:00 PM', 'Ravens', 'BAL', 'Texans', 'HOU', 0, 0, 'pre', 'pre', '0:00', 'HOU -1.5', 'HOU', 1.5, 'CBS', false, null, null, false),
    g('w12-12', 12, 'Sun 11/29/2026', '4:05 PM', 'Titans', 'TEN', 'Jaguars', 'JAX', 0, 0, 'pre', 'pre', '0:00', 'JAX -5.5', 'JAX', 5.5, 'CBS', false, null, null, false),
    g('w12-13', 12, 'Sun 11/29/2026', '4:25 PM', 'Commanders', 'WSH', 'Cardinals', 'ARI', 0, 0, 'pre', 'pre', '0:00', 'WSH -4.5', 'WSH', 4.5, 'FOX', false, null, null, false),
    g('w12-14', 12, 'Sun 11/29/2026', '4:25 PM', 'Seahawks', 'SEA', '49ers', 'SF', 0, 0, 'pre', 'pre', '0:00', 'SF -1.5', 'SF', 1.5, 'FOX', false, null, null, false),
    g('w12-15', 12, 'Sun 11/29/2026', '8:20 PM', 'Patriots', 'NE', 'Chargers', 'LAC', 0, 0, 'pre', 'pre', '0:00', 'LAC -1.5', 'LAC', 1.5, 'NBC', true, null, null, false),
    g('w12-16', 12, 'Mon 11/30/2026', '8:15 PM', 'Panthers', 'CAR', 'Buccaneers', 'TB', 0, 0, 'pre', 'pre', '0:00', 'TB -3.5', 'TB', 3.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 13 (14 Games)
  // ==========================================
  buildWeek(13, 'Joel', [
    g('w13-1', 13, 'Thu 12/03/2026', '8:15 PM', 'Chiefs', 'KC', 'Rams', 'LAR', 0, 0, 'pre', 'pre', '0:00', 'LAR -3.5', 'LAR', 3.5, 'Prime Video', true, null, null, false),
    g('w13-2', 13, 'Sun 12/06/2026', '1:00 PM', 'Lions', 'DET', 'Falcons', 'ATL', 0, 0, 'pre', 'pre', '0:00', 'DET -3.5', 'DET', 3.5, 'CBS', false, null, null, false),
    g('w13-3', 13, 'Sun 12/06/2026', '1:00 PM', 'Jaguars', 'JAX', 'Bears', 'CHI', 0, 0, 'pre', 'pre', '0:00', 'CHI -3', 'CHI', 3, 'FOX', false, null, null, false),
    g('w13-4', 13, 'Sun 12/06/2026', '1:00 PM', 'Bengals', 'CIN', 'Browns', 'CLE', 0, 0, 'pre', 'pre', '0:00', 'CIN -4.5', 'CIN', 4.5, 'CBS', false, null, null, false),
    g('w13-5', 13, 'Sun 12/06/2026', '1:00 PM', 'Commanders', 'WSH', 'Titans', 'TEN', 0, 0, 'pre', 'pre', '0:00', 'WSH -1.5', 'WSH', 1.5, 'CBS', false, null, null, false),
    g('w13-6', 13, 'Sun 12/06/2026', '1:00 PM', 'Packers', 'GB', 'Saints', 'NO', 0, 0, 'pre', 'pre', '0:00', 'GB -4.5', 'GB', 4.5, 'FOX', false, null, null, false),
    g('w13-7', 13, 'Sun 12/06/2026', '1:00 PM', '49ers', 'SF', 'Giants', 'NYG', 0, 0, 'pre', 'pre', '0:00', 'SF -3', 'SF', 3, 'FOX', false, null, null, false),
    g('w13-8', 13, 'Sun 12/06/2026', '1:00 PM', 'Chargers', 'LAC', 'Buccaneers', 'TB', 0, 0, 'pre', 'pre', '0:00', 'LAC -2.5', 'LAC', 2.5, 'CBS', false, null, null, false),
    g('w13-9', 13, 'Sun 12/06/2026', '4:05 PM', 'Dolphins', 'MIA', 'Broncos', 'DEN', 0, 0, 'pre', 'pre', '0:00', 'DEN -9.5', 'DEN', 9.5, 'FOX', false, null, null, false),
    g('w13-10', 13, 'Sun 12/06/2026', '4:05 PM', 'Eagles', 'PHI', 'Cardinals', 'ARI', 0, 0, 'pre', 'pre', '0:00', 'PHI -8.5', 'PHI', 8.5, 'FOX', false, null, null, false),
    g('w13-11', 13, 'Sun 12/06/2026', '4:25 PM', 'Panthers', 'CAR', 'Vikings', 'MIN', 0, 0, 'pre', 'pre', '0:00', 'MIN -3.5', 'MIN', 3.5, 'CBS', false, null, null, false),
    g('w13-12', 13, 'Sun 12/06/2026', '4:25 PM', 'Bills', 'BUF', 'Patriots', 'NE', 0, 0, 'pre', 'pre', '0:00', 'NE -1.5', 'NE', 1.5, 'CBS', false, null, null, false),
    g('w13-13', 13, 'Sun 12/06/2026', '8:20 PM', 'Texans', 'HOU', 'Steelers', 'PIT', 0, 0, 'pre', 'pre', '0:00', 'HOU -1.5', 'HOU', 1.5, 'NBC', true, null, null, false),
    g('w13-14', 13, 'Mon 12/07/2026', '8:15 PM', 'Cowboys', 'DAL', 'Seahawks', 'SEA', 0, 0, 'pre', 'pre', '0:00', 'SEA -4.5', 'SEA', 4.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 14 (15 Games)
  // ==========================================
  buildWeek(14, 'Corey', [
    g('w14-1', 14, 'Thu 12/10/2026', '8:15 PM', 'Vikings', 'MIN', 'Patriots', 'NE', 0, 0, 'pre', 'pre', '0:00', 'NE -4.5', 'NE', 4.5, 'Prime Video', true, null, null, false),
    g('w14-2', 14, 'Sun 12/13/2026', '1:00 PM', 'Falcons', 'ATL', 'Browns', 'CLE', 0, 0, 'pre', 'pre', '0:00', 'CLE -1.5', 'CLE', 1.5, 'CBS', false, null, null, false),
    g('w14-3', 14, 'Sun 12/13/2026', '1:00 PM', 'Titans', 'TEN', 'Lions', 'DET', 0, 0, 'pre', 'pre', '0:00', 'DET -7.5', 'DET', 7.5, 'FOX', false, null, null, false),
    g('w14-4', 14, 'Sun 12/13/2026', '1:00 PM', 'Bears', 'CHI', 'Dolphins', 'MIA', 0, 0, 'pre', 'pre', '0:00', 'CHI -5.5', 'CHI', 5.5, 'CBS', false, null, null, false),
    g('w14-5', 14, 'Sun 12/13/2026', '1:00 PM', 'Broncos', 'DEN', 'Jets', 'NYJ', 0, 0, 'pre', 'pre', '0:00', 'DEN -5.5', 'DEN', 5.5, 'CBS', false, null, null, false),
    g('w14-6', 14, 'Sun 12/13/2026', '1:00 PM', 'Colts', 'IND', 'Eagles', 'PHI', 0, 0, 'pre', 'pre', '0:00', 'PHI -5.5', 'PHI', 5.5, 'FOX', false, null, null, false),
    g('w14-7', 14, 'Sun 12/13/2026', '1:00 PM', 'Texans', 'HOU', 'Commanders', 'WSH', 0, 0, 'pre', 'pre', '0:00', 'HOU -1.5', 'HOU', 1.5, 'CBS', false, null, null, false),
    g('w14-8', 14, 'Sun 12/13/2026', '1:00 PM', 'Saints', 'NO', 'Panthers', 'CAR', 0, 0, 'pre', 'pre', '0:00', 'CAR -2.5', 'CAR', 2.5, 'CBS', false, null, null, false),
    g('w14-9', 14, 'Sun 12/13/2026', '1:00 PM', 'Buccaneers', 'TB', 'Ravens', 'BAL', 0, 0, 'pre', 'pre', '0:00', 'BAL -6', 'BAL', 6, 'FOX', false, null, null, false),
    g('w14-10', 14, 'Sun 12/13/2026', '4:05 PM', 'Chargers', 'LAC', 'Raiders', 'LV', 0, 0, 'pre', 'pre', '0:00', 'LAC -5.5', 'LAC', 5.5, 'CBS', false, null, null, false),
    g('w14-11', 14, 'Sun 12/13/2026', '4:25 PM', 'Chiefs', 'KC', 'Bengals', 'CIN', 0, 0, 'pre', 'pre', '0:00', 'CIN -1.5', 'CIN', 1.5, 'FOX', false, null, null, false),
    g('w14-12', 14, 'Sun 12/13/2026', '4:25 PM', 'Rams', 'LAR', '49ers', 'SF', 0, 0, 'pre', 'pre', '0:00', 'LAR -1.5', 'LAR', 1.5, 'FOX', false, null, null, false),
    g('w14-13', 14, 'Sun 12/13/2026', '4:25 PM', 'Giants', 'NYG', 'Seahawks', 'SEA', 0, 0, 'pre', 'pre', '0:00', 'SEA -7.5', 'SEA', 7.5, 'FOX', false, null, null, false),
    g('w14-14', 14, 'Sun 12/13/2026', '8:20 PM', 'Bills', 'BUF', 'Packers', 'GB', 0, 0, 'pre', 'pre', '0:00', 'GB -1.5', 'GB', 1.5, 'NBC', true, null, null, false),
    g('w14-15', 14, 'Mon 12/14/2026', '8:15 PM', 'Steelers', 'PIT', 'Jaguars', 'JAX', 0, 0, 'pre', 'pre', '0:00', 'JAX -3', 'JAX', 3, 'ESPN', true, null, null, true),
  ]),

  // ==========================================
  // WEEK 15 (16 Games)
  // ==========================================
  buildWeek(15, 'Joel', [
    g('w15-1', 15, 'Thu 12/17/2026', '8:15 PM', '49ers', 'SF', 'Chargers', 'LAC', 0, 0, 'pre', 'pre', '0:00', 'LAC -2.5', 'LAC', 2.5, 'Prime Video', true, null, null, false),
    g('w15-2', 15, 'Sat 12/19/2026', '5:00 PM', 'Seahawks', 'SEA', 'Eagles', 'PHI', 0, 0, 'pre', 'pre', '0:00', 'PHI -1.5', 'PHI', 1.5, 'FOX', false, null, null, false),
    g('w15-3', 15, 'Sat 12/19/2026', '8:20 PM', 'Bears', 'CHI', 'Bills', 'BUF', 0, 0, 'pre', 'pre', '0:00', 'BUF -3.5', 'BUF', 3.5, 'CBS', false, null, null, false),
    g('w15-4', 15, 'Sun 12/20/2026', '1:00 PM', 'Dolphins', 'MIA', 'Packers', 'GB', 0, 0, 'pre', 'pre', '0:00', 'GB -10.5', 'GB', 10.5, 'FOX', false, null, null, false),
    g('w15-5', 15, 'Sun 12/20/2026', '1:00 PM', 'Colts', 'IND', 'Titans', 'TEN', 0, 0, 'pre', 'pre', '0:00', 'IND -1.5', 'IND', 1.5, 'CBS', false, null, null, false),
    g('w15-6', 15, 'Sun 12/20/2026', '1:00 PM', 'Browns', 'CLE', 'Giants', 'NYG', 0, 0, 'pre', 'pre', '0:00', 'NYG -4.5', 'NYG', 4.5, 'CBS', false, null, null, false),
    g('w15-7', 15, 'Sun 12/20/2026', '1:00 PM', 'Ravens', 'BAL', 'Steelers', 'PIT', 0, 0, 'pre', 'pre', '0:00', 'BAL -2.5', 'BAL', 2.5, 'CBS', false, null, null, false),
    g('w15-8', 15, 'Sun 12/20/2026', '1:00 PM', 'Saints', 'NO', 'Buccaneers', 'TB', 0, 0, 'pre', 'pre', '0:00', 'TB -3.5', 'TB', 3.5, 'FOX', false, null, null, false),
    g('w15-9', 15, 'Sun 12/20/2026', '1:00 PM', 'Falcons', 'ATL', 'Commanders', 'WSH', 0, 0, 'pre', 'pre', '0:00', 'WSH -3.5', 'WSH', 3.5, 'FOX', false, null, null, false),
    g('w15-10', 15, 'Sun 12/20/2026', '1:00 PM', 'Bengals', 'CIN', 'Panthers', 'CAR', 0, 0, 'pre', 'pre', '0:00', 'CIN -2.5', 'CIN', 2.5, 'FOX', false, null, null, false),
    g('w15-11', 15, 'Sun 12/20/2026', '1:00 PM', 'Jaguars', 'JAX', 'Texans', 'HOU', 0, 0, 'pre', 'pre', '0:00', 'HOU -3', 'HOU', 3, 'CBS', false, null, null, false),
    g('w15-12', 15, 'Sun 12/20/2026', '4:05 PM', 'Jets', 'NYJ', 'Cardinals', 'ARI', 0, 0, 'pre', 'pre', '0:00', 'NYJ -1.5', 'NYJ', 1.5, 'FOX', false, null, null, false),
    g('w15-13', 15, 'Sun 12/20/2026', '4:25 PM', 'Broncos', 'DEN', 'Raiders', 'LV', 0, 0, 'pre', 'pre', '0:00', 'DEN -4.5', 'DEN', 4.5, 'CBS', false, null, null, false),
    g('w15-14', 15, 'Sun 12/20/2026', '4:25 PM', 'Cowboys', 'DAL', 'Rams', 'LAR', 0, 0, 'pre', 'pre', '0:00', 'LAR -6', 'LAR', 6, 'CBS', false, null, null, false),
    g('w15-15', 15, 'Sun 12/20/2026', '8:20 PM', 'Lions', 'DET', 'Vikings', 'MIN', 0, 0, 'pre', 'pre', '0:00', 'DET -1.5', 'DET', 1.5, 'NBC', true, null, null, false),
    g('w15-16', 15, 'Mon 12/21/2026', '8:15 PM', 'Patriots', 'NE', 'Chiefs', 'KC', 0, 0, 'pre', 'pre', '0:00', 'KC -2.5', 'KC', 2.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 16 (16 Games)
  // ==========================================
  buildWeek(16, 'Corey', [
    g('w16-1', 16, 'Thu 12/24/2026', '8:15 PM', 'Texans', 'HOU', 'Eagles', 'PHI', 0, 0, 'pre', 'pre', '0:00', 'PHI -2.5', 'PHI', 2.5, 'Prime Video', true, null, null, false),
    g('w16-2', 16, 'Fri 12/25/2026', '1:00 PM', 'Packers', 'GB', 'Bears', 'CHI', 0, 0, 'pre', 'pre', '0:00', 'CHI -1.5', 'CHI', 1.5, 'Netflix', false, null, null, false),
    g('w16-3', 16, 'Fri 12/25/2026', '4:30 PM', 'Bills', 'BUF', 'Broncos', 'DEN', 0, 0, 'pre', 'pre', '0:00', 'BUF -1.5', 'BUF', 1.5, 'Netflix', false, null, null, false),
    g('w16-4', 16, 'Fri 12/25/2026', '8:15 PM', 'Rams', 'LAR', 'Seahawks', 'SEA', 0, 0, 'pre', 'pre', '0:00', 'SEA -1.5', 'SEA', 1.5, 'FOX', true, null, null, false),
    g('w16-5', 16, 'Sun 12/27/2026', '12:00 AM', 'Buccaneers', 'TB', 'Falcons', 'ATL', 0, 0, 'pre', 'pre', '0:00', 'TB -1.5', 'TB', 1.5, 'TV', false, null, null, false),
    g('w16-6', 16, 'Sun 12/27/2026', '12:00 AM', 'Bengals', 'CIN', 'Colts', 'IND', 0, 0, 'pre', 'pre', '0:00', 'CIN -1.5', 'CIN', 1.5, 'TV', false, null, null, false),
    g('w16-7', 16, 'Sun 12/27/2026', '12:00 AM', 'Commanders', 'WSH', 'Vikings', 'MIN', 0, 0, 'pre', 'pre', '0:00', 'MIN -2.5', 'MIN', 2.5, 'TV', false, null, null, false),
    g('w16-8', 16, 'Sun 12/27/2026', '12:00 AM', 'Panthers', 'CAR', 'Steelers', 'PIT', 0, 0, 'pre', 'pre', '0:00', 'PIT -3.5', 'PIT', 3.5, 'TV', false, null, null, false),
    g('w16-9', 16, 'Sun 12/27/2026', '1:00 PM', 'Chargers', 'LAC', 'Dolphins', 'MIA', 0, 0, 'pre', 'pre', '0:00', 'LAC -7', 'LAC', 7, 'FOX', false, null, null, false),
    g('w16-10', 16, 'Sun 12/27/2026', '1:00 PM', 'Cardinals', 'ARI', 'Saints', 'NO', 0, 0, 'pre', 'pre', '0:00', 'NO -5.5', 'NO', 5.5, 'FOX', false, null, null, false),
    g('w16-11', 16, 'Sun 12/27/2026', '1:00 PM', 'Patriots', 'NE', 'Jets', 'NYJ', 0, 0, 'pre', 'pre', '0:00', 'NE -6.5', 'NE', 6.5, 'CBS', false, null, null, false),
    g('w16-12', 16, 'Sun 12/27/2026', '1:00 PM', 'Browns', 'CLE', 'Ravens', 'BAL', 0, 0, 'pre', 'pre', '0:00', 'BAL -10', 'BAL', 10, 'CBS', false, null, null, false),
    g('w16-13', 16, 'Sun 12/27/2026', '4:05 PM', 'Titans', 'TEN', 'Raiders', 'LV', 0, 0, 'pre', 'pre', '0:00', 'LV -1.5', 'LV', 1.5, 'FOX', false, null, null, false),
    g('w16-14', 16, 'Sun 12/27/2026', '4:25 PM', '49ers', 'SF', 'Chiefs', 'KC', 0, 0, 'pre', 'pre', '0:00', 'KC -3', 'KC', 3, 'CBS', false, null, null, false),
    g('w16-15', 16, 'Sun 12/27/2026', '8:20 PM', 'Jaguars', 'JAX', 'Cowboys', 'DAL', 0, 0, 'pre', 'pre', '0:00', 'DAL -3', 'DAL', 3, 'NBC', true, null, null, false),
    g('w16-16', 16, 'Mon 12/28/2026', '8:15 PM', 'Giants', 'NYG', 'Lions', 'DET', 0, 0, 'pre', 'pre', '0:00', 'DET -4.5', 'DET', 4.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 17 (16 Games)
  // ==========================================
  buildWeek(17, 'Joel', [
    g('w17-1', 17, 'Thu 12/31/2026', '8:15 PM', 'Ravens', 'BAL', 'Bengals', 'CIN', 0, 0, 'pre', 'pre', '0:00', 'CIN -2.5', 'CIN', 2.5, 'Prime Video', true, null, null, false),
    g('w17-2', 17, 'Sun 01/03/2027', '12:00 AM', 'Broncos', 'DEN', 'Patriots', 'NE', 0, 0, 'pre', 'pre', '0:00', 'NE -2.5', 'NE', 2.5, 'TV', false, null, null, false),
    g('w17-3', 17, 'Sun 01/03/2027', '12:00 AM', 'Chiefs', 'KC', 'Chargers', 'LAC', 0, 0, 'pre', 'pre', '0:00', 'LAC -1.5', 'LAC', 1.5, 'TV', false, null, null, false),
    g('w17-4', 17, 'Sun 01/03/2027', '12:00 AM', 'Rams', 'LAR', 'Buccaneers', 'TB', 0, 0, 'pre', 'pre', '0:00', 'LAR -4.5', 'LAR', 4.5, 'TV', false, null, null, false),
    g('w17-5', 17, 'Sun 01/03/2027', '12:00 AM', 'Commanders', 'WSH', 'Jaguars', 'JAX', 0, 0, 'pre', 'pre', '0:00', 'JAX -3.5', 'JAX', 3.5, 'TV', false, null, null, false),
    g('w17-6', 17, 'Sun 01/03/2027', '1:00 PM', 'Saints', 'NO', 'Falcons', 'ATL', 0, 0, 'pre', 'pre', '0:00', 'ATL -1.5', 'ATL', 1.5, 'FOX', false, null, null, false),
    g('w17-7', 17, 'Sun 01/03/2027', '1:00 PM', 'Colts', 'IND', 'Browns', 'CLE', 0, 0, 'pre', 'pre', '0:00', 'IND -2.5', 'IND', 2.5, 'FOX', false, null, null, false),
    g('w17-8', 17, 'Sun 01/03/2027', '1:00 PM', 'Giants', 'NYG', 'Cowboys', 'DAL', 0, 0, 'pre', 'pre', '0:00', 'DAL -4.5', 'DAL', 4.5, 'FOX', false, null, null, false),
    g('w17-9', 17, 'Sun 01/03/2027', '1:00 PM', 'Steelers', 'PIT', 'Titans', 'TEN', 0, 0, 'pre', 'pre', '0:00', 'PIT -1.5', 'PIT', 1.5, 'CBS', false, null, null, false),
    g('w17-10', 17, 'Sun 01/03/2027', '1:00 PM', 'Bills', 'BUF', 'Dolphins', 'MIA', 0, 0, 'pre', 'pre', '0:00', 'BUF -7.5', 'BUF', 7.5, 'CBS', false, null, null, false),
    g('w17-11', 17, 'Sun 01/03/2027', '1:00 PM', 'Vikings', 'MIN', 'Jets', 'NYJ', 0, 0, 'pre', 'pre', '0:00', 'MIN -3.5', 'MIN', 3.5, 'CBS', false, null, null, false),
    g('w17-12', 17, 'Sun 01/03/2027', '1:00 PM', 'Seahawks', 'SEA', 'Panthers', 'CAR', 0, 0, 'pre', 'pre', '0:00', 'SEA -5.5', 'SEA', 5.5, 'FOX', false, null, null, false),
    g('w17-13', 17, 'Sun 01/03/2027', '4:05 PM', 'Raiders', 'LV', 'Cardinals', 'ARI', 0, 0, 'pre', 'pre', '0:00', 'LV -1.5', 'LV', 1.5, 'CBS', false, null, null, false),
    g('w17-14', 17, 'Sun 01/03/2027', '4:25 PM', 'Lions', 'DET', 'Bears', 'CHI', 0, 0, 'pre', 'pre', '0:00', 'CHI -1.5', 'CHI', 1.5, 'FOX', false, null, null, false),
    g('w17-15', 17, 'Sun 01/03/2027', '8:20 PM', 'Eagles', 'PHI', '49ers', 'SF', 0, 0, 'pre', 'pre', '0:00', 'SF -1.5', 'SF', 1.5, 'NBC', true, null, null, false),
    g('w17-16', 17, 'Mon 01/04/2027', '8:15 PM', 'Texans', 'HOU', 'Packers', 'GB', 0, 0, 'pre', 'pre', '0:00', 'GB -2.5', 'GB', 2.5, 'ESPN', true, null, null, false),
  ]),

  // ==========================================
  // WEEK 18 (16 Games)
  // ==========================================
  buildWeek(18, 'Corey', [
    g('w18-1', 18, 'Sun 01/10/2027', '12:00 AM', 'Jets', 'NYJ', 'Bills', 'BUF', 0, 0, 'pre', 'pre', '0:00', 'BUF -10', 'BUF', 10, 'TV', false, null, null, false),
    g('w18-2', 18, 'Sun 01/10/2027', '12:00 AM', 'Browns', 'CLE', 'Bengals', 'CIN', 0, 0, 'pre', 'pre', '0:00', 'CIN -7.5', 'CIN', 7.5, 'TV', false, null, null, false),
    g('w18-3', 18, 'Sun 01/10/2027', '12:00 AM', 'Chargers', 'LAC', 'Broncos', 'DEN', 0, 0, 'pre', 'pre', '0:00', 'DEN -1.5', 'DEN', 1.5, 'TV', false, null, null, false),
    g('w18-4', 18, 'Sun 01/10/2027', '12:00 AM', 'Lions', 'DET', 'Packers', 'GB', 0, 0, 'pre', 'pre', '0:00', 'GB -2.5', 'GB', 2.5, 'TV', false, null, null, false),
    g('w18-5', 18, 'Sun 01/10/2027', '12:00 AM', 'Jaguars', 'JAX', 'Colts', 'IND', 0, 0, 'pre', 'pre', '0:00', 'IND -1.5', 'IND', 1.5, 'TV', false, null, null, false),
    g('w18-6', 18, 'Sun 01/10/2027', '12:00 AM', 'Raiders', 'LV', 'Chiefs', 'KC', 0, 0, 'pre', 'pre', '0:00', 'KC -8.5', 'KC', 8.5, 'TV', false, null, null, false),
    g('w18-7', 18, 'Sun 01/10/2027', '12:00 AM', 'Seahawks', 'SEA', 'Rams', 'LAR', 0, 0, 'pre', 'pre', '0:00', 'LAR -3', 'LAR', 3, 'TV', false, null, null, false),
    g('w18-8', 18, 'Sun 01/10/2027', '12:00 AM', 'Bears', 'CHI', 'Vikings', 'MIN', 0, 0, 'pre', 'pre', '0:00', 'MIN -1.5', 'MIN', 1.5, 'TV', false, null, null, false),
    g('w18-9', 18, 'Sun 01/10/2027', '12:00 AM', 'Dolphins', 'MIA', 'Patriots', 'NE', 0, 0, 'pre', 'pre', '0:00', 'NE -10.5', 'NE', 10.5, 'TV', false, null, null, false),
    g('w18-10', 18, 'Sun 01/10/2027', '12:00 AM', 'Buccaneers', 'TB', 'Saints', 'NO', 0, 0, 'pre', 'pre', '0:00', 'TB -1.5', 'TB', 1.5, 'TV', false, null, null, false),
    g('w18-11', 18, 'Sun 01/10/2027', '12:00 AM', 'Eagles', 'PHI', 'Giants', 'NYG', 0, 0, 'pre', 'pre', '0:00', 'PHI -3', 'PHI', 3, 'TV', false, null, null, false),
    g('w18-12', 18, 'Sun 01/10/2027', '12:00 AM', '49ers', 'SF', 'Cardinals', 'ARI', 0, 0, 'pre', 'pre', '0:00', 'SF -8.5', 'SF', 8.5, 'TV', false, null, null, false),
    g('w18-13', 18, 'Sun 01/10/2027', '12:00 AM', 'Cowboys', 'DAL', 'Commanders', 'WSH', 0, 0, 'pre', 'pre', '0:00', 'DAL -1.5', 'DAL', 1.5, 'TV', false, null, null, false),
    g('w18-14', 18, 'Sun 01/10/2027', '12:00 AM', 'Falcons', 'ATL', 'Panthers', 'CAR', 0, 0, 'pre', 'pre', '0:00', 'CAR -2.5', 'CAR', 2.5, 'TV', false, null, null, false),
    g('w18-15', 18, 'Sun 01/10/2027', '12:00 AM', 'Steelers', 'PIT', 'Ravens', 'BAL', 0, 0, 'pre', 'pre', '0:00', 'BAL -5.5', 'BAL', 5.5, 'TV', false, null, null, false),
    g('w18-16', 18, 'Sun 01/10/2027', '12:00 AM', 'Titans', 'TEN', 'Texans', 'HOU', 0, 0, 'pre', 'pre', '0:00', 'HOU -7', 'HOU', 7, 'TV', false, null, null, false),
  ]),
];
