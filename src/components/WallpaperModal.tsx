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
    label: 'Default',
    desc: 'Warm terracotta & cream',
    bgClass: 'bg-[#faf8f5] dark:bg-[#121314] border-black/10 dark:border-white/15',
    accentClass: 'bg-[#c85a32]',
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
    id: 'cyberpunk',
    label: 'Cyberpunk',
    desc: 'Deep violet & neon',
    bgClass: 'bg-[#0d0814] border-purple-500/25',
    accentClass: 'bg-[#d946ef]',
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
        className="w-full max-w-lg ios-glass-modal text-[#1c1c1c] dark:text-[#e5e5e1] rounded-[28px] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c85a32]/10 dark:bg-[#d36135]/20 flex items-center justify-center text-[#c85a32] dark:text-[#d36135]">
              <Palette size={16} />
            </div>
            <div>
              <h2 id="wallpaper-settings-title" className="text-xl font-serif-display font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1]">
                Theme & Appearance
              </h2>
              <p className="text-[11px] font-mono-ui text-zinc-500 dark:text-zinc-400">
                Personalize dashboard colors and backdrop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Theme Presets Grid */}
          <div>
            <label className="block text-[11px] font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-2.5 uppercase tracking-wider font-semibold">
              Theme Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_OPTIONS.map((t) => {
                const isSelected = themePreset === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemePreset(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col gap-1 active:scale-95 ${
                      isSelected
                        ? 'border-[#c85a32] dark:border-[#d36135] bg-[#c85a32]/10 dark:bg-[#d36135]/15 shadow-sm'
                        : 'border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full border shadow-sm flex items-center justify-center ${t.bgClass}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${t.accentClass}`} />
                        </div>
                        <span className="text-xs font-sans-ui font-semibold text-[#1c1c1c] dark:text-[#e5e5e1]">
                          {t.label}
                        </span>
                      </div>
                      {isSelected && (
                        <Check size={12} className="text-[#c85a32] dark:text-[#d36135] shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono-ui text-zinc-500 dark:text-zinc-400">
                      {t.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Wallpaper URL */}
          <div>
            <label className="block text-[11px] font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              Custom Wallpaper URL <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative flex items-center">
              <ImageIcon size={15} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="https://images.unsplash.com/photo-..."
                value={bgWallpaper}
                onChange={(e) => setBgWallpaper(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl ios-glass-input text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans-ui text-xs outline-none"
              />
              {bgWallpaper && (
                <button
                  type="button"
                  onClick={() => setBgWallpaper('')}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer rounded-full"
                  title="Remove Wallpaper"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Opacity & Blur Sliders */}
          <div className="p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-sans-ui mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90">
                  Wallpaper Opacity
                </span>
                <span className="text-[11px] font-mono-ui font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#c85a32] dark:text-[#d36135]">
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
                className="w-full accent-[#c85a32] dark:accent-[#d36135] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-sans-ui mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90">
                  Backdrop Blur
                </span>
                <span className="text-[11px] font-mono-ui font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#c85a32] dark:text-[#d36135]">
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
                className="w-full accent-[#c85a32] dark:accent-[#d36135] cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-3 px-3 rounded-2xl ios-glass-pill text-xs font-mono-ui font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>RESET</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-[2] py-3 px-4 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-2xl font-sans-ui text-xs font-semibold shadow-lg shadow-[#c85a32]/25 active:scale-98 transition-all cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c85a32]"
            >
              SAVE & APPLY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

