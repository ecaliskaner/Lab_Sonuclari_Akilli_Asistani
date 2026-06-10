import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, Database, ShieldCheck, Stethoscope } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const TopHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-3xl">
      <div className="flex min-h-[4.25rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white lg:hidden">
            <img src="/logo.png" alt="Lab Sonuçları Akıllı Asistan Logo" className="h-8 w-8 object-contain" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-800 sm:text-base">Lab Sonuçları Akıllı Asistan</p>
            <p className="truncate text-xs font-semibold text-slate-500">
              Güvenli klinik değerlendirme paneli
            </p>
          </div>
        </div>
 
        <div className="hidden items-center gap-2 md:flex">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-700">
            <Database className="h-3.5 w-3.5" />
            Backend Online
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-yeka-blue/20 bg-yeka-blue/5 px-3 py-1.5 text-[11px] font-black text-yeka-blue">
            <ShieldCheck className="h-3.5 w-3.5" />
            RSA Aktif
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-black text-slate-600">
            <Stethoscope className="h-3.5 w-3.5" />
            {user?.role === 'ADMIN' ? 'Admin' : 'Doktor'}
          </span>
        </div>
 
        <div className="flex items-center gap-2 lg:hidden">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `rounded-2xl border px-3 py-2 text-xs font-black transition ${
                isActive ? 'border-yeka-blue/20 bg-yeka-blue/5 text-yeka-blue' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`
            }
            aria-label="Lab sonuçları"
          >
            <Activity className="h-4 w-4" />
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink
              to="/audit-logs"
              className={({ isActive }) =>
                `rounded-2xl border px-3 py-2 text-xs font-black transition ${
                  isActive ? 'border-yeka-blue/20 bg-yeka-blue/5 text-yeka-blue' : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`
              }
              aria-label="Audit logları"
            >
              <ShieldCheck className="h-4 w-4" />
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
