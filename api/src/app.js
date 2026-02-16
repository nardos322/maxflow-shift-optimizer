const express = require('express');
const corsMiddleware = require('./middlewares/corsConfig');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const swaggerUi = require('swagger-ui-express');

// Middlewares
app.use(corsMiddleware);
app.use(express.json());

const swaggerSpecs = require('./swagger');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas
app.use('/', routes);

// Manejo de errores (debe ir al final)
app.use(errorHandler);

module.exports = app;
