import React from 'react';
import { X, Zap, Shield, Sparkles, TrendingUp, Lightbulb } from 'lucide-react';

interface PowerUpsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PowerUpsModal: React.FC<PowerUpsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const powerUps = [
    {
      title: 'Double Down (2x)',
      icon: TrendingUp,
      color: 'from-amber-500 to-yellow-400',
      badge: 'High Stakes',
      desc: 'Lock in your highest confidence pick of the week. If correct, all points earned (including bonuses) are multiplied by 2x!',
    },
    {
      title: 'Underdog Shield',
      icon: Shield,
      color: 'from-blue-500 to-indigo-500',
      badge: 'Risk Protection',
      desc: 'Protect a big underdog pick. If they lose by a single possession (7 points or less), you still rescue +0.5 points.',
    },
    {
      title: 'Prime Time Overcharge',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      badge: 'Night Game Boost',
      desc: 'Supercharges Prime Time games from +1 bonus to +2 bonus, giving a potential ceiling of 4 points on underdog night games!',
    },
    {
      title: 'Draft Steal / Switch',
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-400',
      badge: 'Tactical',
      desc: 'Once per season, swap one unstarted game from your opponent’s slate before kickoff.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">Power Ups Preview</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-900/60 text-purple-300 border border-purple-700/60">
                  Coming Soon
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Experimental modifiers planned for future season iterations
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-300">
            As requested, power-ups will be integrated in future updates. Here is a preview of the cards currently being balanced for Corey vs Joel head-to-head battles:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {powerUps.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-slate-600 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${p.color} text-slate-950 flex items-center justify-center shadow-md`}>
                      <Icon className="w-4 h-4 text-slate-950" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-white">Have a specific power-up in mind?</strong> We can activate custom rules, multiplier tokens, or underdog bets anytime.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-white transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
