const { spawn } = require('child_process');
const { CORE_PATH } = require('../config');

class CoreService {
  /**
   * Prepara los datos de entrada para el solver.
   *
   * @param {Array} medicos
   * @param {Array} periodos
   * @param {object} config
   * @param {object} extraOptions
   * @returns {object} JSON structure:
   * {
   *   medicos: ["Dr A", ...],
   *   dias: ["2024-01-01", ...],
   *   periodos: [ { id: "Periodo 1", dias: ["2024-01-01", ...] } ],
   *   disponibilidad: { "Dr A": ["2024-01-01"], ... },
   *   maxGuardiasPorPeriodo: number,
   *   maxGuardiasTotales: number,
   *   medicosPorDia: number,
   *   capacidades?: { "Dr A": number } // Opcional
   * }
   */
  prepareInput(medicos, periodos, config, extraOptions = {}) {
    // 1. Nombres de médicos
    const nombresMedicos = medicos.map((m) => m.nombre);

    // 2. Todos los días (fechas) de todos los periodos
    const dias = periodos.flatMap((p) =>
      p.feriados.map((f) => f.fecha.toISOString().split('T')[0])
    );

    // 3. Períodos en formato del solver
    const periodosFormat = periodos.map((p) => ({
      id: p.nombre,
      dias: p.feriados.map((f) => f.fecha.toISOString().split('T')[0]),
    }));

    // 4. Disponibilidad por médico
    // Se asume que medicos incluye la relación 'disponibilidad'
    const disponibilidad = {};
    for (const medico of medicos) {
      if (medico.disponibilidad && medico.disponibilidad.length > 0) {
        const diasDisponibles = medico.disponibilidad.map((d) =>
          d.fecha.toISOString().split('T')[0]
        );
        disponibilidad[medico.nombre] = diasDisponibles;
      }
    }

    // 5. Construir objeto final
    const inputData = {
      medicos: nombresMedicos,
      dias: dias,
      periodos: periodosFormat,
      disponibilidad: disponibilidad,
      maxGuardiasPorPeriodo: config.maxGuardiasPorPeriodo,
      maxGuardiasTotales: config.maxGuardiasTotales,
      medicosPorDia: config.medicosPorDia,
    };

    if (extraOptions.capacidades) {
      inputData.capacidades = extraOptions.capacidades;
    }

    return inputData;
  }

  /**
   * Ejecuta el core C++ con los datos de entrada.
   *
   * @returns {Promise<object>} JSON response:
   * {
   *   factible: boolean,
   *   asignaciones: [ { dia: "2024-01-01", medico: "Dr A" } ],
   *   bottlenecks?: [ { id: string, razon: string, tipo: string } ] // Si factible es false
   * }
   */
  async runSolver(inputData) {
    return new Promise((resolve, reject) => {
      const inputJson = JSON.stringify(inputData);
      const process = spawn(CORE_PATH);

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code, signal) => {
        if (code === 0) {
          try {
            resolve(JSON.parse(stdout));
          } catch (parseError) {
            reject(
              new Error(
                `Error parseando respuesta del core: ${parseError.message}`
              )
            );
          }
        } else {
          reject(
            new Error(
              stderr || `Proceso terminó con código ${code} y señal ${signal}`
            )
          );
        }
      });

      process.on('error', (err) => {
        reject(new Error(`No se pudo ejecutar el core: ${err.message}`));
      });

      // Enviar JSON por stdin
      process.stdin.write(inputJson);
      process.stdin.end();
    });
  }
}

module.exports = new CoreService();
