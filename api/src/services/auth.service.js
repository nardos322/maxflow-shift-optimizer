const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

const prisma = new PrismaClient();

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw { status: 400, message: 'Email y contraseña requeridos' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { status: 401, message: 'Credenciales inválidas' };
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw { status: 401, message: 'Credenciales inválidas' };
    }

    const token = jwt.sign(
      { userId: user.id, rol: user.rol, nombre: user.nombre, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    };
  }

  async register(userData, adminUser) {
    const { nombre, email, password, rol } = userData;

    if (!nombre || !email || !password || !rol) {
      throw { status: 400, message: 'Faltan campos requeridos' };
    }

    // Solo admin puede registrar
    if (!adminUser || adminUser.rol !== 'ADMIN') {
      throw { status: 403, message: 'Solo admin puede crear usuarios' };
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw { status: 409, message: 'El email ya está registrado' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { nombre, email, password: passwordHash, rol },
    });

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
    };
  }
}

module.exports = new AuthService();
