import React, { useState } from 'react';
import { X } from 'lucide-react';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (sectionName: string) => void;
}

export const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
}) => {
  const [sectionName, setSectionName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) return;
    onAddSection(sectionName);
    setSectionName('');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-section-title"
    >
      <div
        className="w-full max-w-sm bg-[#faf8f5]/95 dark:bg-[#121314]/95 backdrop-blur-2xl text-[#1c1c1c] dark:text-[#e5e5e1] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/15"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 flex items-center justify-between border-b border-[#1c1c1c]/10 dark:border-[#e5e5e1]/10">
          <h2 id="create-section-title" className="text-2xl font-serif-display font-medium text-[#1c1c1c] dark:text-[#e5e5e1]">
            Create Section
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              Section Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Work, Priorities, Recipes"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-[#1c1e22] border border-[#1c1c1c]/15 dark:border-[#e5e5e1]/20 text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#c85a32] dark:focus:border-[#d36135] focus:ring-2 focus:ring-[#c85a32]/20 dark:focus:ring-[#d36135]/20 transition-all text-xs font-sans-ui"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!sectionName.trim()}
              className="w-full py-3 px-4 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-2xl font-sans-ui font-semibold shadow-md active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c85a32]"
            >
              CREATE SECTION
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
