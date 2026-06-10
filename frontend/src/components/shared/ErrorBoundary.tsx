import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React application crash:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-4">
            <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-2xl w-14 h-14 mx-auto flex items-center justify-center text-rose-450 text-xl font-bold">
              ⚠️
            </div>
            <h1 className="text-xl font-bold text-white">Arayüz Yüklenemedi</h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Beklenmeyen bir istemci kod hatası tespit edildi. Lütfen tarayıcıyı yenilemeyi deneyin veya oturumu kapatın.
            </p>
            <div className="text-[10px] text-slate-600 font-mono text-left bg-slate-950 border border-slate-850 p-3 rounded-lg max-h-24 overflow-auto">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => {
                // Clear session and reload
                localStorage.clear();
                window.location.href = '/';
              }}
              className="w-full rounded-xl bg-indigo-650 hover:bg-indigo-550 text-white font-bold py-3 text-xs transition duration-200"
            >
              Sistemi Yenile ve Yeniden Başlat
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
