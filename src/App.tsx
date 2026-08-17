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

const gridClasses = {
  sm: 'grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-y-6 gap-x-3',
  md: 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-y-8 gap-x-4',
  lg: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-y-10 gap-x-5',
};

const addBtnSizeMap = {
  sm: {
    container: 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl',
    iconSize: 18,
    text: 'text-[10px] sm:text-xs font-sans-ui',
    gap: 'gap-1.5 sm:gap-2',
  },
  md: {
    container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
    iconSize: 26,
    text: 'text-xs sm:text-sm font-sans-ui',
    gap: 'gap-2 sm:gap-2.5',
  },
  lg: {
    container: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl',
    iconSize: 34,
    text: 'text-sm sm:text-base font-sans-ui',
    gap: 'gap-3 sm:gap-3.5',
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
    isEditMode,
    setIsEditMode,
    searchQuery,
    setSearchQuery,
  } = useSettings();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
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
    <div className="min-h-screen p-6 sm:p-10 md:p-14 transition-colors duration-300 flex flex-col items-center w-full">
      {/* iOS Ambient Blob Mesh */}
      <div className="ambient-mesh-container">
        <div className="ambient-blob ambient-blob-1" />
        <div className="ambient-blob ambient-blob-2" />
        <div className="ambient-blob ambient-blob-3" />
      </div>

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
      <main className="w-full max-w-7xl flex flex-col gap-6 sm:gap-8 animate-fade-in-up [animation-delay:100ms]">
        {/* Category Tabs iOS Glass Segmented Control */}
        <CategoryTabs
          sections={sections}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          bookmarks={bookmarks}
        />

        {/* Empty Search Results Card */}
        {searchQuery.trim() && bookmarks.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) || b.url.toLowerCase().includes(searchQuery.toLowerCase().trim())).length === 0 && (
          <div className="w-full ios-glass-card rounded-3xl p-10 flex flex-col items-center justify-center text-center gap-3 my-4 select-none">
            <Search size={32} className="text-zinc-400 opacity-60" />
            <h3 className="text-lg font-serif-display italic text-[#1c1c1c] dark:text-[#e5e5e1]">No bookmarks found</h3>
            <p className="text-xs font-mono-ui text-zinc-500 dark:text-zinc-400">
              No shortcuts match "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-1 px-4 py-1.5 rounded-full bg-[#c85a32] text-white text-xs font-mono-ui font-semibold shadow-md active:scale-95 transition-transform cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
            >
              CLEAR SEARCH
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
                  {activeSection === 'All' && index > 0 && <hr className="w-full border-t border-[#1c1c1c]/8 dark:border-white/10" />}
                  <section className="relative" aria-labelledby={`section-heading-${section}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 id={`section-heading-${section}`} className="text-xl font-serif-display italic font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1] flex items-center gap-3">
                        {section}
                        <span className="text-[10px] font-mono-ui font-normal text-zinc-500 dark:text-zinc-400 bg-black/5 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
                          {sectionBookmarks.length}
                        </span>
                      </h2>
                      {isEditMode && section !== 'General' && (
                        <button 
                          onClick={() => handleDeleteSection(section, activeSection, setActiveSection)}
                          className="text-[10px] font-mono-ui text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                        >
                          DELETE SECTION
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
                            className={`group flex flex-col items-center justify-start ${currentAddSize.gap} transition-transform active:scale-95 z-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32] rounded-2xl p-1`}
                            aria-label={`Add new link to ${section}`}
                          >
                            <div className={`${currentAddSize.container} ios-glass-card border-dashed border-[#1c1c1c]/20 dark:border-white/20 flex items-center justify-center text-[#1c1c1c]/40 dark:text-[#e5e5e1]/40 transition-all group-hover:border-[#c85a32]/50 dark:group-hover:border-[#d36135]/50 group-hover:text-[#c85a32] dark:group-hover:text-[#d36135]`}>
                              <Plus size={currentAddSize.iconSize} strokeWidth={1.4} />
                            </div>
                            <span className={`${currentAddSize.text} font-medium text-[#1c1c1c]/50 dark:text-[#e5e5e1]/50 group-hover:text-[#c85a32] dark:group-hover:text-[#d36135] transition-colors`}>
                              Add Link
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
      />

      {/* Noise background texture overlay */}
      <div className="noise-overlay" />
    </div>
  );
}
