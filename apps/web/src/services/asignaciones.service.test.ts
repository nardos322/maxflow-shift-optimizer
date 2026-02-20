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
});
