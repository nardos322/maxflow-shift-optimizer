import prisma from '../lib/prisma.js';

class ReportesService {
  /**
   * Genera el reporte de equidad basado en las asignaciones actuales.
   * @returns {Promise<{
   *   fechaGeneracion: Date,
   *   estadisticasGlobales: {
   *     totalGuardias: number,
   *     medicosActivos: number,
   *     promedioPorMedico: number,
   *     desviacionEstandar: number
   *   },
   *   detallePorMedico: Array<{
   *     id: number,
   *     nombre: string,
   *     totalGuardias: number,
   *     periodosCubiertos: string[]
   *   }>
   * }>}
   */
  async generarReporteEquidad() {
    // 1. Obtener datos
    const medicos = await prisma.medico.findMany({
      where: { activo: true },
      include: {
        asignaciones: {
          include: { periodo: true },
        },
      },
    });

    const medicosCount = medicos.length;

    if (medicosCount === 0) {
      return { message: 'No hay médicos activos para analizar.' };
    }

    // 2. Calcular métricas por médico
    let asignacionesTotal = 0;
    const detalles = medicos.map((m) => {
      const totalGuardias = m.asignaciones.length;
      asignacionesTotal += totalGuardias;

      // Identificar periodos únicos cubiertos
      const periodosCubiertos = [
        ...new Set(m.asignaciones.map((a) => a.periodo.nombre)),
      ];

      return {
        id: m.id,
        nombre: m.nombre,
        totalGuardias,
        periodosCubiertos,
      };
    });

    // 3. Estadísticas Globales
    const promedio = asignacionesTotal / medicosCount;

    // Desviación Estándar (Population Standard Deviation)
    const variance =
      detalles.reduce((acc, curr) => {
        return acc + Math.pow(curr.totalGuardias - promedio, 2);
      }, 0) / medicosCount;
    const stdDev = Math.sqrt(variance);

    // 3.1 Métricas de cobertura global
    const configuracion = await prisma.configuracion.findFirst({
      orderBy: { id: 'desc' },
      select: { medicosPorDia: true },
    });
    const medicosPorDia = configuracion?.medicosPorDia ?? 1;
    const totalFeriados = await prisma.feriado.count();
    const totalTurnosRequeridos = totalFeriados * medicosPorDia;
    const turnosSinCobertura = Math.max(
      totalTurnosRequeridos - asignacionesTotal,
      0
    );
    const coberturaPorcentaje =
      totalTurnosRequeridos === 0
        ? 100
        : Math.min(
            100,
            parseFloat(
              ((asignacionesTotal / totalTurnosRequeridos) * 100).toFixed(2)
            )
          );

    // 4. Construir respuesta
    return {
      fechaGeneracion: new Date(),
      estadisticasGlobales: {
        totalGuardias: asignacionesTotal,
        medicosActivos: medicosCount,
        promedioPorMedico: parseFloat(promedio.toFixed(2)),
        desviacionEstandar: parseFloat(stdDev.toFixed(2)),
        totalTurnosRequeridos,
        turnosSinCobertura,
        coberturaPorcentaje,
      },
      detallePorMedico: detalles.sort(
        (a, b) => b.totalGuardias - a.totalGuardias
      ),
    };
  }
}

export default new ReportesService();
