import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, X, MoreVertical, FolderPlus, Download, Upload, RefreshCw } from 'lucide-react';
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
    container: 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl',
    iconSize: 20,
    text: 'text-[10px] sm:text-xs',
    gap: 'gap-1 sm:gap-1.5',
  },
  md: {
    container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl',
    iconSize: 32,
    text: 'text-xs sm:text-sm',
    gap: 'gap-2 sm:gap-2.5',
  },
  lg: {
    container: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl',
    iconSize: 40,
    text: 'text-sm sm:text-base',
    gap: 'gap-3 sm:gap-3.5',
  }
};

export default function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md');
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

    setIsReady(true);
  }, []);

  // Save to localeStorage whenever bookmarks, sections or iconSize change
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('bookshelf-data-v2', JSON.stringify({ bookmarks, sections }));
      localStorage.setItem('bookshelf-icon-size', iconSize);
    }
  }, [bookmarks, sections, iconSize, isReady]);

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
    <div className="min-h-screen p-4 sm:p-6 md:p-8 transition-colors duration-300 flex flex-col items-center w-full">
      {/* Header Container */}
      <div className="w-full max-w-7xl flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-10 gap-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex gap-1.5 opacity-90">
            <div className="h-1.5 w-6 rounded-full bg-[#4285F4]"></div>
            <div className="h-1.5 w-6 rounded-full bg-[#EA4335]"></div>
            <div className="h-1.5 w-6 rounded-full bg-[#FBBC05]"></div>
            <div className="h-1.5 w-6 rounded-full bg-[#34A853]"></div>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-zinc-800 dark:text-zinc-100 opacity-90 select-none mt-2">
            Bookshelf
          </h1>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Import Backup"
          >
            <Upload size={18} />
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Export Backup"
          >
            <Download size={18} />
          </button>

          {/* Icon Size Toggle segmented control */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-0.5 rounded-full border border-black/5 dark:border-white/5 gap-0.5" title="Icon size">
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setIconSize(size)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  iconSize === size
                    ? 'bg-white dark:bg-zinc-800 text-[#4285F4] shadow-xs scale-100'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
                title={`${size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'} Icons`}
              >
                {size === 'sm' ? 'S' : size === 'md' ? 'M' : 'L'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSectionModalOpen(true)}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#4285F4]/10 text-[#4285F4] hover:bg-[#4285F4]/20 transition-colors text-sm font-medium"
          >
            <FolderPlus size={16} />
            <span className="hidden sm:inline">New Section</span>
          </button>
          
          {isEditMode && brokenIconIds.size > 0 && (
            <button
              onClick={handleFixAllFavicons}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors text-sm font-medium"
              title="Fix broken favicons"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Fix {brokenIconIds.size} Icons</span>
            </button>
          )}

          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`p-2 rounded-full transition-colors ${isEditMode ? 'bg-[#4285F4] text-white' : 'text-zinc-600 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            title="Edit mode"
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full max-w-7xl flex flex-col gap-8 sm:gap-10">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {sections.map((section, index) => {
            const sectionBookmarks = bookmarks.filter(b => (b.category || 'General') === section);
            
            return (
              <React.Fragment key={section}>
                {index > 0 && <hr className="w-full border-t border-zinc-200 dark:border-zinc-800/80" />}
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium tracking-tight text-zinc-700 dark:text-zinc-200 flex items-center gap-3">
                    {section}
                    <span className="text-sm font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      {sectionBookmarks.length}
                    </span>
                  </h2>
                  {isEditMode && section !== 'General' && (
                    <button 
                      onClick={() => handleDeleteSection(section)}
                      className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 px-3 py-1.5 rounded-full transition-colors"
                    >
                      Delete Section
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
                        className={`group flex flex-col items-center justify-start ${currentAddSize.gap} transition-transform active:scale-95 z-0`}
                      >
                        <div className={`${currentAddSize.container} bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-zinc-500 transition-all group-hover:bg-[#4285F4]/10 dark:group-hover:bg-[#4285F4]/10 group-hover:text-[#4285F4] dark:group-hover:text-[#4285F4] shadow-sm group-hover:shadow-md`}>
                          <Plus size={currentAddSize.iconSize} strokeWidth={1.5} />
                        </div>
                        <span className={`${currentAddSize.text} font-medium text-zinc-500 group-hover:text-[#4285F4] dark:group-hover:text-[#4285F4] transition-colors`}>
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
        <div className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-md bg-white dark:bg-[#202124] rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Add to {newCategory}</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddBookmark} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Website URL
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. news.ycombinator.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 focus:border-[#4285F4] transition-all font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to use domain name"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 focus:border-[#4285F4] transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Section
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 focus:border-[#4285F4] transition-all text-sm appearance-none"
                >
                  {sections.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!newUrl.trim()}
                  className="w-full py-3 px-4 bg-[#4285F4] text-white rounded-xl font-medium shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Bookmark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white dark:bg-[#202124] rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/50">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Create Section</h2>
              <button 
                onClick={() => setIsSectionModalOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleAddSection} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Section Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Work, Priorities, Recipes"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4285F4]/50 focus:border-[#4285F4] transition-all text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!newSectionName.trim()}
                  className="w-full py-3 px-4 bg-[#4285F4] text-white rounded-xl font-medium shadow-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

