import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export const loginSchema = z.object({
  body: loginBodySchema,
});

export const registerBodySchema = z.object({
  email: z.string().email('Debe ser un email válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  rol: z.enum(['ADMIN', 'MEDICO', 'LECTOR'], {
    errorMap: () => ({ message: 'El rol debe ser ADMIN, MEDICO o LECTOR' }),
  }),
});

export const registerSchema = z.object({
  body: registerBodySchema,
});
