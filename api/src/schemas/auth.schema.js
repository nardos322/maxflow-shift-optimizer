const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Debe ser un email válido'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
  }),
});

const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Debe ser un email válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe tener al menos 6 caracteres'),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    rol: z.enum(['ADMIN', 'MEDICO', 'LECTOR'], {
      errorMap: () => ({ message: 'El rol debe ser ADMIN, MEDICO o LECTOR' }),
    }),
  }),
});

module.exports = {
  loginSchema,
  registerSchema,
};
