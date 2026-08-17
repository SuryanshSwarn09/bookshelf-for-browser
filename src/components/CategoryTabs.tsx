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
      className="w-full flex flex-wrap gap-1.5 p-1.5 rounded-2xl ios-glass-pill select-none"
      aria-label="Bookmark Categories Navigation"
    >
      <button
        onClick={() => setActiveSection('All')}
        className={`px-4 py-1.5 rounded-xl text-xs font-mono-ui transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32] ${
          activeSection === 'All'
            ? 'bg-[#c85a32] text-white font-bold shadow-md'
            : 'text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:bg-black/5 dark:hover:bg-white/10'
        }`}
        aria-current={activeSection === 'All' ? 'page' : undefined}
      >
        ALL
      </button>
      {sections.map((section) => {
        const sectionCount = bookmarks.filter(b => (b.category || 'General') === section).length;
        const isActive = activeSection === section;
        return (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-mono-ui transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32] ${
              isActive
                ? 'bg-[#c85a32] text-white font-bold shadow-md'
                : 'text-[#1c1c1c]/70 dark:text-[#e5e5e1]/70 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span>{section.toUpperCase()}</span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold ${
                isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-black/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-300'
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
