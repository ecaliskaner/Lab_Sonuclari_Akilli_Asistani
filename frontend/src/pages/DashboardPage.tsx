import React, { useState } from 'react';
import { useLabResults, useTestCodes, useLabResultsStats } from '../hooks/useLabResults';
import { LabResultTable } from '../components/lab/LabResultTable';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import {
  Activity,
  AlertTriangle,
  Calendar,
  ClipboardList,
  Filter,
  RefreshCw,
  TestTube2,
  User,
  X,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [severity, setSeverity] = useState<string>('');
  const [testCode, setTestCode] = useState<string>('');
  const [patientRef, setPatientRef] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const { data: testCodes } = useTestCodes();

  const { data, isLoading, isError, refetch } = useLabResults({
    page,
    size: 10,
    severity: severity || undefined,
    testCode: testCode || undefined,
    patientRef: patientRef || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const { data: statsData, refetch: refetchStats } = useLabResultsStats({
    severity: severity || undefined,
    testCode: testCode || undefined,
    patientRef: patientRef || undefined,
    from: from || undefined,
    to: to || undefined,
  });

  const handleRefreshAll = () => {
    refetch();
    refetchStats();
  };

  const handleClearFilters = () => {
    setSeverity('');
    setTestCode('');
    setPatientRef('');
    setFrom('');
    setTo('');
    setPage(0);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (data && page < data.totalPages - 1) setPage(page + 1);
  };

  const hasFilters = Boolean(severity || testCode || patientRef || from || to);

  const totalCount = statsData?.totalCount ?? (data?.totalElements ?? 0);
  const abnormalCount = statsData?.abnormalCount ?? 0;
  const criticalCount = statsData?.criticalCount ?? 0;

  const stats = [
    {
      label: 'Toplam Kayıt',
      value: (statsData || data) ? totalCount.toLocaleString('tr-TR') : '--',
      detail: 'Filtreye uygun toplam bulgu',
      icon: ClipboardList,
      tone: 'text-yeka-blue',
    },
    {
      label: 'Anormal Bulgular',
      value: statsData ? abnormalCount.toLocaleString('tr-TR') : '--',
      detail: 'Filtreye uygun anormal bulgular',
      icon: AlertTriangle,
      tone: abnormalCount > 0 ? 'text-amber-600' : 'text-emerald-600',
    },
    {
      label: 'Kritik Bulgular',
      value: statsData ? criticalCount.toLocaleString('tr-TR') : '--',
      detail: 'Öncelikli incelenmesi gerekenler',
      icon: Activity,
      tone: criticalCount > 0 ? 'text-rose-600' : 'text-slate-500',
    },
    {
      label: 'Test Tipi Sayısı',
      value: (testCodes?.length ?? 0).toString(),
      detail: 'Katalogdaki toplam test çeşidi',
      icon: TestTube2,
      tone: 'text-cyan-600',
    },
  ];

  return (
    <div className="space-y-6">
      <section className="yeka-card overflow-hidden p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-yeka-blue/20 bg-yeka-blue/5 px-3 py-1 text-[11px] font-black text-yeka-blue">
              LABORATUVAR AKIŞI AKTİF
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
              Klinik Bulgular Paneli
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              Laboratuvar cihazlarından gelen sonuçları takip edin, anormal değerleri hızla ayırt edin ve seçilen kayıtlar için yerel yapay zeka ön analizini görüntüleyin.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {hasFilters && (
              <button onClick={handleClearFilters} className="yeka-button-ghost flex items-center gap-1.5">
                <X className="h-3.5 w-3.5" />
                <span>Temizle</span>
              </button>
            )}
            <button onClick={handleRefreshAll} className="yeka-button-primary flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Yenile</span>
            </button>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  {stat.label}
                </span>
                <stat.icon className={`h-4.5 w-4.5 ${stat.tone}`} />
              </div>
              <p className={`text-3xl font-black tracking-tight ${stat.tone}`}>{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="glass-panel space-y-4 rounded-[24px] p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Filter className="h-4.5 w-4.5 text-yeka-blue" />
          <span>Gelişmiş Arama Filtreleri</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Hasta Referans No</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-3.5 w-3.5 text-slate-550" />
              </span>
              <input
                type="text"
                value={patientRef}
                onChange={(event) => {
                  setPatientRef(event.target.value);
                  setPage(0);
                }}
                placeholder="Örn: PT-00042"
                className="yeka-input pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Anormallik Seviyesi</label>
            <select
              value={severity}
              onChange={(event) => {
                setSeverity(event.target.value);
                setPage(0);
              }}
              className="yeka-input"
            >
              <option value="">Tümü</option>
              <option value="NORMAL">Normal</option>
              <option value="LOW">Düşük</option>
              <option value="HIGH">Yüksek</option>
              <option value="CRITICAL_LOW">Kritik Düşük</option>
              <option value="CRITICAL_HIGH">Kritik Yüksek</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Test Tipi / Kodu</label>
            <select
              value={testCode}
              onChange={(event) => {
                setTestCode(event.target.value);
                setPage(0);
              }}
              className="yeka-input"
            >
              <option value="">Tümü</option>
              {testCodes?.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Başlangıç Tarihi</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-3.5 w-3.5 text-slate-550" />
              </span>
              <input
                type="date"
                value={from}
                onChange={(event) => {
                  setFrom(event.target.value);
                  setPage(0);
                }}
                className="yeka-input pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Bitiş Tarihi</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Calendar className="h-3.5 w-3.5 text-slate-550" />
              </span>
              <input
                type="date"
                value={to}
                onChange={(event) => {
                  setTo(event.target.value);
                  setPage(0);
                }}
                className="yeka-input pl-9"
              />
            </div>
          </div>
        </div>

        {hasFilters && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 transition hover:text-rose-700"
            >
              <X className="h-3.5 w-3.5" />
              <span>Filtreleri Temizle</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="py-24">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {isError && (
          <ErrorBanner
            message="Laboratuvar sonuçları backend sunucusundan alınamadı. Lütfen ağ bağlantısını veya sunucunun ayakta olup olmadığını kontrol edin."
            onRetry={handleRefreshAll}
          />
        )}

        {data && (
          <>
            <LabResultTable results={data.content} />

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pb-2 pt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  className="yeka-button-ghost disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Önceki Sayfa
                </button>
                <div className="text-xs font-bold text-slate-500">
                  Sayfa {page + 1} / {data.totalPages} <span className="mx-1.5 text-slate-350">|</span> Toplam {data.totalElements} Kayıt
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={page >= data.totalPages - 1}
                  className="yeka-button-ghost disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Sonraki Sayfa
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
