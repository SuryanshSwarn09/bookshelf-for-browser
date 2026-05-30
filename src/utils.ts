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
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

