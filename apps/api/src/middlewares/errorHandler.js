import { ApplicationError, mapPrismaError } from '../lib/errors.js';

/**
 * Middleware de manejo centralizado de errores
 */
function errorHandler(err, req, res, _next) {
  const prismaMappedError = mapPrismaError(err);
  const normalizedError =
    prismaMappedError ||
    (err instanceof ApplicationError
      ? err
      : new ApplicationError(err?.message || 'Error interno del servidor'));
  const statusCode = normalizedError.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const messageToSend =
    statusCode === 500 && isProduction
      ? 'Ocurrió un error interno inesperado. Por favor contacte a soporte.'
      : normalizedError.message || 'Error interno del servidor';

  // Loguear solo errores graves (500) o si estamos en desarrollo
  // Evitar logs en tests para no ensuciar la salida
  if (process.env.NODE_ENV !== 'test') {
    if (statusCode === 500) {
      console.error('Error Crítico:', err);
    } else {
      console.warn(`Error Controlado (${statusCode}):`, normalizedError.message);
    }
  }

  const payload = {
    error: messageToSend,
    code: normalizedError.code || 'INTERNAL_ERROR',
    factible: false, // Mantener compatibilidad con frontend
  };

  if (normalizedError.details) {
    payload.details = normalizedError.details;
  }

  res.status(statusCode).json(payload);
}

export default errorHandler;
