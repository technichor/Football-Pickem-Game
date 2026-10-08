import React, { useState } from 'react';
import { WeekData, CumulativeSeasonStats } from '../types';
import { RawDataViewer } from './RawDataViewer';
import { SeasonTotalsTable } from './SeasonTotalsTable';
import { TableProperties, BarChart3, Database } from 'lucide-react';

interface DataViewContainerProps {
  weeks: WeekData[];
  seasonStats: CumulativeSeasonStats;
  selectedWeekNum: number;
  onSelectWeek: (week: number) => void;
  onSwitchToSlate: (week: number) => void;
}

export type DataSubTab = 'totals' | 'raw';

export const DataViewContainer: React.FC<DataViewContainerProps> = ({
  weeks,
  seasonStats,
  selectedWeekNum,
  onSelectWeek,
  onSwitchToSlate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DataSubTab>('totals');

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Sub-Tab Navigation Header for Data View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-lg">
        <div className="flex items-center gap-2 pl-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Season Analytics &amp; Database</h2>
            <p className="text-[11px] text-slate-400">
              Aggregated weekly totals and granular game-level records
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-stretch sm:self-auto">
          <button
            id="subtab-totals-btn"
            onClick={() => setActiveSubTab('totals')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'totals'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Season Totals</span>
          </button>

          <button
            id="subtab-raw-btn"
            onClick={() => setActiveSubTab('raw')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeSubTab === 'raw'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span>Raw Game Data</span>
          </button>
        </div>
      </div>

      {/* Render Active View */}
      {activeSubTab === 'totals' ? (
        <SeasonTotalsTable
          weeks={weeks}
          seasonStats={seasonStats}
          currentWeek={selectedWeekNum}
          onSelectWeekAndSwitchToSlate={onSwitchToSlate}
        />
      ) : (
        <RawDataViewer
          weeks={weeks}
          selectedWeekNum={selectedWeekNum}
          onSelectWeek={onSelectWeek}
        />
      )}
    </div>
  );
};
