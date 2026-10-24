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
            <div className="w-8 h-8 rounded-lg bg-[#c85a32]/10 dark:bg-[#d36135]/20 flex items-center justify-center text-[#c85a32] dark:text-[#d36135]">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 id="add-bookmark-title" className="text-xl font-serif-display font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1]">
                Add Shortcut
              </h2>
              <p className="text-[11px] font-mono-ui text-zinc-500 dark:text-zinc-400">
                Pin to <span className="font-semibold text-[#c85a32] dark:text-[#d36135]">{category}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
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
          <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#c85a32]/10 dark:bg-[#d36135]/20 text-[#c85a32] dark:text-[#d36135] text-[10px] font-mono-ui font-semibold">
            <Folder size={11} />
            <span>{category}</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
          {/* Website URL Input */}
          <div>
            <label className="block text-[11px] font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              Website URL <span className="text-[#c85a32]">*</span>
            </label>
            <div className="relative flex items-center">
              <Globe size={15} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                placeholder="github.com, figma.com, news.ycombinator.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-lg ios-glass-input text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans-ui text-xs outline-none"
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer rounded"
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
              <label className="text-[11px] font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 uppercase tracking-wider font-semibold">
                Title <span className="text-zinc-400 font-normal lowercase">(optional)</span>
              </label>
              {detectedDomain && !title && (
                <button
                  type="button"
                  onClick={() => setTitle(detectedDomain)}
                  className="text-[10px] font-mono-ui text-[#c85a32] dark:text-[#d36135] hover:underline cursor-pointer"
                >
                  Use "{detectedDomain}"
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <Type size={15} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Leave blank for clean domain"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg ios-glass-input text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans-ui text-xs outline-none"
              />
            </div>
          </div>

          {/* Custom Icon URL Input */}
          <div>
            <label className="block text-[11px] font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              Custom Icon URL <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative flex items-center">
              <ImageIcon size={15} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                placeholder="https://example.com/icon.svg"
                value={customIconUrl}
                onChange={(e) => setCustomIconUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg ios-glass-input text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans-ui text-xs outline-none"
              />
            </div>
          </div>

          {/* Category Quick Chips Selector */}
          <div>
            <label className="block text-[11px] font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              Assign Section
            </label>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 max-h-24 overflow-y-auto">
              {sections.map((s) => {
                const isSelected = category === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCategory(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-ui transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                      isSelected
                        ? 'bg-[#c85a32] dark:bg-[#d36135] text-white font-bold shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/10'
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
              className="flex-1 py-2.5 px-4 rounded-lg ios-glass-pill text-xs font-mono-ui font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 text-center"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="flex-[2] py-2.5 px-4 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-lg font-sans-ui text-xs font-semibold shadow-md active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c85a32]"
            >
              <span>ADD TO BOOKSHELF</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

