import React from 'react';
import { useApp, ToastMessage } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
  isNeo?: boolean;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, isNeo }) => {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  // Specific motion entry configs for different feedback types
  let entryVariants;
  if (isSuccess) {
    // Subtle, delightful spring entry with gentle scale settling
    entryVariants = {
      initial: { opacity: 0, y: -18, x: 28, scale: 0.94 },
      animate: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          type: 'spring' as const,
          stiffness: 420,
          damping: 24,
          mass: 0.8,
        },
      },
      exit: {
        opacity: 0,
        x: 45,
        scale: 0.92,
        transition: { duration: 0.2, ease: 'easeInOut' as const },
      },
    };
  } else if (isError) {
    // Subtle alert micro-shake entry to draw attention gently without jarring
    entryVariants = {
      initial: { opacity: 0, y: -18, x: 28, scale: 0.94 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        x: [28, -6, 5, -2, 1, 0],
        transition: {
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        },
      },
      exit: {
        opacity: 0,
        x: 45,
        scale: 0.92,
        transition: { duration: 0.2, ease: 'easeInOut' as const },
      },
    };
  } else {
    // Smooth fluid spring for warning / info
    entryVariants = {
      initial: { opacity: 0, y: -16, x: 20, scale: 0.95 },
      animate: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        transition: {
          type: 'spring' as const,
          stiffness: 380,
          damping: 25,
        },
      },
      exit: {
        opacity: 0,
        x: 45,
        scale: 0.92,
        transition: { duration: 0.2, ease: 'easeInOut' as const },
      },
    };
  }

  // Type styling configuration
  const config = {
    success: {
      borderColor: 'border-emerald-500',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800/80',
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      pulseColor: 'bg-emerald-400/30',
      progressBarColor: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    error: {
      borderColor: 'border-rose-500',
      badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
      badgeBorder: 'border-rose-200 dark:border-rose-800/80',
      iconColor: 'text-rose-500 dark:text-rose-400',
      pulseColor: 'bg-rose-400/30',
      progressBarColor: 'bg-rose-500',
      icon: AlertCircle,
    },
    warning: {
      borderColor: 'border-amber-500',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
      badgeBorder: 'border-amber-200 dark:border-amber-800/80',
      iconColor: 'text-amber-500 dark:text-amber-400',
      pulseColor: 'bg-amber-400/30',
      progressBarColor: 'bg-amber-500',
      icon: AlertTriangle,
    },
    info: {
      borderColor: 'border-blue-500',
      badgeBg: 'bg-blue-50 dark:bg-blue-950/60',
      badgeBorder: 'border-blue-200 dark:border-blue-800/80',
      iconColor: 'text-blue-500 dark:text-blue-400',
      pulseColor: 'bg-blue-400/30',
      progressBarColor: 'bg-blue-500',
      icon: Info,
    },
  }[toast.type];

  const IconComponent = config.icon;

  return (
    <motion.div
      layout
      variants={entryVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="alert"
      aria-live={isError ? 'assertive' : 'polite'}
      className={`pointer-events-auto relative overflow-hidden flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-xl transition-colors ${
        isNeo
          ? 'border-[3px] border-black dark:border-amber-400 bg-white dark:bg-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,215,0,1)]'
          : `border-l-4 ${config.borderColor} bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-r border-b border-slate-200/80 dark:border-slate-800 shadow-slate-900/10 dark:shadow-black/50`
      }`}
    >
      {/* Animated Icon Container with subtle spring pop & aura ring */}
      <div className="relative shrink-0 mt-0.5">
        {/* Subtle aura pulse on entry */}
        <motion.span
          initial={{ scale: 0.8, opacity: 0.8 }}
          animate={{ scale: [0.8, 1.5, 1.8], opacity: [0.8, 0.4, 0] }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`absolute inset-0 rounded-full ${config.pulseColor}`}
        />

        <motion.div
          initial={
            isSuccess
              ? { scale: 0.2, rotate: -25 }
              : isError
              ? { scale: 0.3, rotate: 20 }
              : { scale: 0.4 }
          }
          animate={
            isSuccess
              ? { scale: [0.2, 1.2, 1], rotate: [-25, 8, 0] }
              : isError
              ? { scale: [0.3, 1.25, 0.95, 1], rotate: [20, -10, 4, 0] }
              : { scale: 1 }
          }
          transition={{
            duration: isError ? 0.42 : 0.38,
            delay: 0.08,
            ease: 'easeOut',
          }}
          className={`relative p-2 rounded-xl border ${config.badgeBg} ${config.badgeBorder} ${config.iconColor}`}
        >
          <IconComponent className="w-5 h-5" />
        </motion.div>
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0 pr-1 pt-0.5">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed break-words font-medium">
            {toast.message}
          </p>
        )}
      </div>

      {/* Dismiss Button with Micro-Interaction */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.15, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRemove(toast.id)}
        aria-label="Tutup notifikasi"
        className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </motion.button>

      {/* Subtle Auto-Dismiss Countdown Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        style={{ transformOrigin: 'left' }}
        className={`absolute bottom-0 left-0 right-0 h-1 ${config.progressBarColor} opacity-75`}
      />
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifikasi Sistem"
      className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
            isNeo={isNeo}
          />
        ))}
      </AnimatePresence>
    </aside>
  );
};
