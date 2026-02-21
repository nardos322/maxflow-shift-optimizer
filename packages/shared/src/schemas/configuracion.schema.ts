import { z } from "zod";

export const updateConfiguracionBodySchema = z.object({
  maxGuardiasTotales: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser positivo')
    .optional(),
  maxGuardiasPorPeriodo: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser positivo')
    .optional(),
  medicosPorDia: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser positivo')
    .optional(),
  freezeDays: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativo')
    .optional(),
});

export const updateConfiguracionSchema = z.object({
  body: updateConfiguracionBodySchema,
});
