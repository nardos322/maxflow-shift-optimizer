import cors from 'cors';

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Configurable via ENV
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default cors(corsOptions);
