import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../LoginPage';
import { authService } from '@/services/auth.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock del servicio de autenticación
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock del hook useAuthStore
const mockLogin = vi.fn();
vi.mock('@/hooks/useAuthStore', () => ({
  useAuthStore: () => {
    // Simulamos que el selector retorna la función login
    return mockLogin;
  }
}));

// Wrapper para proveer el contexto de Router y Query (necesario por useNavigate y useMutation)
const renderLoginPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLoginPage();

    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ingresar/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderLoginPage();

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText('Debe ser un email válido')).toBeInTheDocument();
      expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument();
    });

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('calls authService.login with correct data on submit', async () => {
    // Configurar mock exitoso
    (authService.login as any).mockResolvedValue({
      token: 'fake-token',
      user: { id: 1, email: 'test@example.com' }
    });

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message on login failure', async () => {
    // Configurar mock con error
    (authService.login as any).mockRejectedValue(new Error('Credenciales inválidas'));

    renderLoginPage();

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'wrongpassword' } });

    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });
});
