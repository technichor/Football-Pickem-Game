export type PlayerId = 'Corey' | 'Joel';

export type GameStatus = 'pre' | 'in' | 'post';

export interface NFLGame {
  id: string;
  week: number;
  date: string; // e.g. "Sun 09/13/2026" or ISO
  time: string; // e.g. "1:00 PM"
  awayTeam: string; // "Cowboys"
  awayAbbr: string; // "DAL"
  homeTeam: string; // "Eagles"
  homeAbbr: string; // "PHI"
  awayScore: number;
  homeScore: number;
  status: GameStatus; // 'pre' | 'in' | 'post'
  quarter?: string; // "F", "F-OT", "1st", "2nd", "3rd", "4th", "Half"
  clock?: string; // "0:00", "8:42"
  odds: string; // e.g. "PHI -7.5"
  favoriteAbbr: string; // e.g. "PHI"
  spread: number; // e.g. 7.5
  broadcast: string; // e.g. "NBC", "Prime Video", "FOX", "CBS", "ESPN", "ABC", "NFL Net", "YouTube"
  isPrimeTime: boolean; // Thu night, Sun night, Mon night, Fri special
  
  // Pick'em draft allocation
  picker: PlayerId | null; // 'Corey' | 'Joel' | null (unassigned)
  pick: string | null; // Selected winning team abbr (e.g. "DAL" or "PHI")
  isExtraPick?: boolean; // If game is assigned as Xtra Pick
  
  // Power-up applied (future update preview)
  powerUp?: 'doubleDown' | 'shield' | 'underdogBoost' | null;
}

export interface PlayerWeekStats {
  pts: number;
  pot: number;
  pos: number; // remaining possible/potential points
  ptPct: number; // pts / pot * 100
  gmPct: number; // wins / games * 100
  wins: number;
  losses: number;
  pending: number;
  totalGames: number;
  // Enhanced live, forecast & scenario metrics
  liveLeadingPts?: number;
  forecastedPts?: number;
  bestCasePts?: number;
  worstCasePts?: number;
  liveGamesCount?: number;
  upcomingGamesCount?: number;
  liveLeadingCount?: number;
  liveTrailingCount?: number;
  liveTiedCount?: number;
  pointsInPlay?: number;
  pointsUpcoming?: number;
  underdogPicksCount?: number;
  primeTimePicksCount?: number;
}

export interface WeekData {
  weekNumber: number;
  onTheClock: PlayerId;
  draftOrderFirst: PlayerId;
  games: NFLGame[];
  stats: {
    Corey: PlayerWeekStats;
    Joel: PlayerWeekStats;
  };
}

export interface CumulativeSeasonStats {
  Corey: {
    totalPts: number;
    totalPot: number;
    totalPos: number;
    ptPct: number;
    gmPct: number;
    totalWins: number;
    totalLosses: number;
    totalGames: number;
    weeksWon: number;
  };
  Joel: {
    totalPts: number;
    totalPot: number;
    totalPos: number;
    ptPct: number;
    gmPct: number;
    totalWins: number;
    totalLosses: number;
    totalGames: number;
    weeksWon: number;
  };
  leader: PlayerId | 'Tied';
  pointDifferential: number;
}

export type ChangeLogType = 
  | 'pick' 
  | 'picker' 
  | 'picker_and_pick' 
  | 'game_edit' 
  | 'clear' 
  | 'export_backup' 
  | 'score_refresh' 
  | 'reset' 
  | 'auto_draft' 
  | 'system';

export interface GameChangeLogEntry {
  id: string;
  timestamp: number;
  formattedTime: string;
  weekNumber: number;
  gameId: string;
  matchup: string; // e.g. "DET @ GB"
  changeType: ChangeLogType;
  summary: string; // Human-readable e.g. "Corey picked GB (-3.5)"
  details?: string;
  author?: string; // Player name or Commissioner
  previous?: {
    picker: PlayerId | null;
    pick: string | null;
  };
  current?: {
    picker: PlayerId | null;
    pick: string | null;
  };
}

