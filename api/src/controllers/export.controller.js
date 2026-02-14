const prisma = require('../lib/prisma');
const exportService = require('../services/export.service');

async function downloadExcel(req, res, next) {
    try {
        const asignaciones = await prisma.asignacion.findMany({
            include: { medico: true },
            orderBy: { fecha: 'asc' },
        });

        if (!asignaciones.length) {
            return res.status(404).json({ message: 'No hay asignaciones para exportar' });
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
        console.error('Error generando Excel:', error);
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
            return res.status(404).json({ message: 'No hay asignaciones para exportar' });
        }

        const icsContent = exportService.generateICS(asignaciones);

        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', 'attachment; filename=asignaciones.ics');
        res.send(icsContent);
    } catch (error) {
        console.error('Error generando ICS:', error);
        next(error);
    }
}

module.exports = {
    downloadExcel,
    downloadICS,
};
