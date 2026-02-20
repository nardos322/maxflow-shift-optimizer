/**
 * Middleware de manejo centralizado de errores
 */
function errorHandler(err, req, res, _next) {
  // Si el error tiene un status personalizado (ej: 404, 401), úsalo. Si no, 500.
  const statusCode = err.status || 500;

  // Loguear solo errores graves (500) o si estamos en desarrollo
  // Evitar logs en tests para no ensuciar la salida
  if (process.env.NODE_ENV !== 'test') {
    if (statusCode === 500) {
      console.error('Error Crítico:', err);
    } else {
      console.warn(`Error Controlado (${statusCode}):`, err.message);
    }
  }

  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
    factible: false, // Mantener compatibilidad con frontend
  });
}

export default errorHandler;
