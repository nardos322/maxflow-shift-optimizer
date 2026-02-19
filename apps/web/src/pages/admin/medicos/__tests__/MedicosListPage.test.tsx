import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MedicosListPage } from '../MedicosListPage';
import { medicosService } from '@/services/medicos.service';

// Mock medicosService
vi.mock('@/services/medicos.service', () => ({
  medicosService: {
    getAll: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

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
        <MedicosListPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockMedicos = [
  { id: 1, nombre: 'Dr. House', email: 'house@princeton.edu', activo: true, userId: 101 },
  { id: 2, nombre: 'Dr. Wilson', email: 'wilson@princeton.edu', activo: true, userId: 102 },
  { id: 3, nombre: 'Dr. Cuddy', email: 'cuddy@princeton.edu', activo: false, userId: null },
];

describe('MedicosListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (medicosService.getAll as any).mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve([]), 10)));
    renderComponent();
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Cargando...')).not.toBeInTheDocument());
  });

  it('renders list of medicos correctly', async () => {
    (medicosService.getAll as any).mockResolvedValue(mockMedicos.filter(m => m.activo));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Gestión de Médicos')).toBeInTheDocument();
      expect(screen.getByText('Dr. House')).toBeInTheDocument();
      expect(screen.getByText('Dr. Wilson')).toBeInTheDocument();
    });
  });

  it('toggles inactive medicos', async () => {
    (medicosService.getAll as any).mockResolvedValue(mockMedicos);

    renderComponent();

    const toggleButton = await screen.findByRole('button', { name: /mostrar inactivos/i });
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(medicosService.getAll).toHaveBeenCalledWith(false);
      expect(screen.getByText(/ocultar inactivos/i)).toBeInTheDocument();
    });
  });

  it('handles medico deletion', async () => {
    (medicosService.getAll as any).mockResolvedValue(mockMedicos.filter(m => m.activo));
    (medicosService.delete as any).mockResolvedValue({});
    mockConfirm.mockReturnValue(true);

    renderComponent();

    await screen.findByText('Dr. House');
    const deleteButtons = screen.getAllByTitle('Desactivar');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(medicosService.delete).toHaveBeenCalledWith(1);
    });
  });
});
