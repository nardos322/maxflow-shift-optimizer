import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MedicoDisponibilidadPage } from './MedicoDisponibilidadPage';
import { useCurrentMedico } from '@/hooks/useCurrentMedico';
import { periodosService } from '@/services/periodos.service';
import { medicosService } from '@/services/medicos.service';

vi.mock('@/hooks/useCurrentMedico', () => ({
  useCurrentMedico: vi.fn(),
}));

vi.mock('@/services/periodos.service', () => ({
  periodosService: {
    getAll: vi.fn(),
  },
}));

vi.mock('@/services/medicos.service', () => ({
  medicosService: {
    getDisponibilidad: vi.fn(),
    addDisponibilidad: vi.fn(),
    removeDisponibilidad: vi.fn(),
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
        <MedicoDisponibilidadPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MedicoDisponibilidadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCurrentMedico as any).mockReturnValue({
      medico: { id: 7, nombre: 'Dra. Torres', email: 'torres@hospital.com', activo: true, userId: 11 },
      isLoading: false,
      isError: false,
      error: null,
    });
    (periodosService.getAll as any).mockResolvedValue([
      {
        id: 1,
        nombre: 'Semana Santa',
        fechaInicio: '2026-03-24',
        fechaFin: '2026-03-31',
        feriados: [
          { id: 10, fecha: '2026-03-25T00:00:00.000Z', descripcion: 'Jueves Santo' },
          { id: 11, fecha: '2026-03-26T00:00:00.000Z', descripcion: 'Viernes Santo' },
        ],
      },
    ]);
    (medicosService.getDisponibilidad as any).mockResolvedValue([{ id: 99, medicoId: 7, fecha: '2026-03-25T00:00:00.000Z' }]);
    (medicosService.addDisponibilidad as any).mockResolvedValue([]);
    (medicosService.removeDisponibilidad as any).mockResolvedValue(undefined);
  });

  it('renders feriados and availability actions', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Mi Disponibilidad')).toBeInTheDocument();
      expect(screen.getByText('Semana Santa')).toBeInTheDocument();
      expect(screen.getByText('Jueves Santo')).toBeInTheDocument();
      expect(screen.getByText('Viernes Santo')).toBeInTheDocument();
      expect(screen.getByText('Quitar disponibilidad')).toBeInTheDocument();
      expect(screen.getByText('Marcar disponible')).toBeInTheDocument();
    });
  });

  it('removes disponibilidad for already selected date', async () => {
    renderComponent();

    const removeButton = await screen.findByRole('button', { name: /Quitar disponibilidad/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(medicosService.removeDisponibilidad).toHaveBeenCalledWith(7, ['2026-03-25']);
    });
  });
});
