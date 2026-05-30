import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, RefreshCw } from 'lucide-react';
import { Bookmark } from '../types';

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
    container: 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl',
    icon: 'w-6 h-6 sm:w-7 sm:h-7',
    text: 'text-[10px] sm:text-xs font-sans-ui',
    buttonPadding: 'p-1',
    buttonIconSize: 11,
    gap: 'gap-1.5 sm:gap-2',
    overlayGap: 'gap-1',
  },
  md: {
    container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl',
    icon: 'w-9 h-9 sm:w-11 sm:h-11',
    text: 'text-xs sm:text-sm font-sans-ui',
    buttonPadding: 'p-1.5',
    buttonIconSize: 13,
    gap: 'gap-2 sm:gap-2.5',
    overlayGap: 'gap-1.5',
  },
  lg: {
    container: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl',
    icon: 'w-11 h-11 sm:w-14 sm:h-14',
    text: 'text-sm sm:text-base font-sans-ui',
    buttonPadding: 'p-2',
    buttonIconSize: 16,
    gap: 'gap-3 sm:gap-3.5',
    overlayGap: 'gap-2',
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
  } = useSortable({ id: bookmark.id, disabled: !isEditMode });

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
      className={`relative group flex flex-col items-center justify-start ${currentSize.gap} transition-all duration-300 ${isEditMode ? 'cursor-grab active:cursor-grabbing select-none' : 'hover:-translate-y-[2px]'}`}
    >
      {/* We use a div instead of "a" in edit mode to prevent drag conflicts with native anchor dragging */}
      {isEditMode ? (
        <div className={`w-full flex flex-col items-center justify-start ${currentSize.gap} pointer-events-none`}>
          <BookmarkContent bookmark={bookmark} isEditMode={isEditMode} isDragging={isDragging} onImageError={onImageError} iconSize={iconSize} />
        </div>
      ) : (
        <a 
          href={bookmark.url}
          className={`w-full flex flex-col items-center justify-start ${currentSize.gap}`}
          draggable={false}
        >
          <BookmarkContent bookmark={bookmark} isEditMode={isEditMode} isDragging={isDragging} onImageError={onImageError} iconSize={iconSize} />
        </a>
      )}

      {/* Edit Mode Overlay (Placed outside the anchor to handle clicks properly) */}
      {isEditMode && (
        <div className={`absolute top-0 left-0 ${currentSize.container} bg-black/60 backdrop-blur-[1px] flex items-center justify-center ${currentSize.overlayGap} animate-in fade-in duration-200 pointer-events-auto ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            onClick={(e) => onRefreshFavicon(e, bookmark.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className={`${currentSize.buttonPadding} bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-full hover:scale-110 transition-all shadow-md cursor-pointer`}
            title="Refresh Favicon"
          >
            <RefreshCw size={currentSize.buttonIconSize} />
          </button>
          <button 
            onClick={(e) => onDelete(e, bookmark.id)}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
            className={`${currentSize.buttonPadding} bg-zinc-800 hover:bg-zinc-950 dark:bg-zinc-200 dark:hover:bg-white text-zinc-100 dark:text-zinc-900 rounded-full hover:scale-110 transition-all shadow-md cursor-pointer`}
            title="Delete Bookmark"
          >
            <Trash2 size={currentSize.buttonIconSize} />
          </button>
        </div>
      )}
    </div>
  );
}

function BookmarkContent({ bookmark, isEditMode, isDragging, onImageError, iconSize }: { bookmark: Bookmark, isEditMode: boolean, isDragging: boolean, onImageError: (id: string, isError: boolean) => void, iconSize: 'sm' | 'md' | 'lg' }) {
  const [imgError, setImgError] = useState(false);
  const currentSize = sizeMap[iconSize] || sizeMap.md;

  useEffect(() => {
    setImgError(false);
    onImageError(bookmark.id, false);
  }, [bookmark.iconUrl, bookmark.id, onImageError]);

  return (
    <>
      <div className={`relative ${currentSize.container} bg-white/40 dark:bg-[#121314]/40 border border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10 group-hover:border-[#c85a32]/25 dark:group-hover:border-[#d36135]/25 group-hover:bg-white dark:group-hover:bg-[#121314] overflow-hidden flex items-center justify-center transition-all duration-300 ${isDragging ? 'shadow-md border-[#c85a32]/40 dark:border-[#d36135]/40 scale-105' : ''}`}>
        {!imgError ? (
          <img 
            src={bookmark.iconUrl} 
            alt={bookmark.title}
            className={`${currentSize.icon} object-contain transition-transform duration-300 group-hover:scale-105 ${isEditMode ? 'pointer-events-none' : ''}`}
            draggable={false}
            onError={() => {
              setImgError(true);
              onImageError(bookmark.id, true);
            }}
          />
        ) : (
          <span className="font-serif-display text-4xl italic font-semibold text-[#c85a32] dark:text-[#d36135] pointer-events-none select-none">
            {bookmark.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className={`${currentSize.text} font-medium text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 group-hover:text-[#1c1c1c] dark:group-hover:text-[#e5e5e1] text-center w-full truncate px-1.5 select-none transition-colors duration-200`}>
        {bookmark.title}
      </span>
    </>
  );
}
