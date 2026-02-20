import { z } from "zod";

export const idParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), 'ID debe ser un número'),
});

export const createDisponibilidadBodySchema = z.object({
  fechas: z
    .array(z.coerce.date(), {
      required_error: 'Se requiere un array de fechas',
    })
    .min(1, 'Debe enviar al menos una fecha'),
});

export const createDisponibilidadSchema = z.object({
  params: idParamSchema,
  body: createDisponibilidadBodySchema,
});

export const createAsignacionBodySchema = z.object({
  medicoId: z.number().int('ID de médico inválido'),
  periodoId: z.number().int('ID de período inválido'),
  fecha: z.coerce.date(),
});

export const createAsignacionSchema = z.object({
  body: createAsignacionBodySchema,
});

export const repararAsignacionBodySchema = z.object({
  medicoId: z.number().int('ID de médico inválido'),
});

export const repararAsignacionSchema = z.object({
  body: repararAsignacionBodySchema,
});

export const simulacionBodySchema = z.object({
  excluirMedicos: z.array(z.number().int()).optional(),
  config: z
    .object({
      maxGuardiasTotales: z.number().int().optional(),
      maxGuardiasPorPeriodo: z.number().int().optional(),
      medicosPorDia: z.number().int().optional(),
    })
    .optional(),
});

export const simulacionSchema = z.object({
  body: simulacionBodySchema,
});
