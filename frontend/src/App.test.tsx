import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AbnormalityBadge } from './components/lab/AbnormalityBadge';
import ErrorBanner from './components/shared/ErrorBanner';
import AnalysisSkeleton from './components/llm/AnalysisSkeleton';

const createQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

/* ─────────────── Login Page ─────────────── */
describe('LoginPage', () => {
  it('renders the login form with all required fields', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('YEKA Lab Portalı')).toBeInTheDocument();
    expect(screen.getByText('RSA-OAEP ile Güvenli Hekim Girişi')).toBeInTheDocument();
    expect(screen.getByText('Kurumsal E-posta')).toBeInTheDocument();
    expect(screen.getByText('Şifre')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Giriş Yap' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('dr.aydin@hastane.com')).toBeInTheDocument();
  });

  it('has a submit button that is enabled by default', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const submitBtn = screen.getByRole('button', { name: 'Giriş Yap' });
    expect(submitBtn).toBeEnabled();
  });

  it('displays the RSA encryption notice', () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/RSA-OAEP/)).toBeInTheDocument();
    expect(screen.getByText(/Güvenli Hekim Girişi/)).toBeInTheDocument();
  });
});

/* ─────────────── AbnormalityBadge ─────────────── */
describe('AbnormalityBadge', () => {
  it('renders NORMAL badge with correct label', () => {
    render(<AbnormalityBadge severity="NORMAL" />);
    expect(screen.getByText('Normal')).toBeInTheDocument();
  });

  it('renders LOW badge with Turkish label', () => {
    render(<AbnormalityBadge severity="LOW" />);
    expect(screen.getByText('Düşük')).toBeInTheDocument();
  });

  it('renders HIGH badge with Turkish label', () => {
    render(<AbnormalityBadge severity="HIGH" />);
    expect(screen.getByText('Yüksek')).toBeInTheDocument();
  });

  it('renders CRITICAL_HIGH badge with animated ping indicator', () => {
    const { container } = render(<AbnormalityBadge severity="CRITICAL_HIGH" />);
    expect(screen.getByText('Kritik Yüksek')).toBeInTheDocument();
    const pingDot = container.querySelector('.animate-ping');
    expect(pingDot).toBeInTheDocument();
  });

  it('renders CRITICAL_LOW badge with animated ping indicator', () => {
    const { container } = render(<AbnormalityBadge severity="CRITICAL_LOW" />);
    expect(screen.getByText('Kritik Düşük')).toBeInTheDocument();
    const pingDot = container.querySelector('.animate-ping');
    expect(pingDot).toBeInTheDocument();
  });

  it('does NOT show ping indicator for non-critical severities', () => {
    const { container } = render(<AbnormalityBadge severity="NORMAL" />);
    const pingDot = container.querySelector('.animate-ping');
    expect(pingDot).not.toBeInTheDocument();
  });
});

/* ─────────────── ErrorBanner ─────────────── */
describe('ErrorBanner', () => {
  it('renders the error message', () => {
    render(<ErrorBanner message="Sunucuya bağlanılamadı" />);
    expect(screen.getByText('Sunucuya bağlanılamadı')).toBeInTheDocument();
  });

  it('renders the alert icon', () => {
    const { container } = render(<ErrorBanner message="Test error" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});

/* ─────────────── AnalysisSkeleton ─────────────── */
describe('AnalysisSkeleton', () => {
  it('renders with aria-busy for accessibility', () => {
    const { container } = render(<AnalysisSkeleton />);
    const skeleton = container.querySelector('[aria-busy="true"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('has accessible label for screen readers', () => {
    render(<AnalysisSkeleton />);
    expect(screen.getByLabelText('Analiz yükleniyor')).toBeInTheDocument();
  });
});

/* ─────────────── Auth Store ─────────────── */
describe('AuthStore', () => {
  it('starts with null token and user', async () => {
    const { useAuthStore } = await import('./store/authStore');
    // Reset to initial state
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth stores token and user', async () => {
    const { useAuthStore } = await import('./store/authStore');
    const mockUser = { id: 1, email: 'dr@test.com', fullName: 'Dr. Test', role: 'DOCTOR' as const };

    useAuthStore.getState().setAuth('access-123', 'refresh-456', mockUser);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-123');
    expect(state.refreshToken).toBe('refresh-456');
    expect(state.user).toEqual(mockUser);
  });

  it('clearAuth resets everything to null', async () => {
    const { useAuthStore } = await import('./store/authStore');
    const mockUser = { id: 1, email: 'dr@test.com', fullName: 'Dr. Test', role: 'DOCTOR' as const };

    useAuthStore.getState().setAuth('access-123', 'refresh-456', mockUser);
    useAuthStore.getState().clearAuth();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });
});
