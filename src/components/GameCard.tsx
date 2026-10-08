import React from 'react';
import { NFLGame, PlayerId } from '../types';
import { getTeam } from '../data/nflTeams';
import { 
  calculatePotentialPoints, 
  isTeamUnderdog, 
  getGameWinner 
} from '../services/scoringEngine';
import { 
  Tv, 
  Zap, 
  Flame, 
  Check, 
  X, 
  UserCheck, 
  Radio,
  Lock,
  Edit3
} from 'lucide-react';

interface GameCardProps {
  game: NFLGame;
  onAssignPicker: (gameId: string, picker: PlayerId | null) => void;
  onSelectPick: (gameId: string, teamAbbr: string) => void;
  onQuickDraft: (gameId: string) => void;
  isDraftMode: boolean;
  onTheClock: PlayerId;
  isCurrentActiveWeek?: boolean;
  isCommissionerMode?: boolean;
  onOpenEdit?: (game: NFLGame) => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  onAssignPicker,
  onSelectPick,
  onQuickDraft,
  isDraftMode,
  onTheClock,
  isCurrentActiveWeek = true,
  isCommissionerMode = false,
  onOpenEdit,
}) => {
  const awayInfo = getTeam(game.awayAbbr);
  const homeInfo = getTeam(game.homeAbbr);

  const awayIsUnderdog = isTeamUnderdog(game, game.awayAbbr);
  const homeIsUnderdog = isTeamUnderdog(game, game.homeAbbr);

  const awayPotential = calculatePotentialPoints(game, game.awayAbbr);
  const homePotential = calculatePotentialPoints(game, game.homeAbbr);

  const isFinal = game.status === 'post';
  const isLive = game.status === 'in';
  const winner = getGameWinner(game);

  // If a pick has been made, calculate active potential points
  const activePotential = game.pick ? calculatePotentialPoints(game, game.pick) : 1;
  const pickWon = isFinal && game.pick ? game.pick === winner : null;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        game.picker === 'Corey'
          ? 'bg-slate-900/90 border-emerald-900/60 shadow-lg shadow-emerald-950/20'
          : game.picker === 'Joel'
          ? 'bg-slate-900/90 border-amber-900/60 shadow-lg shadow-amber-950/20'
          : 'bg-slate-900/60 border-slate-800 shadow-md hover:border-slate-700'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* Date, Time, Broadcast */}
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-300">{game.date}</span>
          <span>•</span>
          <span>{game.time}</span>
          {game.broadcast && (
            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
              <Tv className="w-3 h-3 text-slate-400" />
              {game.broadcast}
            </span>
          )}
        </div>

        {/* Badges: Prime Time, Live, Final & Edit button */}
        <div className="flex items-center gap-1.5">
          {onOpenEdit && (
            <button
              onClick={() => onOpenEdit(game)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition"
              title="Edit game picker, pick, or details and record to log"
            >
              <Edit3 className="w-3 h-3 text-amber-400" />
              <span>Edit Game</span>
            </button>
          )}

          {game.isExtraPick && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-700/50">
              Xtra Pick
            </span>
          )}

          {game.isPrimeTime && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
              Prime Time (+1)
            </span>
          )}

          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950 text-red-300 border border-red-700 animate-pulse">
              <Radio className="w-3 h-3 text-red-400" />
              Live {game.quarter} {game.clock}
            </span>
          )}

          {isFinal && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              Final {game.quarter === 'F-OT' ? '(OT)' : ''}
            </span>
          )}
        </div>

      </div>

      {/* Main Card Content */}
      <div className="p-4 space-y-3.5">
        
        {/* Odds & Spread Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Spread:</span>
            <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/70">
              {game.odds || 'PK (Pick\'em)'}
            </span>
            {game.favoriteAbbr && (
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                ({game.favoriteAbbr} favored by {game.spread} pts)
              </span>
            )}
          </div>

          {/* Potential Points Badge */}
          {game.pick && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Potential:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                  activePotential === 3
                    ? 'bg-gradient-to-r from-amber-500 to-red-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : activePotential === 2
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {activePotential} {activePotential === 1 ? 'Point' : 'Points'}
                {activePotential === 3 && ' 🔥'}
              </span>
            </div>
          )}
        </div>

        {/* Team Matchup & Winner Selection Buttons */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Away Team Pick Button */}
          <button
            id={`pick-away-${game.id}`}
            onClick={() => onSelectPick(game.id, game.awayAbbr)}
            className={`relative p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
              game.pick === game.awayAbbr
                ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
            title={game.picker ? `Select ${game.awayAbbr} for ${game.picker}` : `Assign to ${onTheClock} and pick ${game.awayAbbr}`}
          >
            {/* Picked Indicator Checkmark */}
            {game.pick === game.awayAbbr && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-2">
              <img
                src={awayInfo.logoUrl}
                alt={awayInfo.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-contain drop-shadow"
                onError={(e) => {
                  // Fallback if logo fails
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-xs text-slate-400 font-medium leading-none">
                  {awayInfo.city}
                </div>
                <div className="text-base font-black text-white leading-tight">
                  {awayInfo.name}
                </div>
                <div className="text-[11px] font-bold text-slate-400">
                  {game.awayAbbr}
                </div>
              </div>
            </div>

            {/* Score & Spread Meta */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">
                {awayIsUnderdog ? (
                  <span className="text-orange-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    +{game.spread} (Dog)
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {game.favoriteAbbr === game.awayAbbr ? `-${game.spread} (Fav)` : 'PK'}
                  </span>
                )}
              </span>

              {(isLive || isFinal) && (
                <span className="text-lg font-black text-white ml-2">
                  {game.awayScore}
                </span>
              )}
            </div>

            {/* Potential on Pick */}
            <div className="mt-1 text-[10px] text-slate-400 font-medium">
              Worth: <strong className="text-slate-200">{awayPotential} pt{awayPotential > 1 ? 's' : ''}</strong>
              {awayIsUnderdog && ' (+1 Dog)'}
            </div>
          </button>

          {/* Home Team Pick Button */}
          <button
            id={`pick-home-${game.id}`}
            onClick={() => onSelectPick(game.id, game.homeAbbr)}
            className={`relative p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
              game.pick === game.homeAbbr
                ? 'bg-slate-800/90 border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/10'
                : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
            }`}
            title={game.picker ? `Select ${game.homeAbbr} for ${game.picker}` : `Assign to ${onTheClock} and pick ${game.homeAbbr}`}
          >
            {/* Picked Indicator Checkmark */}
            {game.pick === game.homeAbbr && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shadow">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}

            <div className="flex items-center gap-3 mb-2">
              <img
                src={homeInfo.logoUrl}
                alt={homeInfo.name}
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-contain drop-shadow"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <div className="text-xs text-slate-400 font-medium leading-none">
                  {homeInfo.city}
                </div>
                <div className="text-base font-black text-white leading-tight">
                  {homeInfo.name}
                </div>
                <div className="text-[11px] font-bold text-slate-400">
                  {game.homeAbbr}
                </div>
              </div>
            </div>

            {/* Score & Spread Meta */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="font-semibold text-slate-300">
                {homeIsUnderdog ? (
                  <span className="text-orange-400 font-bold flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    +{game.spread} (Dog)
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {game.favoriteAbbr === game.homeAbbr ? `-${game.spread} (Fav)` : 'PK'}
                  </span>
                )}
              </span>

              {(isLive || isFinal) && (
                <span className="text-lg font-black text-white ml-2">
                  {game.homeScore}
                </span>
              )}
            </div>

            {/* Potential on Pick */}
            <div className="mt-1 text-[10px] text-slate-400 font-medium">
              Worth: <strong className="text-slate-200">{homePotential} pt{homePotential > 1 ? 's' : ''}</strong>
              {homeIsUnderdog && ' (+1 Dog)'}
            </div>
          </button>

        </div>

        {/* Outcome Banner if Final or Live Status */}
        {isFinal && game.pick && (
          <div
            className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between ${
              pickWon
                ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800/80 border border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {pickWon ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>
                    <strong>{game.picker}</strong> won pick on <strong>{game.pick}</strong>!
                  </span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </div>
                  <span>
                    <strong>{game.picker}</strong>'s pick on <strong>{game.pick}</strong> lost.
                  </span>
                </>
              )}
            </div>
            <span className="font-black text-sm">
              {pickWon ? `+${activePotential} pts` : '0 pts'}
            </span>
          </div>
        )}

        {/* Bottom Allocation Bar */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Picker Assignment Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Drafted By:</span>
            
            {game.picker ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
                    game.picker === 'Corey'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                      : 'bg-amber-950 text-amber-300 border border-amber-700/60'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  {game.picker}
                </span>

                {/* Quick Toggle / Reassign Button */}
                <button
                  id={`reassign-${game.id}`}
                  onClick={() => onAssignPicker(game.id, game.picker === 'Corey' ? 'Joel' : 'Corey')}
                  className="text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                  title="Switch picker"
                >
                  Switch to {game.picker === 'Corey' ? 'Joel' : 'Corey'}
                </button>

                <button
                  id={`unassign-${game.id}`}
                  onClick={() => onAssignPicker(game.id, null)}
                  className="text-[11px] text-slate-400 hover:text-rose-400 px-1.5 py-0.5 rounded transition"
                  title="Clear assignment"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id={`draft-corey-${game.id}`}
                  onClick={() => onAssignPicker(game.id, 'Corey')}
                  className="px-2.5 py-1 rounded-lg font-bold text-xs bg-slate-800 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-700 hover:border-emerald-600 transition"
                >
                  + Corey
                </button>
                <button
                  id={`draft-joel-${game.id}`}
                  onClick={() => onAssignPicker(game.id, 'Joel')}
                  className="px-2.5 py-1 rounded-lg font-bold text-xs bg-slate-800 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-600 transition"
                >
                  + Joel
                </button>
                {isDraftMode && (
                  <button
                    id={`draft-clock-${game.id}`}
                    onClick={() => onQuickDraft(game.id)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs shadow transition flex items-center gap-1 ${
                      onTheClock === 'Corey'
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <span>Draft ({onTheClock})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pick selection hint if not yet chosen */}
          {game.picker && !game.pick && (
            <span className="text-[11px] text-amber-400/90 font-medium animate-pulse">
              Select {game.picker}'s winner pick ☝️
            </span>
          )}

        </div>

      </div>
    </div>
  );
};
