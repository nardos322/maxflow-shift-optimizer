import { describe, it, expect } from 'vitest';
import {
  createAsignacionBodySchema,
  idParamSchema,
  planDiffQuerySchema,
  publishPlanVersionSchema,
  publishedPlanDiffQuerySchema,
  repararAsignacionBodySchema,
} from '../src/schemas/asignacion.schema';

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

  describe('repararAsignacionBodySchema', () => {
    it('should validate repair payload with optional window', () => {
      const result = repararAsignacionBodySchema.safeParse({
        medicoId: 5,
        darDeBaja: true,
        ventanaInicio: '2026-03-01',
        ventanaFin: '2026-03-10',
      });
      expect(result.success).toBe(true);
    });

    it('should fail when ventanaFin is before ventanaInicio', () => {
      const result = repararAsignacionBodySchema.safeParse({
        medicoId: 5,
        ventanaInicio: '2026-03-10',
        ventanaFin: '2026-03-01',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('planDiffQuerySchema', () => {
    it('should parse valid version ids from query strings', () => {
      const result = planDiffQuerySchema.safeParse({
        fromVersionId: '1',
        toVersionId: '2',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.fromVersionId).toBe(1);
        expect(result.data.toVersionId).toBe(2);
      }
    });

    it('should fail for non positive values', () => {
      const result = planDiffQuerySchema.safeParse({
        fromVersionId: 0,
        toVersionId: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('publishPlanVersionSchema', () => {
    it('should parse version id from params', () => {
      const result = publishPlanVersionSchema.safeParse({
        params: { id: '10' },
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.params.id).toBe(10);
      }
    });
  });

  describe('publishedPlanDiffQuerySchema', () => {
    it('should parse toVersionId from query', () => {
      const result = publishedPlanDiffQuerySchema.safeParse({
        toVersionId: '3',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.toVersionId).toBe(3);
      }
    });

    it('should fail for invalid toVersionId', () => {
      const result = publishedPlanDiffQuerySchema.safeParse({
        toVersionId: 'abc',
      });
      expect(result.success).toBe(false);
    });
  });
});
