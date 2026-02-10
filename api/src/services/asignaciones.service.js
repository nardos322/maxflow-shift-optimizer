const prisma = require('../lib/prisma');
const coreService = require('./core.service');

class AsignacionesService {
  /**
   * Genera las asignaciones llamando al core (C++) y guardando resultados
   */
  async generarAsignaciones() {
    // 1. Obtener datos de la DB
    const medicos = await prisma.medico.findMany({
      where: { activo: true },
      include: { disponibilidad: true },
    });

    const periodos = await prisma.periodo.findMany({
      include: { feriados: true },
      orderBy: { fechaInicio: 'asc' }, // Ordenar cronológicamente
    });

    const config = await prisma.configuracion.findFirst();

    if (!config) {
      throw new Error('Configuración no encontrada');
    }

    if (medicos.length === 0) throw new Error('No hay médicos activos');
    if (periodos.length === 0) throw new Error('No hay períodos definidos');

    // 2. Preparar JSON para el core (Usando core.service)
    const inputJson = coreService.prepareInput(medicos, periodos, config);

    // 3. Ejecutar el ejecutable C++
    const output = await coreService.runSolver(inputJson);

    // 4. Procesar salida
    if (output.factible) {
      // Borrar asignaciones anteriores
      await prisma.asignacion.deleteMany();

      // Guardar nuevas asignaciones
      const asignacionesParaGuardar = [];

      // Mapear nombres a IDs
      const medicoMap = new Map(medicos.map((m) => [m.nombre, m]));
      const periodoMap = new Map(); // fecha string -> periodo

      for (const p of periodos) {
        for (const f of p.feriados) {
          periodoMap.set(f.fecha.toISOString().split('T')[0], p);
        }
      }

      for (const assignment of output.asignaciones) {
        const medico = medicoMap.get(assignment.medico);
        const periodo = periodoMap.get(assignment.dia);

        if (medico && periodo) {
          asignacionesParaGuardar.push({
            medicoId: medico.id,
            periodoId: periodo.id,
            fecha: new Date(assignment.dia),
          });
        }
      }

      if (asignacionesParaGuardar.length > 0) {
        await prisma.asignacion.createMany({
          data: asignacionesParaGuardar,
        });
      }

      return {
        status: 'FEASIBLE', // Mapear 'factible: true' a 'FEASIBLE'
        asignacionesCreadas: asignacionesParaGuardar.length,
        // flow: output.flow // No parece devolver flow
      };
    } else {
      // INFEASIBLE: Devolver diagnóstico (min-cut)
      return {
        status: 'INFEASIBLE',
        message: 'No se pudo encontrar una solución válida.',
        minCut: output.bottlenecks || [], // El core devuelve 'bottlenecks'
      };
    }
  }

