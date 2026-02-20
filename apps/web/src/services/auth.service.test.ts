import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/hooks/useAuthStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

import { authService } from './auth.service';
import { useAuthStore } from '@/hooks/useAuthStore';

function mockJsonResponse(ok: boolean, data: unknown) {
  return {
    ok,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response;
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn() as unknown as typeof fetch;
  });

  it('returns token from store', () => {
    (useAuthStore.getState as any).mockReturnValue({ token: 'token-123' });

    expect(authService.getToken()).toBe('token-123');
  });

  it('login sends POST and returns auth payload', async () => {
    (global.fetch as any).mockResolvedValue(
      mockJsonResponse(true, { token: 'abc', user: { id: 1, email: 'a@b.com' } })
    );

    const result = await authService.login('a@b.com', 'secret');

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
    });
    expect(result).toEqual({ token: 'abc', user: { id: 1, email: 'a@b.com' } });
  });

  it('login throws backend error message when response is not ok', async () => {
    (global.fetch as any).mockResolvedValue(mockJsonResponse(false, { error: 'Credenciales inválidas' }));

    await expect(authService.login('a@b.com', 'wrong')).rejects.toThrow('Credenciales inválidas');
  });

  it('register sends token in Authorization header', async () => {
    (useAuthStore.getState as any).mockReturnValue({ token: 'admin-token' });
    (global.fetch as any).mockResolvedValue(
      mockJsonResponse(true, { token: 'new-token', user: { id: 2, email: 'new@b.com' } })
    );

    await authService.register({ nombre: 'Nuevo', email: 'new@b.com', password: 'secret', rol: 'MEDICO' });

    expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify({ nombre: 'Nuevo', email: 'new@b.com', password: 'secret', rol: 'MEDICO' }),
    });
  });
});
