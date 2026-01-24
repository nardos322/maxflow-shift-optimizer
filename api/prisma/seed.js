const { main } = require('./scenarios/feasible');

if (require.main === module) {
    main()
        .catch((e) => {
            console.error('❌ Error en seed default:', e);
            process.exit(1);
        });
}

module.exports = { main };
