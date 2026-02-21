import { describe, it, expect, vi, beforeEach } from 'vitest';
import { periodosService } from './periodos.service';
import { authService } from './auth.service';

function mockJsonResponse(ok: boolean, data: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('periodosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authService, 'getToken').mockReturnValue('token-123');
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('getById calls expected endpoint with auth headers', async () => {
    (global.fetch as any).mockResolvedValue(
      mockJsonResponse(true, {
        id: 10,
        nombre: 'Navidad',
        fechaInicio: '2026-12-24',
        fechaFin: '2026-12-31',
      })
    );

    await periodosService.getById(10);

    expect(global.fetch).toHaveBeenCalledWith('/api/periodos/10', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
  });

  it('update sends PUT with serialized body', async () => {
    const payload = { nombre: 'Semana Santa', fechaInicio: '2026-03-24', fechaFin: '2026-03-31', feriados: [] };
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, { id: 20, ...payload }));

    await periodosService.update(20, payload as any);

    expect(global.fetch).toHaveBeenCalledWith('/api/periodos/20', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify(payload),
    });
  });

  it('update throws backend message when request fails', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(false, { message: 'Periodo inválido' }));

    await expect(periodosService.update(20, { nombre: '' } as any)).rejects.toThrow('Periodo inválido');
  });
});
