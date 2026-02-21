class ApplicationError extends Error {
  constructor(message, { code = 'INTERNAL_ERROR', status = 500, details } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

class ValidationError extends ApplicationError {
  constructor(message = 'Error de validación', details) {
    super(message, { code: 'VALIDATION_ERROR', status: 400, details });
  }
}

class UnauthorizedError extends ApplicationError {
  constructor(message = 'No autenticado', details) {
    super(message, { code: 'UNAUTHORIZED', status: 401, details });
  }
}

class ForbiddenError extends ApplicationError {
  constructor(message = 'No autorizado', details) {
    super(message, { code: 'FORBIDDEN', status: 403, details });
  }
}

class NotFoundError extends ApplicationError {
  constructor(message = 'Recurso no encontrado', details) {
    super(message, { code: 'NOT_FOUND', status: 404, details });
  }
}

class ConflictError extends ApplicationError {
  constructor(message = 'Conflicto de datos', details) {
    super(message, { code: 'CONFLICT', status: 409, details });
  }
}

const isPrismaKnownError = (error) =>
  error && typeof error === 'object' && typeof error.code === 'string' && error.code.startsWith('P');

function mapPrismaError(error) {
  if (!isPrismaKnownError(error)) return null;

  if (error.code === 'P2025') {
    return new NotFoundError('Recurso no encontrado');
  }

  if (error.code === 'P2002') {
    return new ConflictError('Conflicto por clave única');
  }

  return null;
}

export {
  ApplicationError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  mapPrismaError,
};
