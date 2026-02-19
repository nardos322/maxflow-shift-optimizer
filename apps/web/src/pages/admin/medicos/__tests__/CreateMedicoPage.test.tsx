import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateMedicoPage } from '../CreateMedicoPage';
import { medicosService } from '@/services/medicos.service';

// Mock medicosService
vi.mock('@/services/medicos.service', () => ({
  medicosService: {
    create: vi.fn(),
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
        <CreateMedicoPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CreateMedicoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    console.log('Starting render test');
    renderComponent();
    console.log('Rendered component');

    expect(screen.getByText('Registrar Nuevo Médico')).toBeInTheDocument();
    console.log('Found title');
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  it('shows validation errors for invalid inputs', async () => {
    renderComponent();

    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /registrar médico/i }));

    await waitFor(() => {
      // Check exact messages from schema/component
      expect(screen.getByText(/el nombre es obligatorio/i)).toBeInTheDocument();
      expect(screen.getByText(/debe ser un email válido/i)).toBeInTheDocument();
    });

    // Test password length validation if provided
    fireEvent.change(screen.getByLabelText(/contraseña \(opcional\)/i), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /registrar médico/i }));

    await waitFor(() => {
      expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
    });

    expect(medicosService.create).not.toHaveBeenCalled();
  });

  it('calls medicosService.create and navigates on success', async () => {
    (medicosService.create as any).mockResolvedValue({
      id: 1,
      nombre: 'Dr. Test',
      email: 'test@hospital.com',
      activo: true,
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Dr. Test' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@hospital.com' } });
    // Password optional, leaving empty

    fireEvent.click(screen.getByRole('button', { name: /registrar médico/i }));

    await waitFor(() => {
      expect(medicosService.create).toHaveBeenCalledWith({
        nombre: 'Dr. Test',
        email: 'test@hospital.com',
        // password might be undefined or not present depending on implementation, 
        // using objectContaining is safer or exact match if we know logic
      });
      expect(mockNavigate).toHaveBeenCalledWith('/medicos');
    });
  });

  it('displays error message when creation fails', async () => {
    (medicosService.create as any).mockRejectedValue(new Error('El email ya existe'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Dr. Test' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@hospital.com' } });

    fireEvent.click(screen.getByRole('button', { name: /registrar médico/i }));

    await waitFor(() => {
      expect(screen.getByText('El email ya existe')).toBeInTheDocument();
    });
  });

});
