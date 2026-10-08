import React from 'react';
import { X, HelpCircle, Flame, Zap, Trophy, ShieldAlert, ArrowLeftRight } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">NFL Pick'em Rules &amp; Scoring</h2>
              <p className="text-xs text-slate-400">
                Corey vs. Joel Head-to-Head Premise &amp; Guidelines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm">
          
          {/* Section 1: The Premise */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ArrowLeftRight className="w-4 h-4 text-amber-400" />
              <span>1. Alternating Game Selection (No Crossover)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Each week, Corey and Joel alternate drafting the NFL games they would like to "bet" on.
              There is strictly <strong>no crossover</strong>: each player drafts <strong>8 distinct games</strong> per week (adjusted down during bye weeks).
              Use the <strong>"On the Clock"</strong> indicator and <strong>Draft Mode</strong> to alternate picks in order.
            </p>
          </div>

          {/* Section 2: Scoring Hierarchy */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              2. Point Calculation (1 to 3 Points Possible)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Base Point */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Base Point</span>
                  <span className="text-base font-black text-emerald-400">+1 PT</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Correctly selecting the outright straight-up winner of your drafted game.
                </p>
              </div>

              {/* Underdog Bonus */}
              <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-700/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Underdog Bonus
                  </span>
                  <span className="text-base font-black text-orange-400">+1 PT</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Bonus point awarded when you choose the point-spread underdog and they win outright!
                </p>
              </div>

              {/* Prime Time Bonus */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-700/50 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    Prime Time Bonus
                  </span>
                  <span className="text-base font-black text-amber-400">+1 PT</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Bonus point awarded when your drafted game is during Prime Time (Thursday, Sunday, or Monday Night Football).
                </p>
              </div>
            </div>

            {/* Maximum 3 Pts callout */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-400 flex-shrink-0" />
              <div className="text-xs">
                <strong className="text-white">Maximum 3 Points per Game:</strong> If a game is during Prime Time <em>and</em> you pick the underdog to win, a single game can yield a maximum of <strong>3 points</strong>!
              </div>
            </div>
          </div>

          {/* Section 3: Bye Weeks & Extra Picks */}
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              <span>3. Bye Weeks &amp; Extra Picks</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When teams are on bye and the total slate has fewer than 16 games, game allocations are scaled down accordingly.
              Any designated extra games (e.g., odd number slates) are clearly flagged with an <strong>Xtra Pick</strong> badge so scoring remains fair and balanced.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
