const prisma = require('../lib/prisma');

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
    return prisma.medico.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        activo: data.activo ?? true,
      },
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

module.exports = new MedicosService();
