import prisma from '../lib/prisma.js';

class ConfiguracionService {
  /**
   * Obtiene la configuración global del sistema.
   * Si no existe, crea una por defecto.
   */
  async getConfiguracion() {
    let config = await prisma.configuracion.findFirst();

    if (!config) {
      config = await prisma.configuracion.create({
        data: {
          maxGuardiasTotales: 3,
          maxGuardiasPorPeriodo: 1,
          medicosPorDia: 1,
        },
      });
    }

    return config;
  }

  /**
   * Actualiza la configuración global.
   * @param {Object} data - Datos a actualizar (maxGuardiasTotales, medicosPorDia)
   */
  async actualizarConfiguracion(data) {
    const config = await this.getConfiguracion();

    return prisma.configuracion.update({
      where: { id: config.id },
      data: {
        maxGuardiasTotales: data.maxGuardiasTotales,
        maxGuardiasPorPeriodo: data.maxGuardiasPorPeriodo,
        medicosPorDia: data.medicosPorDia,
      },
    });
  }
}

export default new ConfiguracionService();
