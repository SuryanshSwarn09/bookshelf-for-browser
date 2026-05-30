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
    container: 'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl',
    icon: 'w-7 h-7 sm:w-8 sm:h-8',
    text: 'text-[10px] sm:text-xs',
    buttonPadding: 'p-1',
    buttonIconSize: 11,
    gap: 'gap-1 sm:gap-1.5',
    overlayGap: 'gap-1',
  },
  md: {
    container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl',
    icon: 'w-10 h-10 sm:w-12 sm:h-12',
    text: 'text-xs sm:text-sm',
    buttonPadding: 'p-1.5',
    buttonIconSize: 14,
    gap: 'gap-2 sm:gap-2.5',
    overlayGap: 'gap-1.5',
  },
  lg: {
    container: 'w-20 h-20 sm:w-24 sm:h-24 rounded-3xl',
    icon: 'w-12 h-12 sm:w-16 sm:h-16',
    text: 'text-sm sm:text-base',
    buttonPadding: 'p-2',
    buttonIconSize: 18,
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
      className={`relative group flex flex-col items-center justify-start ${currentSize.gap} transition-transform ${isEditMode ? 'cursor-grab active:cursor-grabbing select-none' : 'hover:-translate-y-1'}`}
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
        <div className={`absolute top-0 left-0 ${currentSize.container} bg-black/40 backdrop-blur-[2px] flex items-center justify-center ${currentSize.overlayGap} animate-in fade-in duration-200 pointer-events-auto ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
          <button 
            onClick={(e) => onRefreshFavicon(e, bookmark.id)}
            onPointerDown={(e) => e.stopPropagation()}
            className={`${currentSize.buttonPadding} bg-[#4285F4] text-white rounded-full hover:bg-blue-600 hover:scale-110 transition-all shadow-lg cursor-pointer`}
            title="Refresh Favicon"
          >
            <RefreshCw size={currentSize.buttonIconSize} />
          </button>
          <button 
            onClick={(e) => onDelete(e, bookmark.id)}
            onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking delete
            className={`${currentSize.buttonPadding} bg-red-500 text-white rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg cursor-pointer`}
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
      <div className={`relative ${currentSize.container} bg-white dark:bg-zinc-800 shadow-sm border border-black/5 dark:border-white/5 overflow-hidden flex items-center justify-center group-hover:shadow-md transition-all ${isDragging ? 'shadow-xl scale-110' : ''} ${imgError ? 'fallback-bg bg-gray-200 dark:bg-gray-800' : ''}`}>
        {!imgError ? (
          <img 
            src={bookmark.iconUrl} 
            alt={bookmark.title}
            className={`${currentSize.icon} object-contain ${isEditMode ? 'pointer-events-none' : ''}`}
            draggable={false}
            onError={() => {
              setImgError(true);
              onImageError(bookmark.id, true);
            }}
          />
        ) : (
          <span className="font-bold text-2xl text-zinc-400 dark:text-zinc-500 pointer-events-none">
            {bookmark.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span className={`${currentSize.text} font-medium text-zinc-700 dark:text-zinc-300 text-center w-full truncate px-1 select-none`}>
        {bookmark.title}
      </span>
    </>
  );
}
