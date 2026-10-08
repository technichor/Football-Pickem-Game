import React, { useEffect } from 'react';
import { RotateCcw, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { PlayerId } from '../types';

interface ResetDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  weekNumber: number;
  totalGames: number;
  assignedUnplayedCount: number;
  completedGamesCount: number;
  firstPicker: PlayerId;
}

export const ResetDraftModal: React.FC<ResetDraftModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  weekNumber,
  totalGames,
  assignedUnplayedCount,
  completedGamesCount,
  firstPicker,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 id="reset-modal-title" className="text-lg font-black text-white">
                Reset Week {weekNumber} Draft?
              </h2>
              <p className="text-xs text-slate-400">Confirmation required</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-slate-300 text-sm">
          <p className="text-slate-300 leading-relaxed text-sm">
            Are you sure you want to reset draft pick allocations for <strong>Week {weekNumber}</strong>?
          </p>

          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs">
            <div className="flex items-start gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">
                  {assignedUnplayedCount} draft {assignedUnplayedCount === 1 ? 'pick' : 'picks'} will be cleared
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  All unplayed games will return to unassigned status so you can draft again.
                </p>
              </div>
            </div>

            {completedGamesCount > 0 && (
              <div className="flex items-start gap-2 pt-2 border-t border-slate-800/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-emerald-300">
                    {completedGamesCount} completed {completedGamesCount === 1 ? 'game' : 'games'} preserved
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Finalized game scores and official points are locked and will not be lost.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-2 pt-2 border-t border-slate-800/80">
              <span className="text-indigo-400 font-bold text-xs shrink-0">⏱️</span>
              <div>
                <span className="font-semibold text-slate-200">
                  Turn resets to <strong className="text-indigo-300">{firstPicker}</strong>
                </span>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  The on-the-clock indicator will reset to the first pick position for this week.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>This action requires confirmation to prevent accidental resets.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/25 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
};
