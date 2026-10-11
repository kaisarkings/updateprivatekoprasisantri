import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleSwitchProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { themeMode, toggleTheme, uiStyle } = useApp();
  const isDark = themeMode === 'dark';
  const isNeo = uiStyle === 'neo-brutalism';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {showLabel && (
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 select-none">
          {isDark ? 'Mode Gelap' : 'Mode Terang'}
        </span>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
        title={isDark ? 'Mode Gelap Aktif (Klik untuk Mode Terang)' : 'Mode Terang Aktif (Klik untuk Mode Gelap)'}
        onClick={toggleTheme}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            toggleTheme();
          }
        }}
        className={`group relative inline-flex items-center h-8 w-16 p-0.5 rounded-full cursor-pointer select-none transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
          isNeo
            ? 'border-[3px] border-black dark:border-amber-400 bg-amber-100 dark:bg-slate-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,215,0,1)] active:translate-x-0.5 active:translate-y-0.5'
            : isDark
            ? 'bg-slate-800 hover:bg-slate-750 border border-slate-700/80 shadow-inner'
            : 'bg-slate-200/90 hover:bg-slate-300/80 border border-slate-300/70 shadow-inner'
        }`}
      >
        {/* Background Track Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
          {/* Sun icon on left side */}
          <Sun
            className={`w-3.5 h-3.5 transition-all duration-300 ${
              isDark ? 'text-slate-500 opacity-40 scale-75' : 'text-amber-500 opacity-90 scale-100'
            }`}
          />
          {/* Moon icon on right side */}
          <Moon
            className={`w-3.5 h-3.5 transition-all duration-300 ${
              isDark ? 'text-indigo-400 opacity-90 scale-100' : 'text-slate-400 opacity-40 scale-75'
            }`}
          />
        </div>

        {/* Sliding Thumb */}
        <span
          className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 ease-out transform ${
            isDark ? 'translate-x-8' : 'translate-x-0.5'
          } ${
            isNeo
              ? isDark
                ? 'bg-amber-400 text-black border-2 border-black'
                : 'bg-white text-black border-2 border-black'
              : isDark
              ? 'bg-slate-900 text-indigo-300 shadow-md ring-1 ring-white/15'
              : 'bg-white text-amber-500 shadow-md ring-1 ring-slate-900/5'
          }`}
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 fill-indigo-400/20 rotate-0 transition-transform duration-300 group-hover:-rotate-12" />
          ) : (
            <Sun className="w-3.5 h-3.5 fill-amber-500/20 rotate-0 transition-transform duration-300 group-hover:rotate-45" />
          )}
        </span>
      </button>
    </div>
  );
};
