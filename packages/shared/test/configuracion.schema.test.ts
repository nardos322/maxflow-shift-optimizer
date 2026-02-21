import { describe, expect, it } from 'vitest';
import { updateConfiguracionBodySchema } from '../src/schemas/configuracion.schema';

describe('Configuracion Schemas', () => {
  it('should validate freezeDays and maxGuardiasPorPeriodo', () => {
    const result = updateConfiguracionBodySchema.safeParse({
      maxGuardiasTotales: 8,
      maxGuardiasPorPeriodo: 2,
      medicosPorDia: 2,
      freezeDays: 14,
    });

    expect(result.success).toBe(true);
  });

  it('should fail when freezeDays is negative', () => {
    const result = updateConfiguracionBodySchema.safeParse({ freezeDays: -1 });
    expect(result.success).toBe(false);
  });
});
