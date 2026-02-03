const asignacionesService = require("../services/asignaciones.service");
const prisma = require("../lib/prisma");

/**
 * POST /asignaciones/calcular
 * Ejecuta el solver C++ para generar asignaciones
 */
async function calcular(req, res, next) {
  try {
    const resultado = await asignacionesService.generarAsignaciones();
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
      orderBy: { fecha: "asc" },
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
    res.json({ message: "Asignaciones eliminadas" });
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
      return res.status(400).json({ error: "medicoId es requerido" });

    const resultado = await asignacionesService.repararAsignaciones(
      medicoId,
      darDeBaja,
    );
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
};
