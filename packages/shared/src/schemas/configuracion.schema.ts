import { z } from "zod";

export const updateConfiguracionBodySchema = z.object({
  maxGuardiasTotales: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser positivo')
    .optional(),
  medicosPorDia: z
    .number()
    .int('Debe ser un número entero')
    .positive('Debe ser positivo')
    .optional(),
});

export const updateConfiguracionSchema = z.object({
  body: updateConfiguracionBodySchema,
});
