import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ShieldAlert, RefreshCw, X, Calendar, User, Settings } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [action, setAction] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const parsedUserId = userIdFilter ? parseInt(userIdFilter, 10) : undefined;

  const { data, isLoading, isError, refetch } = useAuditLogs({
    page,
    size: 15,
    action: action || undefined,
    userId: isNaN(Number(parsedUserId)) ? undefined : parsedUserId,
    from: from || undefined,
    to: to || undefined,
  }, user?.role === 'ADMIN');

  const handleClear = () => {
    setAction('');
    setUserIdFilter('');
    setFrom('');
    setTo('');
    setPage(0);
  };

  const formattedDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd MMM yyyy HH:mm:ss', { locale: tr });
    } catch {
      return dateString;
    }
  };

  // Redirect DOCTOR role away from this page after hooks are registered.
  if (user && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-yeka-blue" />
            <span>Sistem Güvenlik ve Denetim Günlüğü</span>
          </h1>
          <p className="text-slate-500 text-sm font-semibold">
            Güvenlik denetimi ve API işlem takip logları (Audit Logs)
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Yenile</span>
        </button>
      </div>
 
      {/* Filter panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Settings className="h-4.5 w-4.5 text-yeka-blue" />
          <span>Log Sorgulama Parametreleri</span>
        </h2>
 
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          
          {/* Action category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">İşlem Kategorisi</label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-50 border border-slate-200 focus:border-yeka-blue text-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-yeka-blue font-semibold transition focus:bg-white"
            >
              <option value="">Tümü</option>
              <option value="LOGIN">Kullanıcı Girişi (LOGIN)</option>
              <option value="LIST_RESULTS">Sonuç Listesi Sorgulama</option>
              <option value="VIEW_RESULT">Detay Görüntüleme</option>
              <option value="REQUEST_LLM">Yapay Zeka Analiz Talebi</option>
              <option value="INGEST_RESULT">Cihazdan Veri İletimi</option>
            </select>
          </div>
 
          {/* User ID */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kullanıcı Numarası (User ID)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="number"
                value={userIdFilter}
                onChange={(e) => {
                  setUserIdFilter(e.target.value);
                  setPage(0);
                }}
                placeholder="Örn: 1"
                className="w-full bg-slate-50 border border-slate-200 focus:border-yeka-blue text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-yeka-blue font-semibold transition focus:bg-white"
              />
            </div>
          </div>
 
          {/* Date range From */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Başlangıç Tarihi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="date"
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-yeka-blue text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-yeka-blue font-semibold transition focus:bg-white"
              />
            </div>
          </div>
 
          {/* Date range To */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Bitiş Tarihi</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="date"
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-slate-50 border border-slate-200 focus:border-yeka-blue text-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-yeka-blue font-semibold transition focus:bg-white"
              />
            </div>
          </div>
        </div>
 
        {/* Reset filters */}
        {(action || userIdFilter || from || to) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleClear}
              className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition"
            >
              <X className="h-3.5 w-3.5" />
              <span>Aramayı Temizle</span>
            </button>
          </div>
        )}
      </div>
 
      {/* Logs Table */}
      <div className="space-y-4">
        {isLoading && (
          <div className="py-24">
            <LoadingSpinner size="lg" />
          </div>
        )}
 
        {isError && (
          <ErrorBanner
            message="Denetim günlükleri (audit logs) sunucudan alınamadı. Lütfen yetkilendirmeyi ve sunucu durumunu kontrol edin."
            onRetry={() => refetch()}
          />
        )}
 
        {data && (
          <>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">İşlem ID (Request ID)</th>
                    <th scope="col" className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Kullanıcı (Adı / E-posta)</th>
                    <th scope="col" className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">İşlem Kategorisi</th>
                    <th scope="col" className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">İşlem Detayı</th>
                    <th scope="col" className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Kaynak IP Adresi</th>
                    <th scope="col" className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">İşlem Zamanı</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-sm font-medium">
                  {data.content.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-semibold">
                        Sorgu kriterlerine uygun denetim günlüğü kaydı bulunamadı.
                      </td>
                    </tr>
                  ) : (
                    data.content.map((logEntry) => (
                      <tr key={logEntry.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-yeka-blue">
                          {logEntry.requestId || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-800">
                          {logEntry.userId ? (
                            <div>
                              <div className="font-bold">{logEntry.userFullName}</div>
                              <div className="text-xs text-slate-400 font-medium">{logEntry.userEmail}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Sistem (Oto)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${
                            logEntry.action === 'LOGIN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            logEntry.action === 'REQUEST_LLM' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            logEntry.action === 'INGEST_RESULT' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {logEntry.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate" title={logEntry.detail}>
                          {logEntry.detail}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                          {logEntry.ipAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {formattedDate(logEntry.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
 
            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Önceki Sayfa
                </button>
                <div className="text-xs text-slate-500 font-bold">
                  Sayfa {page + 1} / {data.totalPages} <span className="mx-1.5 text-slate-350">|</span> Toplam {data.totalElements} Kayıt
                </div>
                <button
                  onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                  disabled={page >= data.totalPages - 1}
                  className="rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
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
