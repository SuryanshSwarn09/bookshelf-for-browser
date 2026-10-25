import React, { useState, useEffect, useMemo } from 'react';
import { X, Globe, Type, Image as ImageIcon, Folder, Sparkles, Check, ArrowRight, ExternalLink } from 'lucide-react';
import { extractDomain, getFaviconFallbackUrls, getDeterministicGradient, formatCleanTitle } from '../utils';

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBookmark: (url: string, title: string, category: string, customIconUrl?: string) => void;
  sections: string[];
  initialCategory: string;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  onAddBookmark,
  sections,
  initialCategory,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState('');
  const [category, setCategory] = useState(initialCategory || 'General');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    setCategory(initialCategory || 'General');
  }, [initialCategory]);

  useEffect(() => {
    setPreviewError(false);
  }, [url, customIconUrl]);

  // Derive preview data in real time
  const detectedDomain = useMemo(() => {
    if (!url.trim()) return '';
    return extractDomain(url.trim());
  }, [url]);

  const cleanPreviewTitle = useMemo(() => {
    return formatCleanTitle(title, url);
  }, [title, url]);

  const previewFaviconUrl = useMemo(() => {
    if (customIconUrl.trim()) return customIconUrl.trim();
    if (!detectedDomain || detectedDomain === 'not-a-valid-url') return '';
    const fallbacks = getFaviconFallbackUrls(url.trim());
    return fallbacks[0] || '';
  }, [customIconUrl, detectedDomain, url]);

  const gradientAvatar = useMemo(() => {
    return getDeterministicGradient(cleanPreviewTitle || detectedDomain || 'Bookmark');
  }, [cleanPreviewTitle, detectedDomain]);

  const firstLetter = useMemo(() => {
    if (cleanPreviewTitle && cleanPreviewTitle.toLowerCase() !== 'unnamed') {
      return cleanPreviewTitle.charAt(0).toUpperCase();
    }
    if (detectedDomain && detectedDomain !== 'not-a-valid-url') {
      return detectedDomain.charAt(0).toUpperCase();
    }
    return 'B';
  }, [cleanPreviewTitle, detectedDomain]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAddBookmark(url, title, category, customIconUrl);
    setUrl('');
    setTitle('');
    setCustomIconUrl('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-bookmark-title"
    >
      <div
        className="w-full max-w-lg ios-glass-modal text-[#1c1c1c] dark:text-[#e5e5e1] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 dark:bg-[#3b82f6]/20 flex items-center justify-center text-[#2563eb] dark:text-[#3b82f6]">
              <Folder size={16} />
            </div>
            <div>
              <h2 id="add-bookmark-title" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Add bookmark
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Saving to <span className="font-medium text-[#2563eb] dark:text-[#3b82f6]">{category}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Squircle Glass Preview Banner */}
        <div className="mx-6 mt-5 p-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* The Squircle Icon Preview */}
            <div className="relative w-12 h-12 shrink-0 rounded-xl ios-glass-card overflow-hidden flex items-center justify-center shadow-sm">
              {previewFaviconUrl && !previewError ? (
                <img
                  src={previewFaviconUrl}
                  alt="Favicon preview"
                  className="w-7 h-7 object-contain transition-all"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center select-none shadow-inner"
                  style={{ background: gradientAvatar.bg, color: gradientAvatar.text }}
                >
                  <span className="font-sans-ui text-lg font-bold">
                    {firstLetter}
                  </span>
                </div>
              )}
            </div>

            {/* Title & Domain Preview */}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#1c1c1c] dark:text-white truncate">
                {cleanPreviewTitle || 'New Shortcut'}
              </span>
              <span className="text-[11px] font-mono-ui text-zinc-500 dark:text-zinc-400 truncate flex items-center gap-1">
                {detectedDomain && detectedDomain !== 'not-a-valid-url' ? (
                  <>
                    <Globe size={10} className="shrink-0" />
                    <span>{detectedDomain}</span>
                  </>
                ) : (
                  <span>Enter a valid URL below</span>
                )}
              </span>
            </div>
          </div>

          {/* Category Chip Badge */}
          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#2563eb]/10 dark:bg-[#3b82f6]/20 text-[#2563eb] dark:text-[#3b82f6] text-xs font-sans-ui font-medium">
            <Folder size={12} />
            <span>{category}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          {/* Website URL Input */}
          <div>
            <label className="block text-xs font-sans-ui text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
              Website URL <span className="text-[#2563eb]">*</span>
            </label>
            <div className="relative flex items-center">
              <Globe size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                placeholder="github.com, figma.com, news.ycombinator.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-lg ios-glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans-ui text-xs outline-none"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded"
                  title="Clear URL"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-sans-ui text-slate-700 dark:text-slate-300 font-medium">
                Bookmark title <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              {detectedDomain && !title && (
                <button
                  type="button"
                  onClick={() => setTitle(detectedDomain)}
                  className="text-xs font-sans-ui text-[#2563eb] dark:text-[#3b82f6] hover:underline cursor-pointer"
                >
                  Use "{detectedDomain}"
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <Type size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Leave blank to use clean domain"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg ios-glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans-ui text-xs outline-none"
              />
            </div>
          </div>

          {/* Custom Icon URL Input */}
          <div>
            <label className="block text-xs font-sans-ui text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
              Custom icon URL <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative flex items-center">
              <ImageIcon size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="https://example.com/icon.svg"
                value={customIconUrl}
                onChange={(e) => setCustomIconUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg ios-glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans-ui text-xs outline-none"
              />
            </div>
          </div>

          {/* Category Quick Chips Selector */}
          <div>
            <label className="block text-xs font-sans-ui text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
              Section
            </label>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 max-h-24 overflow-y-auto">
              {sections.map((s) => {
                const isSelected = category === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCategory(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans-ui transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                      isSelected
                        ? 'bg-[#2563eb] dark:bg-[#3b82f6] text-white font-medium shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
                    }`}
                  >
                    {isSelected && <Check size={12} className="shrink-0" />}
                    <span>{s}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg ios-glass-pill text-xs font-sans-ui font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="flex-[2] py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white rounded-lg font-sans-ui text-xs font-medium shadow-sm active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb]"
            >
              Save bookmark
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

