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
  darDeBaja: z.boolean().optional(),
  ventanaInicio: z.coerce.date().optional(),
  ventanaFin: z.coerce.date().optional(),
}).superRefine((data, ctx) => {
  if (data.ventanaInicio && data.ventanaFin && data.ventanaFin < data.ventanaInicio) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['ventanaFin'],
      message: 'ventanaFin debe ser mayor o igual que ventanaInicio',
    });
  }
});

export const repararAsignacionSchema = z.object({
  body: repararAsignacionBodySchema,
});

export const planDiffQuerySchema = z.object({
  fromVersionId: z.coerce.number().int('fromVersionId inválido').positive(),
  toVersionId: z.coerce.number().int('toVersionId inválido').positive(),
});

export const planDiffSchema = z.object({
  query: planDiffQuerySchema,
});

export const publishPlanVersionSchema = z.object({
  params: idParamSchema,
});

export const publishedPlanDiffQuerySchema = z.object({
  toVersionId: z.coerce.number().int('toVersionId inválido').positive(),
});

export const publishedPlanDiffSchema = z.object({
  query: publishedPlanDiffQuerySchema,
});

export const simulacionBodySchema = z.object({
  excluirMedicos: z.array(z.number().int()).optional(),
  periodosIds: z.array(z.number().int()).optional(),
  medicosHipoteticos: z
    .array(
      z.object({
        nombre: z.string().min(2),
        disponibilidadFechas: z.array(z.string()).optional(),
      })
    )
    .optional(),
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
