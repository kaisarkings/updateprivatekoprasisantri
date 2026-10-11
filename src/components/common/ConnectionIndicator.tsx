import React, { useState } from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useApp } from '../../context/AppContext';
import { Wifi, WifiOff, RefreshCw, Database, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { formatDateTime } from '../../utils/formatters';

export const ConnectionIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { pendingSyncCount, isSyncing, syncOfflineData } = useApp();
  const [isDismissed, setIsDismissed] = useState(false);

  // If online and no pending items to sync, remain quiet / non-intrusive
  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  const lastCacheTime = storageService.getLastTransactionCacheTime();

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm sm:max-w-md animate-in slide-in-from-bottom-3 duration-300">
      <div className={`p-3.5 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
        !isOnline
          ? 'bg-amber-900/90 text-amber-50 border-amber-600/50 shadow-amber-950/30'
          : 'bg-emerald-900/90 text-emerald-50 border-emerald-600/50 shadow-emerald-950/30'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className={`p-2 rounded-xl shrink-0 ${
              !isOnline ? 'bg-amber-700/80 text-amber-200' : 'bg-emerald-700/80 text-emerald-200'
            }`}>
              {!isOnline ? (
                <WifiOff className="w-4 h-4 animate-pulse" />
              ) : (
                <Database className="w-4 h-4" />
              )}
            </div>

            <div className="text-xs">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-xs tracking-wide">
                  {!isOnline ? 'Mode Offline (Jaringan Pesantren)' : 'Sinkronisasi Pending'}
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono uppercase font-bold ${
                  !isOnline ? 'bg-amber-600/60 text-amber-100' : 'bg-emerald-600/60 text-emerald-100'
                }`}>
                  {!isOnline ? 'Cache Aktif' : 'Online'}
                </span>
              </div>

              <p className="opacity-90 leading-relaxed text-[11px]">
                {!isOnline
                  ? 'Koneksi internet sedang tidak stabil. Data transaksi terakhir tetap dapat diakses & dicatat melalui cache lokal offline.'
                  : `${pendingSyncCount} transaksi lokal menunggu diunggah ke server cloud.`}
              </p>

              {lastCacheTime && (
                <p className="text-[10px] opacity-75 mt-1 font-mono">
                  Cache transaksi: {formatDateTime(lastCacheTime)}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 shrink-0"
            title="Sembunyikan Pesan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action button if pending items exist or manual sync is needed */}
        {pendingSyncCount > 0 && (
          <div className="mt-2.5 pt-2 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-amber-300" />
              <span>{pendingSyncCount} transaksi tersimpan lokal</span>
            </span>

            <button
              type="button"
              disabled={isSyncing || !isOnline}
              onClick={syncOfflineData}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xs transition-all ${
                !isOnline
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-white text-emerald-900 hover:bg-emerald-100 cursor-pointer'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : !isOnline ? 'Menunggu Online' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


