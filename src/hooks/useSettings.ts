import { useState, useEffect } from 'react';
import { storageAdapter } from '../utils';

export function useSettings() {
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [activeSection, setActiveSection] = useState<string>('All');
  const [bgWallpaper, setBgWallpaper] = useState<string>('');
  const [bgOpacity, setBgOpacity] = useState<number>(40);
  const [bgBlur, setBgBlur] = useState<number>(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSettingsReady, setIsSettingsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
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
        setIsSettingsReady(true);
      }
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isSettingsReady) {
      storageAdapter.setItem('bookshelf-icon-size', iconSize, 'sync');
      storageAdapter.setItem('bookshelf-active-section', activeSection, 'sync');
      storageAdapter.setItem('bookshelf-bg-wallpaper', bgWallpaper, 'local');
      storageAdapter.setItem('bookshelf-bg-opacity', bgOpacity, 'local');
      storageAdapter.setItem('bookshelf-bg-blur', bgBlur, 'local');
    }
  }, [iconSize, activeSection, bgWallpaper, bgOpacity, bgBlur, isSettingsReady]);

  return {
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
  };
}
