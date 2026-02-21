import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from './audit.service';
import { authService } from './auth.service';

function mockJsonResponse(ok: boolean, data: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authService, 'getToken').mockReturnValue('token-123');
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('returns only first five logs', async () => {
    const logs = Array.from({ length: 7 }, (_, idx) => ({
      id: idx + 1,
      usuario: 'admin@hospital.com',
      accion: `ACTION_${idx + 1}`,
      entidad: 'ASIGNACION',
      entidadId: String(idx + 1),
      createdAt: '2026-02-20T00:00:00.000Z',
    }));
    (global.fetch as any).mockResolvedValue(mockJsonResponse(true, logs));

    const result = await auditService.getLogs();

    expect(global.fetch).toHaveBeenCalledWith('/api/auditoria', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-123',
      },
    });
    expect(result).toHaveLength(5);
    expect(result[0].id).toBe(1);
    expect(result[4].id).toBe(5);
  });

  it('throws fallback message when backend response has no error payload', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      json: vi.fn().mockRejectedValue(new Error('invalid json')),
    });

    await expect(auditService.getLogs()).rejects.toThrow('Error al obtener actividad reciente');
  });
});
