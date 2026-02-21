import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configuracionService } from './configuracion.service';
import { authService } from './auth.service';

function mockJsonResponse(ok: boolean, data: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('configuracionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authService, 'getToken').mockReturnValue('token-123');
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('get fetches config with auth header', async () => {
    const payload = { maxGuardiasTotales: 6, medicosPorDia: 2 };
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, payload));

    const result = await configuracionService.get();

    expect(global.fetch).toHaveBeenCalledWith('/api/configuracion', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
    expect(result).toEqual(payload);
  });

  it('update throws backend message when response is not ok', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(false, { message: 'Configuración inválida' }));

    await expect(configuracionService.update({ medicosPorDia: 0 })).rejects.toThrow('Configuración inválida');
  });
});
