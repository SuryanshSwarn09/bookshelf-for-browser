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

export function extractRootDomain(url: string): string {
  try {
    const domain = extractDomain(url);
    if (!domain || domain === 'not-a-valid-url') return '';
    const parts = domain.split('.');
    if (parts.length <= 2) return domain;
    const secondLast = parts[parts.length - 2].toLowerCase();
    const isCcTld = ['co', 'com', 'org', 'net', 'edu', 'gov'].includes(secondLast) && parts[parts.length - 1].length === 2;
    if (isCcTld && parts.length > 2) {
      return parts.slice(-3).join('.');
    }
    return parts.slice(-2).join('.');
  } catch (e) {
    return extractDomain(url);
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
    const rootDomain = extractRootDomain(url);
    const cb = forceRefresh ? `?cb=${Date.now()}` : '';
    const cbAmp = forceRefresh ? `&cb=${Date.now()}` : '';

    const urls: string[] = [
      // Tier 1: Crisp Apple Touch Icons (typically 120-180px PNG standard on modern websites)
      `https://${domain}/apple-touch-icon.png${cb}`,
      `https://${domain}/apple-touch-icon-precomposed.png${cb}`,
      // Tier 2: High-resolution icon services
      `https://icon.horse/icon/${domain}`,
      `https://unavatar.io/${domain}?fallback=false`,
      // Tier 3: Google S2 128px API
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128${cbAmp}`,
      // Tier 4: DuckDuckGo favicon service
      `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      // Tier 5: Direct standard root favicon.ico
      `https://${domain}/favicon.ico${cb}`,
    ];

    // Tier 6: Subdomain fallback to root domain if distinct (e.g. docs.github.com -> github.com)
    if (rootDomain && rootDomain !== domain) {
      urls.push(
        `https://icon.horse/icon/${rootDomain}`,
        `https://unavatar.io/${rootDomain}?fallback=false`,
        `https://www.google.com/s2/favicons?domain=${rootDomain}&sz=128${cbAmp}`,
        `https://icons.duckduckgo.com/ip3/${rootDomain}.ico`,
        `https://${rootDomain}/apple-touch-icon.png${cb}`,
        `https://${rootDomain}/favicon.ico${cb}`
      );
    }

    return Array.from(new Set(urls.filter(Boolean)));
  } catch (e) {
    return [];
  }
}

const NON_PURPLE_PALETTES = [
  { bg: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', text: '#ffffff' }, // Cobalt blue
  { bg: 'linear-gradient(135deg, #2d5a43 0%, #1a3828 100%)', text: '#ffffff' }, // Forest slate
  { bg: 'linear-gradient(135deg, #1e3a5f 0%, #0f233d 100%)', text: '#ffffff' }, // Deep navy
  { bg: 'linear-gradient(135deg, #b46b1a 0%, #874b0c 100%)', text: '#ffffff' }, // Warm bronze
  { bg: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)', text: '#ffffff' }, // Charcoal graphite
  { bg: 'linear-gradient(135deg, #52634f 0%, #354233 100%)', text: '#ffffff' }, // Olive sage
  { bg: 'linear-gradient(135deg, #99622c 0%, #6e4219 100%)', text: '#ffffff' }, // Warm ochre
  { bg: 'linear-gradient(135deg, #8f2d2d 0%, #611818 100%)', text: '#ffffff' }, // Auburn
];

export function getDeterministicGradient(seedStr: string): { bg: string; text: string } {
  const str = (seedStr || 'Unnamed').toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % NON_PURPLE_PALETTES.length;
  return NON_PURPLE_PALETTES[index];
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


