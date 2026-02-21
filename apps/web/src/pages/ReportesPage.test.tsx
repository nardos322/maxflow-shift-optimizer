import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReportesPage } from './ReportesPage';
import { reportesService } from '@/services/reportes.service';

vi.mock('@/services/reportes.service', () => ({
  reportesService: {
    getReporteEquidad: vi.fn(),
  },
}));

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
        <ReportesPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('ReportesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    (reportesService.getReporteEquidad as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                estadisticasGlobales: {
                  totalGuardias: 10,
                  medicosActivos: 5,
                  promedioPorMedico: 2,
                  desviacionEstandar: 0.2,
                  totalTurnosRequeridos: 10,
                  turnosSinCobertura: 0,
                  coberturaPorcentaje: 100,
                },
                detallePorMedico: [],
              }),
            10
          )
        )
    );

    renderComponent();

    expect(screen.getByText('Cargando reporte...')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Cargando reporte...')).not.toBeInTheDocument());
  });

  it('renders report data and table rows', async () => {
    (reportesService.getReporteEquidad as any).mockResolvedValue({
      estadisticasGlobales: {
        totalGuardias: 18,
        medicosActivos: 6,
        promedioPorMedico: 3,
        desviacionEstandar: 0.5,
        totalTurnosRequeridos: 18,
        turnosSinCobertura: 0,
        coberturaPorcentaje: 100,
      },
      detallePorMedico: [
        { id: 1, nombre: 'Dr. House', totalGuardias: 3, periodosCubiertos: ['Navidad'] },
        { id: 2, nombre: 'Dra. Grey', totalGuardias: 3, periodosCubiertos: ['Semana Santa'] },
      ],
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Reporte de Equidad')).toBeInTheDocument();
      expect(screen.getByText('Total Guardias')).toBeInTheDocument();
      expect(screen.getByText('Detalle por Médico')).toBeInTheDocument();
      expect(screen.getByText('Dr. House')).toBeInTheDocument();
      expect(screen.getByText('Dra. Grey')).toBeInTheDocument();
    });
  });
});
