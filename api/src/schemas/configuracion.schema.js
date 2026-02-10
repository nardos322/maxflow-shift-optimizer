const { z } = require('zod');

const updateConfiguracionSchema = z.object({
  body: z.object({
    maxGuardiasTotales: z
      .number()
      .int('Debe ser un número entero')
      .positive('Debe ser positivo')
      .optional(),
    medicosPorDia: z
      .number()
      .int('Debe ser un número entero')
      .positive('Debe ser positivo')
      .optional(),
  }),
});

module.exports = {
  updateConfiguracionSchema,
};
