const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

const prisma = new PrismaClient();

async function login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
        { userId: user.id, rol: user.rol, nombre: user.nombre, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
    res.json({ token, user: { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol } });
}

async function register(req, res) {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    // Solo admin puede registrar
    if (!req.user || req.user.rol !== 'ADMIN') {
        return res.status(403).json({ error: 'Solo admin puede crear usuarios' });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
        return res.status(409).json({ error: 'El email ya está registrado' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { nombre, email, password: passwordHash, rol }
    });
    res.status(201).json({ id: user.id, nombre: user.nombre, email: user.email, rol: user.rol });
}

module.exports = { login, register };