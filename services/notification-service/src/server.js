const { createLogger } = require('@campuslink/shared');
const { env } = require('./config/env');
const { migrate } = require('./db/migrate');
const { seed } = require('./db/seed');
const { createApp } = require('./app');

const logger = createLogger('notification-service:bootstrap');

function start() {
  migrate();
  seed();

  const app = createApp();
  app.listen(env.port, () => {
    logger.info('service_started', {
      port: env.port,
      dbFile: env.dbFile
    });
  });
}

if (require.main === module) {
  start();
}

module.exports = {
  start
};
