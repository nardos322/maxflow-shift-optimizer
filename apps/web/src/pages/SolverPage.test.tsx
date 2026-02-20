import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SolverPage } from './SolverPage';
import { asignacionesService } from '@/services/asignaciones.service';

vi.mock('@/services/asignaciones.service', () => ({
  asignacionesService: {
    getResultados: vi.fn(),
    resolver: vi.fn(),
  },
}));

const mockConfirm = vi.fn();
const mockAlert = vi.fn();
global.confirm = mockConfirm;
global.alert = mockAlert;

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
        <SolverPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SolverPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state for assignments', async () => {
    (asignacionesService.getResultados as any).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 10))
    );
    (asignacionesService.resolver as any).mockResolvedValue({});

    renderComponent();

    expect(screen.getByText('Cargando asignaciones...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Cargando asignaciones...')).not.toBeInTheDocument());
  });

  it('renders assignments and executes resolver on confirm', async () => {
    (asignacionesService.getResultados as any).mockResolvedValue([
      {
        id: 1,
        fecha: '2026-12-25T00:00:00.000Z',
        medico: { id: 3, nombre: 'Dr. House', email: 'house@hospital.com', activo: true },
        periodo: { id: 2, nombre: 'Navidad', fechaInicio: '2026-12-24', fechaFin: '2026-12-31' },
        medicoId: 3,
        periodoId: 2,
      },
    ]);
    (asignacionesService.resolver as any).mockResolvedValue({ ok: true });
    mockConfirm.mockReturnValue(true);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Planificador de Guardias')).toBeInTheDocument();
      expect(screen.getByText('Dr. House')).toBeInTheDocument();
      expect(screen.getByText('Navidad')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /ejecutar planificador/i }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(asignacionesService.resolver).toHaveBeenCalled();
    });
  });

  it('does not execute resolver when confirm is cancelled', async () => {
    (asignacionesService.getResultados as any).mockResolvedValue([]);
    (asignacionesService.resolver as any).mockResolvedValue({});
    mockConfirm.mockReturnValue(false);

    renderComponent();

    await screen.findByText('Planificador de Guardias');
    fireEvent.click(screen.getByRole('button', { name: /ejecutar planificador/i }));

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(asignacionesService.resolver).not.toHaveBeenCalled();
    });
  });

  it('shows min-cut details when solver is infeasible', async () => {
    (asignacionesService.getResultados as any).mockResolvedValue([]);
    (asignacionesService.resolver as any).mockResolvedValue({
      status: 'INFEASIBLE',
      message: 'No se pudo encontrar una solución válida.',
      minCut: [{ tipo: 'SOURCE', id: 'Dr. X', razon: 'Capacidad agotada' }],
    });
    mockConfirm.mockReturnValue(true);

    renderComponent();
    await screen.findByText('Planificador de Guardias');

    fireEvent.click(screen.getByRole('button', { name: /ejecutar planificador/i }));

    await waitFor(() => {
      expect(screen.getByText('Conflictos detectados por el Solver')).toBeInTheDocument();
      expect(screen.getByText(/SOURCE · Dr\. X · Capacidad agotada/)).toBeInTheDocument();
    });
  });
});
