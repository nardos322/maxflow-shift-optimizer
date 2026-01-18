const app = require('./src/app');
const { PORT } = require('./src/config');

app.listen(PORT, () => {
    console.log(`🚀 API corriendo en http://localhost:${PORT}`);
    console.log(`📍 POST /resolver - Resolver asignación de turnos`);
    console.log(`📍 GET /health - Health check`);
});
