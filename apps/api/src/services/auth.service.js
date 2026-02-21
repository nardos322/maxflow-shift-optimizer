import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config.js';
import {
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '../lib/errors.js';
import prisma from '../lib/prisma.js';

class AuthService {
  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        rol: user.rol,
        nombre: user.nombre,
        email: user.email,
      },
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

    // Solo admin puede registrar
    if (!adminUser || adminUser.rol !== 'ADMIN') {
      throw new ForbiddenError('Solo admin puede crear usuarios');
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      throw new ConflictError('El email ya está registrado');
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

export default new AuthService();
