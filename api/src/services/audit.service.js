const prisma = require('../lib/prisma');

class AuditService {
    /**
     * Registra una acción en el log de auditoría.
     * @param {string} accion - Tipo de acción (e.g., 'RESOLVER', 'REPARAR')
     * @param {string} usuario - Email del usuario que realizó la acción
     * @param {object} detalles - Objeto con detalles adicionales (opcional)
     */
    async log(accion, usuario, detalles = null) {
        try {
            await prisma.auditLog.create({
                data: {
                    accion,
                    usuario,
                    detalles: detalles ? JSON.stringify(detalles) : null,
                },
            });
        } catch (error) {
            console.error('Error al registrar auditoría:', error);
            // No lanzamos el error para no interrumpir el flujo principal
        }
    }

    /**
     * Obtiene los logs de auditoría ordenados por fecha descendente.
     * @param {number} limit - Cantidad máxima de registros a retornar
     */
    async obtenerLogs(limit = 100) {
        return prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
}

module.exports = new AuditService();
