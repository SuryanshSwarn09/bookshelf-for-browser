import { z } from 'zod';
import { Bookmark } from './types';

declare const chrome: any;

export function extractDomain(url: string): string {
  try {
    const urlToParse = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
    const domain = new URL(urlToParse).hostname;
    return domain.replace(/^www\./i, '');
  } catch (e) {
    return url.replace(/^https?:\/\//i, '').replace(/^www\./i, '');
  }
}

export function getFaviconUrl(url: string, forceRefresh: boolean = false): string {
  try {
    const domain = extractDomain(url);
    if (!domain) return '';
    const baseUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    return forceRefresh ? `${baseUrl}&cb=${Date.now()}` : baseUrl;
  } catch (e) {
    return '';
  }
}

export function getFaviconFallbackUrls(url: string, forceRefresh: boolean = false): string[] {
  try {
    const domain = extractDomain(url);
    if (!domain || domain === 'not-a-valid-url') return [];
    const cb = forceRefresh ? `?cb=${Date.now()}` : '';
    return [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128${cb ? '&' + cb.slice(1) : ''}`,
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      `https://icon.horse/icon/${domain}`,
      `https://${domain}/favicon.ico${cb}`
    ];
  } catch (e) {
    return [];
  }
}

export function getDeterministicGradient(seedStr: string): { bg: string; text: string } {
  const str = (seedStr || 'Unnamed').toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 45) % 360;
  
  return {
    bg: `linear-gradient(135deg, hsl(${hue1}, 70%, 45%) 0%, hsl(${hue2}, 80%, 35%) 100%)`,
    text: '#ffffff',
  };
}

export function formatCleanTitle(userTitle: string, rawUrl: string): string {
  const trimmed = (userTitle || '').trim();
  if (trimmed) return trimmed;

  const domain = extractDomain(rawUrl);
  if (domain && domain !== 'not-a-valid-url' && !domain.startsWith('#')) {
    return domain;
  }

  return 'Unnamed';
}

export function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

const DANGEROUS_PROTOCOLS = /^(javascript|data|vbscript|blob):/i;

export function sanitizeUrl(url: string): string {
  const trimmed = (url || '').trim();
  if (!trimmed) return '#';

  // Strip ASCII control characters and whitespace within scheme check
  const normalized = trimmed.replace(/[\u0000-\u001F\u007F-\u009F\s]+/g, '');
  if (DANGEROUS_PROTOCOLS.test(normalized)) {
    return '#';
  }

  const withProtocol = ensureProtocol(trimmed);
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '#';
    }
    return withProtocol;
  } catch {
    return '#';
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Zod Schema for robust JSON Backup validation
export const BookmarkSchema = z.object({
  id: z.string(),
  url: z.string().transform(sanitizeUrl),
  title: z.string(),
  iconUrl: z.string(),
  customIconUrl: z.string().optional(),
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

// Resilient GitHub Integration Parser & Fetcher
export interface GitHubFetchResult {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  content: string;
  source: string;
}

export function parseGitHubUrl(inputUrl: string): { owner: string; repo: string; path: string; branch: string } {
  const cleanInput = (inputUrl || '').trim().replace(/\/$/, '');
  let owner = '';
  let repo = '';
  let path = 'README.md';
  let branch = '';

  const githubUrlMatch = cleanInput.match(/^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(\/(blob|raw)\/([^\/]+)\/(.+))?$/i);
  if (githubUrlMatch) {
    owner = githubUrlMatch[1];
    repo = githubUrlMatch[2].replace(/\.git$/i, '');
    if (githubUrlMatch[5]) branch = githubUrlMatch[5];
    if (githubUrlMatch[6]) path = githubUrlMatch[6];
  } else {
    const parts = cleanInput.replace(/^https?:\/\//i, '').split('/');
    if (parts.length >= 2) {
      owner = parts[0];
      repo = parts[1].replace(/\.git$/i, '');
    }
  }

  return { owner, repo, path, branch };
}

export async function fetchGitHubMarkdown(inputUrl: string, token?: string): Promise<GitHubFetchResult> {
  const { owner, repo, path, branch } = parseGitHubUrl(inputUrl);

  if (!owner || !repo) {
    throw new Error('Invalid GitHub URL or owner/repo format. Example: https://github.com/owner/repo or owner/repo');
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3.raw, text/plain, */*'
  };
  if (token && token.trim()) {
    headers['Authorization'] = `token ${token.trim()}`;
  }

  // Strategy 1: GitHub API README / contents endpoint (Handles default branch dynamically)
  try {
    const apiEndpoint = path.toLowerCase() === 'readme.md'
      ? `https://api.github.com/repos/${owner}/${repo}/readme`
      : `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    const res = await fetch(apiEndpoint, { headers });
    if (res.ok) {
      const text = await res.text();
      return { owner, repo, path, branch: branch || 'default', content: text, source: 'github-api' };
    }
  } catch {
    // Fall through to raw content strategy
  }

  // Strategy 2: Raw GitHub Content (specified branch or 'main')
  const targetBranch = branch || 'main';
  try {
    const rawUrlMain = `https://raw.githubusercontent.com/${owner}/${repo}/${targetBranch}/${path}`;
    const res = await fetch(rawUrlMain, { headers });
    if (res.ok) {
      const text = await res.text();
      return { owner, repo, path, branch: targetBranch, content: text, source: 'raw-main' };
    }
  } catch {
    // Fall through to master strategy
  }

  // Strategy 3: Raw GitHub Content ('master' branch fallback)
  if (!branch) {
    try {
      const rawUrlMaster = `https://raw.githubusercontent.com/${owner}/${repo}/master/${path}`;
      const res = await fetch(rawUrlMaster, { headers });
      if (res.ok) {
        const text = await res.text();
        return { owner, repo, path, branch: 'master', content: text, source: 'raw-master' };
      }
    } catch {
      // Fall through to final error
    }
  }

  throw new Error(`Unable to fetch "${path}" from ${owner}/${repo}. Check that the repository is public and spelled correctly, or add a GitHub Personal Access Token.`);
}


