import medicosService from '../services/medicos.service.js';
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from '../lib/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /medicos
 */
const obtenerTodos = asyncHandler(async (req, res) => {
  const soloActivos = req.query.soloActivos === 'true';
  const medicos = await medicosService.obtenerTodos(soloActivos);
  res.json(medicos);
});

/**
 * GET /medicos/:id
 */
const obtenerPorId = asyncHandler(async (req, res) => {
  const medico = await medicosService.obtenerPorId(req.params.id);
  if (!medico) {
    throw new NotFoundError('Médico no encontrado');
  }
  res.json(medico);
});

/**
 * POST /medicos
 */
const crear = asyncHandler(async (req, res) => {
  try {
    const { nombre, email, password, activo } = req.body;
    const medico = await medicosService.crear({
      nombre,
      email,
      password,
      activo,
    });
    res.status(201).json(medico);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictError('El email ya está registrado');
    }
    throw error;
  }
});

/**
 * PUT /medicos/:id
 */
const actualizar = asyncHandler(async (req, res) => {
  try {
    const medico = await medicosService.actualizar(req.params.id, req.body);
    res.json(medico);
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Médico no encontrado');
    }
    throw error;
  }
});

/**
 * DELETE /medicos/:id
 */
const eliminar = asyncHandler(async (req, res) => {
  try {
    await medicosService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Médico no encontrado');
    }
    throw error;
  }
});

/**
 * GET /medicos/:id/disponibilidad
 */
const obtenerDisponibilidad = asyncHandler(async (req, res) => {
  const disponibilidad = await medicosService.obtenerDisponibilidad(req.params.id);
  res.json(disponibilidad);
});

/**
 * POST /medicos/:id/disponibilidad
 * Body: { fechas: ["2026-04-02", "2026-04-03"] }
 */
const agregarDisponibilidad = asyncHandler(async (req, res) => {
  const { fechas } = req.body;
  if (!fechas || !Array.isArray(fechas)) {
    throw new ValidationError('Se requiere un array de fechas');
  }
  const result = await medicosService.agregarDisponibilidad(req.params.id, fechas);
  res.status(201).json(result);
});

/**
 * DELETE /medicos/:id/disponibilidad
 * Body: { fechas: ["2026-04-02"] }
 */
const eliminarDisponibilidad = asyncHandler(async (req, res) => {
  const { fechas } = req.body;
  if (!fechas || !Array.isArray(fechas)) {
    throw new ValidationError('Se requiere un array de fechas');
  }
  await medicosService.eliminarDisponibilidad(req.params.id, fechas);
  res.status(204).send();
});

export default {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  obtenerDisponibilidad,
  agregarDisponibilidad,
  eliminarDisponibilidad,
};
