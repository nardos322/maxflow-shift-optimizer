import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PeriodosListPage } from './PeriodosListPage';
import { periodosService } from '@/services/periodos.service';

vi.mock('@/services/periodos.service', () => ({
  periodosService: {
    getAll: vi.fn(),
    delete: vi.fn(),
  },
}));

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
        <PeriodosListPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockPeriodos = [
  { id: 1, nombre: 'Semana Santa', fechaInicio: '2026-03-24', fechaFin: '2026-03-31', feriados: [] },
  { id: 2, nombre: 'Navidad', fechaInicio: '2026-12-24', fechaFin: '2026-12-31', feriados: [] },
];

describe('PeriodosListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (periodosService.getAll as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 10))
    );

    renderComponent();

    expect(screen.getByText('Cargando períodos...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Cargando períodos...')).not.toBeInTheDocument());
  });

  it('renders periodos table data correctly', async () => {
    (periodosService.getAll as any).mockResolvedValue(mockPeriodos);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Gestión de Períodos')).toBeInTheDocument();
      expect(screen.getByText('Períodos Registrados')).toBeInTheDocument();
      expect(screen.getByText('Semana Santa')).toBeInTheDocument();
      expect(screen.getByText('Navidad')).toBeInTheDocument();
    });
  });

  it('deletes a periodo when user confirms', async () => {
    (periodosService.getAll as any).mockResolvedValue(mockPeriodos);
    (periodosService.delete as any).mockResolvedValue({});
    mockConfirm.mockReturnValue(true);

    renderComponent();

    await screen.findByText('Semana Santa');
    const deleteButtons = screen.getAllByTitle('Eliminar');
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(periodosService.delete).toHaveBeenCalledWith(1);
    });
  });
});
