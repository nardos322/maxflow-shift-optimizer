const authService = require('../services/auth.service');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

async function register(req, res) {
  try {
    // req.user viene del middleware authenticateJWT (admin)
    const result = await authService.register(req.body, req.user);
    res.status(201).json(result);
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = { login, register };
