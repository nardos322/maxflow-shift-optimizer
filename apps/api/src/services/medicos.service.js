import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

class MedicosService {
  /**
   * Obtiene todos los médicos
   */
  async obtenerTodos(soloActivos = false) {
    const where = soloActivos ? { activo: true } : {};
    return prisma.medico.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Obtiene un médico por ID
   */
  async obtenerPorId(id) {
    return prisma.medico.findUnique({
      where: { id: parseInt(id) },
      include: {
        disponibilidad: true,
        asignaciones: {
          include: { periodo: true },
        },
      },
    });
  }

  /**
   * Crea un nuevo médico
   */
  async crear(data) {
    return prisma.$transaction(async (tx) => {
      // 1. Verificar si el usuario ya existe
      const existingUser = await tx.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw { status: 409, message: 'El email ya está registrado' };
      }

      // 2. Crear Usuario (Login)
      // Contraseña por defecto: "medico123" (o la que venga en data)
      const plainPassword = data.password || 'medico123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const newUser = await tx.user.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          password: hashedPassword,
          rol: 'MEDICO',
        },
      });

      // 3. Crear Perfil de Médico vinculado
      const newMedico = await tx.medico.create({
        data: {
          nombre: data.nombre,
          email: data.email,
          activo: data.activo ?? true,
          userId: newUser.id,
        },
      });

      return {
        ...newMedico,
        user: {
          id: newUser.id,
          email: newUser.email,
        },
      };
    });
  }

  /**
   * Actualiza un médico
   */
  async actualizar(id, data) {
    return prisma.medico.update({
      where: { id: parseInt(id) },
      data,
    });
  }

  /**
   * Elimina un médico (soft delete - lo desactiva)
   */
  async eliminar(id) {
    const medicoId = parseInt(id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Eliminar asignaciones futuras
    await prisma.asignacion.deleteMany({
      where: {
        medicoId: medicoId,
        fecha: { gte: today },
      },
    });

    // 2. Desactivar médico
    return prisma.medico.update({
      where: { id: medicoId },
      data: { activo: false },
    });
  }

  /**
   * Agrega disponibilidad a un médico
   */
  async agregarDisponibilidad(medicoId, fechas) {
    const data = fechas.map((fecha) => ({
      medicoId: parseInt(medicoId),
      fecha: new Date(fecha),
    }));

    // Usar upsert para evitar duplicados
    const results = [];
    for (const item of data) {
      const result = await prisma.disponibilidad.upsert({
        where: {
          medicoId_fecha: {
            medicoId: item.medicoId,
            fecha: item.fecha,
          },
        },
        update: {},
        create: item,
      });
      results.push(result);
    }
    return results;
  }

  /**
   * Elimina disponibilidad de un médico
   */
  async eliminarDisponibilidad(medicoId, fechas) {
    return prisma.disponibilidad.deleteMany({
      where: {
        medicoId: parseInt(medicoId),
        fecha: { in: fechas.map((f) => new Date(f)) },
      },
    });
  }

  /**
   * Obtiene la disponibilidad de un médico
   */
  async obtenerDisponibilidad(medicoId) {
    return prisma.disponibilidad.findMany({
      where: { medicoId: parseInt(medicoId) },
      orderBy: { fecha: 'asc' },
    });
  }
}

export default new MedicosService();
