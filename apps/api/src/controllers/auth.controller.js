import authService from '../services/auth.service.js';

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

async function register(req, res, next) {
  try {
    // req.user viene del middleware authenticateJWT (admin)
    const result = await authService.register(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export { login, register };
