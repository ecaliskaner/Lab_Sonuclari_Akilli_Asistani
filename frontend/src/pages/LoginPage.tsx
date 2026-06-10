import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, { message: 'E-posta alanı boş bırakılamaz' }).email({ message: 'Geçersiz e-posta formatı' }),
  password: z.string().min(8, { message: 'Şifre en az 8 karakter olmalıdır' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    login({ email: data.email, password: data.password });
  };

  return (
    <div className="yeka-page-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4 bg-slate-50">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yeka-blue/40 to-transparent" />

      <div className="glass-panel relative w-full max-w-md rounded-[28px] p-8 bg-white border border-slate-200 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img src="/logo.png" alt="Lab Sonuçları Akıllı Asistan Logo" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">YEKA Lab Portalı</h1>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 text-yeka-blue" />
            <span>RSA-OAEP ile Güvenli Hekim Girişi</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Kurumsal E-posta</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Mail className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type="email"
                {...register('email')}
                placeholder="dr.aydin@hastane.com"
                className={`yeka-input py-3 pl-10 pr-4 text-sm ${errors.email ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <span className="text-xs font-semibold text-red-500">{errors.email.message}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Şifre</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type="password"
                {...register('password')}
                placeholder="********"
                className={`yeka-input py-3 pl-10 pr-4 text-sm ${errors.password ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.password && (
              <span className="text-xs font-semibold text-red-500">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="yeka-button-primary mt-2 flex w-full items-center justify-center py-3 text-sm"
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-8 space-y-2 border-t border-slate-100 pt-6 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Test Giriş Bilgileri</span>
          <div className="flex flex-col items-center space-y-0.5 text-[11px] font-medium text-slate-650">
            <div><strong>Hekim:</strong> dr.aydin@hastane.com <span className="text-slate-300">/</span> Doctor123!</div>
            <div><strong>Yönetici:</strong> admin@hastane.com <span className="text-slate-300">/</span> Admin123!</div>
          </div>
        </div>
      </div>
    </div>
  );
};
