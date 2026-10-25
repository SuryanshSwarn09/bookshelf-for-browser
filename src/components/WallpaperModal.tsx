import React from 'react';
import { X, Palette, Image as ImageIcon, Sliders, RotateCcw, Check } from 'lucide-react';
import { ThemePreset } from '../hooks/useSettings';

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgWallpaper: string;
  setBgWallpaper: (url: string) => void;
  bgOpacity: number;
  setBgOpacity: (opacity: number) => void;
  bgBlur: number;
  setBgBlur: (blur: number) => void;
  themePreset: ThemePreset;
  setThemePreset: (theme: ThemePreset) => void;
}

const THEME_OPTIONS: Array<{
  id: ThemePreset;
  label: string;
  desc: string;
  bgClass: string;
  accentClass: string;
}> = [
  {
    id: 'default',
    label: 'Modernist Slate',
    desc: 'Crisp canvas & cobalt blue',
    bgClass: 'bg-[#f8fafc] dark:bg-[#0c0d12] border-slate-200 dark:border-slate-800',
    accentClass: 'bg-[#2563eb]',
  },
  {
    id: 'oled',
    label: 'OLED Black',
    desc: 'Pure deep black',
    bgClass: 'bg-[#050505] border-white/20',
    accentClass: 'bg-white',
  },
  {
    id: 'nordic',
    label: 'Nordic Frost',
    desc: 'Slate blue & ice',
    bgClass: 'bg-[#0f172a] border-sky-500/20',
    accentClass: 'bg-[#38bdf8]',
  },
  {
    id: 'sunset',
    label: 'Warm Sunset',
    desc: 'Cozy charcoal & ember',
    bgClass: 'bg-[#181311] border-orange-500/20',
    accentClass: 'bg-[#ea580c]',
  },
  {
    id: 'graphite',
    label: 'Graphite',
    desc: 'Slate charcoal & cool white',
    bgClass: 'bg-[#18181b] border-white/15',
    accentClass: 'bg-[#f4f4f5]',
  },
  {
    id: 'porcelain',
    label: 'Porcelain',
    desc: 'Minimal warm paper',
    bgClass: 'bg-[#f4f4f0] border-black/15 text-[#1a1a1a]',
    accentClass: 'bg-[#1a1a1a]',
  },
];

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  bgWallpaper,
  setBgWallpaper,
  bgOpacity,
  setBgOpacity,
  bgBlur,
  setBgBlur,
  themePreset,
  setThemePreset,
}) => {
  if (!isOpen) return null;

  const handleClear = () => {
    setBgWallpaper('');
    setBgOpacity(40);
    setBgBlur(0);
    setThemePreset('default');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallpaper-settings-title"
    >
      <div
        className="w-full max-w-lg ios-glass-modal text-[#1c1c1c] dark:text-[#e5e5e1] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2563eb]/10 dark:bg-[#3b82f6]/20 flex items-center justify-center text-[#2563eb] dark:text-[#3b82f6]">
              <Palette size={15} />
            </div>
            <div>
              <h2 id="wallpaper-settings-title" className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Theme & appearance
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Personalize dashboard colors and backdrop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          {/* Theme Presets Grid */}
          <div>
            <label className="block text-xs font-sans-ui text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
              Theme presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_OPTIONS.map((t) => {
                const isSelected = themePreset === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemePreset(t.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative group flex flex-col gap-1 active:scale-95 ${
                      isSelected
                        ? 'border-[#2563eb] dark:border-[#3b82f6] bg-[#2563eb]/10 dark:bg-[#3b82f6]/15 shadow-sm'
                        : 'border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-sm border shadow-sm flex items-center justify-center ${t.bgClass}`}>
                          <div className={`w-1.5 h-1.5 rounded-sm ${t.accentClass}`} />
                        </div>
                        <span className="text-xs font-sans-ui font-semibold text-slate-800 dark:text-slate-200">
                          {t.label}
                        </span>
                      </div>
                      {isSelected && (
                        <Check size={12} className="text-[#2563eb] dark:text-[#3b82f6] shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Wallpaper URL */}
          <div>
            <label className="block text-xs font-sans-ui text-slate-700 dark:text-slate-300 mb-1 font-medium">
              Custom wallpaper URL <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative flex items-center">
              <ImageIcon size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={bgWallpaper}
                onChange={(e) => setBgWallpaper(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-lg ios-glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans-ui text-xs outline-none"
              />
              {bgWallpaper && (
                <button
                  type="button"
                  onClick={() => setBgWallpaper('')}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded"
                  title="Remove Wallpaper"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Opacity & Blur Sliders */}
          <div className="p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-3">
            <div>
              <div className="flex justify-between items-center text-xs font-sans-ui mb-1.5">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Wallpaper opacity
                </span>
                <span className="text-[11px] font-mono-ui font-medium px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[#2563eb] dark:text-[#3b82f6]">
                  {bgOpacity}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={bgOpacity}
                onChange={(e) => setBgOpacity(Number(e.target.value))}
                className="w-full accent-[#2563eb] dark:accent-[#3b82f6] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-sans-ui mb-1.5">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Backdrop blur
                </span>
                <span className="text-[11px] font-mono-ui font-medium px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[#2563eb] dark:text-[#3b82f6]">
                  {bgBlur}px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={bgBlur}
                onChange={(e) => setBgBlur(Number(e.target.value))}
                className="w-full accent-[#2563eb] dark:accent-[#3b82f6] cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1.5 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-2 px-3 rounded-lg ios-glass-pill text-xs font-sans-ui font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} />
              <span>Reset defaults</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-[2] py-2 px-3 bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white rounded-lg font-sans-ui text-xs font-medium shadow-sm active:scale-98 transition-all cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb]"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
