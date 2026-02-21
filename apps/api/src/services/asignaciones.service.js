import prisma from '../lib/prisma.js';
import auditService from './audit.service.js';
import coreService from './core.service.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';

class AsignacionesService {
  getStartOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  getFreezeBoundary(config, fromDate = null) {
    const base = fromDate ? new Date(fromDate) : this.getStartOfToday();
    const freezeDays = Number.isInteger(config?.freezeDays)
      ? config.freezeDays
      : 0;
    base.setDate(base.getDate() + Math.max(0, freezeDays));
    base.setHours(0, 0, 0, 0);
    return base;
  }

  async ensurePlanVersion(id) {
    const planVersionId = parseInt(id, 10);
    if (Number.isNaN(planVersionId)) {
      throw new ValidationError('ID de versión inválido');
    }
    const planVersion = await prisma.planVersion.findUnique({
      where: { id: planVersionId },
    });
    if (!planVersion) {
      throw new NotFoundError(`Versión de plan ${planVersionId} no encontrada`);
    }
    return planVersion;
  }

  safeJsonParse(rawValue, defaultValue = null) {
    if (!rawValue) return defaultValue;
    try {
      return JSON.parse(rawValue);
    } catch (_error) {
      return defaultValue;
    }
  }

  async getAssignmentsForVersion(version) {
    if (version.snapshot) {
      const snapshot = this.safeJsonParse(version.snapshot, []);
      if (!Array.isArray(snapshot)) return [];
      const medicoIds = [...new Set(snapshot.map((a) => a.medicoId))];
      const medicos = await prisma.medico.findMany({
        where: { id: { in: medicoIds } },
        select: { id: true, nombre: true },
      });
      const medicoMap = new Map(medicos.map((m) => [m.id, m.nombre]));
      return snapshot
        .map((a) => ({
          fecha: new Date(a.fecha),
          medicoId: a.medicoId,
          periodoId: a.periodoId,
          medico: { nombre: medicoMap.get(a.medicoId) || 'Desconocido' },
        }))
        .filter((a) => !Number.isNaN(a.fecha.getTime()));
    }

    return prisma.asignacion.findMany({
      where: { planVersionId: version.id },
      include: { medico: { select: { id: true, nombre: true } } },
    });
  }

