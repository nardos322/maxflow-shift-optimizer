const { z } = require('zod');

const createDisponibilidadSchema = z.object({
    body: z.object({
        // Si no se envía medicoId, se asume que es el del usuario logueado (gestionado por controller)
        // pero validamos si se envía.
        medicoId: z.number().int().optional(),
        fecha: z.coerce.date()
    })
});

const createAsignacionSchema = z.object({
    body: z.object({
        medicoId: z.number().int('ID de médico inválido'),
        periodoId: z.number().int('ID de período inválido'),
        fecha: z.coerce.date()
    })
});

const repararAsignacionSchema = z.object({
    body: z.object({
        medicoId: z.number().int('ID de médico inválido')
    })
});

module.exports = {
    createDisponibilidadSchema,
    createAsignacionSchema,
    repararAsignacionSchema
};
