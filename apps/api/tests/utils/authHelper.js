import prisma from '../../src/lib/prisma.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../../src/config.js';

const AuthHelper = {
  // Generic helper to create a user and get token
  // Returns { user, token }
  async createUserAndGetToken(role = 'ADMIN', data = {}) {
    const email =
      data.email ||
      `${role.toLowerCase()}${Math.floor(Math.random() * 10000)}@test.com`;
    const password = data.password || 'password123';
    const nombre = data.nombre || `Test ${role}`;

    // Create user directly in DB
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { email },
      update: { rol: role },
      create: {
        email,
        password: passwordHash,
        nombre,
        rol: role,
      },
    });

    // Generate token directly (faster, no API call)
    const token = jwt.sign(
      {
        userId: user.id,
        rol: user.rol,
        nombre: user.nombre,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { user, token };
  },

  async getAdminToken() {
    const { token } = await this.createUserAndGetToken('ADMIN', {
      email: 'admin@hospital.com',
      password: 'admin123',
    });
    return token;
  },

  async getMedicoToken() {
    const { token } = await this.createUserAndGetToken('MEDICO');
    return token;
  },

  async getLectorToken() {
    const { token } = await this.createUserAndGetToken('LECTOR');
    return token;
  },

  // Helper para obtener una cabecera de autenticación completa
  async getAuthHeader(role = 'ADMIN') {
    const { token } = await this.createUserAndGetToken(role);
    return `Bearer ${token}`;
  },
};

export default AuthHelper;
