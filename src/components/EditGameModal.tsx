import React, { useState, useEffect } from 'react';
import { NFLGame, PlayerId } from '../types';
import { getTeam } from '../data/nflTeams';
import { calculatePotentialPoints, isTeamUnderdog } from '../services/scoringEngine';
import { 
  X, 
  Edit3, 
  User, 
  Trophy, 
  Flame, 
  Zap, 
  CheckCircle2, 
  FileText,
  AlertCircle
} from 'lucide-react';

interface EditGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: NFLGame | null;
  weekNumber: number;
  onSave: (updatedGame: NFLGame, logNote?: string) => void;
}

export const EditGameModal: React.FC<EditGameModalProps> = ({
  isOpen,
  onClose,
  game,
  weekNumber,
  onSave,
}) => {
  if (!isOpen || !game) return null;

  const [selectedPicker, setSelectedPicker] = useState<PlayerId | null>(game.picker);
  const [selectedPick, setSelectedPick] = useState<string | null>(game.pick);
  const [isExtraPick, setIsExtraPick] = useState<boolean>(Boolean(game.isExtraPick));
  const [logNote, setLogNote] = useState<string>('');

  // Re-sync when game changes
  useEffect(() => {
    if (game) {
      setSelectedPicker(game.picker);
      setSelectedPick(game.pick);
      setIsExtraPick(Boolean(game.isExtraPick));
      setLogNote('');
    }
  }, [game]);

  const awayInfo = getTeam(game.awayAbbr);
  const homeInfo = getTeam(game.homeAbbr);

  const awayUnderdog = isTeamUnderdog(game, game.awayAbbr);
  const homeUnderdog = isTeamUnderdog(game, game.homeAbbr);

  const awayPotential = calculatePotentialPoints(game, game.awayAbbr);
  const homePotential = calculatePotentialPoints(game, game.homeAbbr);

  const hasChanges =
    selectedPicker !== game.picker ||
    selectedPick !== game.pick ||
    isExtraPick !== Boolean(game.isExtraPick) ||
    logNote.trim().length > 0;

  const handleSave = () => {
    const updated: NFLGame = {
      ...game,
      picker: selectedPicker,
      pick: selectedPick,
      isExtraPick,
    };
    onSave(updated, logNote.trim() || undefined);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">
                  Edit Game & Record to Log
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-950 text-blue-300 border border-blue-800">
                  Week {weekNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {game.awayAbbr} @ {game.homeAbbr} • {game.date} • {game.time}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs">
          
          {/* Matchup Banner */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <span className="text-base font-black text-white block">{game.awayAbbr}</span>
                <span className="text-[10px] text-slate-400">{awayInfo.name}</span>
              </div>
              <span className="text-slate-500 font-bold">@</span>
              <div className="text-center">
                <span className="text-base font-black text-white block">{game.homeAbbr}</span>
                <span className="text-[10px] text-slate-400">{homeInfo.name}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                Spread: {game.odds || 'PK'}
              </span>
              {game.status === 'post' && (
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Final: {game.awayScore} - {game.homeScore}
                </div>
              )}
            </div>
          </div>

          {/* 1. Drafted By Picker Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Drafted By / Picker</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPicker(null)}
                className={`p-3 rounded-xl border text-center transition font-bold text-xs ${
                  selectedPicker === null
                    ? 'bg-slate-800 border-slate-500 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                Unassigned
              </button>

              <button
                type="button"
                onClick={() => setSelectedPicker('Corey')}
                className={`p-3 rounded-xl border text-center transition font-black text-xs ${
                  selectedPicker === 'Corey'
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-emerald-300 hover:border-emerald-800'
                }`}
              >
                Corey
              </button>

              <button
                type="button"
                onClick={() => setSelectedPicker('Joel')}
                className={`p-3 rounded-xl border text-center transition font-black text-xs ${
                  selectedPicker === 'Joel'
                    ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/50'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-800'
                }`}
              >
                Joel
              </button>
            </div>
          </div>

          {/* 2. Winning Team Pick Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Pick Winning Team</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Away Button */}
              <button
                type="button"
                onClick={() => setSelectedPick(game.awayAbbr)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedPick === game.awayAbbr
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-black">{game.awayAbbr}</span>
                  {selectedPick === game.awayAbbr && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {awayInfo.city} {awayInfo.name}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {awayUnderdog ? `+${game.spread} (Dog)` : 'Favored/PK'}
                  </span>
                  <span className="font-bold text-amber-300">
                    Worth: {awayPotential} pt{awayPotential > 1 ? 's' : ''}
                  </span>
                </div>
              </button>

              {/* Home Button */}
              <button
                type="button"
                onClick={() => setSelectedPick(game.homeAbbr)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  selectedPick === game.homeAbbr
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md ring-1 ring-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-black">{game.homeAbbr}</span>
                  {selectedPick === game.homeAbbr && (
                    <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {homeInfo.city} {homeInfo.name}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    {homeUnderdog ? `+${game.spread} (Dog)` : 'Favored/PK'}
                  </span>
                  <span className="font-bold text-amber-300">
                    Worth: {homePotential} pt{homePotential > 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            </div>

            {selectedPick && (
              <button
                type="button"
                onClick={() => setSelectedPick(null)}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition underline underline-offset-2 pt-1"
              >
                Clear pick (No winner chosen)
              </button>
            )}
          </div>

          {/* 3. Extra Pick Option */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-200 block">Xtra Pick</span>
              <span className="text-[11px] text-slate-400">
                Mark this matchup as an extra / bonus pick
              </span>
            </div>
            <input
              type="checkbox"
              checked={isExtraPick}
              onChange={(e) => setIsExtraPick(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/50 bg-slate-900 border-slate-700 cursor-pointer"
            />
          </div>

          {/* 4. Log Reason / Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Log Note (Optional reason for change)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Correcting historical Week 3 pick, late injury adjustment..."
              value={logNote}
              onChange={(e) => setLogNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Diff Preview */}
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] flex items-center justify-between text-slate-400">
            <div>
              <span className="text-slate-500 font-bold block text-[10px] uppercase">Original:</span>
              <span className="text-slate-300 font-medium">
                {game.picker || 'None'} • {game.pick || 'No Pick'}
              </span>
            </div>
            <span className="text-slate-600 font-bold">→</span>
            <div className="text-right">
              <span className="text-emerald-400 font-bold block text-[10px] uppercase">New:</span>
              <span className="text-white font-bold">
                {selectedPicker || 'None'} • {selectedPick || 'No Pick'}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save & Record to Log</span>
          </button>
        </div>
      </div>
    </div>
  );
};
