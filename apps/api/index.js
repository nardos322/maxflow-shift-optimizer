import app from './src/app.js';
import { PORT } from './src/config.js';

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
  console.log(`📍 POST /resolver - Resolver asignaciónes de guardias medicas`);
  console.log(`📍 GET /health - Health check`);
});
