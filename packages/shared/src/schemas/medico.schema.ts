import { z } from "zod";
import { idParamSchema } from "./asignacion.schema.js"; // Reusing idParamSchema is cleaner

export const createMedicoBodySchema = z.object({
  nombre: z.string().min(2, 'El nombre es obligatorio'),
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional().or(z.literal("")),
  activo: z.boolean().optional(),
  userId: z.number().int().optional(),
});

export const createMedicoSchema = z.object({
  body: createMedicoBodySchema,
});

export const updateMedicoBodySchema = z.object({
  nombre: z.string().min(2).optional(),
  email: z.string().email().optional(),
  activo: z.boolean().optional(),
  userId: z.number().int().optional(),
});

export const updateMedicoSchema = z.object({
  params: idParamSchema,
  body: updateMedicoBodySchema,
});

export const getMedicoSchema = z.object({
  params: idParamSchema,
});

export const deleteMedicoSchema = z.object({
  params: idParamSchema,
});

export const deleteDisponibilidadBodySchema = z.object({
  fechas: z
    .array(z.coerce.date(), {
      required_error: 'Se requiere un array de fechas',
    })
    .min(1, 'Debe enviar al menos una fecha'),
});

export const deleteDisponibilidadSchema = z.object({
  params: idParamSchema,
  body: deleteDisponibilidadBodySchema,
});
