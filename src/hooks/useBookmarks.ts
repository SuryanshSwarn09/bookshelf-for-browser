import React, { useState, useEffect, useCallback } from 'react';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Bookmark } from '../types';
import { extractDomain, getFaviconUrl, sanitizeUrl, generateId, validateBackup, storageAdapter } from '../utils';

export const DEFAULT_BOOKMARKS: Bookmark[] = [
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

export const DEFAULT_SECTIONS = ['General', 'Work', 'Entertainment', 'Tech'];

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [brokenIconIds, setBrokenIconIds] = useState<Set<string>>(new Set());
  const [isBookmarksReady, setIsBookmarksReady] = useState(false);

  // Load bookmarks & sections from universal storageAdapter
  useEffect(() => {
    let isMounted = true;
    const loadBookmarksData = async () => {
      const dataV2 = await storageAdapter.getItem<{ bookmarks: Bookmark[]; sections: string[] }>(
        'bookshelf-data-v2',
        {
          bookmarks: DEFAULT_BOOKMARKS,
          sections: DEFAULT_SECTIONS,
        },
        'sync'
      );

      if (isMounted) {
        setBookmarks(dataV2.bookmarks || DEFAULT_BOOKMARKS);
        setSections(dataV2.sections || DEFAULT_SECTIONS);
        setIsBookmarksReady(true);
      }
    };

    loadBookmarksData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save bookmarks & sections state on change
  useEffect(() => {
    if (isBookmarksReady) {
      storageAdapter.setItem('bookshelf-data-v2', { bookmarks, sections }, 'sync');
    }
  }, [bookmarks, sections, isBookmarksReady]);

  const handleImageError = useCallback((id: string, isError: boolean) => {
    setBrokenIconIds(prev => {
      const next = new Set(prev);
      if (isError) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleFixAllFavicons = useCallback(() => {
    if (brokenIconIds.size === 0) return;
    setBookmarks(prev => prev.map(b => {
      if (brokenIconIds.has(b.id)) {
        return { ...b, iconUrl: getFaviconUrl(b.url, true) };
      }
      return b;
    }));
  }, [brokenIconIds]);

  const handleAddBookmark = useCallback((url: string, title: string, category: string) => {
    if (!url.trim()) return;

    const safeUrl = sanitizeUrl(url);
    const domain = extractDomain(safeUrl);
    const bookmarkTitle = title.trim() || domain;
    
    const newBookmark: Bookmark = {
      id: generateId(),
      url: safeUrl,
      title: bookmarkTitle,
      iconUrl: getFaviconUrl(safeUrl),
      createdAt: Date.now(),
      category: category.trim() || 'General',
    };

    setBookmarks(prev => [...prev, newBookmark]);
  }, []);

  const handleAddSection = useCallback((sectionName: string) => {
    const sectionTitle = sectionName.trim();
    if (sectionTitle && !sections.includes(sectionTitle)) {
      setSections(prev => [...prev, sectionTitle]);
    }
  }, [sections]);

  const handleDeleteBookmark = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks(prev => prev.filter(b => b.id !== id));
  }, []);

  const handleDeleteSection = useCallback((sectionToDelete: string, activeSection: string, setActiveSection: (s: string) => void) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter(s => s !== sectionToDelete));
    setBookmarks(prev => prev.map(b => (b.category === sectionToDelete ? { ...b, category: 'General' } : b)));
    if (activeSection === sectionToDelete) {
      setActiveSection('All');
    }
  }, [sections]);

  const handleRefreshFavicon = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarks(prev => prev.map(b => {
      if (b.id === id) {
        return { ...b, iconUrl: getFaviconUrl(b.url, true) };
      }
      return b;
    }));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
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
  }, []);

  const handleExportBackup = useCallback(() => {
    const dataStr = JSON.stringify({ bookmarks, sections }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookshelf-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [bookmarks, sections]);

  const handleImportBackup = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
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
            resolve(true);
          } else {
            alert('Invalid backup file format. Please upload a valid Bookshelf JSON backup file.');
            resolve(false);
          }
        } catch {
          alert('Failed to parse backup file.');
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  return {
    isBookmarksReady,
    bookmarks,
    setBookmarks,
    sections,
    setSections,
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
  };
}
