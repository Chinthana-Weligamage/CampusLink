import { existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const rootDir = process.cwd();

const services = {
  user: {
    label: 'user-service',
    dbFile: path.join(rootDir, 'services', 'user-service', 'data', 'user.sqlite'),
    migrateModule: path.join(rootDir, 'services', 'user-service', 'src', 'db', 'migrate.js'),
    seedModule: path.join(rootDir, 'services', 'user-service', 'src', 'db', 'seed.js')
  },
  transport: {
    label: 'transport-service',
    dbFile: path.join(rootDir, 'services', 'transport-service', 'data', 'transport.sqlite'),
    migrateModule: path.join(rootDir, 'services', 'transport-service', 'src', 'db', 'migrate.js'),
    seedModule: path.join(rootDir, 'services', 'transport-service', 'src', 'db', 'seed.js')
  },
  assignment: {
    label: 'assignment-service',
    dbFile: path.join(rootDir, 'services', 'assignment-service', 'data', 'assignment.sqlite'),
    migrateModule: path.join(rootDir, 'services', 'assignment-service', 'src', 'db', 'migrate.js'),
    seedModule: path.join(rootDir, 'services', 'assignment-service', 'src', 'db', 'seed.js')
  },
  notification: {
    label: 'notification-service',
    dbFile: path.join(rootDir, 'services', 'notification-service', 'data', 'notification.sqlite'),
    migrateModule: path.join(rootDir, 'services', 'notification-service', 'src', 'db', 'migrate.js'),
    seedModule: path.join(rootDir, 'services', 'notification-service', 'src', 'db', 'seed.js')
  }
};

const target = process.argv[2];

if (!target || (!services[target] && target !== 'all')) {
  console.error('Usage: node scripts/reset-db.mjs <user|transport|assignment|notification|all>');
  process.exit(1);
}

const selectedServices = target === 'all'
  ? Object.values(services)
  : [services[target]];

for (const service of selectedServices) {
  resetServiceDatabase(service);
}

console.log(`Reset complete for ${selectedServices.length} database${selectedServices.length === 1 ? '' : 's'}.`);

function resetServiceDatabase(service) {
  mkdirSync(path.dirname(service.dbFile), { recursive: true });

  for (const candidate of [
    service.dbFile,
    `${service.dbFile}-shm`,
    `${service.dbFile}-wal`
  ]) {
    if (existsSync(candidate)) {
      rmSync(candidate, { force: true });
    }
  }

  process.env.DB_FILE = service.dbFile;

  const { migrate } = require(service.migrateModule);
  const { seed } = require(service.seedModule);

  migrate();
  seed();

  console.log(`- ${service.label} reset at ${service.dbFile}`);
}
