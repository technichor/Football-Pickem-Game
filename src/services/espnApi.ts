import { NFLGame, GameStatus } from '../types';

export interface EspnScoreboardResult {
  success: boolean;
  games: Partial<NFLGame>[];
  source: 'espn' | 'cache' | 'simulated';
  lastUpdated: string;
  error?: string;
}

/**
 * Normalizes team abbreviation differences between ESPN and our sheets
 */
function normalizeAbbr(abbr: string): string {
  const map: Record<string, string> = {
    WSH: 'WSH',
    WAS: 'WSH',
    JAC: 'JAX',
    LA: 'LAR',
    LAR: 'LAR',
    LAC: 'LAC',
    ARI: 'ARI',
    KC: 'KC',
    TB: 'TB',
    NE: 'NE',
    NO: 'NO',
    SF: 'SF',
    GB: 'GB',
    TEN: 'TEN',
    IND: 'IND',
    HOU: 'HOU',
    BAL: 'BAL',
    BUF: 'BUF',
    CIN: 'CIN',
    CLE: 'CLE',
    DEN: 'DEN',
    DET: 'DET',
    MIA: 'MIA',
    MIN: 'MIN',
    NYG: 'NYG',
    NYJ: 'NYJ',
    PHI: 'PHI',
    PIT: 'PIT',
    SEA: 'SEA',
    ATL: 'ATL',
    CAR: 'CAR',
    CHI: 'CHI',
    DAL: 'DAL',
    LV: 'LV',
    OAK: 'LV',
  };
  return map[abbr?.toUpperCase()] || abbr?.toUpperCase();
}

interface ParsedOdds {
  odds?: string;
  favoriteAbbr?: string;
  spread?: number;
}

function parseEspnOdds(
  oddsArray: any[],
  homeAbbr: string,
  awayAbbr: string
): ParsedOdds {
  if (!Array.isArray(oddsArray) || oddsArray.length === 0) {
    return {};
  }

  const oddsObj = oddsArray.find((o: any) => o && (o.details || typeof o.spread === 'number')) || oddsArray[0];
  if (!oddsObj) return {};

  const details = typeof oddsObj.details === 'string' ? oddsObj.details.trim() : '';

  // 1. Pick'em / Even
  if (/^(PK|EVEN|PICK)$/i.test(details)) {
    return {
      odds: "PK (Pick'em)",
      favoriteAbbr: '',
      spread: 0,
    };
  }

  // 2. Standard details with minus e.g. "BUF -3.5" or "GB -5.5"
  if (details.includes('-')) {
    const parts = details.split('-');
    const fav = normalizeAbbr(parts[0]?.trim());
    const spreadVal = Math.abs(parseFloat(parts[1]?.trim())) || 0;
    if (fav) {
      return {
        odds: `${fav} -${spreadVal}`,
        favoriteAbbr: fav,
        spread: spreadVal,
      };
    }
  }

  // 3. Format with plus e.g. "ATL +5.5"
  if (details.includes('+')) {
    const parts = details.split('+');
    const dog = normalizeAbbr(parts[0]?.trim());
    const spreadVal = Math.abs(parseFloat(parts[1]?.trim())) || 0;
    const fav = dog === homeAbbr ? awayAbbr : homeAbbr;
    if (fav) {
      return {
        odds: `${fav} -${spreadVal}`,
        favoriteAbbr: fav,
        spread: spreadVal,
      };
    }
  }

  // 4. Spread number on oddsObj
  if (typeof oddsObj.spread === 'number') {
    const spreadVal = Math.abs(oddsObj.spread);
    if (spreadVal === 0) {
      return {
        odds: "PK (Pick'em)",
        favoriteAbbr: '',
        spread: 0,
      };
    }

    let fav = '';
    if (oddsObj.homeTeamOdds?.favorite) fav = homeAbbr;
    else if (oddsObj.awayTeamOdds?.favorite) fav = awayAbbr;
    else fav = oddsObj.spread < 0 ? homeAbbr : awayAbbr;

    return {
      odds: `${fav} -${spreadVal}`,
      favoriteAbbr: fav,
      spread: spreadVal,
    };
  }

  if (details) {
    return {
      odds: details,
    };
  }

  return {};
}

/**
 * Fetch live NFL scores and odds/spreads from ESPN public scoreboard
 */
export async function fetchEspnScores(weekNumber?: number): Promise<EspnScoreboardResult> {
  try {
    let url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
    if (weekNumber) {
      // NFL regular season type is 2
      url += `?seasontype=2&week=${weekNumber}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`ESPN responded with status ${res.status}`);
    }

    const data = await res.json();
    const events = data.events || [];

    const updatedGames: Partial<NFLGame>[] = [];

    for (const event of events) {
      const competition = event.competitions?.[0];
      if (!competition) continue;

      const homeComp = competition.competitors?.find((c: any) => c.homeAway === 'home');
      const awayComp = competition.competitors?.find((c: any) => c.homeAway === 'away');

      if (!homeComp || !awayComp) continue;

      const homeAbbr = normalizeAbbr(homeComp.team?.abbreviation);
      const awayAbbr = normalizeAbbr(awayComp.team?.abbreviation);

      const homeScore = parseInt(homeComp.score || '0', 10);
      const awayScore = parseInt(awayComp.score || '0', 10);

      const rawState = competition.status?.type?.state; // 'pre' | 'in' | 'post'
      let status: GameStatus = 'pre';
      if (rawState === 'in') status = 'in';
      else if (rawState === 'post') status = 'post';

      const shortDetail = competition.status?.type?.shortDetail || '';
      const clock = competition.status?.displayClock || '0:00';
      const period = competition.status?.period || 1;

      let quarter = 'pre';
      if (status === 'post') {
        quarter = shortDetail.includes('OT') ? 'F-OT' : 'F';
      } else if (status === 'in') {
        quarter = `${period}Q`;
        if (period === 2 && clock === '0:00') quarter = 'Half';
      }

      // Parse Odds & Spread (ESPN Bet / DraftKings consensus)
      const parsedOdds = parseEspnOdds(competition.odds, homeAbbr, awayAbbr);

      // Broadcast
      const broadcast = competition.broadcasts?.[0]?.names?.[0] || 'TV';

      updatedGames.push({
        homeAbbr,
        awayAbbr,
        homeScore,
        awayScore,
        status,
        quarter,
        clock,
        odds: parsedOdds.odds,
        favoriteAbbr: parsedOdds.favoriteAbbr,
        spread: parsedOdds.spread,
        broadcast: broadcast || undefined,
      });
    }

    return {
      success: true,
      games: updatedGames,
      source: 'espn',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  } catch (err: any) {
    console.warn('Could not fetch ESPN live scores, using local/cached state:', err?.message || err);
    return {
      success: false,
      games: [],
      source: 'cache',
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      error: err?.message || 'Network unavailable',
    };
  }
}
