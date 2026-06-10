import React, { useState } from 'react';
import { useLlmAnalysis } from '../../hooks/useLlmAnalysis';
import { AnalysisSkeleton } from './AnalysisSkeleton';
import { Sparkles, AlertTriangle, AlertOctagon, HelpCircle, Activity, RefreshCw } from 'lucide-react';

interface LlmAnalysisPanelProps {
  resultId: number;
}

export const LlmAnalysisPanel: React.FC<LlmAnalysisPanelProps> = ({ resultId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate, data, isPending, isError, error, reset } = useLlmAnalysis();

  const handleRequestAnalysis = () => {
    setIsOpen(true);
    mutate(resultId);
  };

  const handleRequery = () => {
    reset();
    mutate(resultId);
  };

  // Get color configurations for LLM Urgency badge
  const getUrgencyStyles = (level?: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return {
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <AlertOctagon className="h-4 w-4 text-rose-700" />,
          label: 'Kritik Derecede Acil',
        };
      case 'URGENT':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <AlertTriangle className="h-4 w-4 text-amber-700" />,
          label: 'Yüksek Aciliyet',
        };
      case 'ROUTINE':
      default:
        return {
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Activity className="h-4 w-4 text-slate-500" />,
          label: 'Rutin / Stabil',
        };
    }
  };

  if (!isOpen) {
    return (
      <div className="glass-panel space-y-4 rounded-[24px] p-6 text-center bg-white border border-slate-200 shadow-sm">
        <div className="mx-auto flex w-14 items-center justify-center rounded-2xl border border-yeka-blue/20 bg-yeka-blue/5 p-3.5">
          <Sparkles className="h-7 w-7 text-yeka-blue" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">Yapay Zeka Destekli Klinik Ön Analiz</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Bu test sonucu için klinik özet, olası tanı olasılıkları ve önerilen takip adımlarını içeren anlık yapay zeka değerlendirmesi talep edin.
          </p>
        </div>
        <button
          onClick={handleRequestAnalysis}
          className="yeka-button-primary inline-flex items-center gap-2 px-6 py-3 text-sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>Yapay Zeka Analiz Raporu Talep Et</span>
        </button>
      </div>
    );
  }

  const urgency = getUrgencyStyles(data?.urgencyLevel);

  return (
    <div className="glass-panel relative overflow-hidden rounded-[24px] p-6 bg-white border border-slate-200 shadow-sm">
      {isPending && <AnalysisSkeleton />}

      {isError && (
        <div className="space-y-4 text-center">
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm max-w-md mx-auto">
            Analiz işlemi beklenmedik bir hatadan dolayı tamamlanamadı. Lütfen tekrar deneyin.
            <div className="text-xs text-red-500 font-mono mt-1">{error?.message}</div>
          </div>
          <button
            onClick={handleRequery}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-550 hover:bg-slate-650 text-white font-semibold px-4 py-2 text-xs transition border border-transparent shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Yeniden Dene</span>
          </button>
        </div>
      )}

      {data && (
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yeka-blue" />
              <span>Yapay Zeka Değerlendirme Raporu</span>
            </h3>
            
            <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold ${urgency.badge}`}>
              {urgency.icon}
              <span>{urgency.label}</span>
            </span>
          </div>

          {/* Offline Connection Warning Banner */}
          {!data.llmAvailable && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-xs flex gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Bağlantı Uyarısı:</strong> Yapay Zeka Servisi (Ollama) ile bağlantı kurulamadı. Aşağıdaki klinik ön analiz, yerel kurallara göre oluşturulmuş otomatik şablondur.
              </span>
            </div>
          )}
 
          {/* Clinical Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Klinik Değerlendirme</h4>
            <p className="text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl shadow-inner">
              {data.clinicalSummary}
            </p>
          </div>
 
          {/* Suggested Actions */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Önerilen Klinik Takip Adımları</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              {data.suggestedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center rounded-full bg-yeka-blue/10 text-yeka-blue h-5 w-5 font-bold text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="font-semibold text-slate-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
 
          {/* Differential Hints */}
          {data.differentialHints && data.differentialHints.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
                <span>Olası Klinik Odaklar (Ön Tanı Seçenekleri)</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.differentialHints.map((hint, index) => (
                  <span
                    key={index}
                    className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          )}
 
          {/* Disclaimer & Re-query */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-slate-100 pt-4">
            <p className="text-[10px] text-slate-400 italic max-w-md font-semibold leading-relaxed">
              {data.disclaimer}
            </p>
            <button
              onClick={handleRequery}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-650 hover:text-slate-800 font-bold px-3.5 py-2 text-xs transition border border-slate-200 shadow-sm self-end sm:self-center"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Yeniden Analiz Et</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
