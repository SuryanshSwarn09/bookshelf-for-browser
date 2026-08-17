import { useState, useEffect } from 'react';
import { Bookmark } from '../types';
import { storageAdapter } from '../utils';
import { DEFAULT_BOOKMARKS, DEFAULT_SECTIONS } from './useBookmarks';

export function useStorageState() {
  const [bookmarks, setBookmarksState] = useState<Bookmark[]>([]);
  const [sections, setSectionsState] = useState<string[]>([]);
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [activeSection, setActiveSection] = useState<string>('All');
  const [bgWallpaper, setBgWallpaper] = useState<string>('');
  const [bgOpacity, setBgOpacity] = useState<number>(40);
  const [bgBlur, setBgBlur] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);

  // Load state from universal storageAdapter
  useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      const dataV2 = await storageAdapter.getItem<{ bookmarks: Bookmark[]; sections: string[] }>(
        'bookshelf-data-v2',
        {
          bookmarks: DEFAULT_BOOKMARKS,
          sections: DEFAULT_SECTIONS,
        },
        'sync'
      );

      if (isMounted) {
        setBookmarksState(dataV2.bookmarks || DEFAULT_BOOKMARKS);
        setSectionsState(dataV2.sections || DEFAULT_SECTIONS);
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

  // Save state whenever relevant state variables change
  useEffect(() => {
    if (isReady) {
      storageAdapter.setItem('bookshelf-data-v2', { bookmarks, sections }, 'sync');
      storageAdapter.setItem('bookshelf-icon-size', iconSize, 'sync');
      storageAdapter.setItem('bookshelf-active-section', activeSection, 'sync');
      storageAdapter.setItem('bookshelf-[#bg-wallpaper]', bgWallpaper, 'local');
      storageAdapter.setItem('bookshelf-bg-wallpaper', bgWallpaper, 'local');
      storageAdapter.setItem('bookshelf-bg-opacity', bgOpacity, 'local');
      storageAdapter.setItem('bookshelf-bg-blur', bgBlur, 'local');
    }
  }, [bookmarks, sections, iconSize, activeSection, bgWallpaper, bgOpacity, bgBlur, isReady]);

  return {
    isReady,
    bookmarks,
    setBookmarksState,
    sections,
    setSectionsState,
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
  };
}
