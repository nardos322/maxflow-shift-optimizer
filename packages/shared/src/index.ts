import * as z from 'zod';
export * from './schemas/auth.schema';
export * from './schemas/asignacion.schema';
export * from './schemas/configuracion.schema';
export * from './schemas/medico.schema';
export * from './schemas/periodo.schema';

// Inferred Types
import { loginBodySchema, registerBodySchema } from './schemas/auth.schema';
import { createMedicoBodySchema, updateMedicoBodySchema } from './schemas/medico.schema';
import { createPeriodoBodySchema, updatePeriodoBodySchema } from './schemas/periodo.schema';
import { createAsignacionBodySchema, simulacionBodySchema } from './schemas/asignacion.schema';

export type LoginBody = z.infer<typeof loginBodySchema>;
export type RegisterBody = z.infer<typeof registerBodySchema>;
export type CreateMedicoBody = z.infer<typeof createMedicoBodySchema>;
export type UpdateMedicoBody = z.infer<typeof updateMedicoBodySchema>;
export type CreatePeriodoBody = z.infer<typeof createPeriodoBodySchema>;
export type UpdatePeriodoBody = z.infer<typeof updatePeriodoBodySchema>;
export type CreateAsignacionBody = z.infer<typeof createAsignacionBodySchema>;
export type SimulacionBody = z.infer<typeof simulacionBodySchema>;

export { z };
