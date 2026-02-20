import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
const CORE_PATH = process.env.CORE_PATH || path.join(__dirname, '../../core/build/solver');

export { PORT, JWT_SECRET, JWT_EXPIRES_IN, CORE_PATH };
