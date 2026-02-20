import prisma from '../lib/prisma.js';

class PeriodosService {
  getStartOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  /**
   * Obtiene todos los períodos con sus feriados
   */
  async obtenerTodos(options = {}) {
    const { rol } = options;
    const feriadosWhere =
      rol === 'MEDICO'
        ? {
            estadoPlanificacion: 'PENDIENTE',
            fecha: { gte: this.getStartOfToday() },
          }
        : undefined;

    const periodos = await prisma.periodo.findMany({
      include: { feriados: true },
      orderBy: { fechaInicio: 'desc' },
      ...(feriadosWhere ? { where: { feriados: { some: feriadosWhere } } } : {}),
    });

    if (!feriadosWhere) return periodos;

    return periodos.map((periodo) => ({
      ...periodo,
      feriados: periodo.feriados.filter(
        (feriado) =>
          feriado.estadoPlanificacion === 'PENDIENTE' &&
          new Date(feriado.fecha) >= this.getStartOfToday()
      ),
    }));
  }

  /**
   * Obtiene un período por ID con sus feriados
   */
  async obtenerPorId(id) {
    return prisma.periodo.findUnique({
      where: { id: parseInt(id) },
      include: { feriados: true },
    });
  }

  /**
   * Crea un nuevo período y sus feriados asociados.
   * Maneja la transacción para crear todo junto.
   */
  async crear(data) {
    const { nombre, fechaInicio, fechaFin, feriados } = data;

    // Usar transacción para crear período y feriados
    return prisma.$transaction(async (tx) => {
      const nuevoPeriodo = await tx.periodo.create({
        data: {
          nombre,
          fechaInicio: new Date(fechaInicio),
          fechaFin: new Date(fechaFin),
        },
      });

      if (feriados && feriados.length > 0) {
        await tx.feriado.createMany({
          data: feriados.map((f) => ({
            periodoId: nuevoPeriodo.id,
            fecha: new Date(f.fecha),
            descripcion: f.descripcion,
          })),
        });
      }

      return tx.periodo.findUnique({
        where: { id: nuevoPeriodo.id },
        include: { feriados: true },
      });
    });
  }

  /**
   * Actualiza un período existente
   */
  async actualizar(id, data) {
    const { nombre, fechaInicio, fechaFin, feriados } = data;

    return prisma.$transaction(async (tx) => {
      // 1. Actualizar datos básicos del período
      await tx.periodo.update({
        where: { id: parseInt(id) },
        data: {
          nombre,
          fechaInicio: fechaInicio ? new Date(fechaInicio) : undefined,
          fechaFin: fechaFin ? new Date(fechaFin) : undefined,
        },
      });

      // 2. Si vienen feriados, reemplazar los existentes (estrategia simple)
      if (feriados) {
        // Borrar feriados viejos
        await tx.feriado.deleteMany({
          where: { periodoId: parseInt(id) },
        });

        // Crear nuevos
        if (feriados.length > 0) {
          await tx.feriado.createMany({
            data: feriados.map((f) => ({
              periodoId: parseInt(id),
              fecha: new Date(f.fecha),
              descripcion: f.descripcion,
            })),
          });
        }
      }

      return tx.periodo.findUnique({
        where: { id: parseInt(id) },
        include: { feriados: true },
      });
    });
  }

  /**
   * Elimina un período y sus feriados (en cascada por la definición de schema o manual)
   */
  async eliminar(id) {
    const periodoId = parseInt(id);

    // 1. Borrar feriados primero
    await prisma.feriado.deleteMany({
      where: { periodoId },
    });

    // 2. Borrar asignaciones asociadas
    await prisma.asignacion.deleteMany({
      where: { periodoId },
    });

    // 3. Borrar período
    return prisma.periodo.delete({
      where: { id: periodoId },
    });
  }
}

export default new PeriodosService();
