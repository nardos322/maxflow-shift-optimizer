import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MedicoGuardiasPage } from './MedicoGuardiasPage';
import { useCurrentMedico } from '@/hooks/useCurrentMedico';
import { asignacionesService } from '@/services/asignaciones.service';

vi.mock('@/hooks/useCurrentMedico', () => ({
  useCurrentMedico: vi.fn(),
}));

vi.mock('@/services/asignaciones.service', () => ({
  asignacionesService: {
    getResultados: vi.fn(),
  },
}));

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MedicoGuardiasPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MedicoGuardiasPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCurrentMedico as any).mockReturnValue({
      medico: { id: 7, nombre: 'Dra. Torres', email: 'torres@hospital.com', activo: true, userId: 11 },
      isLoading: false,
      isError: false,
      error: null,
    });
    (asignacionesService.getResultados as any).mockResolvedValue([
      {
        id: 1,
        fecha: '2026-12-25T00:00:00.000Z',
        medicoId: 7,
        periodoId: 1,
        medico: { id: 7, nombre: 'Dra. Torres', email: 'torres@hospital.com', activo: true },
        periodo: { id: 1, nombre: 'Navidad', fechaInicio: '2026-12-24', fechaFin: '2026-12-31' },
      },
      {
        id: 2,
        fecha: '2026-12-26T00:00:00.000Z',
        medicoId: 8,
        periodoId: 1,
        medico: { id: 8, nombre: 'Dr. Otro', email: 'otro@hospital.com', activo: true },
        periodo: { id: 1, nombre: 'Navidad', fechaInicio: '2026-12-24', fechaFin: '2026-12-31' },
      },
    ]);
  });

  it('shows only current medico assignments', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Mis Guardias')).toBeInTheDocument();
      expect(screen.getByText('Dra. Torres')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(asignacionesService.getResultados).toHaveBeenCalled();
    });
  });
});
