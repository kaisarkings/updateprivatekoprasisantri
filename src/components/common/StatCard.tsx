import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'teal';
  customIconBg?: string;
  badgeText?: string;
  badgeDotColor?: string;
  delayIndex?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'emerald',
  customIconBg,
  badgeText,
  badgeDotColor,
  delayIndex = 0,
}) => {
  const { uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const configMap: Record<
    string,
    {
      gradient: string;
      glowBg: string;
      hoverBorder: string;
      badgeStyle: string;
      defaultDot: string;
      barGradient: string;
    }
  > = {
    emerald: {
      gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30',
      glowBg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      hoverBorder: 'hover:border-emerald-500/50 dark:hover:border-emerald-400/60',
      badgeStyle: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800/60',
      defaultDot: '#10b981',
      barGradient: 'from-emerald-400 to-teal-500',
    },
    teal: {
      gradient: 'bg-gradient-to-br from-teal-400 to-teal-600 text-white shadow-lg shadow-teal-500/30',
      glowBg: 'from-teal-500/10 via-teal-500/5 to-transparent',
      hoverBorder: 'hover:border-teal-500/50 dark:hover:border-teal-400/60',
      badgeStyle: 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200/80 dark:border-teal-800/60',
      defaultDot: '#14b8a6',
      barGradient: 'from-teal-400 to-cyan-500',
    },
    blue: {
      gradient: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30',
      glowBg: 'from-blue-500/10 via-blue-500/5 to-transparent',
      hoverBorder: 'hover:border-blue-500/50 dark:hover:border-blue-400/60',
      badgeStyle: 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-800/60',
      defaultDot: '#3b82f6',
      barGradient: 'from-blue-400 to-indigo-500',
    },
    amber: {
      gradient: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30',
      glowBg: 'from-amber-500/10 via-amber-500/5 to-transparent',
      hoverBorder: 'hover:border-amber-500/50 dark:hover:border-amber-400/60',
      badgeStyle: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/60',
      defaultDot: '#f59e0b',
      barGradient: 'from-amber-400 to-orange-500',
    },
    purple: {
      gradient: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/30',
      glowBg: 'from-purple-500/10 via-purple-500/5 to-transparent',
      hoverBorder: 'hover:border-purple-500/50 dark:hover:border-purple-400/60',
      badgeStyle: 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200/80 dark:border-purple-800/60',
      defaultDot: '#a855f7',
      barGradient: 'from-purple-400 to-pink-500',
    },
    rose: {
      gradient: 'bg-gradient-to-br from-rose-400 to-rose-600 text-white shadow-lg shadow-rose-500/30',
      glowBg: 'from-rose-500/10 via-rose-500/5 to-transparent',
      hoverBorder: 'hover:border-rose-500/50 dark:hover:border-rose-400/60',
      badgeStyle: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-800/60',
      defaultDot: '#f43f5e',
      barGradient: 'from-rose-400 to-red-500',
    },
  };

  const scheme = configMap[colorScheme] || configMap.emerald;
  const iconClass = customIconBg || scheme.gradient;
  const activeDot = badgeDotColor || scheme.defaultDot;

  if (isNeo) {
    return (
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 border-[3.5px] border-black dark:border-slate-400 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.8)] rounded-xl flex items-start justify-between gap-4 font-mono transition-transform hover:-translate-y-1">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-black text-black dark:text-white mt-1.5 tracking-tight truncate">
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-1 truncate">
              {subtitle}
            </p>
          )}
          {badgeText && (
            <div className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-black text-[11px] uppercase border-[2px] border-black">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeDot }} />
              <span>{badgeText}</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 flex items-center justify-center border-[3px] border-black dark:border-white bg-amber-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: delayIndex * 0.05, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative p-5 sm:p-6 rounded-2xl bg-white/90 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl dark:shadow-none transition-all duration-300 overflow-hidden flex items-start justify-between gap-4 ${scheme.hoverBorder}`}
    >
      {/* Ambient background glow on top right */}
      <div
        className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br ${scheme.glowBg} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
      />

      {/* Top subtle colored accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.barGradient} opacity-70 group-hover:opacity-100 transition-opacity`}
      />

      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>{title}</span>
        </p>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight truncate group-hover:text-emerald-950 dark:group-hover:text-white transition-colors">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
            {subtitle}
          </p>
        )}
        {badgeText && (
          <div
            className={`mt-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${scheme.badgeStyle}`}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse shrink-0"
              style={{
                backgroundColor: activeDot,
                boxShadow: `0 0 8px ${activeDot}`,
              }}
            />
            <span className="truncate">{badgeText}</span>
          </div>
        )}
      </div>

      {/* Colored Icon Container with micro hover interaction */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 3 }}
        whileTap={{ scale: 0.95 }}
        className={`relative z-10 w-12 h-12 flex items-center justify-center rounded-2xl shrink-0 transition-transform duration-300 ${iconClass}`}
      >
        <Icon className="w-6 h-6 drop-shadow-sm" />
      </motion.div>
    </motion.div>
  );
};

export default StatCard;
