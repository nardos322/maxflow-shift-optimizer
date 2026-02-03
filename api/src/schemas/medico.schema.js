const { z } = require('zod');

const createMedicoSchema = z.object({
  body: z.object({
    nombre: z.string().min(2, 'El nombre es obligatorio'),
    email: z.string().email('Debe ser un email válido'),
    activo: z.boolean().optional(),
    userId: z.number().int().optional(),
  }),
});

const updateMedicoSchema = z.object({
  params: z.object({
    id: z
      .string()
      .transform((val) => parseInt(val, 10))
      .refine((val) => !isNaN(val), 'ID debe ser un número'),
  }),
  body: z.object({
    nombre: z.string().min(2).optional(),
    email: z.string().email().optional(),
    activo: z.boolean().optional(),
    userId: z.number().int().optional(),
  }),
});

module.exports = {
  createMedicoSchema,
  updateMedicoSchema,
};
