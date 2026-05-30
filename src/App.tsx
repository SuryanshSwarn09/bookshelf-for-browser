import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, X, MoreVertical, FolderPlus, Download, Upload, RefreshCw, Image } from 'lucide-react';
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
import { extractDomain, getFaviconUrl, ensureProtocol, generateId } from './utils';
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

  // Load from localeStorage
  useEffect(() => {
    const savedV2 = localStorage.getItem('bookshelf-data-v2');
    if (savedV2) {
      try {
        const data = JSON.parse(savedV2);
        setBookmarks(data.bookmarks || []);
        setSections(data.sections || ['General', 'Work', 'Entertainment', 'Tech']);
      } catch (e) {
        setBookmarks(DEFAULT_BOOKMARKS);
        setSections(['General', 'Work', 'Entertainment', 'Tech']);
      }
    } else {
      const saved = localStorage.getItem('bookshelf-data');
      if (saved) {
        try {
          const oldBookmarks = JSON.parse(saved);
          setBookmarks(oldBookmarks);
          const derived = Array.from(new Set([...oldBookmarks.map((b: Bookmark) => b.category || 'General')]));
          setSections(derived.length > 0 ? derived as string[] : ['General']);
        } catch (e) {
          setBookmarks(DEFAULT_BOOKMARKS);
          setSections(['General', 'Work', 'Entertainment', 'Tech']);
        }
      } else {
        setBookmarks(DEFAULT_BOOKMARKS);
        setSections(['General', 'Work', 'Entertainment', 'Tech']);
      }
    }

    const savedIconSize = localStorage.getItem('bookshelf-icon-size');
    if (savedIconSize === 'sm' || savedIconSize === 'md' || savedIconSize === 'lg') {
      setIconSize(savedIconSize);
    }

    const savedActiveSection = localStorage.getItem('bookshelf-active-section');
    if (savedActiveSection) {
      setActiveSection(savedActiveSection);
    }

    const savedBgWallpaper = localStorage.getItem('bookshelf-bg-wallpaper');
    if (savedBgWallpaper) {
      setBgWallpaper(savedBgWallpaper);
    }

    const savedBgOpacity = localStorage.getItem('bookshelf-bg-opacity');
    if (savedBgOpacity) {
      setBgOpacity(Number(savedBgOpacity));
    }

    const savedBgBlur = localStorage.getItem('bookshelf-bg-blur');
    if (savedBgBlur) {
      setBgBlur(Number(savedBgBlur));
    }

    setIsReady(true);
  }, []);

  // Save to localeStorage whenever bookmarks, sections, settings, or wallpaper configurations change
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('bookshelf-data-v2', JSON.stringify({ bookmarks, sections }));
      localStorage.setItem('bookshelf-icon-size', iconSize);
      localStorage.setItem('bookshelf-active-section', activeSection);
      localStorage.setItem('bookshelf-bg-wallpaper', bgWallpaper);
      localStorage.setItem('bookshelf-bg-opacity', bgOpacity.toString());
      localStorage.setItem('bookshelf-bg-blur', bgBlur.toString());
    }
  }, [bookmarks, sections, iconSize, activeSection, bgWallpaper, bgOpacity, bgBlur, isReady]);

  const handleAddBookmark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const formattedUrl = ensureProtocol(newUrl);
    const domain = extractDomain(formattedUrl);
    const title = newTitle.trim() || domain;
    
    const newBookmark: Bookmark = {
      id: generateId(),
      url: formattedUrl,
      title,
      iconUrl: getFaviconUrl(formattedUrl),
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
        if (json.bookmarks && Array.isArray(json.bookmarks) && json.sections && Array.isArray(json.sections)) {
          setBookmarks(json.bookmarks);
          setSections(json.sections);
        } else {
          alert('Invalid backup file format.');
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
    <div className="min-h-screen p-6 sm:p-10 md:p-14 transition-colors duration-300 flex flex-col items-center w-full animate-fade-in-up">
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
      <div className="w-full max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 select-none">
            <div className="h-2 w-2 rounded-full bg-[#c85a32] dark:bg-[#d36135]"></div>
            <span className="text-[10px] uppercase tracking-widest font-mono-ui text-[#1c1c1c]/50 dark:text-[#e5e5e1]/50">Workspace Dashboard</span>
          </div>
          <h1 className="text-4xl font-serif-display italic font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1] select-none mt-1">
            Bookshelf
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-auto justify-end">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 hover:border-[#c85a32]/30 dark:hover:border-[#d36135]/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
            title="Import Backup"
          >
            <Upload size={15} />
          </button>
          <button
            onClick={handleExport}
            className="p-1.5 rounded-lg text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 hover:border-[#c85a32]/30 dark:hover:border-[#d36135]/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
            title="Export Backup"
          >
            <Download size={15} />
          </button>

          {/* Icon Size Toggle segmented control */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-lg border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 gap-0.5" title="Icon size">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setIconSize(size)}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono-ui font-semibold transition-all duration-200 cursor-pointer ${
                  iconSize === size
                    ? 'bg-[#c85a32] text-white shadow-xs font-bold'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title={`${size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'} Icons`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSectionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 bg-white/40 dark:bg-zinc-900/40 hover:bg-[#c85a32]/10 dark:hover:bg-[#d36135]/10 text-xs font-mono-ui transition-all duration-200 cursor-pointer text-[#1c1c1c] dark:text-[#e5e5e1]"
          >
            <FolderPlus size={14} />
            <span>NEW SECTION</span>
          </button>
          
          {isEditMode && brokenIconIds.size > 0 && (
            <button
              onClick={handleFixAllFavicons}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border border-orange-500/20 transition-all text-xs font-mono-ui cursor-pointer"
              title="Fix broken favicons"
            >
              <RefreshCw size={14} />
              <span>FIX ({brokenIconIds.size})</span>
            </button>
          )}

          <button
            onClick={() => setIsWallpaperModalOpen(true)}
            className="p-1.5 rounded-lg text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 hover:border-[#c85a32]/30 dark:hover:border-[#d36135]/30 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
            title="Wallpaper Settings"
          >
            <Image size={16} />
          </button>

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`p-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
              isEditMode 
                ? 'bg-[#c85a32] text-white border-[#c85a32]' 
                : 'text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 hover:border-[#c85a32]/30 dark:hover:border-[#d36135]/30 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            title="Edit mode"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-7xl flex flex-col gap-6 sm:gap-8">
        {/* Category Tabs */}
        <div className="w-full flex flex-wrap gap-1.5 border-b border-[#1c1c1c]/8 dark:border-[#e5e5e1]/8 pb-3 select-none">
          <button
            onClick={() => setActiveSection('All')}
            className={`px-3 py-1 rounded-lg text-xs font-mono-ui transition-all duration-200 cursor-pointer border ${
              activeSection === 'All'
                ? 'bg-[#c85a32]/8 text-[#c85a32] border-[#c85a32]/20 font-bold'
                : 'text-[#1c1c1c]/50 dark:text-[#e5e5e1]/50 border-transparent hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            [ALL]
          </button>
          {sections.map((section) => {
            const sectionCount = bookmarks.filter(b => (b.category || 'General') === section).length;
            return (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono-ui transition-all duration-200 cursor-pointer border ${
                  activeSection === section
                    ? 'bg-[#c85a32]/8 text-[#c85a32] border-[#c85a32]/20 font-bold'
                    : 'text-[#1c1c1c]/50 dark:text-[#e5e5e1]/50 border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>[{section.toUpperCase()}]</span>
                <span className={`text-[9px] px-1 py-0.2 rounded-md ${activeSection === section ? 'bg-[#c85a32]/20 text-[#c85a32]' : 'bg-black/5 dark:bg-white/5 text-zinc-500'}`}>
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
                  {activeSection === 'All' && index > 0 && <hr className="w-full border-t border-[#1c1c1c]/8 dark:border-[#e5e5e1]/8" />}
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif-display italic font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1] flex items-center gap-3">
                        {section}
                        <span className="text-[10px] font-mono-ui font-normal text-zinc-400 dark:text-zinc-500 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                          {sectionBookmarks.length}
                        </span>
                      </h2>
                      {isEditMode && section !== 'General' && (
                        <button 
                          onClick={() => handleDeleteSection(section)}
                          className="text-[10px] font-mono-ui text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-2 py-1 rounded transition-colors cursor-pointer"
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
                            <div className={`${currentAddSize.container} bg-transparent border border-dashed border-[#1c1c1c]/15 dark:border-[#e5e5e1]/15 flex items-center justify-center text-[#1c1c1c]/40 dark:text-[#e5e5e1]/40 transition-all group-hover:border-[#c85a32]/40 dark:group-hover:border-[#d36135]/40 group-hover:bg-[#c85a32]/5 dark:group-hover:bg-[#d36135]/5 group-hover:text-[#c85a32] dark:group-hover:text-[#d36135] shadow-xs`}>
                              <Plus size={currentAddSize.iconSize} strokeWidth={1.2} />
                            </div>
                            <span className={`${currentAddSize.text} font-medium text-[#1c1c1c]/40 dark:text-[#e5e5e1]/40 group-hover:text-[#c85a32] dark:group-hover:text-[#d36135] transition-colors`}>
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
        <div className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-[#faf8f5] dark:bg-[#121314] rounded-2xl shadow-2xl overflow-hidden border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 flex items-center justify-between border-b border-[#1c1c1c]/8 dark:border-[#e5e5e1]/8">
              <h2 className="text-xl font-serif-display font-medium italic text-[#1c1c1c] dark:text-[#e5e5e1]">Add to {newCategory}</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleAddBookmark} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 mb-1.5 uppercase tracking-wider">
                  Website URL
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. news.ycombinator.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/50 dark:bg-zinc-900/50 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#c85a32]/40 focus:ring-1 focus:ring-[#c85a32]/20 transition-all font-mono-ui text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 mb-1.5 uppercase tracking-wider">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to use domain name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/50 dark:bg-zinc-900/50 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#c85a32]/40 focus:ring-1 focus:ring-[#c85a32]/20 transition-all text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 mb-1.5 uppercase tracking-wider">
                  Section
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/50 dark:bg-zinc-900/50 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-[#c85a32]/40 transition-all text-xs font-mono-ui appearance-none cursor-pointer"
                >
                  {sections.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!newUrl.trim()}
                  className="w-full py-2.5 px-4 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-lg font-mono-ui font-semibold shadow-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        <div className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-[#faf8f5] dark:bg-[#121314] rounded-2xl shadow-2xl overflow-hidden border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 flex items-center justify-between border-b border-[#1c1c1c]/8 dark:border-[#e5e5e1]/8">
              <h2 className="text-xl font-serif-display font-medium italic text-[#1c1c1c] dark:text-[#e5e5e1]">Create Section</h2>
              <button 
                onClick={() => setIsSectionModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            
            <form onSubmit={handleAddSection} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 mb-1.5 uppercase tracking-wider">
                  Section Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Work, Priorities, Recipes"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/50 dark:bg-zinc-900/50 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#c85a32]/40 focus:ring-1 focus:ring-[#c85a32]/20 transition-all text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!newSectionName.trim()}
                  className="w-full py-2.5 px-4 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-lg font-mono-ui font-semibold shadow-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        <div className="fixed inset-0 bg-zinc-950/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-[#faf8f5] dark:bg-[#121314] rounded-2xl shadow-2xl overflow-hidden border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 flex items-center justify-between border-b border-[#1c1c1c]/8 dark:border-[#e5e5e1]/8">
              <h2 className="text-xl font-serif-display font-medium italic text-[#1c1c1c] dark:text-[#e5e5e1]">Wallpaper Settings</h2>
              <button 
                onClick={() => setIsWallpaperModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 mb-1.5 uppercase tracking-wider">
                  Image URL
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={bgWallpaper}
                  onChange={(e) => setBgWallpaper(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/50 dark:bg-zinc-900/50 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 text-zinc-900 dark:text-zinc-100 placeholder-zinc-455 focus:outline-none focus:border-[#c85a32]/40 focus:ring-1 focus:ring-[#c85a32]/20 transition-all text-xs font-mono-ui"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 mb-1.5 uppercase tracking-wider">
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
                <div className="flex justify-between text-xs font-mono-ui text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 mb-1.5 uppercase tracking-wider">
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
                  className="flex-1 py-2 px-3 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 hover:border-[#c85a32]/30 dark:hover:border-[#d36135]/30 text-[#1c1c1c]/60 dark:text-[#e5e5e1]/60 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg font-mono-ui text-xs transition-colors cursor-pointer text-center"
                >
                  CLEAR
                </button>
                <button
                  type="button"
                  onClick={() => setIsWallpaperModalOpen(false)}
                  className="flex-1 py-2 px-3 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-lg font-mono-ui font-semibold shadow-xs transition-colors cursor-pointer text-center"
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
