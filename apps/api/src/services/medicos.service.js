import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

class MedicosService {
  getStartOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  normalizeDate(dateLike) {
    const date = new Date(dateLike);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  async validarFechasDisponibilidad(fechas) {
    const normalizedDates = fechas.map((fecha) => this.normalizeDate(fecha));
    const feriadosPendientes = await prisma.feriado.findMany({
      where: {
        fecha: { in: normalizedDates, gte: this.getStartOfToday() },
        estadoPlanificacion: 'PENDIENTE',
      },
      select: { fecha: true },
    });

    const allowedSet = new Set(
      feriadosPendientes.map((feriado) => feriado.fecha.toISOString().split('T')[0])
    );
    const invalidDates = normalizedDates
      .map((fecha) => fecha.toISOString().split('T')[0])
      .filter((fecha) => !allowedSet.has(fecha));

    if (invalidDates.length > 0) {
      throw new Error(
        `Fechas no disponibles para edición: ${invalidDates.join(', ')}. Solo se permite disponibilidad en feriados pendientes.`
      );
    }

    return normalizedDates;
  }

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
    const normalizedDates = await this.validarFechasDisponibilidad(fechas);
    const data = normalizedDates.map((fecha) => ({
      medicoId: parseInt(medicoId),
      fecha,
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
    const normalizedDates = await this.validarFechasDisponibilidad(fechas);
    return prisma.disponibilidad.deleteMany({
      where: {
        medicoId: parseInt(medicoId),
        fecha: { in: normalizedDates },
      },
    });
  }

  /**
   * Obtiene la disponibilidad de un médico
   */
  async obtenerDisponibilidad(medicoId) {
    const feriadosPendientes = await prisma.feriado.findMany({
      where: {
        estadoPlanificacion: 'PENDIENTE',
        fecha: { gte: this.getStartOfToday() },
      },
      select: { fecha: true },
    });
    const fechasPermitidas = feriadosPendientes.map((f) => f.fecha);

    if (fechasPermitidas.length === 0) return [];

    return prisma.disponibilidad.findMany({
      where: {
        medicoId: parseInt(medicoId),
        fecha: { in: fechasPermitidas },
      },
      orderBy: { fecha: 'asc' },
    });
  }
}

export default new MedicosService();
