const prisma = require('../lib/prisma');

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

        // 4. Construir respuesta
        return {
            fechaGeneracion: new Date(),
            estadisticasGlobales: {
                totalGuardias: asignacionesTotal,
                medicosActivos: medicosCount,
                promedioPorMedico: parseFloat(promedio.toFixed(2)),
                desviacionEstandar: parseFloat(stdDev.toFixed(2)),
            },
            detallePorMedico: detalles.sort((a, b) => b.totalGuardias - a.totalGuardias),
        };
    }
}

module.exports = new ReportesService();
