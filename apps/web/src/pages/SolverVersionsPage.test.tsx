import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SolverVersionsPage } from './SolverVersionsPage';
import { asignacionesService } from '@/services/asignaciones.service';
import { medicosService } from '@/services/medicos.service';

vi.mock('@/services/asignaciones.service', () => ({
  asignacionesService: {
    getVersiones: vi.fn(),
    getRiesgoVersion: vi.fn(),
    getAprobacionVersion: vi.fn(),
    getAutofixVersion: vi.fn(),
    getDiffPublicado: vi.fn(),
    publicarVersion: vi.fn(),
    previsualizarReparacion: vi.fn(),
    crearReparacionCandidata: vi.fn(),
  },
}));

vi.mock('@/services/medicos.service', () => ({
  medicosService: {
    getAll: vi.fn(),
  },
}));

const mockConfirm = vi.fn();
global.confirm = mockConfirm;

function renderComponent() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SolverVersionsPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('SolverVersionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true);

    (medicosService.getAll as any).mockResolvedValue([
      { id: 1, nombre: 'Dr. A', email: 'a@test.com', activo: true },
    ]);

    (asignacionesService.getVersiones as any).mockResolvedValue([
      {
        id: 2,
        tipo: 'REPAIR',
        estado: 'DRAFT',
        usuario: 'admin@hospital.com',
        sourcePlanVersionId: 1,
        totalAsignaciones: 5,
        createdAt: '2026-02-20T12:00:00.000Z',
      },
      {
        id: 1,
        tipo: 'BASE',
        estado: 'PUBLICADO',
        usuario: 'admin@hospital.com',
        sourcePlanVersionId: null,
        totalAsignaciones: 5,
        createdAt: '2026-02-19T12:00:00.000Z',
      },
    ]);

    (asignacionesService.getRiesgoVersion as any).mockResolvedValue({
      version: { id: 2, tipo: 'REPAIR', estado: 'DRAFT', createdAt: '2026-02-20T12:00:00.000Z' },
      baseline: { id: 1, tipo: 'BASE', estado: 'PUBLICADO', createdAt: '2026-02-19T12:00:00.000Z' },
      resumen: {
        cambiosNetos: 2,
        agregadas: 1,
        removidas: 1,
        medicosAfectados: 1,
        periodosAfectados: 1,
        diasConRiesgoCobertura: 0,
        cambiosEnZonaCongelada: 0,
      },
      detallePorMedico: [],
      detallePorPeriodo: [],
      diasConRiesgoCobertura: [],
    });

    (asignacionesService.getAprobacionVersion as any).mockResolvedValue({
      version: { id: 2, tipo: 'REPAIR', estado: 'DRAFT', createdAt: '2026-02-20T12:00:00.000Z' },
      decision: {
        aprobable: true,
        recomendacion: 'APROBAR',
        bloqueantes: [],
        advertencias: [],
      },
      resumenRiesgo: {
        cambiosNetos: 2,
        agregadas: 1,
        removidas: 1,
        medicosAfectados: 1,
        periodosAfectados: 1,
        diasConRiesgoCobertura: 0,
        cambiosEnZonaCongelada: 0,
      },
      recomendaciones: [
        {
          tipo: 'EQUIDAD_OPERATIVA',
          prioridad: 'MEDIA',
          accion: 'Revisar distribución',
          detalle: {},
        },
      ],
      comparacionPublicada: null,
    });

    (asignacionesService.getAutofixVersion as any).mockResolvedValue({
      version: { id: 2, tipo: 'REPAIR', estado: 'DRAFT' },
      decisionActual: { aprobable: true, recomendacion: 'APROBAR', bloqueantes: [], advertencias: [] },
      parametrosReintento: {
        medicoId: 1,
        darDeBaja: false,
        ventanaInicioSugerida: '2026-02-25T00:00:00.000Z',
        ventanaFinSugerida: null,
        fechasCriticasACubrir: [],
        medicosMasImpactados: [],
      },
      pasosSugeridos: ['Publicar versión'],
      resumenRiesgo: {
        cambiosNetos: 2,
        agregadas: 1,
        removidas: 1,
        medicosAfectados: 1,
        periodosAfectados: 1,
        diasConRiesgoCobertura: 0,
        cambiosEnZonaCongelada: 0,
      },
    });

    (asignacionesService.getDiffPublicado as any).mockResolvedValue({
      fromVersion: { id: 1, tipo: 'BASE', createdAt: '2026-02-19T12:00:00.000Z' },
      toVersion: { id: 2, tipo: 'REPAIR', createdAt: '2026-02-20T12:00:00.000Z' },
      resumen: { totalFrom: 5, totalTo: 5, agregadas: 1, removidas: 1, cambiosNetos: 2 },
      agregadas: [],
      removidas: [],
    });

    (asignacionesService.publicarVersion as any).mockResolvedValue({ id: 2, estado: 'PUBLICADO', tipo: 'REPAIR' });
    (asignacionesService.previsualizarReparacion as any).mockResolvedValue({
      status: 'FEASIBLE',
      resumenImpacto: { cambiosEstimados: 2, diasAfectados: 1 },
    });
    (asignacionesService.crearReparacionCandidata as any).mockResolvedValue({
      status: 'FEASIBLE',
      planVersion: { id: 3, tipo: 'REPAIR_CANDIDATE', estado: 'DRAFT' },
      resumenImpacto: { cambiosEstimados: 2, diasAfectados: 1 },
    });
  });

  it('renders versions workspace with key sections', async () => {
    renderComponent();

    expect(await screen.findByText('Versionado y Aprobación')).toBeInTheDocument();
    expect(await screen.findByText('Versiones de Plan')).toBeInTheDocument();
    expect(await screen.findByText('Decisión de Aprobación')).toBeInTheDocument();
    expect(await screen.findByText('Autofix Sugerido')).toBeInTheDocument();
  });

  it('publishes selected version after confirmation', async () => {
    renderComponent();

    const publishBtn = await screen.findByRole('button', { name: /publicar versión/i });
    await waitFor(() => {
      expect(publishBtn).toBeEnabled();
    });
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(asignacionesService.publicarVersion).toHaveBeenCalledWith(2);
    });
  });

  it('previews and creates candidate repair from form inputs', async () => {
    renderComponent();

    await screen.findByText('Crear Candidata de Reparación');

    fireEvent.change(screen.getByLabelText('Ventana Inicio'), {
      target: { value: '2026-02-25' },
    });
    fireEvent.change(screen.getByLabelText('Ventana Fin'), {
      target: { value: '2026-02-26' },
    });

    fireEvent.click(screen.getByRole('button', { name: /previsualizar/i }));

    await waitFor(() => {
      expect(asignacionesService.previsualizarReparacion).toHaveBeenCalledWith(
        expect.objectContaining({
          medicoId: 1,
          ventanaInicio: '2026-02-25',
          ventanaFin: '2026-02-26',
        })
      );
    });

    fireEvent.click(screen.getByRole('button', { name: /crear candidata/i }));

    await waitFor(() => {
      expect(asignacionesService.crearReparacionCandidata).toHaveBeenCalledWith(
        expect.objectContaining({
          medicoId: 1,
          ventanaInicio: '2026-02-25',
          ventanaFin: '2026-02-26',
        })
      );
    });
  });
});
