import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, RotateCcw, AlertTriangle } from 'lucide-react';

declare const chrome: any;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public props: Props;

  constructor(props: Props) {
    super(props);
    this.props = props;
  }

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Bookshelf ErrorBoundary caught error]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    try {
      localStorage.clear();
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync?.clear();
        chrome.storage.local?.clear();
      }
    } catch (e) {
      console.error('Failed clearing storage', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#121314] text-[#e5e5e1] p-6 text-center select-none font-sans">
          <div className="max-w-md w-full ios-glass-card p-8 rounded-3xl backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-1">
              <AlertTriangle size={32} />
            </div>

            <h2 className="text-2xl font-semibold tracking-tight">Something went wrong</h2>
            <p className="text-sm text-stone-400 leading-relaxed">
              Bookshelf encountered an unexpected error. Your saved bookmarks remain safely stored.
            </p>

            {this.state.error?.message && (
              <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs font-mono text-stone-400 text-left overflow-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-sm font-medium rounded-2xl transition-all cursor-pointer border border-white/10"
              >
                <RefreshCw size={16} />
                Reload Page
              </button>

              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/80 hover:bg-red-600 active:scale-95 text-white text-sm font-medium rounded-2xl transition-all cursor-pointer border border-red-500/30"
              >
                <RotateCcw size={16} />
                Reset Data
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
