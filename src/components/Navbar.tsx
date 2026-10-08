import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  RefreshCw, 
  Cloud, 
  HelpCircle, 
  Zap, 
  Database,
  LayoutGrid,
  Download,
  History,
  MoreVertical,
  X
} from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  onRefreshScores: () => void;
  isRefreshing: boolean;
  lastUpdated: string;
  onOpenDrive: () => void;
  onOpenRules: () => void;
  onOpenPowerUps: () => void;
  onToggleOptimizer?: () => void;
  onDownloadBackup?: () => void;
  onOpenChangeLog?: () => void;
  changeLogCount?: number;
  googleUser: User | null;
  cloudSyncStatus?: 'synced' | 'syncing' | 'offline';
  onRetryCloudSync?: () => void;
  viewMode: 'slate' | 'data';
  onToggleViewMode: (mode: 'slate' | 'data') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onRefreshScores,
  isRefreshing,
  lastUpdated,
  onOpenDrive,
  onOpenRules,
  onOpenPowerUps,
  onToggleOptimizer,
  onDownloadBackup,
  onOpenChangeLog,
  changeLogCount = 0,
  googleUser,
  cloudSyncStatus = 'synced',
  onRetryCloudSync,
  viewMode = 'slate',
  onToggleViewMode,
}) => {
  // Mobile collapsed menu state & outside-click dismissal
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hidden long-press easter egg gesture for Help button to unlock Draft Optimizer
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isHeldTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
    };
  }, []);

  const handleHelpPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isHeldTriggeredRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);

    holdTimerRef.current = setTimeout(() => {
      isHeldTriggeredRef.current = true;
      if (onToggleOptimizer) {
        onToggleOptimizer();
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (_) {}
      }
    }, 2500);
  };

  const handleHelpPointerUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleHelpPointerLeave = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleHelpPointerCancel = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  };

  const handleHelpClick = (e: React.MouseEvent) => {
    if (isHeldTriggeredRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isHeldTriggeredRef.current = false;
      return;
    }
    onOpenRules();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('pointerdown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo & App Title (Corey vs Joel removed to preserve mobile space) */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-red-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-base sm:text-lg uppercase bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none">
                  NFL Pick'em
                </span>
                <button
                  id="cloud-sync-status-badge"
                  onClick={onRetryCloudSync}
                  disabled={!onRetryCloudSync || cloudSyncStatus === 'syncing'}
                  className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border transition ${
                    cloudSyncStatus === 'synced'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : cloudSyncStatus === 'syncing'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20 cursor-pointer'
                  }`}
                  title={
                    cloudSyncStatus === 'synced'
                      ? 'Cloud Live: Real-time multi-device sync active'
                      : cloudSyncStatus === 'syncing'
                      ? 'Syncing with Firestore...'
                      : 'Offline: Click to reconnect to Cloud Firestore'
                  }
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      cloudSyncStatus === 'synced'
                        ? 'bg-emerald-400 animate-pulse'
                        : cloudSyncStatus === 'syncing'
                        ? 'bg-amber-400 animate-spin'
                        : 'bg-rose-400'
                    }`}
                  />
                  <span>
                    {cloudSyncStatus === 'synced'
                      ? 'Cloud Live'
                      : cloudSyncStatus === 'syncing'
                      ? 'Syncing...'
                      : 'Offline (Click to retry)'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                2026–27 Season Head-to-Head
              </p>
            </div>
          </div>

          {/* Primary View Switcher: Slate vs Data (Icons only on mobile, text on sm+) */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700/80 shadow-inner shrink-0">
            <button
              id="nav-slate-tab-btn"
              onClick={() => onToggleViewMode('slate')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'slate'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Weekly draft board & match picks"
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Slate</span>
            </button>
            <button
              id="nav-data-tab-btn"
              onClick={() => onToggleViewMode('data')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === 'data'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Season totals & raw database table"
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Data</span>
            </button>
          </div>

          {/* Actions & Integration Tools Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Rules / Help Button (Hold down for hidden Draft Optimizer) */}
            <button
              id="open-rules-btn"
              onClick={handleHelpClick}
              onPointerDown={handleHelpPointerDown}
              onPointerUp={handleHelpPointerUp}
              onPointerLeave={handleHelpPointerLeave}
              onPointerCancel={handleHelpPointerCancel}
              onContextMenu={(e) => {
                if (isHeldTriggeredRef.current) e.preventDefault();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 shrink-0 select-none touch-manipulation"
              title="Scoring Rules & Instructions"
              aria-label="Scoring Rules & Instructions"
            >
              <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
              <span className="hidden xl:inline text-xs font-semibold">Rules</span>
            </button>

            {/* Desktop Actions Toolbar (Visible on md and larger) */}
            <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
              
              {/* Live Refresh Button */}
              <button
                id="refresh-scores-btn"
                onClick={onRefreshScores}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition disabled:opacity-50 shrink-0"
                title={`Refresh live scores & active/future spreads from ESPN (Last checked: ${lastUpdated})`}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 shrink-0 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden lg:inline">Refresh</span>
              </button>

              {/* Download JSON Backup Button */}
              {onDownloadBackup && (
                <button
                  id="nav-download-backup-btn"
                  onClick={onDownloadBackup}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition shrink-0"
                  title="Download complete season JSON backup file (all picks, scores, & standings)"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden lg:inline">JSON Backup</span>
                </button>
              )}

              {/* Change & Audit Log Button */}
              {onOpenChangeLog && (
                <button
                  id="nav-change-log-btn"
                  onClick={onOpenChangeLog}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition shrink-0"
                  title="View permanent transparent audit log of all picks and game edits"
                >
                  <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="hidden lg:inline">Change Log</span>
                  {changeLogCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {changeLogCount}
                    </span>
                  )}
                </button>
              )}

              {/* Google Drive Integration Button */}
              <button
                id="open-drive-btn"
                onClick={onOpenDrive}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-semibold transition shrink-0 ${
                  googleUser
                    ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/70'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
                title={googleUser ? `Google Drive Connected (${googleUser.email})` : 'Connect Google Drive'}
              >
                <Cloud className={`w-3.5 h-3.5 shrink-0 ${googleUser ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="hidden lg:inline">Drive</span>
                {googleUser && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />}
              </button>

              {/* Power-ups Preview Button */}
              <button
                id="open-powerups-btn"
                onClick={onOpenPowerUps}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-400 transition shrink-0"
                title="Upcoming Power-Ups Preview"
              >
                <Zap className="w-4 h-4 text-amber-400" />
              </button>

            </div>

            {/* Mobile Collapsible Actions Menu (Visible on smaller screens < md) */}
            <div className="relative md:hidden" ref={menuRef}>
              <button
                id="mobile-actions-menu-btn"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`p-1.5 rounded-lg border transition flex items-center justify-center shrink-0 cursor-pointer ${
                  isMenuOpen
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Menu & actions"
                aria-label="Actions menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <MoreVertical className="w-4 h-4" />
                )}
                {changeLogCount > 0 && !isMenuOpen && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-slate-900" />
                )}
              </button>

              {/* Mobile Actions Dropdown Card */}
              {isMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-64 bg-slate-900/98 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
                  role="menu"
                >
                  <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Actions & Tools</span>
                    <span className="text-[10px] text-slate-400 lowercase font-normal">{lastUpdated}</span>
                  </div>

                  {/* Refresh Scores */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onRefreshScores();
                    }}
                    disabled={isRefreshing}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-between transition disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <RefreshCw className={`w-4 h-4 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span>Refresh ESPN Scores</span>
                    </div>
                    {isRefreshing && <span className="text-[10px] text-blue-400 font-normal">Syncing...</span>}
                  </button>

                  {/* Change & Audit Log */}
                  {onOpenChangeLog && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenChangeLog();
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <History className="w-4 h-4 text-amber-400" />
                        <span>Change & Audit Log</span>
                      </div>
                      {changeLogCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {changeLogCount}
                        </span>
                      )}
                    </button>
                  )}

                  {/* Google Drive */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenDrive();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Cloud className={`w-4 h-4 ${googleUser ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>Google Drive</span>
                    </div>
                    {googleUser ? (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-normal">Connect</span>
                    )}
                  </button>

                  {/* Export JSON Backup */}
                  {onDownloadBackup && (
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDownloadBackup();
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Download className="w-4 h-4 text-amber-400" />
                        <span>Export JSON Backup</span>
                      </div>
                    </button>
                  )}

                  {/* Power-ups Preview */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenPowerUps();
                    }}
                    className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span>Power-Ups Preview</span>
                    </div>
                  </button>

                  {/* Mobile Cloud Live Sync Indicator */}
                  {onRetryCloudSync && (
                    <div className="px-3.5 py-2 mt-1 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Database:</span>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          onRetryCloudSync();
                        }}
                        disabled={cloudSyncStatus === 'syncing'}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                          cloudSyncStatus === 'synced'
                            ? 'text-emerald-400'
                            : cloudSyncStatus === 'syncing'
                            ? 'text-amber-400'
                            : 'text-rose-400 hover:underline'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cloudSyncStatus === 'synced'
                              ? 'bg-emerald-400 animate-pulse'
                              : cloudSyncStatus === 'syncing'
                              ? 'bg-amber-400 animate-spin'
                              : 'bg-rose-400'
                          }`}
                        />
                        <span>
                          {cloudSyncStatus === 'synced'
                            ? 'Cloud Live'
                            : cloudSyncStatus === 'syncing'
                            ? 'Syncing...'
                            : 'Offline (Retry)'}
                        </span>
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

