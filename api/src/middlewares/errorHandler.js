/**
 * Middleware de manejo centralizado de errores
 */
function errorHandler(err, req, res, _next) {
  console.error('Error:', err.message);

  res.status(500).json({
    error: err.message,
    factible: false,
  });
}

module.exports = errorHandler;
