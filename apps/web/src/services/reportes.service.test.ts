import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/hooks/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

import { reportesService } from './reportes.service';
import { useAuthStore } from '@/hooks/useAuthStore';

function mockJsonResponse(ok: boolean, data: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('reportesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn() as unknown as typeof fetch;
    (useAuthStore.getState as any).mockReturnValue({ token: 'token-123' });
  });

  it('getReporteEquidad sends GET with auth header', async () => {
    const payload = {
      estadisticasGlobales: {
        totalGuardias: 10,
        medicosActivos: 5,
        promedioPorMedico: 2,
        desviacionEstandar: 0,
        totalTurnosRequeridos: 10,
        turnosSinCobertura: 0,
        coberturaPorcentaje: 100,
      },
      detallePorMedico: [],
    };
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, payload));

    const result = await reportesService.getReporteEquidad();

    expect(global.fetch).toHaveBeenCalledWith('/api/reportes/equidad', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
    expect(result).toEqual(payload);
  });

  it('throws error message from backend when request fails', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(false, { error: 'Sin permisos' }));

    await expect(reportesService.getReporteEquidad()).rejects.toThrow('Sin permisos');
  });
});
