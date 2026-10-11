import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ActivityLog } from '../../types';
import { storageService, subscribeToRealtimeLogs } from '../../services/storageService';
import { formatRelativeTime } from '../../utils/deviceUtils';
import { useApp } from '../../context/AppContext';
import waliSantriAvatar from '../../assets/images/wali_santri_avatar_habibi_1790235608369.jpg';
import {
  Activity,
  ArrowRight,
  Clock,
  HeartHandshake,
  GraduationCap,
  ShieldCheck,
  Users,
  Smartphone,
  Laptop,
  Sparkles,
} from 'lucide-react';

export const RecentActivityLogsWidget: React.FC = () => {
  const { uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';
  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    return storageService.getCachedLogs().slice(0, 5);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [newlyArrivedId, setNewlyArrivedId] = useState<string | null>(null);

  useEffect(() => {
    // Initial load
    const cached = storageService.getCachedLogs();
    if (cached.length > 0) {
      setLogs(cached.slice(0, 5));
    } else {
      setIsLoading(true);
      storageService.getLogs().then((res) => {
        setLogs((res || []).slice(0, 5));
      }).finally(() => setIsLoading(false));
    }

    // Real-time listener via Cloud Firestore onSnapshot & cross-tab sync
    const unsub = subscribeToRealtimeLogs((updatedLogs, latestNewLog) => {
      setLogs((updatedLogs || []).slice(0, 5));
      setIsLoading(false);
      if (latestNewLog) {
        setNewlyArrivedId(latestNewLog.id);
        setTimeout(() => {
          setNewlyArrivedId(null);
        }, 5000);
      }
    });

    return () => unsub();
  }, []);

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isNeo
          ? 'bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
      }`}
    >
      {/* Widget Header */}
      <div
        className={`p-4 sm:p-5 flex items-center justify-between border-b ${
          isNeo
            ? 'bg-amber-300 border-b-3 border-black'
            : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
              isNeo
                ? 'bg-black text-amber-300 border-2 border-black'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            }`}
          >
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <span>Buku Tamu & Log Aktivitas</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-black bg-emerald-500 text-white shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>Live Real-time</span>
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Kunjungan wali santri & riwayat login terkini
            </p>
          </div>
        </div>

        <Link
          to="/aktivitas"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-black transition-all cursor-pointer rounded-lg ${
            isNeo
              ? 'bg-white hover:bg-slate-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5'
              : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-bold hover:underline'
          }`}
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Widget Content */}
      <div className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Memuat aktivitas terkini...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Belum ada aktivitas yang tercatat hari ini.
          </div>
        ) : (
          logs.map((log) => {
            const isGuest =
              log.role === 'guest' ||
              log.role === 'viewer' ||
              (log.action && log.action.toLowerCase().includes('tamu')) ||
              (log.action && log.action.toLowerCase().includes('wali')) ||
              Boolean(log.santri_name);

            const isNewlyArrived = newlyArrivedId === log.id;

            return (
              <div
                key={log.id}
                className={`py-3 first:pt-0 last:pb-0 flex items-start gap-3 transition-all rounded-xl p-2 ${
                  isNewlyArrived
                    ? 'bg-amber-100 dark:bg-emerald-950/70 border-2 border-emerald-500 scale-[1.02] shadow-md animate-pulse'
                    : ''
                }`}
              >
                <div className="relative shrink-0 mt-0.5">
                  <img
                    src={isGuest ? waliSantriAvatar : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'}
                    alt={log.user_name}
                    className={`w-9 h-9 rounded-full object-cover border-2 ${
                      isGuest ? 'border-emerald-500' : 'border-purple-500'
                    }`}
                  />
                  <span
                    className={`absolute -bottom-1 -right-1 text-[8px] font-black px-1 rounded-full border border-black ${
                      isGuest ? 'bg-lime-400 text-black' : 'bg-purple-400 text-black'
                    }`}
                  >
                    {isGuest ? 'TAMU' : 'ADM'}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {log.user_name}
                      </span>
                      {log.relationship && (
                        <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                          ({log.relationship})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0 font-medium">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>

                  {log.santri_name && (
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 dark:border-emerald-800">
                      <GraduationCap className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Wali: {log.santri_name}</span>
                      {log.santri_class && <span>({log.santri_class})</span>}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-1 font-medium">
                    {log.details || log.action}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
