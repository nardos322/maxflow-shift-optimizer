import { describe, it, expect } from 'vitest';
import { createPeriodoBodySchema, updatePeriodoBodySchema } from '../src/schemas/periodo.schema';

describe('Periodo Schemas', () => {
  describe('createPeriodoBodySchema', () => {
    it('should validate valid periodo data', () => {
      const data = {
        nombre: 'Enero 2024',
        fechaInicio: '2024-01-01',
        fechaFin: '2024-01-31',
      };
      const result = createPeriodoBodySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail if fechaFin is before fechaInicio', () => {
      const data = {
        nombre: 'Periodo Invalido',
        fechaInicio: '2024-02-01',
        fechaFin: '2024-01-01',
      };
      const result = createPeriodoBodySchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La fecha de fin debe ser posterior a la fecha de inicio');
      }
    });

    it('should fail with invalid date format', () => {
      const data = {
        nombre: 'Periodo Invalido',
        fechaInicio: 'invalid-date',
        fechaFin: '2024-01-31',
      };
      const result = createPeriodoBodySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('updatePeriodoBodySchema', () => {
    it('should validate partial update with valid dates', () => {
      const data = {
        fechaInicio: '2024-02-01',
        fechaFin: '2024-02-28',
      };
      const result = updatePeriodoBodySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail partial update if dates are invalid', () => {
      const data = {
        fechaInicio: '2024-03-01',
        fechaFin: '2024-02-01',
      };
      const result = updatePeriodoBodySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
