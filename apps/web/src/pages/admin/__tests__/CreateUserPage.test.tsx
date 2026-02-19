import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateUserPage } from '../CreateUserPage';
import { authService } from '@/services/auth.service';

// Mock authService
vi.mock('@/services/auth.service', () => ({
  authService: {
    register: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderComponent = () => {
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
        <CreateUserPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CreateUserPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the create user form correctly', () => {
    renderComponent();

    expect(screen.getByText('Crear Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rol/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /crear usuario/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    await waitFor(() => {
      // The shared schema messages
      expect(screen.getByText(/el nombre debe tener al menos 2 caracteres/i)).toBeInTheDocument();
      expect(screen.getByText(/debe ser un email válido/i)).toBeInTheDocument();
      expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
  });

  it('calls authService.register and navigates on success', async () => {
    (authService.register as any).mockResolvedValue({
      user: { id: 1, email: 'new@example.com', nombre: 'New User', rol: 'MEDICO' },
      token: 'fake-token'
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });

    // Role is MEDICO by default

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        nombre: 'New User',
        email: 'new@example.com',
        password: 'password123',
        rol: 'MEDICO',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('displays error message when registration fails', async () => {
    (authService.register as any).mockRejectedValue(new Error('El usuario ya existe'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Existing User' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'password123' } });

    fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));

    await waitFor(() => {
      expect(screen.getByText('El usuario ya existe')).toBeInTheDocument();
    });
  });
});
