import rateLimit from 'express-rate-limit';
import { ApplicationError } from '../lib/errors.js';

// Rate Limiter para operaciones pesadas (Solver)
const solverLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // Limite de 5 peticiones por IP
  handler: (_req, _res, next) =>
    next(
      new ApplicationError('Demasiadas peticiones al solver, por favor espere.', {
        code: 'RATE_LIMIT',
        status: 429,
      })
    ),
});

export { solverLimiter };