  /**
   * Genera las asignaciones llamando al core (C++) y guardando resultados
   */
  async generarAsignaciones(usuarioEmail) {
    // 1. Obtener datos de la DB
    const medicos = await prisma.medico.findMany({
      where: { activo: true },
      include: { disponibilidad: true },
    });

    const today = this.getStartOfToday();
    const config = await prisma.configuracion.findFirst();

    if (!config) {
      throw new NotFoundError('Configuración no encontrada');
    }

    const freezeBoundary = this.getFreezeBoundary(config, today);

    const periodos = await prisma.periodo.findMany({
      include: {
        feriados: {
          where: {
            estadoPlanificacion: 'PENDIENTE',
            fecha: { gte: freezeBoundary },
          },
        },
      },
      orderBy: { fechaInicio: 'asc' }, // Ordenar cronológicamente
    });
    const periodosPendientes = periodos.filter((periodo) => periodo.feriados.length > 0);

    if (medicos.length === 0) throw new ValidationError('No hay médicos activos');
    if (periodosPendientes.length === 0) {
      throw new ValidationError(
        'No hay feriados pendientes para planificar fuera de la ventana congelada'
      );
    }

    // 2. Preparar JSON para el core (Usando core.service)
    const inputJson = coreService.prepareInput(medicos, periodosPendientes, config);

    // 3. Ejecutar el ejecutable C++
    const output = await coreService.runSolver(inputJson);

    // 4. Procesar salida
    if (output.factible) {
      // Usar transacción para asegurar atomicidad
      return await prisma.$transaction(async (tx) => {
        const nuevaVersion = await tx.planVersion.create({
          data: {
            tipo: 'BASE',
            estado: 'DRAFT',
            usuario: usuarioEmail,
          },
        });

        // Replanificar solo hacia adelante para no perder histórico ya ejecutado.
        await tx.asignacion.deleteMany({
          where: {
            fecha: { gte: freezeBoundary },
          },
        });

        // Guardar nuevas asignaciones
        const asignacionesParaGuardar = [];
        const feriadosPlanificadosIds = new Set();

        // Mapear nombres a IDs
        const medicoMap = new Map(medicos.map((m) => [m.nombre, m]));
        const periodoMap = new Map(); // fecha string -> periodo
        const feriadoIdMap = new Map(); // fecha string -> feriadoId

        for (const p of periodosPendientes) {
          for (const f of p.feriados) {
            const fechaKey = f.fecha.toISOString().split('T')[0];
            periodoMap.set(fechaKey, p);
            feriadoIdMap.set(fechaKey, f.id);
          }
        }

        for (const assignment of output.asignaciones) {
          const medico = medicoMap.get(assignment.medico);
          const periodo = periodoMap.get(assignment.dia);
          const feriadoId = feriadoIdMap.get(assignment.dia);

          if (medico && periodo) {
            asignacionesParaGuardar.push({
              medicoId: medico.id,
              periodoId: periodo.id,
              fecha: new Date(assignment.dia),
              planVersionId: nuevaVersion.id,
            });
            if (feriadoId) {
              feriadosPlanificadosIds.add(feriadoId);
            }
          }
        }

        if (asignacionesParaGuardar.length > 0) {
          await tx.asignacion.createMany({
            data: asignacionesParaGuardar,
          });
        }

        if (feriadosPlanificadosIds.size > 0) {
          await tx.feriado.updateMany({
            where: {
              id: { in: Array.from(feriadosPlanificadosIds) },
              estadoPlanificacion: 'PENDIENTE',
            },
            data: {
              estadoPlanificacion: 'PLANIFICADO',
            },
          });
        }

        await auditService.log(
          'RESOLVER_ASIGNACIONES',
          usuarioEmail,
          {
            asignacionesCreadas: asignacionesParaGuardar.length,
            planVersionId: nuevaVersion.id,
          },
          tx
        );

        return {
          status: 'FEASIBLE',
          asignacionesCreadas: asignacionesParaGuardar.length,
          planVersion: {
            id: nuevaVersion.id,
            tipo: nuevaVersion.tipo,
            estado: nuevaVersion.estado,
            createdAt: nuevaVersion.createdAt,
          },
        };
      });
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
   * @param {string} usuarioEmail - Email del usuario que ejecuta la acción
   */
  async repararAsignaciones(
    medicoId,
    darDeBaja = false,
    ventanaInicio = null,
    ventanaFin = null,
    usuarioEmail = 'system'
  ) {
    medicoId = parseInt(medicoId);
    if (isNaN(medicoId)) throw new ValidationError('ID de médico inválido');

    const hoy = this.getStartOfToday();

    let inicioSolicitado = new Date(hoy);
    if (ventanaInicio) {
      const parsedInicio = new Date(ventanaInicio);
      if (Number.isNaN(parsedInicio.getTime())) {
        throw new ValidationError('ventanaInicio inválida');
      }
      parsedInicio.setHours(0, 0, 0, 0);
      if (parsedInicio > inicioSolicitado) inicioSolicitado = parsedInicio;
    }

    let fin = null;
    if (ventanaFin) {
      const parsedFin = new Date(ventanaFin);
      if (Number.isNaN(parsedFin.getTime())) {
        throw new ValidationError('ventanaFin inválida');
      }
      parsedFin.setHours(23, 59, 59, 999);
      fin = parsedFin;
    }

    if (fin && fin < inicioSolicitado) {
      throw new ValidationError('ventanaFin debe ser mayor o igual que ventanaInicio');
    }

    // 1. Obtener configuración
    const config = await prisma.configuracion.findFirst();
    if (!config) throw new NotFoundError('No hay configuración definida');

    const freezeBoundary = this.getFreezeBoundary(config, hoy);
    const inicio = inicioSolicitado > freezeBoundary ? inicioSolicitado : freezeBoundary;

    if (fin && fin < inicio) {
      return {
        status: 'OK',
        message:
          'La ventana solicitada cae completamente dentro del período congelado. No se aplicaron cambios.',
        ventanaAplicada: {
          inicio,
          fin,
          freezeBoundary,
        },
      };
    }

    // 2. Obtener todas las asignaciones futuras
    const whereBase = { fecha: { gte: inicio } };
    if (fin) {
      whereBase.fecha.lte = fin;
    }

    const asignacionesExistentes = await prisma.asignacion.findMany({
      where: whereBase,
      include: { medico: true, planVersion: true },
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
        ventanaAplicada: {
          inicio,
          fin,
          freezeBoundary,
        },
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

    const sourcePlanVersionId =
      asignacionesBorrables.find((a) => a.planVersionId)?.planVersionId ?? null;

    // 7. Procesar resultados
    if (output.factible) {
      // Transacción para aplicar cambios
      const nuevaVersion = await prisma.$transaction(async (tx) => {
        const nuevaVersionTx = await tx.planVersion.create({
          data: {
            tipo: 'REPAIR',
            estado: 'DRAFT',
            usuario: usuarioEmail,
            sourcePlanVersionId,
          },
        });

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
              planVersionId: nuevaVersionTx.id,
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
        return nuevaVersionTx;
      });

      await auditService.log('REPARAR_ASIGNACIONES', usuarioEmail, {
        medicoId,
        reasignaciones: output.asignaciones.length,
        darDeBaja,
        planVersionId: nuevaVersion.id,
        sourcePlanVersionId,
      });

      return {
        status: 'FEASIBLE',
        reasignaciones: output.asignaciones.length, // Número de reasignaciones
        planVersion: {
          id: nuevaVersion.id,
          tipo: nuevaVersion.tipo,
          estado: nuevaVersion.estado,
          sourcePlanVersionId: nuevaVersion.sourcePlanVersionId,
          createdAt: nuevaVersion.createdAt,
        },
        ventanaAplicada: {
          inicio,
          fin,
          freezeBoundary,
        },
      };
    } else {
      return {
        status: 'INFEASIBLE',
        message: 'No se pudo encontrar una solución válida para reparar.',
        minCut: output.bottlenecks || [],
      };
    }
  }

  async computeRepairPreviewData(
    medicoId,
    darDeBaja = false,
    ventanaInicio = null,
    ventanaFin = null
  ) {
    medicoId = parseInt(medicoId);
    if (isNaN(medicoId)) throw new ValidationError('ID de médico inválido');

    const hoy = this.getStartOfToday();

    let inicioSolicitado = new Date(hoy);
    if (ventanaInicio) {
      const parsedInicio = new Date(ventanaInicio);
      if (Number.isNaN(parsedInicio.getTime())) {
        throw new ValidationError('ventanaInicio inválida');
      }
      parsedInicio.setHours(0, 0, 0, 0);
      if (parsedInicio > inicioSolicitado) inicioSolicitado = parsedInicio;
    }

    let fin = null;
    if (ventanaFin) {
      const parsedFin = new Date(ventanaFin);
      if (Number.isNaN(parsedFin.getTime())) {
        throw new ValidationError('ventanaFin inválida');
      }
      parsedFin.setHours(23, 59, 59, 999);
      fin = parsedFin;
    }

    if (fin && fin < inicioSolicitado) {
      throw new ValidationError(
        'ventanaFin debe ser mayor o igual que ventanaInicio'
      );
    }

    const config = await prisma.configuracion.findFirst();
    if (!config) throw new NotFoundError('No hay configuración definida');

    const freezeBoundary = this.getFreezeBoundary(config, hoy);
    const inicio =
      inicioSolicitado > freezeBoundary ? inicioSolicitado : freezeBoundary;

    if (fin && fin < inicio) {
      return {
        status: 'OK',
        message:
          'La ventana solicitada cae completamente dentro del período congelado. No se aplicaron cambios.',
        ventanaAplicada: {
          inicio,
          fin,
          freezeBoundary,
        },
      };
    }

    const whereBase = { fecha: { gte: inicio } };
    if (fin) whereBase.fecha.lte = fin;

    const asignacionesExistentes = await prisma.asignacion.findMany({
      where: whereBase,
      include: { medico: true, planVersion: true },
    });

    const asignacionesBorrables = asignacionesExistentes.filter(
      (a) => a.medicoId === medicoId
    );

    if (asignacionesBorrables.length === 0) {
      return {
        status: 'OK',
        message:
          'El médico no tenía asignaciones futuras en la ventana. No se requiere reparación.',
        ventanaAplicada: {
          inicio,
          fin,
          freezeBoundary,
        },
      };
    }

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
      capacidadesPersonales[medico.nombre] = Math.max(
        0,
        config.maxGuardiasTotales - usadas
      );
    }

    const fechasHuecos = asignacionesBorrables.map((a) =>
      a.fecha.toISOString().split('T')[0]
    );
    const periodosAfectadosIds = [
      ...new Set(asignacionesBorrables.map((a) => a.periodoId)),
    ];

    const periodos = await prisma.periodo.findMany({
      where: { id: { in: periodosAfectadosIds } },
      include: { feriados: true },
    });

    const periodosParaSolver = periodos
      .map((p) => ({
        ...p,
        feriados: p.feriados.filter((f) =>
          fechasHuecos.includes(f.fecha.toISOString().split('T')[0])
        ),
      }))
      .filter((p) => p.feriados.length > 0);

    const inputData = coreService.prepareInput(
      medicosActivos,
      periodosParaSolver,
      config,
      { capacidades: capacidadesPersonales }
    );
    const output = await coreService.runSolver(inputData);

    const sourcePlanVersionId =
      asignacionesBorrables.find((a) => a.planVersionId)?.planVersionId ?? null;

    if (!output.factible) {
      return {
        status: 'INFEASIBLE',
        message:
          'No se pudo encontrar una solución válida para reparar.',
        minCut: output.bottlenecks || [],
        ventanaAplicada: {
          inicio,
          fin,
          freezeBoundary,
        },
      };
    }

    const medicoMap = new Map(medicosActivos.map((m) => [m.nombre, m]));
    const periodoIdsMap = new Map();
    for (const p of periodosParaSolver) {
      for (const f of p.feriados) {
        periodoIdsMap.set(f.fecha.toISOString().split('T')[0], p.id);
      }
    }

    const preservedAssignments = asignacionesConservadas.map((a) => ({
      medicoId: a.medicoId,
      periodoId: a.periodoId,
      fecha: a.fecha.toISOString(),
    }));

    const reassignedAssignments = [];
    for (const assignment of output.asignaciones) {
      const medico = medicoMap.get(assignment.medico);
      const periodoId = periodoIdsMap.get(assignment.dia);
      if (medico && periodoId) {
        reassignedAssignments.push({
          medicoId: medico.id,
          periodoId,
          fecha: new Date(assignment.dia).toISOString(),
        });
      }
    }

    const snapshot = [...preservedAssignments, ...reassignedAssignments];

    const diasAfectados = [
      ...new Set(
        reassignedAssignments.map((a) =>
          new Date(a.fecha).toISOString().split('T')[0]
        )
      ),
    ];

    const medicosEntrantes = [
      ...new Set(reassignedAssignments.map((a) => a.medicoId)),
    ];

    return {
      status: 'FEASIBLE',
      reasignaciones: reassignedAssignments.length,
      snapshot,
      sourcePlanVersionId,
      metadata: {
        darDeBaja: Boolean(darDeBaja),
        medicoId,
      },
      resumenImpacto: {
        medicoIdAfectado: medicoId,
        guardiasRemovidas: asignacionesBorrables.length,
        guardiasReasignadas: reassignedAssignments.length,
        diasAfectados: diasAfectados.length,
        listaDiasAfectados: diasAfectados,
        medicosEntrantes: medicosEntrantes.length,
        listaMedicosEntrantes: medicosEntrantes,
        cambiosEstimados: asignacionesBorrables.length + reassignedAssignments.length,
      },
      ventanaAplicada: {
        inicio,
        fin,
        freezeBoundary,
      },
    };
  }

  async previsualizarReparacion(
    medicoId,
    darDeBaja = false,
    ventanaInicio = null,
    ventanaFin = null
  ) {
    const preview = await this.computeRepairPreviewData(
      medicoId,
      darDeBaja,
      ventanaInicio,
      ventanaFin
    );

    if (preview.status !== 'FEASIBLE') return preview;

    return {
      status: 'FEASIBLE',
      resumenImpacto: preview.resumenImpacto,
      ventanaAplicada: preview.ventanaAplicada,
    };
  }

  async generarCandidataReparacion(
    medicoId,
    darDeBaja = false,
    ventanaInicio = null,
    ventanaFin = null,
    usuarioEmail = 'system'
  ) {
    const preview = await this.computeRepairPreviewData(
      medicoId,
      darDeBaja,
      ventanaInicio,
      ventanaFin
    );

    if (preview.status !== 'FEASIBLE') return preview;

    const version = await prisma.planVersion.create({
      data: {
        tipo: 'REPAIR_CANDIDATE',
        estado: 'DRAFT',
        usuario: usuarioEmail,
        sourcePlanVersionId: preview.sourcePlanVersionId,
        snapshot: JSON.stringify(preview.snapshot),
        metadata: JSON.stringify(preview.metadata),
      },
    });

    await auditService.log('CREAR_CANDIDATA_REPARACION', usuarioEmail, {
      medicoId: preview.metadata.medicoId,
      reasignaciones: preview.reasignaciones,
      planVersionId: version.id,
      sourcePlanVersionId: preview.sourcePlanVersionId,
      darDeBaja: preview.metadata.darDeBaja,
    });

    return {
      status: 'FEASIBLE',
      reasignaciones: preview.reasignaciones,
      planVersion: {
        id: version.id,
        tipo: version.tipo,
        estado: version.estado,
        sourcePlanVersionId: version.sourcePlanVersionId,
        createdAt: version.createdAt,
      },
      resumenImpacto: preview.resumenImpacto,
      ventanaAplicada: preview.ventanaAplicada,
    };
  }

  async compararVersiones(fromVersionId, toVersionId) {
    const fromVersion = await this.ensurePlanVersion(fromVersionId);
    const toVersion = await this.ensurePlanVersion(toVersionId);

    const [fromAsignaciones, toAsignaciones] = await Promise.all([
      this.getAssignmentsForVersion(fromVersion),
      this.getAssignmentsForVersion(toVersion),
    ]);

    const fromSet = new Set(
      fromAsignaciones.map(
        (a) => `${a.fecha.toISOString().split('T')[0]}|${a.medicoId}`
      )
    );
    const toSet = new Set(
      toAsignaciones.map(
        (a) => `${a.fecha.toISOString().split('T')[0]}|${a.medicoId}`
      )
    );

    const removidas = fromAsignaciones
      .filter((a) => !toSet.has(`${a.fecha.toISOString().split('T')[0]}|${a.medicoId}`))
      .map((a) => ({
        fecha: a.fecha,
        medicoId: a.medicoId,
        medico: a.medico.nombre,
      }));

    const agregadas = toAsignaciones
      .filter((a) => !fromSet.has(`${a.fecha.toISOString().split('T')[0]}|${a.medicoId}`))
      .map((a) => ({
        fecha: a.fecha,
        medicoId: a.medicoId,
        medico: a.medico.nombre,
      }));

    return {
      fromVersion: {
        id: fromVersion.id,
        tipo: fromVersion.tipo,
        createdAt: fromVersion.createdAt,
      },
      toVersion: {
        id: toVersion.id,
        tipo: toVersion.tipo,
        createdAt: toVersion.createdAt,
      },
      resumen: {
        totalFrom: fromAsignaciones.length,
        totalTo: toAsignaciones.length,
        agregadas: agregadas.length,
        removidas: removidas.length,
        cambiosNetos: agregadas.length + removidas.length,
      },
      agregadas,
      removidas,
    };
  }

  async listarVersiones() {
    const versiones = await prisma.planVersion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { asignaciones: true },
        },
      },
    });

