const path = require('path');

module.exports = {
    PORT: process.env.PORT || 3000,
    CORE_PATH: path.join(__dirname, '..', '..', '..', 'core', 'build', 'turnos'),
};
