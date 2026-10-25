import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useBookmarks } from './hooks/useBookmarks';
import { useSettings } from './hooks/useSettings';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { SortableBookmark } from './components/SortableBookmark';
import { AddBookmarkModal } from './components/AddBookmarkModal';
import { SectionModal } from './components/SectionModal';
import { WallpaperModal } from './components/WallpaperModal';
import { PrivacyModal } from './components/PrivacyModal';
import { TermsModal } from './components/TermsModal';

const gridClasses = {
  sm: 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-y-3.5 gap-x-2.5',
  md: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-y-4.5 gap-x-3',
  lg: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-y-6 gap-x-4',
};

const addBtnSizeMap = {
  sm: {
    container: 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl',
    iconSize: 18,
    text: 'text-[10px] sm:text-xs font-sans-ui',
    gap: 'gap-1 sm:gap-1.5',
  },
  md: {
    container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
    iconSize: 26,
    text: 'text-xs sm:text-sm font-sans-ui',
    gap: 'gap-1.5 sm:gap-2',
  },
  lg: {
    container: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl',
    iconSize: 34,
    text: 'text-sm sm:text-base font-sans-ui',
    gap: 'gap-2 sm:gap-2.5',
  }
};

export default function App() {
  const {
    isBookmarksReady,
    bookmarks,
    sections,
    brokenIconIds,
    handleImageError,
    handleFixAllFavicons,
    handleAddBookmark,
    handleAddSection,
    handleDeleteBookmark,
    handleDeleteSection,
    handleRefreshFavicon,
    handleDragEnd,
    handleExportBackup,
    handleImportBackup,
  } = useBookmarks();

  const {
    isSettingsReady,
    iconSize,
    setIconSize,
    activeSection,
    setActiveSection,
    bgWallpaper,
    setBgWallpaper,
    bgOpacity,
    setBgOpacity,
    bgBlur,
    setBgBlur,
    themePreset,
    setThemePreset,
    isEditMode,
    setIsEditMode,
    searchQuery,
    setSearchQuery,
  } = useSettings();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [addModalCategory, setAddModalCategory] = useState('General');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Global Keyboard Shortcuts (Cmd/Ctrl+K or / to search, N for add modal, E for edit mode, Esc to dismiss/clear)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName || '';
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsSectionModalOpen(false);
        setIsWallpaperModalOpen(false);
        setIsPrivacyModalOpen(false);
        setIsTermsModalOpen(false);
        setSearchQuery('');
        if (isInputActive) {
          (document.activeElement as HTMLElement)?.blur();
        }
      } else if (e.key.toLowerCase() === 'n' && !isInputActive) {
        e.preventDefault();
        setIsAddModalOpen(true);
      } else if (e.key.toLowerCase() === 'e' && !isInputActive) {
        e.preventDefault();
        setIsEditMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsEditMode, setSearchQuery]);

  if (!isBookmarksReady || !isSettingsReady) return null;

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7 transition-colors duration-300 flex flex-col items-center w-full">

      {/* Background Wallpaper Backdrop */}
      {bgWallpaper && (
        <div 
          className="fixed inset-0 w-full h-full bg-cover bg-center transition-all duration-500 z-[-1] pointer-events-none"
          style={{
            backgroundImage: `url(${bgWallpaper})`,
            opacity: bgOpacity / 100,
            filter: bgBlur > 0 ? `blur(${bgBlur}px)` : 'none'
          }}
        />
      )}

      {/* Header Container */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        onImportBackup={handleImportBackup}
        onExportBackup={handleExportBackup}
        iconSize={iconSize}
        setIconSize={setIconSize}
        onOpenSectionModal={() => setIsSectionModalOpen(true)}
        brokenIconCount={brokenIconIds.size}
        onFixAllFavicons={handleFixAllFavicons}
        onOpenWallpaperModal={() => setIsWallpaperModalOpen(true)}
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
      />

      {/* Main Content */}
      <main className="w-full max-w-7xl flex flex-col gap-4 sm:gap-5 animate-fade-in-up [animation-delay:100ms]">
        {/* Category Tabs iOS Glass Segmented Control */}
        <CategoryTabs
          sections={sections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          bookmarks={bookmarks}
        />

        {/* Empty Search Results Card */}
        {searchQuery.trim() && bookmarks.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) || b.url.toLowerCase().includes(searchQuery.toLowerCase().trim())).length === 0 && (
          <div className="w-full ios-glass-card rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 my-4 select-none">
            <Search size={28} className="text-slate-400 opacity-60" />
            <h3 className="text-base font-medium text-slate-900 dark:text-slate-100">No bookmarks found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No shortcuts match "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-1 px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-sans-ui font-medium shadow-sm active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
            >
              Clear search
            </button>
          </div>
        )}

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {sections
            .filter((section) => activeSection === 'All' || activeSection === section)
            .map((section, index) => {
              const query = searchQuery.trim().toLowerCase();
              const sectionBookmarks = bookmarks.filter(b => {
                const matchesSection = (b.category || 'General') === section;
                if (!matchesSection) return false;
                if (!query) return true;
                return b.title.toLowerCase().includes(query) || b.url.toLowerCase().includes(query);
              });
              
              if (query && sectionBookmarks.length === 0) {
                return null;
              }

              return (
                <React.Fragment key={section}>
                  <section className={`relative ${activeSection === 'All' && index > 0 ? 'pt-4 border-t border-slate-200/80 dark:border-slate-800/80' : ''}`} aria-labelledby={`section-heading-${section}`}>
                    <div className="flex items-center justify-between mb-2.5">
                      <h2 id={`section-heading-${section}`} className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {section}
                        <span className="text-[10px] font-mono-ui font-medium text-slate-500 dark:text-slate-400 bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded border border-black/5 dark:border-white/10">
                          {sectionBookmarks.length}
                        </span>
                      </h2>
                      {isEditMode && section !== 'General' && (
                        <button 
                          onClick={() => handleDeleteSection(section, activeSection, setActiveSection)}
                          className="text-xs font-sans-ui text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          Delete section
                        </button>
                      )}
                    </div>

                    <div className={`grid ${gridClasses[iconSize] || gridClasses.md}`}>
                      <SortableContext 
                        items={sectionBookmarks.map(b => b.id)}
                        strategy={rectSortingStrategy}
                      >
                        {sectionBookmarks.map((bookmark) => (
                          <SortableBookmark 
                            key={bookmark.id}
                            bookmark={bookmark}
                            isEditMode={isEditMode}
                            onDelete={handleDeleteBookmark}
                            onRefreshFavicon={handleRefreshFavicon}
                            onImageError={handleImageError}
                            iconSize={iconSize}
                          />
                        ))}
                      </SortableContext>
                      
                      {/* Add Shortcut Button per section */}
                      {(() => {
                        const currentAddSize = addBtnSizeMap[iconSize] || addBtnSizeMap.md;
                        return (
                          <button 
                            onClick={() => {
                              setAddModalCategory(section);
                              setIsAddModalOpen(true);
                            }}
                            className={`group flex flex-col items-center justify-start ${currentAddSize.gap} transition-transform active:scale-95 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] rounded-2xl p-1`}
                            aria-label={`Add new link to ${section}`}
                          >
                            <div className={`${currentAddSize.container} ios-glass-card border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 transition-all group-hover:border-[#2563eb]/50 dark:group-hover:border-[#3b82f6]/50 group-hover:text-[#2563eb] dark:group-hover:text-[#3b82f6]`}>
                              <Plus size={currentAddSize.iconSize} strokeWidth={1.5} />
                            </div>
                            <span className={`${currentAddSize.text} font-medium text-slate-500 dark:text-slate-400 group-hover:text-[#2563eb] dark:group-hover:text-[#3b82f6] transition-colors`}>
                              Add link
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  </section>
                </React.Fragment>
              );
            })}
        </DndContext>
      </main>

      {/* Understated Clean Footer */}
      <footer className="w-full max-w-7xl mt-8 sm:mt-10 pt-4 pb-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-sans-ui text-slate-500 dark:text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-200">Bookshelf</span>
          <span className="text-slate-300 dark:text-slate-700 font-mono">v1.0.0</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span>Local storage</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsPrivacyModalOpen(true)}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563eb] rounded px-1"
          >
            Privacy policy
          </button>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <button
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2563eb] rounded px-1"
          >
            Terms of service
          </button>
        </div>
      </footer>

      {/* Modals */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddBookmark={handleAddBookmark}
        sections={sections}
        initialCategory={addModalCategory}
      />

      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onAddSection={handleAddSection}
      />

      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={() => setIsWallpaperModalOpen(false)}
        bgWallpaper={bgWallpaper}
        setBgWallpaper={setBgWallpaper}
        bgOpacity={bgOpacity}
        setBgOpacity={setBgOpacity}
        bgBlur={bgBlur}
        setBgBlur={setBgBlur}
        themePreset={themePreset}
        setThemePreset={setThemePreset}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />

      {/* Noise background texture overlay */}
      <div className="noise-overlay" />
    </div>
  );
}
