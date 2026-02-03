const prisma = require("./prisma");

const Factories = {
  async createMedico(data = {}) {
    return prisma.medico.create({
      data: {
        nombre: data.nombre || `Medico ${Math.floor(Math.random() * 1000)}`,
        email:
          data.email || `medico${Math.floor(Math.random() * 1000)}@test.com`,
        activo: data.activo !== undefined ? data.activo : true,
        ...(data.userId && { user: { connect: { id: data.userId } } }),
      },
    });
  },

  async createPeriodo(data = {}) {
    const fechaInicio = data.fechaInicio || new Date();
    const fechaFin =
      data.fechaFin || new Date(new Date().setDate(new Date().getDate() + 5));

    return prisma.periodo.create({
      data: {
        nombre: data.nombre || "Periodo Test",
        fechaInicio,
        fechaFin,
      },
    });
  },

  async createPeriodoWithFeriados(dias = []) {
    if (dias.length === 0) {
      const hoy = new Date();
      dias = [hoy, new Date(hoy.getTime() + 86400000)];
    }

    dias.sort((a, b) => a - b);

    return prisma.periodo.create({
      data: {
        nombre: `Periodo Auto ${dias.length} dias`,
        fechaInicio: dias[0],
        fechaFin: dias[dias.length - 1],
        feriados: {
          create: dias.map((d, i) => ({
            fecha: d,
            descripcion: `Feriado ${i}`,
          })),
        },
      },
      include: { feriados: true },
    });
  },

  async createConfiguracion(data = {}) {
    const exists = await prisma.configuracion.findFirst();
    if (exists) {
      return prisma.configuracion.update({
        where: { id: exists.id },
        data: {
          maxGuardiasTotales: data.maxGuardiasTotales || 5,
          medicosPorDia: data.medicosPorDia || 1,
        },
      });
    }
    return prisma.configuracion.create({
      data: {
        maxGuardiasTotales: data.maxGuardiasTotales || 5,
        medicosPorDia: data.medicosPorDia || 1,
      },
    });
  },

  async createDisponibilidad(medicoId, fecha) {
    return prisma.disponibilidad.create({
      data: {
        medicoId,
        fecha,
      },
    });
  },

  async createAsignacion(medicoId, periodoId, fecha) {
    return prisma.asignacion.create({
      data: {
        medicoId,
        periodoId,
        fecha,
      },
    });
  },

  async debugCleanDB() {
    // Warning: This deletes everything
    await prisma.asignacion.deleteMany();
    await prisma.disponibilidad.deleteMany();
    await prisma.feriado.deleteMany();
    await prisma.periodo.deleteMany();
    await prisma.medico.deleteMany();
    await prisma.configuracion.deleteMany();
  },
};

module.exports = Factories;
