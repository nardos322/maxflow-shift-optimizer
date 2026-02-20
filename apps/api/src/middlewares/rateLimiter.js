import rateLimit from 'express-rate-limit';

// Rate Limiter para operaciones pesadas (Solver)
const solverLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // Limite de 5 peticiones por IP
  message: { error: 'Demasiadas peticiones al solver, por favor espere.' },
});

export { solverLimiter };
