const { ZodError } = require('zod');

/**
 * Middleware genérico para validar esquemas Zod
 * @param {import('zod').ZodSchema} schema - Esquema Zod a validar
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Validamos body, query y params contra el esquema
    // Usamos parseAsync por si el esquema tiene validaciones asíncronas
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError || error.name === 'ZodError') {
      const issues = error.issues || error.errors || [];
      return res.status(400).json({
        error: 'Error de validación',
        details: issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    console.error('Validate Middleware Error:', error);
    return res.status(500).json({ error: 'Error interno de validación' });
  }
};

module.exports = validate;
