import { useState, useEffect } from 'react';
import { storageAdapter } from '../utils';

export type ThemePreset = 'default' | 'oled' | 'nordic' | 'sunset' | 'graphite' | 'porcelain';

export function useSettings() {
  const [iconSize, setIconSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [activeSection, setActiveSection] = useState<string>('All');
  const [themePreset, setThemePreset] = useState<ThemePreset>('default');
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

      const savedTheme = await storageAdapter.getItem<string>('bookshelf-theme-preset', 'default', 'sync');
      if (isMounted && savedTheme) {
        if (savedTheme === 'cyberpunk') {
          setThemePreset('graphite');
        } else if (['default', 'oled', 'nordic', 'sunset', 'graphite', 'porcelain'].includes(savedTheme)) {
          setThemePreset(savedTheme as ThemePreset);
        }
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

  // Update body class and document dark-mode state when theme changes
  useEffect(() => {
    const root = document.documentElement;

    if (themePreset === 'porcelain') {
      document.body.className = 'theme-porcelain';
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      return;
    }

    if (['oled', 'nordic', 'sunset', 'graphite'].includes(themePreset)) {
      document.body.className = `theme-${themePreset}`;
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      return;
    }

    // Default theme follows system preferences dynamically
    document.body.className = '';
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = () => {
      if (mediaQuery.matches) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    syncSystemTheme();
    mediaQuery.addEventListener('change', syncSystemTheme);
    return () => {
      mediaQuery.removeEventListener('change', syncSystemTheme);
    };
  }, [themePreset]);

  useEffect(() => {
    if (isSettingsReady) {
      storageAdapter.setItem('bookshelf-icon-size', iconSize, 'sync');
      storageAdapter.setItem('bookshelf-active-section', activeSection, 'sync');
      storageAdapter.setItem('bookshelf-theme-preset', themePreset, 'sync');
      storageAdapter.setItem('bookshelf-bg-wallpaper', bgWallpaper, 'local');
      storageAdapter.setItem('bookshelf-bg-opacity', bgOpacity, 'local');
      storageAdapter.setItem('bookshelf-bg-blur', bgBlur, 'local');
    }
  }, [iconSize, activeSection, themePreset, bgWallpaper, bgOpacity, bgBlur, isSettingsReady]);

  return {
    isSettingsReady,
    iconSize,
    setIconSize,
    activeSection,
    setActiveSection,
    themePreset,
    setThemePreset,
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