    return versiones.map((v) => ({
      id: v.id,
      tipo: v.tipo,
      estado: v.estado,
      usuario: v.usuario,
      sourcePlanVersionId: v.sourcePlanVersionId,
      createdAt: v.createdAt,
      totalAsignaciones: v._count.asignaciones,
    }));
  }

  async publicarVersion(planVersionId, usuarioEmail = 'system') {
    const version = await this.ensurePlanVersion(planVersionId);

    await prisma.$transaction(async (tx) => {
      await tx.planVersion.updateMany({
        where: { estado: 'PUBLICADO' },
        data: { estado: 'DRAFT' },
      });

      await tx.planVersion.update({
        where: { id: version.id },
        data: { estado: 'PUBLICADO' },
      });

      if (version.snapshot) {
        const snapshot = this.safeJsonParse(version.snapshot, []);
        if (!Array.isArray(snapshot)) {
          throw new ValidationError('Snapshot de versión inválido');
        }

        const fechas = [
          ...new Set(
            snapshot
              .map((a) => {
                const fecha = new Date(a.fecha);
                return Number.isNaN(fecha.getTime())
                  ? null
                  : fecha.toISOString().split('T')[0];
              })
              .filter(Boolean)
          ),
        ];

        if (fechas.length > 0) {
          const rangosFecha = fechas.map((day) => {
            const start = new Date(`${day}T00:00:00.000Z`);
            const end = new Date(`${day}T23:59:59.999Z`);
            return { fecha: { gte: start, lte: end } };
          });
          await tx.asignacion.deleteMany({
            where: { OR: rangosFecha },
          });
        }

        if (snapshot.length > 0) {
          await tx.asignacion.createMany({
            data: snapshot.map((a) => ({
              medicoId: a.medicoId,
              periodoId: a.periodoId,
              fecha: new Date(a.fecha),
              planVersionId: version.id,
            })),
          });
        }

        const metadata = this.safeJsonParse(version.metadata, {});
        if (metadata?.darDeBaja && metadata?.medicoId) {
          await tx.medico.update({
            where: { id: metadata.medicoId },
            data: { activo: false },
          });
        }
      }

      await auditService.log(
        'PUBLICAR_PLAN_VERSION',
        usuarioEmail,
        { planVersionId: version.id },
        tx
      );
    });

    return prisma.planVersion.findUnique({ where: { id: version.id } });
  }

  async compararConPublicada(toVersionId) {
    const target = await this.ensurePlanVersion(toVersionId);
    const publicada = await prisma.planVersion.findFirst({
      where: {
        estado: 'PUBLICADO',
        id: { not: target.id },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!publicada) {
      throw new NotFoundError('No existe una versión publicada para comparar');
    }

    return this.compararVersiones(publicada.id, target.id);
  }

  async obtenerRiesgoVersion(planVersionId) {
    const target = await this.ensurePlanVersion(planVersionId);

    let baseline = null;
    if (target.sourcePlanVersionId) {
      baseline = await prisma.planVersion.findUnique({
        where: { id: target.sourcePlanVersionId },
      });
    }
    if (!baseline) {
      baseline = await prisma.planVersion.findFirst({
        where: { estado: 'PUBLICADO', id: { not: target.id } },
        orderBy: { createdAt: 'desc' },
      });
    }

    const [targetAssignments, baselineAssignments, config] = await Promise.all([
      this.getAssignmentsForVersion(target),
      baseline ? this.getAssignmentsForVersion(baseline) : [],
      prisma.configuracion.findFirst(),
    ]);

    const baselineMap = new Map(
      baselineAssignments.map((a) => [
        `${a.fecha.toISOString().split('T')[0]}|${a.medicoId}`,
        a,
      ])
    );
    const targetMap = new Map(
      targetAssignments.map((a) => [
        `${a.fecha.toISOString().split('T')[0]}|${a.medicoId}`,
        a,
      ])
    );

    const removidas = baselineAssignments.filter(
      (a) => !targetMap.has(`${a.fecha.toISOString().split('T')[0]}|${a.medicoId}`)
    );
    const agregadas = targetAssignments.filter(
      (a) => !baselineMap.has(`${a.fecha.toISOString().split('T')[0]}|${a.medicoId}`)
    );

    const periodIds = [
      ...new Set(
        [...targetAssignments, ...baselineAssignments]
          .map((a) => a.periodoId)
          .filter(Boolean)
      ),
    ];
    const periodos = await prisma.periodo.findMany({
      where: { id: { in: periodIds } },
      select: { id: true, nombre: true, feriados: { select: { fecha: true } } },
    });
    const periodoMap = new Map(periodos.map((p) => [p.id, p]));

    const medicoStats = new Map();
    for (const a of agregadas) {
      const key = a.medicoId;
      const current = medicoStats.get(key) || {
        medicoId: a.medicoId,
        medico: a.medico?.nombre || 'Desconocido',
        agregadas: 0,
        removidas: 0,
      };
      current.agregadas += 1;
      medicoStats.set(key, current);
    }
    for (const a of removidas) {
      const key = a.medicoId;
      const current = medicoStats.get(key) || {
        medicoId: a.medicoId,
        medico: a.medico?.nombre || 'Desconocido',
        agregadas: 0,
        removidas: 0,
      };
      current.removidas += 1;
      medicoStats.set(key, current);
    }

    const periodoStats = new Map();
    for (const a of agregadas) {
      const key = a.periodoId;
      const current = periodoStats.get(key) || {
        periodoId: a.periodoId,
        periodo: periodoMap.get(a.periodoId)?.nombre || 'Desconocido',
        agregadas: 0,
        removidas: 0,
      };
      current.agregadas += 1;
      periodoStats.set(key, current);
    }
    for (const a of removidas) {
      const key = a.periodoId;
      const current = periodoStats.get(key) || {
        periodoId: a.periodoId,
        periodo: periodoMap.get(a.periodoId)?.nombre || 'Desconocido',
        agregadas: 0,
        removidas: 0,
      };
      current.removidas += 1;
      periodoStats.set(key, current);
    }

    const medicosPorDia = config?.medicosPorDia ?? 1;
    const assignedPerDay = new Map();
    for (const a of targetAssignments) {
      const day = a.fecha.toISOString().split('T')[0];
      assignedPerDay.set(day, (assignedPerDay.get(day) || 0) + 1);
    }

    const allFeriadoDays = [
      ...new Set(
        periodos.flatMap((p) =>
          p.feriados.map((f) => f.fecha.toISOString().split('T')[0])
        )
      ),
    ];
    const diasConRiesgoCobertura = allFeriadoDays
      .map((day) => ({
        fecha: day,
        requeridos: medicosPorDia,
        asignados: assignedPerDay.get(day) || 0,
      }))
      .filter((d) => d.asignados < d.requeridos);

    const freezeBoundary = this.getFreezeBoundary(config || { freezeDays: 0 });
    const cambiosEnZonaCongelada = [...agregadas, ...removidas].filter(
      (a) => a.fecha < freezeBoundary
    ).length;

    return {
      version: {
        id: target.id,
        tipo: target.tipo,
        estado: target.estado,
        createdAt: target.createdAt,
      },
      baseline: baseline
        ? {
            id: baseline.id,
            tipo: baseline.tipo,
            estado: baseline.estado,
            createdAt: baseline.createdAt,
          }
        : null,
      resumen: {
        cambiosNetos: agregadas.length + removidas.length,
        agregadas: agregadas.length,
        removidas: removidas.length,
        medicosAfectados: medicoStats.size,
        periodosAfectados: periodoStats.size,
        diasConRiesgoCobertura: diasConRiesgoCobertura.length,
        cambiosEnZonaCongelada,
      },
      detallePorMedico: Array.from(medicoStats.values()).sort(
        (a, b) => b.agregadas + b.removidas - (a.agregadas + a.removidas)
      ),
      detallePorPeriodo: Array.from(periodoStats.values()).sort(
        (a, b) => b.agregadas + b.removidas - (a.agregadas + a.removidas)
      ),
      diasConRiesgoCobertura,
    };
  }

  /**
   * Ejecuta una simulación del solver con opciones personalizadas.
   * No guarda resultados en la base de datos.
   *
   * @param {object} options
   * @param {number[]} options.excluirMedicos - IDs de médicos a excluir
   * @param {object} options.config - Sobreescritura de configuración
   */
  async simularAsignaciones(options = {}) {
    const {
      excluirMedicos = [],
      periodosIds = [],
      medicosHipoteticos = [],
      config: configOverride = {},
    } = options;

    // 1. Obtener datos base
    let medicos = await prisma.medico.findMany({
      where: { activo: true },
      include: { disponibilidad: true },
    });

    const periodos = await prisma.periodo.findMany({
      where:
        periodosIds.length > 0 ? { id: { in: periodosIds.map((id) => parseInt(id)) } } : undefined,
      include: { feriados: true },
      orderBy: { fechaInicio: 'asc' },
    });

    let config = await prisma.configuracion.findFirst();

    if (!config) throw new NotFoundError('Configuración no encontrada');

    // 2. Aplicar filtros y overrides
    if (excluirMedicos.length > 0) {
      medicos = medicos.filter((m) => !excluirMedicos.includes(m.id));
    }

    if (periodosIds.length > 0 && periodos.length !== periodosIds.length) {
      throw new ValidationError('Uno o más períodos seleccionados no existen');
    }

    const fechasPeriodo = periodos.flatMap((p) =>
      p.feriados.map((f) => f.fecha)
    );

    if (periodos.length === 0 || fechasPeriodo.length === 0) {
      return {
        factible: false,
        message: 'No hay períodos/feriados disponibles para simular',
      };
    }

    if (medicosHipoteticos.length > 0) {
      const existingNames = new Set(medicos.map((m) => m.nombre));
      const hypotheticalNames = new Set();

      for (const [idx, medico] of medicosHipoteticos.entries()) {
        const nombre =
          typeof medico.nombre === 'string' ? medico.nombre.trim() : '';
        if (!nombre) {
          throw new ValidationError('Cada médico hipotético debe tener nombre');
        }
        if (existingNames.has(nombre) || hypotheticalNames.has(nombre)) {
          throw new ValidationError(
            `Nombre de médico duplicado en simulación: ${nombre}`
          );
        }
        hypotheticalNames.add(nombre);

        const availabilitySource =
          medico.disponibilidadFechas && medico.disponibilidadFechas.length > 0
            ? medico.disponibilidadFechas
            : fechasPeriodo.map((fecha) => fecha.toISOString());

        const disponibilidad = availabilitySource.map((fechaLike) => {
          const parsedDate = new Date(fechaLike);
          if (Number.isNaN(parsedDate.getTime())) {
            throw new ValidationError(
              `Fecha inválida en disponibilidad de ${nombre}: ${fechaLike}`
            );
          }
          return { fecha: parsedDate };
        });

        medicos.push({
          id: -(idx + 1),
          nombre,
          activo: true,
          disponibilidad,
        });
      }
    }

    if (medicos.length === 0) {
      return {
        factible: false,
        message: 'No hay médicos disponibles para la simulación',
      };
    }

    // Mezclar config base con overrides
    const configSimulacion = { ...config, ...configOverride };

    // 3. Preparar input
    const inputJson = coreService.prepareInput(
      medicos,
      periodos,
      configSimulacion
    );

    // 4. Ejecutar solver
    const output = await coreService.runSolver(inputJson);

    // 5. Retornar resultado directo (sin persistir)
    return {
      parametros: {
        medicosExcluidos: excluirMedicos.length,
        medicosHipoteticos: medicosHipoteticos.length,
        periodosConsiderados: periodos.length,
        config: configSimulacion,
      },
      resultado: output,
    };
  }
}

export default new AsignacionesService();
