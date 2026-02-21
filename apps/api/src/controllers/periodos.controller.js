import periodosService from '../services/periodos.service.js';
import { NotFoundError, ConflictError } from '../lib/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /periodos
 */
const obtenerTodos = asyncHandler(async (req, res) => {
  const periodos = await periodosService.obtenerTodos({
    rol: req.user?.rol,
  });
  res.json(periodos);
});

/**
 * GET /periodos/:id
 */
const obtenerPorId = asyncHandler(async (req, res) => {
  const periodo = await periodosService.obtenerPorId(req.params.id);
  if (!periodo) {
    throw new NotFoundError('Período no encontrado');
  }
  res.json(periodo);
});

/**
 * POST /periodos
 */
const crear = asyncHandler(async (req, res) => {
  try {
    const periodo = await periodosService.crear(req.body);
    res.status(201).json(periodo);
  } catch (error) {
    if (error.code === 'P2002') {
      throw new ConflictError('Ya existe un feriado en esa fecha');
    }
    throw error;
  }
});

/**
 * PUT /periodos/:id
 */
const actualizar = asyncHandler(async (req, res) => {
  try {
    const periodo = await periodosService.actualizar(req.params.id, req.body);
    res.json(periodo);
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Período no encontrado');
    }
    throw error;
  }
});

/**
 * DELETE /periodos/:id
 */
const eliminar = asyncHandler(async (req, res) => {
  try {
    await periodosService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Período no encontrado');
    }
    throw error;
  }
});

export default {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