  /**
   * Repara las asignaciones tras la baja de un médico.
   * Algoritmo:
   * 1. Identificar asignaciones futuras del médico dado de baja.
   * 2. Intentar reasignarlas a otros médicos disponibles que NO han alcanzado su cupo.
   * 3. Si no es posible cubrir alguna, se marca como 'SIN_CUBRIR' (o se deja para manejo manual).
   *
   * @param {number} medicoId - ID del médico que se da de baja
   * @param {boolean} darDeBaja - Si true, marca al médico como inactivo en la DB
   */
  async repararAsignaciones(medicoId, darDeBaja = false) {
    medicoId = parseInt(medicoId);
    if (isNaN(medicoId)) throw new Error('ID de médico inválido');

    // 1. Obtener configuración
    const config = await prisma.configuracion.findFirst();
    if (!config) throw new Error('No hay configuración definida');

    // 2. Obtener todas las asignaciones futuras
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const asignacionesExistentes = await prisma.asignacion.findMany({
      where: { fecha: { gte: hoy } },
      include: { medico: true },
    });

    // 3. Identificar huecos (asignaciones del médico saliente)
    const asignacionesBorrables = asignacionesExistentes.filter(
      (a) => a.medicoId === medicoId
    );

    // Si no hay asignaciones futuras, igual procesamos la baja si se solicitó
    if (asignacionesBorrables.length === 0) {
      if (darDeBaja) {
        await prisma.medico.update({
          where: { id: medicoId },
          data: { activo: false },
        });
      }
      return {
        status: 'OK',
        message:
          'El médico no tenía asignaciones futuras. No se requiere reparación.',
      };
    }

    // 4. Calcular capacidad restante de médicos activos
    const medicosActivos = await prisma.medico.findMany({
      where: {
        activo: true,
        id: { not: medicoId },
      },
      include: { disponibilidad: true },
    });

    const capacidadesPersonales = {};
    const asignacionesConservadas = asignacionesExistentes.filter(
      (a) => a.medicoId !== medicoId
    );

    for (const medico of medicosActivos) {
      const usadas = asignacionesConservadas.filter(
        (a) => a.medicoId === medico.id
      ).length;
      // Asumimos que maxGuardiasTotales es el límite relevante para la reparación global
      // Si se desea usar maxGuardiasPorPeriodo, habría que calcularlo por periodo,
      // pero el core actualmente maneja capacidades globales en 'capacidades'.
      // Para reparación precisa por periodo, el core debería recibir capacidades por periodo o manejarlo internamente.
      // Por ahora mantenemos la lógica original que usaba el total.
      const restante = Math.max(0, config.maxGuardiasTotales - usadas);
      capacidadesPersonales[medico.nombre] = restante;
    }

    // 5. Preparar datos para solver (SOLO para los huecos)
    const fechasHuecos = asignacionesBorrables.map(
      (a) => a.fecha.toISOString().split('T')[0]
    );
    const periodosAfectadosIds = [
      ...new Set(asignacionesBorrables.map((a) => a.periodoId)),
    ];

    const periodos = await prisma.periodo.findMany({
      where: { id: { in: periodosAfectadosIds } },
      include: { feriados: true },
    });

    // Filtramos los periodos para que SOLO contengan los días huecos
    const periodosParaSolver = periodos
      .map((p) => ({
        ...p,
        feriados: p.feriados.filter((f) =>
          fechasHuecos.includes(f.fecha.toISOString().split('T')[0])
        ),
      }))
      .filter((p) => p.feriados.length > 0);

    // El solver necesita 'medicos' con 'disponibilidad'
    // Ya lo tenemos en medicosActivos

    // Construir input
    const inputData = coreService.prepareInput(
      medicosActivos,
      periodosParaSolver,
      config,
      { capacidades: capacidadesPersonales }
    );

    // 6. Ejecutar solver
    const output = await coreService.runSolver(inputData);

    // 7. Procesar resultados
    if (output.factible) {
      // Transacción para aplicar cambios
      await prisma.$transaction(async (tx) => {
        // Borrar asignaciones del médico saliente
        await tx.asignacion.deleteMany({
          where: {
            id: { in: asignacionesBorrables.map((a) => a.id) },
          },
        });

        // Guardar nuevas asignaciones (Append)
        // Necesitamos mapear nombres a IDs
        const medicoMap = new Map(medicosActivos.map((m) => [m.nombre, m]));
        const periodoIdsMap = new Map(); // Fecha -> PeriodoID
        for (const p of periodosParaSolver) {
          for (const f of p.feriados) {
            periodoIdsMap.set(f.fecha.toISOString().split('T')[0], p.id);
          }
        }
        // Nota: periodosParaSolver tiene los ID originales de periodos? Si.

        const asignacionesNuevas = [];
        for (const assignment of output.asignaciones) {
          const medico = medicoMap.get(assignment.medico);
          const periodoId = periodoIdsMap.get(assignment.dia);

          if (medico && periodoId) {
            asignacionesNuevas.push({
              medicoId: medico.id,
              periodoId: periodoId,
              fecha: new Date(assignment.dia),
            });
          }
        }

        if (asignacionesNuevas.length > 0) {
          await tx.asignacion.createMany({ data: asignacionesNuevas });
        }

        if (darDeBaja) {
          await tx.medico.update({
            where: { id: medicoId },
            data: { activo: false },
          });
        }
      });

      return {
        status: 'FEASIBLE',
        reasignaciones: output.asignaciones.length, // Número de reasignaciones
      };

    } else {
      return {
        status: 'INFEASIBLE',
        message: 'No se pudo encontrar una solución válida para reparar.',
        minCut: output.bottlenecks || [],
      };
    }
  }
}

module.exports = new AsignacionesService();
