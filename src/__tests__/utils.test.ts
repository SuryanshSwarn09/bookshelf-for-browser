import { describe, it, expect, beforeEach } from 'vitest';
import {
  extractDomain,
  ensureProtocol,
  sanitizeUrl,
  getFaviconUrl,
  generateId,
  validateBackup,
  storageAdapter
} from '../utils';

describe('Utility Functions', () => {
  describe('extractDomain', () => {
    it('should extract domain without www', () => {
      expect(extractDomain('https://www.github.com/profile')).toBe('github.com');
      expect(extractDomain('http://google.com')).toBe('google.com');
      expect(extractDomain('news.ycombinator.com')).toBe('news.ycombinator.com');
    });

    it('should handle malformed URL gracefully', () => {
      expect(extractDomain('not-a-valid-url')).toBe('not-a-valid-url');
    });
  });

  describe('ensureProtocol', () => {
    it('should add https:// if missing', () => {
      expect(ensureProtocol('github.com')).toBe('https://github.com');
    });

    it('should preserve existing http or https protocol', () => {
      expect(ensureProtocol('http://example.com')).toBe('http://example.com');
      expect(ensureProtocol('https://example.com')).toBe('https://example.com');
    });
  });

  describe('sanitizeUrl', () => {
    it('should sanitize javascript: URIs', () => {
      expect(sanitizeUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeUrl('JAVASCRIPT:console.log("XSS")')).toBe('#');
    });

    it('should sanitize data:text/html URIs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('#');
    });

    it('should allow valid http and https URLs', () => {
      expect(sanitizeUrl('https://github.com')).toBe('https://github.com');
      expect(sanitizeUrl('google.com')).toBe('https://google.com');
    });
  });

  describe('getFaviconUrl', () => {
    it('should return Google Favicon API endpoint', () => {
      const url = getFaviconUrl('https://github.com');
      expect(url).toContain('google.com/s2/favicons?domain=github.com&sz=128');
    });

    it('should append timestamp when forceRefresh is true', () => {
      const url = getFaviconUrl('https://github.com', true);
      expect(url).toContain('&cb=');
    });
  });

  describe('generateId', () => {
    it('should return a non-empty string id', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(3);
      expect(id1).not.toBe(id2);
    });
  });

  describe('validateBackup (Zod Schema Validation)', () => {
    it('should validate correct backup JSON payload', () => {
      const validPayload = {
        bookmarks: [
          {
            id: '1',
            url: 'https://github.com',
            title: 'GitHub',
            iconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
            createdAt: 1700000000000,
            category: 'Work'
          }
        ],
        sections: ['General', 'Work']
      };
      const result = validateBackup(validPayload);
      expect(result.success).toBe(true);
    });

    it('should reject invalid backup JSON missing required fields', () => {
      const invalidPayload = {
        bookmarks: [
          {
            // missing id and url
            title: 'Invalid'
          }
        ]
      };
      const result = validateBackup(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('storageAdapter', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should set and get items via localStorage fallback when chrome is undefined', async () => {
      const testData = { key: 'value' };
      await storageAdapter.setItem('test-key', testData, 'sync');
      const retrieved = await storageAdapter.getItem('test-key', null, 'sync');
      expect(retrieved).toEqual(testData);
    });

    it('should return default value when key does not exist', async () => {
      const defaultValue = { default: true };
      const retrieved = await storageAdapter.getItem('non-existent-key', defaultValue, 'sync');
      expect(retrieved).toEqual(defaultValue);
    });
  });
});
