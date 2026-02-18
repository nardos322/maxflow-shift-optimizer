import { describe, it, expect } from 'vitest';
import { createAsignacionBodySchema, idParamSchema } from '../src/schemas/asignacion.schema';

describe('Asignacion Schemas', () => {
  describe('idParamSchema', () => {
    it('should validate valid numeric id string', () => {
      const result = idParamSchema.safeParse({ id: '123' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe(123);
      }
    });

    it('should fail with non-numeric string', () => {
      const result = idParamSchema.safeParse({ id: 'abc' });
      expect(result.success).toBe(false);
    });
  });

  describe('createAsignacionBodySchema', () => {
    it('should validate valid asignacion data', () => {
      const data = {
        medicoId: 1,
        periodoId: 1,
        fecha: '2024-01-01',
      };
      const result = createAsignacionBodySchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should fail with missing required fields', () => {
      const data = {
        medicoId: 1,
      };
      const result = createAsignacionBodySchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid date', () => {
      const data = {
        medicoId: 1,
        periodoId: 1,
        fecha: 'invalid-date',
      };
      const result = createAsignacionBodySchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
