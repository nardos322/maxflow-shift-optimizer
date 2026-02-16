const asignacionesService = require('../services/asignaciones.service');
const prisma = require('../lib/prisma');

/**
 * POST /asignaciones/calcular
 * Ejecuta el solver C++ para generar asignaciones
 */
async function calcular(req, res, next) {
  try {
    const usuarioEmail = req.user ? req.user.email : 'system';
    const resultado = await asignacionesService.generarAsignaciones(usuarioEmail);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /asignaciones
 * Obtiene todas las asignaciones generadas
 */
async function obtenerResultados(req, res, next) {
  try {
    const asignaciones = await prisma.asignacion.findMany({
      include: {
        medico: { select: { id: true, nombre: true } },
        periodo: { select: { id: true, nombre: true } },
      },
      orderBy: { fecha: 'asc' },
    });

    res.json(asignaciones);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /asignaciones
 * Limpia todas las asignaciones
 */
async function limpiar(req, res, next) {
  try {
    await prisma.asignacion.deleteMany();
    res.json({ message: 'Asignaciones eliminadas' });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /asignaciones/reparar
 * Body: { medicoId: 123 }
 */
async function reparar(req, res, next) {
  try {
    const { medicoId, darDeBaja } = req.body;
    if (!medicoId)
      return res.status(400).json({ error: 'medicoId es requerido' });

    const usuarioEmail = req.user ? req.user.email : 'system';

    const resultado = await asignacionesService.repararAsignaciones(
      medicoId,
      darDeBaja,
      usuarioEmail
    );
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /asignaciones/simular
 * Ejecuta una simulación con parámetros modificados sin persistir cambios.
 * Body: {
 *   excluirMedicos: [id1, id2],
 *   config: { maxGuardiasTotales: 5, ... }
 * }
 */
async function simular(req, res, next) {
  try {
    const options = req.body || {};
    const resultado = await asignacionesService.simularAsignaciones(options);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  calcular,
  obtenerResultados,
  limpiar,
  reparar,
  simular,
};
