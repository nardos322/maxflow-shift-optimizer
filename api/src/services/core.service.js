const { spawn } = require('child_process');
const { CORE_PATH } = require('../config');

/**
 * Ejecuta el core C++ con los datos de entrada
 * @param {Object} inputData - Datos de entrada para el solver
 * @returns {Promise<Object>} - Resultado del solver
 */
function ejecutarCore(inputData) {
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

        process.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(stdout));
                } catch (parseError) {
                    reject(new Error(`Error parseando respuesta del core: ${parseError.message}`));
                }
            } else {
                reject(new Error(stderr || `Proceso terminó con código ${code}`));
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

module.exports = {
    ejecutarCore,
};
