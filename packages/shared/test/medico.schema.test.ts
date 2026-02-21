import { describe, it, expect } from 'vitest';
import { createMedicoBodySchema, updateMedicoBodySchema, deleteDisponibilidadBodySchema } from '../src/schemas/medico.schema';

describe('Medico Schemas', () => {
  describe('createMedicoBodySchema', () => {
    it('should validate valid medico data', () => {
      const data = {
        nombre: 'Dr. House',
        email: 'house@princeton.edu',
        activo: true,
      };
      const result = createMedicoBodySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid email', () => {
      const data = {
        nombre: 'Dr. House',
        email: 'invalid-email',
      };
      const result = createMedicoBodySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail with short name', () => {
      const data = {
        nombre: 'D',
        email: 'house@princeton.edu',
      };
      const result = createMedicoBodySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updateMedicoBodySchema', () => {
    it('should validate partial updates', () => {
      const data = {
        activo: false,
      };
      const result = updateMedicoBodySchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('deleteDisponibilidadBodySchema', () => {
    it('should validate array of dates', () => {
      const data = {
        fechas: ['2023-10-27', '2023-10-28']
      };
      const result = deleteDisponibilidadBodySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail with empty array', () => {
      const data = {
        fechas: []
      };
      const result = deleteDisponibilidadBodySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
