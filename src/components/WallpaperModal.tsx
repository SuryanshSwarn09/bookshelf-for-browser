import React from 'react';
import { X } from 'lucide-react';

interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  bgWallpaper: string;
  setBgWallpaper: (url: string) => void;
  bgOpacity: number;
  setBgOpacity: (opacity: number) => void;
  bgBlur: number;
  setBgBlur: (blur: number) => void;
}

export const WallpaperModal: React.FC<WallpaperModalProps> = ({
  isOpen,
  onClose,
  bgWallpaper,
  setBgWallpaper,
  bgOpacity,
  setBgOpacity,
  bgBlur,
  setBgBlur,
}) => {
  if (!isOpen) return null;

  const handleClear = () => {
    setBgWallpaper('');
    setBgOpacity(40);
    setBgBlur(0);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wallpaper-settings-title"
    >
      <div
        className="w-full max-w-sm bg-[#faf8f5]/95 dark:bg-[#121314]/95 backdrop-blur-2xl text-[#1c1c1c] dark:text-[#e5e5e1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex items-center justify-between border-b border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10">
          <h2 id="wallpaper-settings-title" className="text-2xl font-serif-display font-medium text-[#1c1c1c] dark:text-[#e5e5e1]">
            Wallpaper Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              Image URL
            </label>
            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              value={bgWallpaper}
              onChange={(e) => setBgWallpaper(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1c1e22] border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/20 text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#c85a32] dark:focus:border-[#d36135] focus:ring-2 focus:ring-[#c85a32]/20 dark:focus:ring-[#d36135]/20 transition-all text-xs font-sans-ui"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              <span>Opacity</span>
              <span>{bgOpacity}%</span>
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
            <div className="flex justify-between text-xs font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              <span>Blur</span>
              <span>{bgBlur}px</span>
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

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-3 px-3 border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/20 hover:bg-black/5 dark:hover:bg-white/10 text-[#1c1c1c] dark:text-[#e5e5e1] rounded-2xl font-sans-ui text-xs transition-colors cursor-pointer text-center active:scale-95 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
            >
              CLEAR
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-3 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-2xl font-sans-ui font-semibold shadow-md active:scale-95 transition-colors cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
            >
              SAVE & CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
