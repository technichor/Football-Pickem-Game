import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  googleSignIn, 
  logoutGoogle, 
  saveSeasonToDrive, 
  listDrivePickemFiles, 
  loadSeasonFromDrive,
  DriveFileItem 
} from '../services/driveService';
import { WeekData } from '../types';
import { INITIAL_WEEKS } from '../data/initialSeasonData';
import { 
  X, 
  Cloud, 
  Check, 
  AlertTriangle, 
  Upload, 
  Download, 
  FolderSearch, 
  ExternalLink,
  FileText,
  UploadCloud,
  RotateCcw
} from 'lucide-react';

interface DriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: WeekData[];
  onImportWeeks: (importedWeeks: WeekData[]) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  onLogEvent?: (summary: string, changeType: 'export_backup' | 'system') => void;
}

export const DriveModal: React.FC<DriveModalProps> = ({
  isOpen,
  onClose,
  weeks,
  onImportWeeks,
  currentUser,
  setCurrentUser,
  onLogEvent,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedLink, setLastSavedLink] = useState<string | null>(null);

  // Mandatory confirmation dialog state for destructive/mutating Google Drive operations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: async () => {},
  });

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFilesList();
    }
  }, [isOpen, currentUser]);

  const loadFilesList = async () => {
    setIsLoadingFiles(true);
    try {
      const files = await listDrivePickemFiles();
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Could not list drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        setCurrentUser(result.user);
        setStatusMessage({ type: 'success', text: `Connected as ${result.user.email}` });
        const files = await listDrivePickemFiles();
        setDriveFiles(files);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sign in with Google' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutGoogle();
      setCurrentUser(null);
      setDriveFiles([]);
      setStatusMessage({ type: 'info', text: 'Signed out of Google' });
    } catch (err: any) {
      console.error(err);
    }
  };

  // Trigger Save with Mandatory Confirmation Dialog
  const promptSaveToDrive = () => {
    if (!currentUser) {
      setStatusMessage({ type: 'error', text: 'Please connect Google Drive first.' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "Save Season Data to Google Drive?",
      message:
        "This will upload your current NFL Pick'em season selections, weekly scores, and standings as '2026-27 NFL Pick'em.json' to your Google Drive account. Would you like to proceed?",
      onConfirm: async () => {
        setIsSaving(true);
        setStatusMessage(null);
        try {
          const res = await saveSeasonToDrive(weeks, "2026-27 NFL Pick'em.json");
          setStatusMessage({
            type: 'success',
            text: `Successfully saved "${res.fileName}" to your Google Drive!`,
          });
          if (onLogEvent) {
            onLogEvent(`Saved season database to Google Drive (${res.fileName})`, 'export_backup');
          }
          if (res.webViewLink) setLastSavedLink(res.webViewLink);
          await loadFilesList();
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to save to Google Drive' });
        } finally {
          setIsSaving(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Trigger Load with Mandatory Confirmation Dialog
  const promptLoadFromDrive = (fileId: string, fileName: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Load Season from "${fileName}"?`,
      message:
        "Loading this file will replace your current in-app week allocations and picks with the data from this Google Drive file. Are you sure you want to proceed?",
      onConfirm: async () => {
        try {
          const loadedWeeks = await loadSeasonFromDrive(fileId);
          onImportWeeks(loadedWeeks);
          setStatusMessage({
            type: 'success',
            text: `Loaded ${loadedWeeks.length} weeks of NFL Pick'em data from Google Drive!`,
          });
        } catch (err: any) {
          setStatusMessage({ type: 'error', text: err.message || 'Failed to load file from Drive' });
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Local JSON Export
  const handleExportLocalJson = () => {
    const jsonStr = JSON.stringify({ title: "2026-27 NFL Pick'em", weeks }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `2026-27-NFL-Pickem-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Local JSON Import / Restore from File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const importedWeeks = Array.isArray(parsed) ? parsed : parsed.weeks;
        if (!Array.isArray(importedWeeks) || importedWeeks.length === 0) {
          throw new Error('Invalid backup file: missing weeks array.');
        }
        onImportWeeks(importedWeeks);
        setStatusMessage({
          type: 'success',
          text: `Successfully restored ${importedWeeks.length} weeks from "${file.name}"!`,
        });
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err.message || 'Failed to parse JSON backup file.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Dedicated Restore Week 1 Historical Action
  const handleRestoreWeek1 = () => {
    if (window.confirm("Restore official Week 1 historical picks, scores, and matchups from backup?")) {
      const restored = weeks.map((w) => (w.weekNumber === 1 ? INITIAL_WEEKS[0] : w));
      onImportWeeks(restored);
      setStatusMessage({
        type: 'success',
        text: 'Official Week 1 historical data restored successfully!',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Cloud className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Google Drive Integration</h2>
                <p className="text-xs text-slate-400">
                  Sync &amp; backup the "2026-27 NFL Pick'em" season data with Drive
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
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Status alerts */}
            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
                    : statusMessage.type === 'error'
                    ? 'bg-rose-950/50 border-rose-500/40 text-rose-300'
                    : 'bg-blue-950/50 border-blue-500/40 text-blue-300'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <Check className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Account Status / Sign In */}
            <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
              {currentUser ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-slate-600"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {currentUser.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{currentUser.displayName || 'Google User'}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-xs text-slate-400">{currentUser.email}</div>
                    </div>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="text-xs text-slate-400 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-slate-700 hover:border-rose-800 transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="text-center py-3 space-y-4">
                  <p className="text-xs text-slate-300">
                    Connect your Google account to save weekly picks and cumulative scores directly to Google Drive.
                  </p>

                  {/* Official Google GSI Style Sign In Button */}
                  <div className="flex justify-center">
                    <button
                      id="google-signin-btn"
                      onClick={handleSignIn}
                      disabled={isLoggingIn}
                      className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-md transition disabled:opacity-50 cursor-pointer"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Drive Actions */}
            {currentUser && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Drive Sync Actions
                  </h3>
                  <button
                    onClick={loadFilesList}
                    disabled={isLoadingFiles}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  >
                    <FolderSearch className="w-3.5 h-3.5" />
                    Refresh Files
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Save to Drive */}
                  <button
                    id="save-to-drive-btn"
                    onClick={promptSaveToDrive}
                    disabled={isSaving}
                    className="p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSaving ? 'Saving to Drive...' : "Save to Google Drive"}</span>
                  </button>

                  {/* Local Backup & Restore Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 col-span-1 sm:col-span-2">
                    <label className="flex-1 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition">
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      <span>Upload JSON Backup</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={handleExportLocalJson}
                      className="flex-1 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Download Backup</span>
                    </button>

                    <button
                      onClick={handleRestoreWeek1}
                      className="flex-1 p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 font-bold text-xs flex items-center justify-center gap-2 transition"
                      title="Directly restore verified Week 1 historical scores and picks"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-400" />
                      <span>Restore Week 1</span>
                    </button>
                  </div>
                </div>

                {lastSavedLink && (
                  <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700 text-xs flex items-center justify-between">
                    <span className="text-slate-300">File saved successfully!</span>
                    <a
                      href={lastSavedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                    >
                      Open in Drive <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Pick'em Files in Drive */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-slate-300">
                    Pick'em Files in your Drive:
                  </h4>
                  {isLoadingFiles ? (
                    <div className="text-xs text-slate-400 py-3 text-center animate-pulse">
                      Searching Drive...
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="text-xs text-slate-400 py-3 text-center bg-slate-800/40 rounded-xl border border-slate-800">
                      No saved Pick'em files found yet. Click "Save to Google Drive" above to create one.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {driveFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs hover:border-slate-600 transition"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            <span className="font-semibold text-white truncate">{file.name}</span>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => promptLoadFromDrive(file.id, file.name)}
                              className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold"
                            >
                              Load
                            </button>
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white p-1"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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

      {/* Mandatory User Confirmation Dialog */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                id="confirm-drive-action-btn"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-lg transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
