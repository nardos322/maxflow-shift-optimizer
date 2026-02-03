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

module.exports = {
  createPeriodoSchema,
};
