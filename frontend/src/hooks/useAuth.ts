import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

type LoginCredentials = {
  email: string;
  password: string;
};

export function useAuth() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: LoginCredentials) => authApi.login(email, password),
    onSuccess: (data, variables) => {
      setError(null);
      setAuth(data.accessToken, data.refreshToken, {
        id: data.user.id,
        fullName: data.user.fullName,
        role: data.user.role,
        email: variables.email,
      });
      navigate('/dashboard');
    },
    onError: (err: unknown) => {
      console.error('Login failed:', err);
      if (axios.isAxiosError(err) && !err.response) {
        setError('Backend sunucusuna ulasilamiyor. Lutfen Spring Boot servisini ve PostgreSQL containerini baslatin.');
        return;
      }
      setError('E-posta veya sifre hatali');
    },
  });

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
    error,
    logout,
    user,
    isAuthenticated,
  };
}
