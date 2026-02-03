
const { main } = require('./scenarios/feasible');


const { seedAdmin } = require('./seedAdmin');


if (require.main === module) {
    seedAdmin()
        .then(() => main())
        .catch((e) => {
            console.error('❌ Error en seed default:', e);
            process.exit(1);
        });
}

module.exports = { main, seedAdmin };
