export default function AnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Analiz yükleniyor">
      {/* Header shimmer */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-200" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
        </div>
      </div>

      {/* Body shimmer lines */}
      <div className="space-y-2 pt-2">
        <div className="h-3 w-full rounded bg-slate-200" />
        <div className="h-3 w-5/6 rounded bg-slate-100" />
        <div className="h-3 w-4/6 rounded bg-slate-200" />
      </div>

      {/* Tags shimmer */}
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-20 rounded-full bg-slate-200" />
        <div className="h-6 w-24 rounded-full bg-slate-100" />
        <div className="h-6 w-16 rounded-full bg-slate-200" />
      </div>

      {/* Footer shimmer */}
      <div className="h-16 w-full rounded-xl bg-slate-100 mt-4" />
    </div>
  );
}
