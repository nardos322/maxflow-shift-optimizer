import periodosService from '../services/periodos.service.js';
import { NotFoundError, ConflictError } from '../lib/errors.js';

/**
 * GET /periodos
 */
async function obtenerTodos(req, res, next) {
  try {
    const periodos = await periodosService.obtenerTodos({
      rol: req.user?.rol,
    });
    res.json(periodos);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /periodos/:id
 */
async function obtenerPorId(req, res, next) {
  try {
    const periodo = await periodosService.obtenerPorId(req.params.id);
    if (!periodo) {
      throw new NotFoundError('Período no encontrado');
    }
    res.json(periodo);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /periodos
 * Body: {
 *   nombre: "Semana Santa 2026",
 *   fechaInicio: "2026-04-02",
 *   fechaFin: "2026-04-05",
 *   feriados: [
 *     { fecha: "2026-04-02", descripcion: "Jueves Santo" },
 *     { fecha: "2026-04-03", descripcion: "Viernes Santo" }
 *   ]
 * }
 */
async function crear(req, res, next) {
  try {
    const periodo = await periodosService.crear(req.body);
    res.status(201).json(periodo);
  } catch (error) {
    if (error.code === 'P2002')
      return next(new ConflictError('Ya existe un feriado en esa fecha'));
    next(error);
  }
}

/**
 * PUT /periodos/:id
 */
async function actualizar(req, res, next) {
  try {
    const periodo = await periodosService.actualizar(req.params.id, req.body);
    res.json(periodo);
  } catch (error) {
    if (error.code === 'P2025') {
      return next(new NotFoundError('Período no encontrado'));
    }
    next(error);
  }
}

/**
 * DELETE /periodos/:id
 */
async function eliminar(req, res, next) {
  try {
    await periodosService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return next(new NotFoundError('Período no encontrado'));
    }
    next(error);
  }
}

export default {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
