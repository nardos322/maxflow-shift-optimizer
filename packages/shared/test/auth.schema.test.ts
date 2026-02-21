import { describe, it, expect } from 'vitest';
import { loginBodySchema, registerBodySchema } from '../src/schemas/auth.schema';

describe('Auth Schemas', () => {
  describe('loginBodySchema', () => {
    it('should validate valid login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = loginBodySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'password123',
      };
      const result = loginBodySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Debe ser un email válido');
      }
    });

    it('should fail with empty password', () => {
      const data = {
        email: 'test@example.com',
        password: '',
      };
      const result = loginBodySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña es obligatoria');
      }
    });
  });

  describe('registerBodySchema', () => {
    it('should validate valid register data', () => {
      const data = {
        email: 'newuser@example.com',
        password: 'password123',
        nombre: 'New User',
        rol: 'MEDICO',
      };
      const result = registerBodySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail with short password', () => {
      const data = {
        email: 'newuser@example.com',
        password: '123',
        nombre: 'New User',
        rol: 'MEDICO',
      };
      const result = registerBodySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La contraseña debe tener al menos 6 caracteres');
      }
    });

    it('should fail with invalid role', () => {
      const data = {
        email: 'newuser@example.com',
        password: 'password123',
        nombre: 'New User',
        rol: 'INVALID_ROLE',
      };
      const result = registerBodySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El rol debe ser ADMIN, MEDICO o LECTOR');
      }
    });
  });
});
