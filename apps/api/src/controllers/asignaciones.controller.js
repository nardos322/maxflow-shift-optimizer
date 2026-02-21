import asignacionesService from '../services/asignaciones.service.js';
import prisma from '../lib/prisma.js';
import { ValidationError } from '../lib/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * POST /asignaciones/calcular
 * Ejecuta el solver C++ para generar asignaciones
 */
const calcular = asyncHandler(async (req, res) => {
  const usuarioEmail = req.user ? req.user.email : 'system';
  const resultado = await asignacionesService.generarAsignaciones(usuarioEmail);
  res.json(resultado);
});

/**
 * GET /asignaciones
 * Obtiene todas las asignaciones generadas
 */
const obtenerResultados = asyncHandler(async (req, res) => {
  const asignaciones = await prisma.asignacion.findMany({
    include: {
      medico: { select: { id: true, nombre: true } },
      periodo: { select: { id: true, nombre: true } },
    },
    orderBy: { fecha: 'asc' },
  });

  res.json(asignaciones);
});

/**
 * DELETE /asignaciones
 * Limpia todas las asignaciones
 */
const limpiar = asyncHandler(async (req, res) => {
  await prisma.asignacion.deleteMany();
  res.status(204).send();
});

/**
 * POST /asignaciones/reparar
 * Body: { medicoId: 123 }
 */
const reparar = asyncHandler(async (req, res) => {
  const { medicoId, darDeBaja } = req.body;
  if (!medicoId) throw new ValidationError('medicoId es requerido');

  const usuarioEmail = req.user ? req.user.email : 'system';

  const resultado = await asignacionesService.repararAsignaciones(
    medicoId,
    darDeBaja,
    usuarioEmail
  );
  res.json(resultado);
});

/**
 * POST /asignaciones/simular
 * Ejecuta una simulación con parámetros modificados sin persistir cambios.
 * Body: {
 *   excluirMedicos: [id1, id2],
 *   config: { maxGuardiasTotales: 5, ... }
 * }
 */
const simular = asyncHandler(async (req, res) => {
  const options = req.body || {};
  const resultado = await asignacionesService.simularAsignaciones(options);
  res.json(resultado);
});

export default {
  calcular,
  obtenerResultados,
  limpiar,
  reparar,
  simular,
};
