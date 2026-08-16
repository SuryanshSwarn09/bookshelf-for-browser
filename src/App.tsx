import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, X, FolderPlus, Download, Upload, RefreshCw, Image, Pencil, Check } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Bookmark } from './types';
import { extractDomain, getFaviconUrl, ensureProtocol, sanitizeUrl, generateId, storageAdapter, validateBackup } from './utils';
import { SortableBookmark } from './components/SortableBookmark';

const DEFAULT_BOOKMARKS: Bookmark[] = [
  {
    id: '1',
    url: 'https://github.com',
    title: 'GitHub',
    iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
    createdAt: Date.now(),
    category: 'Work',
  },
  {
    id: '2',
    url: 'https://youtube.com',
    title: 'YouTube',
    iconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
    createdAt: Date.now() - 1000,
    category: 'Entertainment',
  },
  {
    id: '3',
    url: 'https://news.ycombinator.com',
    title: 'Hacker News',
    iconUrl: 'https://www.google.com/s2/favicons?domain=news.ycombinator.com&sz=128',
    createdAt: Date.now() - 2000,
    category: 'Tech',
  }
];

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
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [activeSection, setActiveSection] = useState<string>('All');
  const [bgWallpaper, setBgWallpaper] = useState<string>('');
  const [bgOpacity, setBgOpacity] = useState<number>(40);
  const [bgBlur, setBgBlur] = useState<number>(0);
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  // Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  
  const [newSectionName, setNewSectionName] = useState('');

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);

  // File Input Ref for Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Broken Icons State
  const [brokenIconIds, setBrokenIconIds] = useState<Set<string>>(new Set());

  const handleImageError = useCallback((id: string, isError: boolean) => {
    setBrokenIconIds(prev => {
      const next = new Set(prev);
      if (isError) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleFixAllFavicons = () => {
    if (brokenIconIds.size === 0) return;
    setBookmarks(bookmarks.map(b => {
      if (brokenIconIds.has(b.id)) {
        return { ...b, iconUrl: getFaviconUrl(b.url, true) };
      }
      return b;
    }));
  };

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

  // Load state from universal storageAdapter (chrome.storage with localStorage fallback)
  useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      const dataV2 = await storageAdapter.getItem<{ bookmarks: Bookmark[]; sections: string[] }>('bookshelf-data-v2', {
        bookmarks: DEFAULT_BOOKMARKS,
        sections: ['General', 'Work', 'Entertainment', 'Tech'],
      }, 'sync');

      if (isMounted) {
        setBookmarks(dataV2.bookmarks || DEFAULT_BOOKMARKS);
        setSections(dataV2.sections || ['General', 'Work', 'Entertainment', 'Tech']);
      }

      const savedIconSize = await storageAdapter.getItem<'sm' | 'md' | 'lg'>('bookshelf-icon-size', 'md', 'sync');
      if (isMounted && (savedIconSize === 'sm' || savedIconSize === 'md' || savedIconSize === 'lg')) {
        setIconSize(savedIconSize);
      }

      const savedActiveSection = await storageAdapter.getItem<string>('bookshelf-active-section', 'All', 'sync');
      if (isMounted && savedActiveSection) {
        setActiveSection(savedActiveSection);
      }

      const savedBgWallpaper = await storageAdapter.getItem<string>('bookshelf-bg-wallpaper', '', 'local');
      if (isMounted && savedBgWallpaper) {
        setBgWallpaper(savedBgWallpaper);
      }

      const savedBgOpacity = await storageAdapter.getItem<number>('bookshelf-bg-opacity', 40, 'local');
      if (isMounted && savedBgOpacity !== undefined) {
        setBgOpacity(Number(savedBgOpacity));
      }

      const savedBgBlur = await storageAdapter.getItem<number>('bookshelf-bg-blur', 0, 'local');
      if (isMounted && savedBgBlur !== undefined) {
        setBgBlur(Number(savedBgBlur));
      }

      if (isMounted) {
        setIsReady(true);
      }
    };

    loadState();
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsSectionModalOpen(false);
        setIsWallpaperModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save state whenever bookmarks, sections, settings, or wallpaper change
  useEffect(() => {
    if (isReady) {
      storageAdapter.setItem('bookshelf-data-v2', { bookmarks, sections }, 'sync');
      storageAdapter.setItem('bookshelf-icon-size', iconSize, 'sync');
      storageAdapter.setItem('bookshelf-active-section', activeSection, 'sync');
      storageAdapter.setItem('bookshelf-bg-wallpaper', bgWallpaper, 'local');
      storageAdapter.setItem('bookshelf-bg-opacity', bgOpacity, 'local');
      storageAdapter.setItem('bookshelf-bg-blur', bgBlur, 'local');
    }
  }, [bookmarks, sections, iconSize, activeSection, bgWallpaper, bgOpacity, bgBlur, isReady]);

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const safeUrl = sanitizeUrl(newUrl);
    const domain = extractDomain(safeUrl);
    const title = newTitle.trim() || domain;
    
    const newBookmark: Bookmark = {
      id: generateId(),
      url: safeUrl,
      title,
      iconUrl: getFaviconUrl(safeUrl),
      createdAt: Date.now(),
      category: newCategory.trim() || 'General',
    };

    setBookmarks([...bookmarks, newBookmark]);
    setIsAddModalOpen(false);
    setNewUrl('');
    setNewTitle('');
  };

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    const sectionTitle = newSectionName.trim();
    if (sectionTitle && !sections.includes(sectionTitle)) {
      setSections([...sections, sectionTitle]);
    }
    setNewSectionName('');
    setIsSectionModalOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const handleDeleteSection = (sectionToDelete: string) => {
    if (sections.length <= 1) return; // Prevent deleting last section
    setSections(sections.filter(s => s !== sectionToDelete));
    // Move bookmarks from deleted section to General
    setBookmarks(bookmarks.map(b => (b.category === sectionToDelete ? { ...b, category: 'General' } : b)));
    if (activeSection === sectionToDelete) {
      setActiveSection('All');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ bookmarks, sections }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookshelf-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const validation = validateBackup(json);
        if (validation.success) {
          setBookmarks(validation.data.bookmarks);
          if (validation.data.sections && validation.data.sections.length > 0) {
            setSections(validation.data.sections);
          }
        } else {
          alert('Invalid backup file format. Please upload a valid Bookshelf JSON backup file.');
        }
      } catch (error) {
        alert('Failed to parse backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleRefreshFavicon = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks(bookmarks.map(b => {
      if (b.id === id) {
        return { ...b, iconUrl: getFaviconUrl(b.url, true) };
      }
      return b;
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setBookmarks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = [...items];
          const targetCategory = newItems[newIndex].category || 'General';
          newItems[oldIndex] = { ...newItems[oldIndex], category: targetCategory };
          return arrayMove(newItems, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  if (!isReady) return null;

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
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-start md:items-center justify-between mb-8 sm:mb-10 gap-6 animate-fade-in-up">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 select-none">
            <div className="h-2 w-2 rounded-full bg-[#c85a32] dark:bg-[#d36135] animate-pulse"></div>
            <span className="text-[10px] uppercase tracking-widest font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 font-semibold">Workspace Dashboard</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif-display italic font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1] select-none mt-0.5">
            Bookshelf
          </h1>
        </div>
        
        {/* Floating iOS Controls Dock */}
        <div className="ios-glass-pill rounded-full p-2 flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end shadow-lg">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:text-[#c85a32] dark:hover:text-[#d36135] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Import Backup"
          >
            <Upload size={15} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-full text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:text-[#c85a32] dark:hover:text-[#d36135] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Export Backup"
          >
            <Download size={15} />
          </button>

          {/* Icon Size Toggle segmented control */}
          <div className="flex items-center bg-black/5 dark:bg-white/10 p-1 rounded-full border border-black/5 dark:border-white/10 gap-0.5" title="Icon size">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setIconSize(size)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono-ui font-semibold transition-all duration-200 cursor-pointer active:scale-95 ${
                  iconSize === size
                    ? 'bg-[#c85a32] dark:bg-[#d36135] text-white shadow-md font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
                title={`${size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'} Icons`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSectionModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/15 bg-white/40 dark:bg-black/30 hover:bg-[#c85a32]/10 dark:hover:bg-[#d36135]/15 text-xs font-mono-ui transition-all active:scale-95 cursor-pointer text-[#1c1c1c] dark:text-[#e5e5e1]"
          >
            <FolderPlus size={14} />
            <span>NEW SECTION</span>
          </button>
          
          {isEditMode && brokenIconIds.size > 0 && (
            <button
              onClick={handleFixAllFavicons}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 hover:bg-orange-500/25 border border-orange-500/30 transition-all text-xs font-mono-ui active:scale-95 cursor-pointer"
              title="Fix broken favicons"
            >
              <RefreshCw size={14} />
              <span>FIX ({brokenIconIds.size})</span>
            </button>
          )}

          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="p-2 rounded-full text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:text-[#c85a32] dark:hover:text-[#d36135] hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            title="Wallpaper Settings"
          >
            <Image size={16} />
          </button>

          {/* Edit Mode Toggle Button */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer active:scale-95 text-xs font-mono-ui font-semibold ${
              isEditMode 
                ? 'bg-[#c85a32] text-white border-[#c85a32] shadow-md' 
                : 'text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 border-[#1c1c1c]/10 dark:border-[#e5e5e1]/15 bg-white/40 dark:bg-black/30 hover:bg-[#c85a32]/10 dark:hover:bg-[#d36135]/15'
            }`}
            title="Toggle Edit Mode"
          >
            {isEditMode ? <Check size={13} /> : <Pencil size={13} />}
            <span>{isEditMode ? 'DONE' : 'EDIT'}</span>
          </button>
        </div>
      </div>


      {/* Main Content */}
      <main className="w-full max-w-7xl flex flex-col gap-6 sm:gap-8 animate-fade-in-up [animation-delay:100ms]">
        {/* Category Tabs iOS Glass Segmented Control */}
        <div className="w-full flex flex-wrap gap-1.5 p-1.5 rounded-2xl ios-glass-pill select-none">
          <button
            onClick={() => setActiveSection('All')}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono-ui transition-all duration-200 cursor-pointer active:scale-95 ${
              activeSection === 'All'
                ? 'bg-[#c85a32] text-white font-bold shadow-md'
                : 'text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            ALL
          </button>
          {sections.map((section) => {
            const sectionCount = bookmarks.filter(b => (b.category || 'General') === section).length;
            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-mono-ui transition-all duration-200 cursor-pointer active:scale-95 ${
                  activeSection === section
                    ? 'bg-[#c85a32] text-white font-bold shadow-md'
                    : 'text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <span>{section.toUpperCase()}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${activeSection === section ? 'bg-white/25 text-white' : 'bg-black/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-300'}`}>
                  {sectionCount}
                </span>
              </button>
            );
          })}
        </div>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {sections
            .filter((section) => activeSection === 'All' || activeSection === section)
            .map((section, index) => {
              const sectionBookmarks = bookmarks.filter(b => (b.category || 'General') === section);
              
              return (
                <React.Fragment key={section}>
                  {activeSection === 'All' && index > 0 && <hr className="w-full border-t border-[#1c1c1c]/8 dark:border-white/10" />}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif-display italic font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1] flex items-center gap-3">
                        {section}
                        <span className="text-[10px] font-mono-ui font-normal text-zinc-500 dark:text-zinc-400 bg-black/5 dark:bg-white/10 px-2.5 py-0.5 rounded-full">
                          {sectionBookmarks.length}
                        </span>
                      </h2>
                      {isEditMode && section !== 'General' && (
                        <button 
                          onClick={() => handleDeleteSection(section)}
                          className="text-[10px] font-mono-ui text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded-full transition-colors cursor-pointer"
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
                            onDelete={handleDelete}
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
                              setNewCategory(section);
                              setIsAddModalOpen(true);
                            }}
                            className={`group flex flex-col items-center justify-start ${currentAddSize.gap} transition-transform active:scale-95 z-0 cursor-pointer`}
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
                  </div>
                </React.Fragment>
              );
            })}
        </DndContext>
      </main>

      {/* Add Link Modal */}
      {isAddModalOpen && (
        <div 
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div 
            className="w-full max-w-md bg-[#faf8f5]/95 dark:bg-[#121314]/95 backdrop-blur-2xl text-[#1c1c1c] dark:text-[#e5e5e1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10">
              <h2 className="text-2xl font-serif-display font-medium text-[#1c1c1c] dark:text-[#e5e5e1]">Add to {newCategory}</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleAddBookmark} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
                  Website URL
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. news.ycombinator.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1c1e22] border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/20 text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#c85a32] dark:focus:border-[#d36135] focus:ring-2 focus:ring-[#c85a32]/20 dark:focus:ring-[#d36135]/20 transition-all font-sans-ui text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to use domain name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1c1e22] border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/20 text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#c85a32] dark:focus:border-[#d36135] focus:ring-2 focus:ring-[#c85a32]/20 dark:focus:ring-[#d36135]/20 transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
                  Section
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1c1e22] border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/20 text-[#1c1c1c] dark:text-[#e5e5e1] focus:outline-none focus:border-[#c85a32] dark:focus:border-[#d36135] focus:ring-2 focus:ring-[#c85a32]/20 dark:focus:ring-[#d36135]/20 transition-all text-xs font-sans-ui appearance-none cursor-pointer"
                >
                  {sections.map(s => (
                    <option key={s} value={s} className="bg-[#faf8f5] dark:bg-[#121314] text-[#1c1c1c] dark:text-[#e5e5e1]">{s}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!newUrl.trim()}
                  className="w-full py-3 px-4 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-2xl font-sans-ui font-semibold shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  SAVE BOOKMARK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Section Modal */}
      {isSectionModalOpen && (
        <div 
          onClick={() => setIsSectionModalOpen(false)}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div 
            className="w-full max-w-sm bg-[#faf8f5]/95 dark:bg-[#121314]/95 backdrop-blur-2xl text-[#1c1c1c] dark:text-[#e5e5e1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10">
              <h2 className="text-2xl font-serif-display font-medium text-[#1c1c1c] dark:text-[#e5e5e1]">Create Section</h2>
              <button 
                onClick={() => setIsSectionModalOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleAddSection} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
                  Section Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Work, Priorities, Recipes"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1c1e22] border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/20 text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#c85a32] dark:focus:border-[#d36135] focus:ring-2 focus:ring-[#c85a32]/20 dark:focus:ring-[#d36135]/20 transition-all text-xs font-sans-ui"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!newSectionName.trim()}
                  className="w-full py-3 px-4 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-2xl font-sans-ui font-semibold shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  CREATE SECTION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallpaper Settings Modal */}
      {isWallpaperModalOpen && (
        <div 
          onClick={() => setIsWallpaperModalOpen(false)}
          className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
        >
          <div 
            className="w-full max-w-sm bg-[#faf8f5]/95 dark:bg-[#121314]/95 backdrop-blur-2xl text-[#1c1c1c] dark:text-[#e5e5e1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10">
              <h2 className="text-2xl font-serif-display font-medium text-[#1c1c1c] dark:text-[#e5e5e1]">Wallpaper Settings</h2>
              <button 
                onClick={() => setIsWallpaperModalOpen(false)}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer"
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
                  onClick={() => {
                    setBgWallpaper('');
                    setBgOpacity(40);
                    setBgBlur(0);
                    setIsWallpaperModalOpen(false);
                  }}
                  className="flex-1 py-3 px-3 border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/20 hover:bg-black/5 dark:hover:bg-white/10 text-[#1c1c1c] dark:text-[#e5e5e1] rounded-2xl font-sans-ui text-xs transition-colors cursor-pointer text-center active:scale-95 font-semibold"
                >
                  CLEAR
                </button>
                <button
                  type="button"
                  onClick={() => setIsWallpaperModalOpen(false)}
                  className="flex-1 py-3 px-3 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-2xl font-sans-ui font-semibold shadow-md active:scale-95 transition-colors cursor-pointer text-center"
                >
                  SAVE & CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Noise background texture overlay */}
      <div className="noise-overlay" />
    </div>
  );
}
