import React from 'react';
import { Bookmark } from '../types';

interface CategoryTabsProps {
  sections: string[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  bookmarks: Bookmark[];
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  sections,
  activeSection,
  setActiveSection,
  bookmarks,
}) => {
  return (
    <nav 
      className="w-full flex flex-wrap gap-1.5 p-1.5 rounded-xl ios-glass-pill select-none shadow-sm"
      aria-label="Bookmark Categories Navigation"
    >
      <button
        onClick={() => setActiveSection('All')}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-sans-ui transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] ${
          activeSection === 'All'
            ? 'bg-[#2563eb] text-white font-medium shadow-sm'
            : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
        }`}
        aria-current={activeSection === 'All' ? 'page' : undefined}
      >
        All
      </button>
      {sections.map((section) => {
        const sectionCount = bookmarks.filter(b => (b.category || 'General') === section).length;
        const isActive = activeSection === section;
        return (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-sans-ui transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] ${
              isActive
                ? 'bg-[#2563eb] text-white font-medium shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{section}</span>
            <span
              className={`text-[10px] font-mono-ui px-1.5 py-0.5 rounded-md font-medium ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-black/5 dark:bg-white/10 text-slate-500 dark:text-slate-400'
              }`}
            >
              {sectionCount}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
