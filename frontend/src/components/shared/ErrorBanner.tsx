import { AlertTriangle } from 'lucide-react';

interface Props {
  message: string;
}

export default function ErrorBanner({ message }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-red-700">
      <AlertTriangle className="h-5 w-5 shrink-0" />
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}
