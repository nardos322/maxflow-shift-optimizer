if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const path = require('path');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
const CORE_PATH = process.env.CORE_PATH || path.join(__dirname, '../../core/build/solver');

module.exports = {
    PORT,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    CORE_PATH
};
