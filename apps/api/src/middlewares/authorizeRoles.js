import { ForbiddenError } from '../lib/errors.js';

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return next(new ForbiddenError('No autorizado'));
    }
    next();
  };
}

export { authorizeRoles };
