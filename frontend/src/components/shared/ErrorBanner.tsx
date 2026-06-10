import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1 text-xs font-bold text-red-700 hover:text-red-900 border border-red-300 hover:border-red-400 bg-white hover:bg-red-50/50 rounded-xl px-3 py-1.5 shadow-sm transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Yeniden Dene</span>
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;
