import { z } from "zod";
import { idParamSchema } from "./asignacion.schema";

export const createPeriodoBodySchema = z
  .object({
    nombre: z.string().min(3, 'El nombre del período es obligatorio'),
    fechaInicio: z.coerce.date({
      errorMap: () => ({ message: 'Fecha de inicio inválida' }),
    }),
    fechaFin: z.coerce.date({
      errorMap: () => ({ message: 'Fecha de fin inválida' }),
    }),
  })
  .refine((data) => data.fechaFin > data.fechaInicio, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['fechaFin'],
  });

export const createPeriodoSchema = z.object({
  body: createPeriodoBodySchema,
});

export const updatePeriodoBodySchema = z
  .object({
    nombre: z.string().min(3).optional(),
    fechaInicio: z.coerce.date().optional(),
    fechaFin: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.fechaInicio && data.fechaFin) {
        return data.fechaFin > data.fechaInicio;
      }
      return true;
    },
    {
      message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      path: ['fechaFin'],
    }
  );

export const updatePeriodoSchema = z.object({
  params: idParamSchema,
  body: updatePeriodoBodySchema,
});

export const getPeriodoSchema = z.object({
  params: idParamSchema,
});

export const deletePeriodoSchema = z.object({
  params: idParamSchema,
});
