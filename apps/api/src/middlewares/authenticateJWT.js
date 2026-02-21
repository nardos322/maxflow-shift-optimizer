import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config.js';
import { UnauthorizedError } from '../lib/errors.js';

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token requerido'));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return next(new UnauthorizedError('Token inválido o expirado'));
  }
}

export { authenticateJWT };
