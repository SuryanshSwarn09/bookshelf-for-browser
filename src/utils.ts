import { z } from 'zod';
import { Bookmark } from './types';

declare const chrome: any;

export function extractDomain(url: string): string {
  try {
    const urlToParse = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(urlToParse).hostname;
    return domain.replace('www.', '');
  } catch (e) {
    return url.replace('https://', '').replace('http://', '');
  }
}

export function getFaviconUrl(url: string, forceRefresh: boolean = false): string {
  try {
    const urlToParse = url.startsWith('http') ? url : `https://${url}`;
    const domain = new URL(urlToParse).hostname;
    // Using Google's favicon service for reliable 128px icons
    const baseUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    return forceRefresh ? `${baseUrl}&cb=${Date.now()}` : baseUrl;
  } catch (e) {
    return '';
  }
}

export function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed) || /^data:text\/html/i.test(trimmed)) {
    return '#';
  }
  return ensureProtocol(trimmed);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Zod Schema for robust JSON Backup validation
export const BookmarkSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  iconUrl: z.string(),
  createdAt: z.number(),
  category: z.string().optional()
});

export const BackupDataSchema = z.object({
  bookmarks: z.array(BookmarkSchema),
  sections: z.array(z.string()).optional()
});

export function validateBackup(json: unknown) {
  return BackupDataSchema.safeParse(json);
}

// Universal Storage Adapter (chrome.storage with localStorage fallback)
const isChromeStorageAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage);
};

export const storageAdapter = {
  async getItem<T>(key: string, defaultValue: T, storageType: 'sync' | 'local' = 'sync'): Promise<T> {
    try {
      if (isChromeStorageAvailable()) {
        const storageArea = storageType === 'sync' && chrome.storage.sync ? chrome.storage.sync : chrome.storage.local;
        const result = await new Promise<{ [key: string]: any }>((resolve) => {
          storageArea.get([key], (data) => resolve(data));
        });
        if (result && result[key] !== undefined) {
          return typeof result[key] === 'string' ? JSON.parse(result[key]) : result[key];
        }
      }
    } catch (err) {
      console.warn(`[storageAdapter] Failed reading ${key} from chrome.storage, falling back to localStorage`, err);
    }

    // Fallback to localStorage
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  async setItem<T>(key: string, value: T, storageType: 'sync' | 'local' = 'sync'): Promise<void> {
    const stringified = JSON.stringify(value);

    try {
      if (isChromeStorageAvailable()) {
        const storageArea = storageType === 'sync' && chrome.storage.sync ? chrome.storage.sync : chrome.storage.local;
        await new Promise<void>((resolve, reject) => {
          storageArea.set({ [key]: stringified }, () => {
            if (chrome.runtime?.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      }
    } catch (err) {
      console.warn(`[storageAdapter] Failed writing ${key} to chrome.storage, falling back to localStorage`, err);
    }

    // Always mirror to localStorage as local fallback
    try {
      localStorage.setItem(key, stringified);
    } catch (e) {
      console.error(`[storageAdapter] Failed writing ${key} to localStorage`, e);
    }
  }
};


