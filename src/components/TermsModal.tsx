import React from 'react';
import { X, FileText, CheckCircle, Scale, AlertCircle } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-conditions-title"
    >
      <div
        className="w-full max-w-xl ios-glass-modal text-[#1c1c1c] dark:text-[#e5e5e1] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#c85a32]/10 dark:bg-[#d36135]/20 flex items-center justify-center text-[#c85a32] dark:text-[#d36135]">
              <FileText size={16} />
            </div>
            <div>
              <h2 id="terms-conditions-title" className="text-xl font-serif-display font-medium tracking-tight text-[#1c1c1c] dark:text-[#e5e5e1]">
                Terms & Conditions
              </h2>
              <p className="text-[11px] font-mono-ui text-zinc-500 dark:text-zinc-400">
                Open-source license agreement and software terms
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[#1c1c1c]/90 dark:text-[#e5e5e1]/90 font-sans-ui leading-relaxed">
          <div className="p-3.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-start gap-3">
            <Scale size={16} className="text-[#c85a32] dark:text-[#d36135] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs text-[#1c1c1c] dark:text-white">Summary of Terms</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                Bookshelf is free and open-source software provided under the MIT License. You are free to use it for personal or commercial workflows without subscription fees or lock-in.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-mono-ui flex items-center gap-1.5">
              <CheckCircle size={13} />
              <span>1. Permitted Usage</span>
            </h3>
            <p>
              You may install, run, modify, and distribute Bookshelf as a web application or browser extension for personal or commercial use. You agree not to use the software for unlawful activities or to distribute malicious payloads through imported backups.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-mono-ui flex items-center gap-1.5">
              <Scale size={13} />
              <span>2. Intellectual Property & Your Content</span>
            </h3>
            <p>
              You own all rights, title, and interest in the shortcuts, categories, and personal data you store in Bookshelf. Bookshelf claims no ownership, license, or rights over your bookmark URLs, titles, or browsing habits.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-mono-ui flex items-center gap-1.5">
              <AlertCircle size={13} />
              <span>3. Disclaimer of Warranty</span>
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-mono-ui flex items-center gap-1.5">
              <FileText size={13} />
              <span>4. Data Backup Responsibility</span>
            </h3>
            <p>
              Because Bookshelf is a client-side, local-first utility, you are responsible for maintaining your own backups via the built-in JSON export feature. We recommend periodic exports before clearing browser site data or resetting extension storage.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#c85a32] hover:bg-[#b04925] dark:bg-[#d36135] dark:hover:bg-[#e07248] text-white text-xs font-mono-ui font-semibold shadow-sm transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c85a32]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
