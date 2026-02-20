import { main } from './scenarios/feasible.js';
import { seedAdmin } from './seedAdmin.js';
import { pathToFileURL } from 'node:url';

const isDirectRun =
  typeof process.argv[1] === 'string' &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seedAdmin()
    .then(() => main())
    .catch((e) => {
      console.error('❌ Error en seed default:', e);
      process.exit(1);
    });
}

export { main, seedAdmin };
