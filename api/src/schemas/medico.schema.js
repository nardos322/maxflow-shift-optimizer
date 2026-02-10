const { z } = require('zod');

const idParamSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val), 'ID debe ser un número'),
});

const createMedicoSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre es obligatorio'),
    email: z.string().email('Debe ser un email válido'),
    activo: z.boolean().optional(),
    userId: z.number().int().optional(),
  }),
});

const updateMedicoSchema = z.object({
  params: idParamSchema,
  body: z.object({
    nombre: z.string().min(2).optional(),
    email: z.string().email().optional(),
    activo: z.boolean().optional(),
    userId: z.number().int().optional(),
  }),
});

const getMedicoSchema = z.object({
  params: idParamSchema,
});

const deleteMedicoSchema = z.object({
  params: idParamSchema,
});

const deleteDisponibilidadSchema = z.object({
  params: idParamSchema,
  body: z.object({
    fechas: z
      .array(z.coerce.date(), {
        required_error: 'Se requiere un array de fechas',
      })
      .min(1, 'Debe enviar al menos una fecha'),
  }),
});

module.exports = {
  createMedicoSchema,
  updateMedicoSchema,
  getMedicoSchema,
  deleteMedicoSchema,
  deleteDisponibilidadSchema,
};
