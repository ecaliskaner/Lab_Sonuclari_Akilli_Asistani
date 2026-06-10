import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, ClipboardList, LogOut, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition',
    isActive
      ? 'border border-yeka-blue/20 bg-yeka-blue/5 text-yeka-blue shadow-sm'
      : 'border border-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-800',
  ].join(' ');
 
export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
 
  return (
    <aside className="hidden h-screen w-[18rem] shrink-0 border-r border-slate-200 bg-white px-5 py-6 backdrop-blur-3xl lg:flex lg:flex-col">
      <NavLink to="/dashboard" className="flex items-center gap-3 rounded-3xl px-2 py-2">
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <img src="/logo.png" alt="Lab Sonuçları Akıllı Asistan Logo" className="h-10 w-10 object-contain" />
        </span>
        <span>
          <span className="block text-xl font-black tracking-tight text-slate-850">YEKA Lab</span>
          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.22em] text-yeka-blue">
            <Sparkles className="h-3 w-3" />
            Klinik AI
          </span>
        </span>
      </NavLink>
 
      <div className="mt-9 space-y-2">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Panel</p>
        <NavLink to="/dashboard" className={navLinkClass}>
          <Activity className="h-4.5 w-4.5" />
          <span>Lab Sonuçları</span>
        </NavLink>
        {user?.role === 'ADMIN' && (
          <NavLink to="/audit-logs" className={navLinkClass}>
            <ShieldAlert className="h-4.5 w-4.5" />
            <span>Audit Logları</span>
          </NavLink>
        )}
      </div>
 
      <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-yeka-blue/10 text-yeka-blue">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-800">Canlı Akış</p>
            <p className="text-xs font-semibold text-slate-500">Mock cihaz + LLM hazır</p>
          </div>
        </div>
      </div>
 
      <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4">
          <p className="truncate text-sm font-black text-slate-800">{user?.fullName}</p>
          <p className="text-xs font-semibold text-yeka-blue">
            {user?.role === 'ADMIN' ? 'Sistem Yöneticisi' : 'Hekim'}
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 shadow-sm"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
};
