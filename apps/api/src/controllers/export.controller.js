import prisma from '../lib/prisma.js';
import exportService from '../services/export.service.js';
import { NotFoundError } from '../lib/errors.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const downloadExcel = asyncHandler(async (req, res) => {
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
});

const downloadICS = asyncHandler(async (req, res) => {
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
});

export default {
  downloadExcel,
  downloadICS,
};
