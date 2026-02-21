import app from './src/app.js';
import { PORT } from './src/config.js';

const handlersFlag = '__MAXFLOW_PROCESS_HANDLERS_REGISTERED__';

if (!globalThis[handlersFlag]) {
  process.on('uncaughtException', (error) => {
    console.error('🔥 CRITICAL: Uncaught Exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error(
      '🔥 CRITICAL: Unhandled Rejection at:',
      promise,
      'reason:',
      reason
    );
  });

  globalThis[handlersFlag] = true;
}

app.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
  console.log(`📍 POST /resolver - Resolver asignaciónes de guardias medicas`);
  console.log(`📍 GET /health - Health check`);
});
