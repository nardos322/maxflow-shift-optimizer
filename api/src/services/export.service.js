const ExcelJS = require('exceljs');
const { createEvents } = require('ics');

class ExportService {
  /**
   * Genera un archivo Excel con las asignaciones.
   * @param {Array} asignaciones - Lista de asignaciones con datos de médico.
   * @returns {Promise<Buffer>} - Buffer del archivo Excel.
   */
  async generateExcel(asignaciones) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asignaciones');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Día', key: 'dia', width: 15 },
      { header: 'Médico', key: 'medico', width: 25 },
    ];

    asignaciones.forEach((a) => {
      const date = new Date(a.fecha);
      const days = [
        'Domingo',
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
      ];

      worksheet.addRow({
        fecha: date.toISOString().split('T')[0],
        dia: days[date.getDay()],
        medico: a.medico.nombre,
      });
    });

    return await workbook.xlsx.writeBuffer();
  }

  /**
   * Genera un string en formato ICS (iCalendar).
   * @param {Array} asignaciones - Lista de asignaciones con datos de médico.
   * @returns {string} - Contenido del archivo ICS.
   */
  generateICS(asignaciones) {
    const events = asignaciones.map((a) => {
      const date = new Date(a.fecha);
      return {
        start: [date.getFullYear(), date.getMonth() + 1, date.getDate()],
        duration: { days: 1 },
        title: `Guardia: ${a.medico.nombre}`,
        description: `Asignación de guardia confirmada para ${a.medico.nombre}`,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        categories: ['Guardia', 'Hospital'],
      };
    });

    const { error, value } = createEvents(events);

    if (error) {
      throw error;
    }

    return value;
  }
}

module.exports = new ExportService();
