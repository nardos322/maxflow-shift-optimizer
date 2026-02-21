import { ZodError } from 'zod';
import { ApplicationError, ValidationError } from '../lib/errors.js';

/**
 * Middleware genérico para validar esquemas Zod
 * @param {import('zod').ZodSchema} schema - Esquema Zod a validar
 */
const validate = (schema) => async (req, res, next) => {
  try {
    // Validamos body, query y params contra el esquema
    // Usamos parseAsync por si el esquema tiene validaciones asíncronas
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError || error.name === 'ZodError') {
      const issues = error.issues || error.errors || [];
      return next(
        new ValidationError(
          'Error de validación',
          issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
          }))
        )
      );
    }
    return next(
      new ApplicationError('Error interno de validación', {
        code: 'VALIDATION_MIDDLEWARE_ERROR',
        status: 500,
      })
    );
  }
};

export default validate;
