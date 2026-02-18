import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/hooks/useAuthStore';

// Mockeamos los componentes para simplificar el test de routing
vi.mock('@/pages/DashboardPage', () => ({
  DashboardPage: () => <div data-testid="dashboard-page">Dashboard</div>
}));
vi.mock('@/pages/LoginPage', () => ({
  LoginPage: () => <div data-testid="login-page">Login</div>
}));

// Mockeamos el hook de autenticación
vi.mock('@/hooks/useAuthStore', () => ({
  useAuthStore: vi.fn()
}));

describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to login when not authenticated', () => {
    // Simulamos usuario no autenticado
    (useAuthStore as any).mockReturnValue(() => false);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Debería redirigir a login (según la lógica de ProtectedRoute)
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('allows access to dashboard when authenticated', () => {
    // Simulamos usuario autenticado
    (useAuthStore as any).mockReturnValue(() => true);

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
  });
});
