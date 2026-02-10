const { z } = require('zod');

const createPeriodoSchema = z.object({
  body: z
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
    }),
});

const idParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), 'ID debe ser un número'),
});

const updatePeriodoSchema = z.object({
  params: idParamSchema,
  body: z
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
    ),
});

const getPeriodoSchema = z.object({
  params: idParamSchema,
});

const deletePeriodoSchema = z.object({
  params: idParamSchema,
});

module.exports = {
  createPeriodoSchema,
  updatePeriodoSchema,
  getPeriodoSchema,
  deletePeriodoSchema,
};
