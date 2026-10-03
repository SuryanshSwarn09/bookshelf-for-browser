import React, { useState, useEffect, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, RefreshCw } from 'lucide-react';
import { Bookmark } from '../types';
import { extractDomain, getFaviconFallbackUrls, getDeterministicGradient } from '../utils';

interface SortableBookmarkProps {
  key?: string | number;
  bookmark: Bookmark;
  isEditMode: boolean;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onRefreshFavicon: (e: React.MouseEvent, id: string) => void;
  onImageError: (id: string, isError: boolean) => void;
  iconSize: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: {
    container: 'w-12 h-12 sm:w-14 sm:h-14 ios-squircle',
    icon: 'w-6 h-6 sm:w-7 sm:h-7',
    text: 'text-[10px] sm:text-xs font-sans-ui tracking-tight',
    buttonPadding: 'p-1',
    buttonIconSize: 11,
    gap: 'gap-1.5 sm:gap-2',
    overlayGap: 'gap-1',
    avatarText: 'text-lg sm:text-xl font-bold',
  },
  md: {
    container: 'w-16 h-16 sm:w-20 sm:h-20 ios-squircle',
    icon: 'w-9 h-9 sm:w-11 sm:h-11',
    text: 'text-xs sm:text-sm font-sans-ui tracking-tight',
    buttonPadding: 'p-1.5',
    buttonIconSize: 13,
    gap: 'gap-2 sm:gap-2.5',
    overlayGap: 'gap-1.5',
    avatarText: 'text-2xl sm:text-3xl font-bold',
  },
  lg: {
    container: 'w-20 h-20 sm:w-24 sm:h-24 ios-squircle',
    icon: 'w-11 h-11 sm:w-14 sm:h-14',
    text: 'text-sm sm:text-base font-sans-ui tracking-tight',
    buttonPadding: 'p-2',
    buttonIconSize: 16,
    gap: 'gap-3 sm:gap-3.5',
    overlayGap: 'gap-2',
    avatarText: 'text-3xl sm:text-4xl font-bold',
  }
};

export function SortableBookmark({ bookmark, isEditMode, onDelete, onRefreshFavicon, onImageError, iconSize }: SortableBookmarkProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const currentSize = sizeMap[iconSize] || sizeMap.md;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group flex flex-col items-center justify-start ${currentSize.gap} transition-transform duration-200 cursor-grab active:cursor-grabbing select-none ${isEditMode ? 'animate-jiggle' : 'hover:-translate-y-[3px]'}`}
    >
      <a 
        href={isEditMode ? undefined : bookmark.url}
        target={isEditMode ? undefined : "_blank"}
        rel={isEditMode ? undefined : "noopener noreferrer"}
        onClick={(e) => {
          if (isEditMode) e.preventDefault();
        }}
        className={`w-full flex flex-col items-center justify-start ${currentSize.gap}`}
        draggable={false}
      >
        <BookmarkContent bookmark={bookmark} isEditMode={isEditMode} isDragging={isDragging} onImageError={onImageError} iconSize={iconSize} />
      </a>

      {/* Edit Mode iOS Corner Badges */}
      {isEditMode && (
        <>
          <button 
            onClick={(e) => onRefreshFavicon(e, bookmark.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-1 -left-1 p-1 bg-amber-500/90 hover:bg-amber-500 text-white rounded-full shadow-md hover:scale-115 active:scale-90 transition-all cursor-pointer z-20 backdrop-blur-md"
            title="Refresh Favicon"
          >
            <RefreshCw size={11} />
          </button>
          <button 
            onClick={(e) => onDelete(e, bookmark.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute -top-1 -right-1 p-1 bg-red-500/90 hover:bg-red-500 text-white rounded-full shadow-md hover:scale-115 active:scale-90 transition-all cursor-pointer z-20 backdrop-blur-md"
            title="Delete Bookmark"
          >
            <Trash2 size={11} />
          </button>
        </>
      )}
    </div>
  );
}

function BookmarkContent({ bookmark, isEditMode, isDragging, onImageError, iconSize }: { bookmark: Bookmark, isEditMode: boolean, isDragging: boolean, onImageError: (id: string, isError: boolean) => void, iconSize: 'sm' | 'md' | 'lg' }) {
  const currentSize = sizeMap[iconSize] || sizeMap.md;

  // Build candidate fallback image URLs array
  const candidateUrls = useMemo(() => {
    const list: string[] = [];
    if (bookmark.customIconUrl?.trim()) {
      list.push(bookmark.customIconUrl.trim());
    }
    if (bookmark.iconUrl?.trim()) {
      list.push(bookmark.iconUrl.trim());
    }
    const fallbacks = getFaviconFallbackUrls(bookmark.url);
    fallbacks.forEach(f => {
      if (!list.includes(f)) list.push(f);
    });
    return list;
  }, [bookmark.customIconUrl, bookmark.iconUrl, bookmark.url]);

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
    onImageError(bookmark.id, false);
  }, [bookmark.iconUrl, bookmark.customIconUrl, bookmark.url, bookmark.id, onImageError]);

  const activeSrc = candidateUrls[candidateIndex];
  const allImagesFailed = candidateIndex >= candidateUrls.length || !activeSrc;

  // Initial letter and gradient styling for fallback avatar
  const initialChar = useMemo(() => {
    const title = (bookmark.title || '').trim();
    if (title && title.toLowerCase() !== 'unnamed') return title.charAt(0).toUpperCase();
    const dom = extractDomain(bookmark.url);
    if (dom && dom !== 'not-a-valid-url') return dom.charAt(0).toUpperCase();
    return 'U';
  }, [bookmark.title, bookmark.url]);

  const gradient = useMemo(() => {
    return getDeterministicGradient(bookmark.title || bookmark.url);
  }, [bookmark.title, bookmark.url]);

  const handleImgError = () => {
    if (candidateIndex + 1 < candidateUrls.length) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setCandidateIndex(candidateUrls.length); // trigger allImagesFailed
      onImageError(bookmark.id, true);
    }
  };

  return (
    <>
      <div className={`relative ${currentSize.container} ios-glass-card overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-active:scale-95 ${isDragging ? 'shadow-2xl border-[#c85a32]/40 dark:border-[#d36135]/40 scale-110' : ''}`}>
        {!allImagesFailed ? (
          <img 
            src={activeSrc} 
            alt={bookmark.title || 'Bookmark'}
            className={`${currentSize.icon} object-contain transition-transform duration-300 group-hover:scale-105 ${isEditMode ? 'pointer-events-none' : ''}`}
            draggable={false}
            onError={handleImgError}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center pointer-events-none select-none shadow-inner"
            style={{ background: gradient.bg, color: gradient.text }}
          >
            <span className={`font-sans-ui ${currentSize.avatarText} tracking-tight drop-shadow-md`}>
              {initialChar}
            </span>
          </div>
        )}
      </div>
      <span className={`${currentSize.text} font-medium text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 group-hover:text-[#1c1c1c] dark:group-hover:text-white text-center w-full truncate px-1.5 select-none transition-colors duration-200`}>
        {bookmark.title || extractDomain(bookmark.url) || 'Unnamed'}
      </span>
    </>
  );
}


