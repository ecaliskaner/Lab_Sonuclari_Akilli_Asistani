import React, { useState } from 'react';
import type { LabResult } from '../../types/labResult';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Shield, HelpCircle, Terminal, User, Cpu, Calendar } from 'lucide-react';
import { AbnormalityBadge } from './AbnormalityBadge';

interface ResultDetailCardProps {
  result: LabResult;
}

export const ResultDetailCard: React.FC<ResultDetailCardProps> = ({ result }) => {
  const [showRaw, setShowRaw] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy - HH:mm', { locale: tr });
    } catch {
      return dateString;
    }
  };
  // Calculate coordinates for the Visual Range Indicator
  const renderRangeIndicator = () => {
    const val = result.value;
    const min = result.referenceMin;
    const max = result.referenceMax;

    if (val === null || min === null || max === null) {
      return (
        <div className="text-slate-400 text-xs italic">
          Bu test için referans aralığı grafiği çizilemiyor.
        </div>
      );
    }

    // Determine bounds for the visual slider track:
    // We want the track to represent [min * 0.5, max * 1.5]
    const trackMin = Math.min(val, min * 0.5);
    const trackMax = Math.max(val, max * 1.5);
    const span = trackMax - trackMin;

    if (span <= 0) return null;

    const valuePercent = ((val - trackMin) / span) * 100;
    const minPercent = ((min - trackMin) / span) * 100;
    const maxPercent = ((max - trackMin) / span) * 100;

    let markerColor = 'bg-emerald-500';
    if (result.severity.startsWith('CRITICAL')) {
      markerColor = 'bg-rose-500';
    } else if (result.severity === 'LOW' || result.severity === 'HIGH') {
      markerColor = 'bg-amber-500';
    }

    return (
      <div className="mt-6">
        <div className="flex justify-between text-xs text-slate-400 font-medium mb-2">
          <span>Kritik Eşik Altı ({Math.round(trackMin * 10) / 10})</span>
          <span>Kritik Eşik Üstü ({Math.round(trackMax * 10) / 10})</span>
        </div>
        
        {/* Track */}
        <div className="relative h-4 w-full bg-slate-100 rounded-full border border-slate-200 overflow-visible flex items-center">
          
          {/* Normal Zone (Green) */}
          <div
            className="absolute h-2.5 bg-emerald-500/10 border-x border-emerald-500/20"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />

          {/* Reference Min line & tag */}
          <div
            className="absolute h-5 border-l-2 border-slate-300 flex flex-col justify-end"
            style={{ left: `${minPercent}%` }}
          >
            <span className="absolute top-5 -translate-x-1/2 text-[10px] font-bold text-slate-400">
              Min ({min})
            </span>
          </div>

          {/* Reference Max line & tag */}
          <div
            className="absolute h-5 border-l-2 border-slate-300 flex flex-col justify-end"
            style={{ left: `${maxPercent}%` }}
          >
            <span className="absolute top-5 -translate-x-1/2 text-[10px] font-bold text-slate-400">
              Max ({max})
            </span>
          </div>

          {/* Patient Value Marker */}
          <div
            className="absolute z-10 flex flex-col items-center group cursor-pointer top-1/2 -translate-y-1/2"
            style={{ left: `${valuePercent}%` }}
          >
            <div className={`h-4.5 w-4.5 rounded-full ${markerColor} border-2 border-white shadow-md`} />
            <span className="absolute -top-8 -translate-x-1/2 bg-slate-900 border border-slate-950 rounded px-1.5 py-0.5 text-xs font-bold text-white shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none scale-90 group-hover:scale-100">
              {val} {result.unit}
            </span>
          </div>
        </div>
        <div className="h-6" /> {/* spacer for labels */}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-xs text-yeka-blue font-bold tracking-wider uppercase">Laboratuvar Sonuç Raporu</span>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mt-1">
            {result.testName} <span className="text-slate-400 font-semibold text-sm">({result.testCode})</span>
          </h2>
        </div>
        <AbnormalityBadge severity={result.severity} />
      </div>

      {/* Grid Specs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Patient Profile */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <User className="h-4 w-4 text-yeka-blue" />
            <span>Hasta Bilgileri</span>
          </h3>
          <div className="space-y-1 text-sm font-medium">
            <div className="flex justify-between"><span className="text-slate-400">Hasta Ref. No:</span> <span className="text-slate-800">{result.patientRef}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Yaş:</span> <span className="text-slate-800">{result.patientAge ?? 'Bilinmiyor'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Cinsiyet:</span> <span className="text-slate-800">{result.patientGender === 'M' ? 'Erkek' : 'Kadın'}</span></div>
          </div>
        </div>

        {/* Test Result Data */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Shield className="h-4 w-4 text-yeka-blue" />
            <span>Analiz Değerleri</span>
          </h3>
          <div className="space-y-1 text-sm font-medium">
            <div className="flex justify-between"><span className="text-slate-400">Ölçüm Değeri:</span> <span className="text-slate-800 font-bold">{result.value} {result.unit}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Referans Aralığı:</span> <span className="text-slate-800">{result.referenceMin} - {result.referenceMax} {result.unit}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Sonuç Durumu:</span> <span className="text-slate-800 uppercase">{result.status}</span></div>
          </div>
        </div>

        {/* Device Metadata */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
            <Cpu className="h-4 w-4 text-yeka-blue" />
            <span>Cihaz Bilgisi</span>
          </h3>
          <div className="space-y-1 text-sm font-medium">
            <div className="flex justify-between"><span className="text-slate-400">Cihaz Modeli:</span> <span className="text-slate-800 truncate max-w-[150px]">{result.deviceModel}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Cihaz ID'si:</span> <span className="text-slate-800">{result.deviceId}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Sonuç Benzersiz No:</span> <span className="text-slate-800 text-xs font-mono">{result.resultId.substring(0, 8)}...</span></div>
          </div>
        </div>
      </div>

      {/* Visual Indicator Container */}
      <div className="border border-slate-200 bg-slate-50/50 p-5 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-2">
          <HelpCircle className="h-4 w-4 text-slate-400" />
          <span>Referans Değer Analiz Göstergesi</span>
        </h4>
        {renderRangeIndicator()}
      </div>

      {/* Timestamps */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between text-xs text-slate-400 font-semibold border-t border-slate-100 pt-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          <span>Örnek Alım Tarihi: {formatDate(result.collectedAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          <span>Cihaz Raporlama Tarihi: {formatDate(result.reportedAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-300" />
          <span>Sisteme Giriş Tarihi: {formatDate(result.ingestedAt)}</span>
        </div>
      </div>

      {/* Developer Raw JSON drawer */}
      <div className="border-t border-slate-100 pt-4">
        <button
          onClick={() => setShowRaw(!showRaw)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition font-bold"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span>{showRaw ? 'Ham Cihaz Verisini Gizle' : 'Ham Cihaz Verisini Göster (Geliştirici JSON)'}</span>
        </button>
        
        {showRaw && (
          <div className="mt-3 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs overflow-x-auto text-slate-650 font-mono leading-relaxed max-h-48 shadow-inner">
            {JSON.stringify(JSON.parse(result.rawPayload), null, 2)}
          </div>
        )}
      </div>
    </div>
  );
};
