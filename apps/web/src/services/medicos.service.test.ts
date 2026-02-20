import { describe, it, expect, vi, beforeEach } from 'vitest';
import { medicosService } from './medicos.service';
import { authService } from './auth.service';

function mockJsonResponse(ok: boolean, data: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('medicosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authService, 'getToken').mockReturnValue('token-123');
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('getAll sends query param and auth header', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, []));

    await medicosService.getAll(true);

    expect(global.fetch).toHaveBeenCalledWith('/api/medicos?soloActivos=true', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
  });

  it('create sends POST body and returns medico', async () => {
    const created = { id: 1, nombre: 'Dr. House', email: 'house@hospital.com', activo: true };
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, created));

    const result = await medicosService.create({ nombre: 'Dr. House', email: 'house@hospital.com' });

    expect(global.fetch).toHaveBeenCalledWith('/api/medicos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({ nombre: 'Dr. House', email: 'house@hospital.com' }),
    });
    expect(result).toEqual(created);
  });

  it('create throws backend error message when request fails', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(false, { error: 'El email ya existe' }));

    await expect(
      medicosService.create({ nombre: 'Dr. House', email: 'house@hospital.com' })
    ).rejects.toThrow('El email ya existe');
  });

  it('addDisponibilidad sends fechas array to medico availability endpoint', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, []));

    await medicosService.addDisponibilidad(7, ['2026-12-25']);

    expect(global.fetch).toHaveBeenCalledWith('/api/medicos/7/disponibilidad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
      body: JSON.stringify({ fechas: ['2026-12-25'] }),
    });
  });
});
