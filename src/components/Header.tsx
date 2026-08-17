import React, { useRef } from 'react';
import { Search, X, Upload, Download, FolderPlus, RefreshCw, Image, Pencil, Check } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  onImportBackup: (file: File) => void;
  onExportBackup: () => void;
  iconSize: 'sm' | 'md' | 'lg';
  setIconSize: (size: 'sm' | 'md' | 'lg') => void;
  onOpenSectionModal: () => void;
  brokenIconCount: number;
  onFixAllFavicons: () => void;
  onOpenWallpaperModal: () => void;
  isEditMode: boolean;
  setIsEditMode: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  searchInputRef,
  onImportBackup,
  onExportBackup,
  iconSize,
  setIconSize,
  onOpenSectionModal,
  brokenIconCount,
  onFixAllFavicons,
  onOpenWallpaperModal,
  isEditMode,
  setIsEditMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackup(file);
    }
    e.target.value = '';
  };

  return (
    <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 sm:mb-10 gap-6 animate-fade-in-up">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 select-none">
          <div className="h-2 w-2 rounded-full bg-[#c85a32] dark:bg-[#d36135] animate-pulse"></div>
          <span className="text-[10px] uppercase tracking-widest font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 font-semibold">
            Workspace Dashboard
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif-display italic font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1] select-none mt-0.5">
          Bookshelf
        </h1>
      </div>

      {/* Floating iOS Controls Dock */}
      <div className="ios-glass-pill rounded-full p-2 flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end shadow-lg">
        {/* Search Pill Input */}
        <div className="flex items-center bg-black/5 dark:bg-white/10 px-3 py-1 rounded-full border border-black/5 dark:border-white/10 text-xs text-[#1c1c1c] dark:text-[#e5e5e1] focus-within:ring-2 focus-within:ring-[#c85a32]/50 dark:focus-within:ring-[#d36135]/50 transition-all">
          <Search size={14} className="text-zinc-500 dark:text-zinc-400 mr-2 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-24 sm:w-32 text-xs text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-500 dark:placeholder:text-zinc-400 font-sans-ui"
            aria-label="Search Bookmarks"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 ml-1 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c85a32] rounded-full p-0.5"
              aria-label="Clear Search"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <input
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload Backup JSON File"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:text-[#c85a32] dark:hover:text-[#d36135] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
          title="Import Backup"
          aria-label="Import Backup"
        >
          <Upload size={15} />
        </button>
        <button
          onClick={onExportBackup}
          className="p-2 rounded-full text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:text-[#c85a32] dark:hover:text-[#d36135] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
          title="Export Backup"
          aria-label="Export Backup"
        >
          <Download size={15} />
        </button>

        {/* Icon Size Toggle segmented control */}
        <div className="flex items-center bg-black/5 dark:bg-white/10 p-1 rounded-full border border-black/5 dark:border-white/10 gap-0.5" title="Icon size" role="group" aria-label="Icon Size Control">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setIconSize(size)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono-ui font-semibold transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                iconSize === size
                  ? 'bg-[#c85a32] dark:bg-[#d36135] text-white shadow-md font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
              title={`${size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'} Icons`}
              aria-label={`Set icon size to ${size}`}
              aria-pressed={iconSize === size}
            >
              {size.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          onClick={onOpenSectionModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/15 bg-white/40 dark:bg-black/30 hover:bg-[#c85a32]/10 dark:hover:bg-[#d36135]/15 text-xs font-mono-ui transition-all active:scale-95 cursor-pointer text-[#1c1c1c] dark:text-[#e5e5e1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
          aria-label="Create New Section"
        >
          <FolderPlus size={14} />
          <span>NEW SECTION</span>
        </button>
        
        {isEditMode && brokenIconCount > 0 && (
          <button
            onClick={onFixAllFavicons}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25 border border-orange-500/30 transition-all text-xs font-mono-ui active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            title="Fix broken favicons"
            aria-label="Fix broken favicons"
          >
            <RefreshCw size={14} />
            <span>FIX ({brokenIconCount})</span>
          </button>
        )}

        <button
          onClick={onOpenWallpaperModal}
          className="p-2 rounded-full text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:text-[#c85a32] dark:hover:text-[#d36135] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
          title="Wallpaper Settings"
          aria-label="Wallpaper Settings"
        >
          <Image size={16} />
        </button>

        {/* Edit Mode Toggle Button */}
        <button
          onClick={() => setIsEditMode(prev => !prev)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 text-xs font-mono-ui font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32] ${
            isEditMode 
              ? 'bg-[#c85a32] text-white border-[#c85a32] shadow-md' 
              : 'text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 border-[#1c1c1c]/10 dark:border-[#e5e5e1]/15 bg-white/40 dark:bg-black/30 hover:bg-[#c85a32]/10 dark:hover:bg-[#d36135]/15'
          }`}
          title="Toggle Edit Mode"
          aria-label="Toggle Edit Mode"
          aria-pressed={isEditMode}
        >
          {isEditMode ? <Check size={13} /> : <Pencil size={13} />}
          <span>{isEditMode ? 'DONE' : 'EDIT'}</span>
        </button>
      </div>
    </header>
  );
};
