import prisma from '../lib/prisma.js';
import exportService from '../services/export.service.js';
import { NotFoundError } from '../lib/errors.js';

async function downloadExcel(req, res, next) {
  try {
    const asignaciones = await prisma.asignacion.findMany({
      include: { medico: true },
      orderBy: { fecha: 'asc' },
    });

    if (!asignaciones.length) {
      throw new NotFoundError('No hay asignaciones para exportar');
    }

    const buffer = await exportService.generateExcel(asignaciones);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=asignaciones.xlsx'
    );
    res.send(buffer);
  } catch (error) {
    next(error);
  }
}

async function downloadICS(req, res, next) {
  try {
    const asignaciones = await prisma.asignacion.findMany({
      include: { medico: true },
      orderBy: { fecha: 'asc' },
    });

    if (!asignaciones.length) {
      throw new NotFoundError('No hay asignaciones para exportar');
    }

    const icsContent = exportService.generateICS(asignaciones);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=asignaciones.ics'
    );
    res.send(icsContent);
  } catch (error) {
    next(error);
  }
}

export default {
  downloadExcel,
  downloadICS,
};
