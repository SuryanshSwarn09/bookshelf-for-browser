import React, { useState } from 'react';
import { X, FolderPlus, Sparkles, ArrowRight } from 'lucide-react';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (sectionName: string) => void;
}

const PRESET_SUGGESTIONS = [
  'Work',
  'Dev Tools',
  'Design',
  'AI Tools',
  'Reading',
  'Media',
  'Finance',
  'Social',
];

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

  const handleSelectPreset = (preset: string) => {
    setSectionName(preset);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-section-title"
    >
      <div
        className="w-full max-w-md ios-glass-modal text-[#1c1c1c] dark:text-[#e5e5e1] rounded-[28px] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#c85a32]/10 dark:bg-[#d36135]/20 flex items-center justify-center text-[#c85a32] dark:text-[#d36135]">
              <FolderPlus size={16} />
            </div>
            <div>
              <h2 id="create-section-title" className="text-xl font-serif-display font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1]">
                New Category
              </h2>
              <p className="text-[11px] font-mono-ui text-zinc-500 dark:text-zinc-400">
                Organize shortcuts into workflow sections
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-sans-ui text-[#1c1c1c]/80 dark:text-[#e5e5e1]/90 mb-1.5 uppercase tracking-wider font-semibold">
              Category Name <span className="text-[#c85a32]">*</span>
            </label>
            <div className="relative flex items-center">
              <FolderPlus size={15} className="absolute left-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Work, AI Tools, Recipes"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl ios-glass-input text-[#1c1c1c] dark:text-[#e5e5e1] placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-sans-ui text-xs outline-none"
              />
              {sectionName && (
                <button
                  type="button"
                  onClick={() => setSectionName('')}
                  className="absolute right-3 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer rounded-full"
                  title="Clear"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-sans-ui text-zinc-500 dark:text-zinc-400 mb-2 font-medium">
              <Sparkles size={11} className="text-[#c85a32]" />
              <span>Quick suggestions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SUGGESTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-mono-ui transition-all cursor-pointer border active:scale-95 ${
                    sectionName === preset
                      ? 'bg-[#c85a32] text-white border-transparent font-bold'
                      : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/5 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-[#c85a32]/50'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl ios-glass-pill text-xs font-mono-ui font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 text-center"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={!sectionName.trim()}
              className="flex-[2] py-3 px-4 bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white rounded-2xl font-sans-ui text-xs font-semibold shadow-lg shadow-[#c85a32]/25 active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c85a32]"
            >
              <span>CREATE CATEGORY</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

