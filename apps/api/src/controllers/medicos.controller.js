import medicosService from '../services/medicos.service.js';

/**
 * GET /medicos
 */
async function obtenerTodos(req, res, next) {
  try {
    const soloActivos = req.query.soloActivos === 'true';
    const medicos = await medicosService.obtenerTodos(soloActivos);
    res.json(medicos);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /medicos/:id
 */
async function obtenerPorId(req, res, next) {
  try {
    const medico = await medicosService.obtenerPorId(req.params.id);
    if (!medico) {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }
    res.json(medico);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /medicos
 */
async function crear(req, res, next) {
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
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    // Si el error viene del service con status (ej: 409)
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * PUT /medicos/:id
 */
async function actualizar(req, res, next) {
  try {
    const medico = await medicosService.actualizar(req.params.id, req.body);
    res.json(medico);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }
    next(error);
  }
}

/**
 * DELETE /medicos/:id
 */
async function eliminar(req, res, next) {
  try {
    await medicosService.eliminar(req.params.id);
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Médico no encontrado' });
    }
    next(error);
  }
}

/**
 * GET /medicos/:id/disponibilidad
 */
async function obtenerDisponibilidad(req, res, next) {
  try {
    const disponibilidad = await medicosService.obtenerDisponibilidad(
      req.params.id
    );
    res.json(disponibilidad);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /medicos/:id/disponibilidad
 * Body: { fechas: ["2026-04-02", "2026-04-03"] }
 */
async function agregarDisponibilidad(req, res, next) {
  try {
    const { fechas } = req.body;
    if (!fechas || !Array.isArray(fechas)) {
      return res.status(400).json({ error: 'Se requiere un array de fechas' });
    }
    const result = await medicosService.agregarDisponibilidad(
      req.params.id,
      fechas
    );
    res.status(201).json(result);
  } catch (error) {
    if (error.message?.includes('Fechas no disponibles para edición')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

/**
 * DELETE /medicos/:id/disponibilidad
 * Body: { fechas: ["2026-04-02"] }
 */
async function eliminarDisponibilidad(req, res, next) {
  try {
    const { fechas } = req.body;
    if (!fechas || !Array.isArray(fechas)) {
      return res.status(400).json({ error: 'Se requiere un array de fechas' });
    }
    await medicosService.eliminarDisponibilidad(req.params.id, fechas);
    res.status(204).send();
  } catch (error) {
    if (error.message?.includes('Fechas no disponibles para edición')) {
      return res.status(400).json({ error: error.message });
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
  obtenerDisponibilidad,
  agregarDisponibilidad,
  eliminarDisponibilidad,
};
