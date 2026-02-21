import authService from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

const register = asyncHandler(async (req, res) => {
  // req.user viene del middleware authenticateJWT (admin)
  const result = await authService.register(req.body, req.user);
  res.status(201).json(result);
});

export { login, register };
