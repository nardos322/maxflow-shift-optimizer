import express from 'express';
import corsMiddleware from './middlewares/corsConfig.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

import swaggerUi from 'swagger-ui-express';

// Middlewares
app.use(corsMiddleware);
app.use(express.json());

import swaggerSpecs from './swagger.js';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/', routes);

// Manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
