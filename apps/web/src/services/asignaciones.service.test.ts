import { describe, it, expect, vi, beforeEach } from 'vitest';
import { asignacionesService } from './asignaciones.service';
import { authService } from './auth.service';

function mockJsonResponse(ok: boolean, data: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('asignacionesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authService, 'getToken').mockReturnValue('token-123');
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('resolver sends POST to resolver endpoint', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, { ok: true }));

    await asignacionesService.resolver();

    expect(global.fetch).toHaveBeenCalledWith('/api/asignaciones/resolver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
  });

  it('getResultados throws explicit error when request fails', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(false, {}));

    await expect(asignacionesService.getResultados()).rejects.toThrow('Error al obtener las asignaciones');
  });

  it('simular sends payload to simulation endpoint', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, { resultado: { factible: true } }));

    await asignacionesService.simular({
      excluirMedicos: [1, 2],
      periodosIds: [10],
      medicosHipoteticos: [{ nombre: 'Dra. Escenario' }],
      config: { maxGuardiasTotales: 4 },
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/asignaciones/simulaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({
        excluirMedicos: [1, 2],
        periodosIds: [10],
        medicosHipoteticos: [{ nombre: 'Dra. Escenario' }],
        config: { maxGuardiasTotales: 4 },
      }),
    });
  });

  it('reparar sends payload to repair endpoint', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, { status: 'FEASIBLE' }));

    await asignacionesService.reparar({ medicoId: 7, darDeBaja: true });

    expect(global.fetch).toHaveBeenCalledWith('/api/asignaciones/reparaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({ medicoId: 7, darDeBaja: true }),
    });
  });

  it('getVersiones requests version list', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, []));

    await asignacionesService.getVersiones();

    expect(global.fetch).toHaveBeenCalledWith('/api/asignaciones/versiones', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
  });

  it('publicarVersion posts to publish endpoint', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, { id: 5 }));

    await asignacionesService.publicarVersion(5);

    expect(global.fetch).toHaveBeenCalledWith('/api/asignaciones/versiones/5/publicar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
  });
});
