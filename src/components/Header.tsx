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
    <header className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between mb-4 sm:mb-5 gap-3.5">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2 select-none">
          <div className="h-2 w-2 rounded-sm bg-[#2563eb] dark:bg-[#3b82f6]"></div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Personal Dashboard
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 select-none">
          Bookshelf
        </h1>
      </div>

      {/* Floating Controls Dock */}
      <div className="ios-glass-pill rounded-xl p-1.5 flex flex-wrap items-center gap-1.5 self-stretch md:self-auto justify-end shadow-sm">
        {/* Search Input */}
        <div className="flex items-center bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 focus-within:ring-2 focus-within:ring-[#2563eb]/40 dark:focus-within:ring-[#3b82f6]/40 transition-all">
          <Search size={14} className="text-slate-400 mr-2 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search shortcuts (⌘K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-28 sm:w-36 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-sans-ui"
            aria-label="Search Bookmarks"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563eb] rounded p-0.5"
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
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#2563eb] dark:hover:text-[#3b82f6] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          title="Import Backup"
          aria-label="Import Backup"
        >
          <Upload size={14} />
        </button>
        <button
          onClick={onExportBackup}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#2563eb] dark:hover:text-[#3b82f6] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          title="Export Backup"
          aria-label="Export Backup"
        >
          <Download size={14} />
        </button>

        {/* Icon Size Toggle control */}
        <div className="flex items-center bg-black/5 dark:bg-white/10 p-0.5 rounded-lg border border-black/5 dark:border-white/10 gap-0.5" title="Icon size" role="group" aria-label="Icon Size Control">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              onClick={() => setIconSize(size)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono-ui font-semibold transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white ${
                iconSize === size
                  ? 'bg-[#2563eb] dark:bg-[#3b82f6] text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
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
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-black/30 hover:bg-[#2563eb]/10 dark:hover:bg-[#3b82f6]/15 hover:border-[#2563eb]/30 text-xs font-sans-ui font-medium transition-all active:scale-95 cursor-pointer text-slate-700 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          aria-label="Create New Section"
        >
          <FolderPlus size={13} />
          <span>New section</span>
        </button>
        
        {isEditMode && brokenIconCount > 0 && (
          <button
            onClick={onFixAllFavicons}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/30 transition-all text-xs font-sans-ui active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            title="Fix broken favicons"
            aria-label="Fix broken favicons"
          >
            <RefreshCw size={13} />
            <span>Fix icons ({brokenIconCount})</span>
          </button>
        )}

        <button
          onClick={onOpenWallpaperModal}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#2563eb] dark:hover:text-[#3b82f6] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          title="Theme and appearance"
          aria-label="Theme and appearance"
        >
          <Image size={15} />
        </button>

        {/* Edit Mode Toggle Button */}
        <button
          onClick={() => setIsEditMode(prev => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer active:scale-95 text-xs font-sans-ui font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] ${
            isEditMode 
              ? 'bg-[#2563eb] text-white border-[#2563eb] shadow-sm' 
              : 'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-black/30 hover:bg-[#2563eb]/10 dark:hover:bg-[#3b82f6]/15 hover:border-[#2563eb]/30'
          }`}
          title="Toggle Edit Mode"
          aria-label="Toggle Edit Mode"
          aria-pressed={isEditMode}
        >
          {isEditMode ? <Check size={13} /> : <Pencil size={13} />}
          <span>{isEditMode ? 'Done' : 'Edit'}</span>
        </button>
      </div>
    </header>
  );
};
