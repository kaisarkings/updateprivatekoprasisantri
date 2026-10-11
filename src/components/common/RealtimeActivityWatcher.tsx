import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ActivityLog } from '../../types';
import { subscribeToRealtimeLogs, NEW_LOG_ALERT_EVENT } from '../../services/storageService';
import { playNotificationChime } from '../../utils/audioUtils';
import { formatRelativeTime } from '../../utils/deviceUtils';
import waliSantriAvatar from '../../assets/images/wali_santri_avatar_habibi_1790235608369.jpg';
import { Users, X, ArrowRight, Sparkles, CheckCircle2, Clock } from 'lucide-react';

export const RealtimeActivityWatcher: React.FC = () => {
  const { user } = useAuth();
  const { uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';
  const navigate = useNavigate();

  const [activeAlert, setActiveAlert] = useState<ActivityLog | null>(null);
  const isAdmin = user?.role === 'admin' || user?.role === 'administrator';

  useEffect(() => {
    // Only listen for real-time guest arrivals if admin is logged in
    if (!isAdmin) return;

    let dismissTimer: NodeJS.Timeout | null = null;

    const handleNewLog = (newLog: ActivityLog) => {
      // Specifically react when guest/wali santri enters
      const isGuestEntry =
        newLog.role === 'guest' ||
        newLog.role === 'viewer' ||
        (newLog.action && newLog.action.toLowerCase().includes('tamu')) ||
        (newLog.action && newLog.action.toLowerCase().includes('wali')) ||
        Boolean(newLog.santri_name);

      if (isGuestEntry) {
        // Play notification bell
        playNotificationChime();

        // Show floating reaction toast
        setActiveAlert(newLog);

        if (dismissTimer) clearTimeout(dismissTimer);
        dismissTimer = setTimeout(() => {
          setActiveAlert(null);
        }, 8000);
      }
    };

    // 1. Subscribe to Firestore onSnapshot & cross-tab events
    const unsubRealtime = subscribeToRealtimeLogs((_logs, latestNewLog) => {
      if (latestNewLog) {
        handleNewLog(latestNewLog);
      }
    });

    // 2. Also listen for explicit NEW_LOG_ALERT_EVENT
    const handleEventAlert = (e: Event) => {
      const custom = e as CustomEvent<ActivityLog>;
      if (custom.detail) {
        handleNewLog(custom.detail);
      }
    };
    window.addEventListener(NEW_LOG_ALERT_EVENT, handleEventAlert);

    return () => {
      unsubRealtime();
      window.removeEventListener(NEW_LOG_ALERT_EVENT, handleEventAlert);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [isAdmin]);

  if (!activeAlert || !isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full font-mono animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`p-4 rounded-2xl border-4 relative overflow-hidden transition-all ${
          isNeo
            ? 'bg-amber-300 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-white dark:bg-slate-900 border-emerald-500 shadow-2xl'
        }`}
      >
        {/* Glow Header */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-black dark:text-white flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Real-time: Tamu Masuk!</span>
            </span>
          </div>

          <button
            onClick={() => setActiveAlert(null)}
            className="p-1 rounded-md hover:bg-black/10 text-black dark:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex items-start gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border-2 border-black/80">
          <img
            src={waliSantriAvatar}
            alt="Wali Santri"
            className="w-11 h-11 rounded-full object-cover border-2 border-black shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="font-black text-xs text-slate-900 dark:text-white truncate">
              {activeAlert.user_name}
            </div>
            {activeAlert.santri_name && (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold truncate">
                Wali dari: {activeAlert.santri_name} {activeAlert.santri_class ? `(${activeAlert.santri_class})` : ''}
              </div>
            )}
            <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              <span>{formatRelativeTime(activeAlert.created_at)}</span>
              {activeAlert.relationship && (
                <>
                  <span>•</span>
                  <span>{activeAlert.relationship}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-bold">
            Tersimpan di Cloud Firestore
          </span>
          <button
            onClick={() => {
              setActiveAlert(null);
              navigate('/aktivitas');
            }}
            className="px-3 py-1.5 bg-black hover:bg-slate-800 text-white font-black text-xs rounded-lg flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
          >
            <span>Buka Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
