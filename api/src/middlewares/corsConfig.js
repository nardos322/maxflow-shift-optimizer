const cors = require('cors');

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Configurable via ENV
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

module.exports = cors(corsOptions);
