import React from 'react';
import { X, ShieldCheck, Database, EyeOff, Lock, Download } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
    >
      <div
        className="w-full max-w-xl ios-glass-modal text-[#1c1c1c] dark:text-[#e5e5e1] rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-black/5 dark:border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2563eb]/10 dark:bg-[#3b82f6]/20 flex items-center justify-center text-[#2563eb] dark:text-[#3b82f6]">
              <ShieldCheck size={15} />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Privacy policy
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Local-first architecture and transparent data guarantees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 rounded-lg transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
            aria-label="Close modal"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-3.5 text-xs text-[#1c1c1c]/90 dark:text-[#e5e5e1]/90 font-sans-ui leading-relaxed">
          <div className="p-3 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-start gap-2.5">
            <Lock size={15} className="text-[#2563eb] dark:text-[#3b82f6] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs text-[#1c1c1c] dark:text-white">The Core Principle</p>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-0.5">
                Bookshelf is designed as an offline-capable, local-first dashboard. Your data belongs entirely to you, remains on your machine, and is never sold, indexed, or monetized.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-mono-ui flex items-center gap-1.5">
              <Database size={13} />
              <span>1. Data Storage & Persistence</span>
            </h3>
            <p>
              All bookmarks, custom categories, theme preferences, and wallpaper configurations are stored locally on your device:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li><strong>Web Deployment:</strong> Data is persisted in your browser's <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">window.localStorage</code>.</li>
              <li><strong>Browser Extension Mode:</strong> Data is stored via <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">chrome.storage.sync</code> (enabling cross-device sync strictly through your personal browser account) or <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">chrome.storage.local</code>.</li>
              <li>No external application databases or remote servers receive or store your bookmarks.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-mono-ui flex items-center gap-1.5">
              <EyeOff size={13} />
              <span>2. Telemetry, Tracking & Analytics</span>
            </h3>
            <p>
              Bookshelf contains <strong>zero third-party trackers</strong>, advertising SDKs, session recording tools, or telemetry beacons. We do not track your browsing habits, click-through rates, search queries, or visited domains.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-mono-ui flex items-center gap-1.5">
              <ShieldCheck size={13} />
              <span>3. External Network Requests</span>
            </h3>
            <p>
              The only outbound network requests performed by the application are:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li><strong>Favicon Resolution:</strong> When you add a shortcut, an image request is sent to public favicon endpoints (e.g., Google Favicon API or DuckDuckGo). Only the target domain is included in the query (for example, <code className="bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded font-mono">google.com/s2/favicons?domain=example.com</code>). No user credentials or personal identifiers are attached.</li>
              <li><strong>Google Fonts:</strong> Typographic stylesheets for the Poppins font family are loaded from Google Fonts via standard web caching.</li>
              <li><strong>Custom Wallpaper URLs:</strong> If you supply a custom wallpaper URL, your browser fetches that image directly from the specified host.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-zinc-600 dark:text-zinc-400 font-mono-ui flex items-center gap-1.5">
              <Download size={13} />
              <span>4. Data Portability & Deletion</span>
            </h3>
            <p>
              You maintain uninhibited control over your data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400 text-[11px]">
              <li><strong>Export:</strong> Download a full, structured JSON copy of all saved bookmarks and sections at any moment.</li>
              <li><strong>Import:</strong> Restore or migrate backups across browsers with strict runtime validation.</li>
              <li><strong>Wipe:</strong> Clearing your browser history, site data, or uninstalling the extension permanently removes all stored data from your local system.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/10 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-[#3b82f6] dark:hover:bg-[#2563eb] text-white text-xs font-sans-ui font-medium shadow-sm transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
