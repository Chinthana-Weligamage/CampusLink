const path = require('node:path');
const { loadEnvFiles, loadServiceEnv, readEnv } = require('@campuslink/shared');

const serviceRoot = path.resolve(__dirname, '../..');
const workspaceRoot = path.resolve(serviceRoot, '../..');

loadEnvFiles([
  path.join(workspaceRoot, '.env'),
  path.join(serviceRoot, '.env')
]);

const env = {
  ...loadServiceEnv({
    serviceName: 'notification-service',
    defaultPort: 3004,
    portEnvName: 'NOTIFICATION_SERVICE_PORT'
  }),
  dbFile: readEnv('DB_FILE', path.join(serviceRoot, 'data', 'notification.sqlite'))
};

module.exports = {
  env
};
