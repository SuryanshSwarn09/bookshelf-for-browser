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
  'Reference',
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
        className="w-full max-w-md ios-glass-modal text-[#1c1c1c] dark:text-[#e5e5e1] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb]/10 dark:bg-[#3b82f6]/20 flex items-center justify-center text-[#2563eb] dark:text-[#3b82f6]">
              <FolderPlus size={16} />
            </div>
            <div>
              <h2 id="create-section-title" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                New category
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize shortcuts into workflow sections
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-sans-ui text-slate-700 dark:text-slate-300 mb-1.5 font-medium">
              Category name <span className="text-[#2563eb]">*</span>
            </label>
            <div className="relative flex items-center">
              <FolderPlus size={15} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Work, Dev Tools, Reference"
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-lg ios-glass-input text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-sans-ui text-xs outline-none"
              />
              {sectionName && (
                <button
                  type="button"
                  onClick={() => setSectionName('')}
                  className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer rounded"
                  title="Clear"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-sans-ui text-slate-500 dark:text-slate-400 mb-2 font-medium">
              <span>Suggestions:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SUGGESTIONS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-sans-ui transition-all cursor-pointer border active:scale-95 ${
                    sectionName === preset
                      ? 'bg-[#2563eb] text-white border-transparent font-medium shadow-sm'
                      : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/5 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#2563eb]/40'
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
              className="flex-1 py-2.5 px-4 rounded-lg ios-glass-pill text-xs font-sans-ui font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer active:scale-95 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!sectionName.trim()}
              className="flex-[2] py-2.5 px-4 bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white rounded-lg font-sans-ui text-xs font-medium shadow-sm active:scale-98 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb]"
            >
              <span>Create category</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

