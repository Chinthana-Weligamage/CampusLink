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
    serviceName: 'assignment-service',
    defaultPort: 3003,
    portEnvName: 'ASSIGNMENT_SERVICE_PORT'
  }),
  dbFile: readEnv('DB_FILE', path.join(serviceRoot, 'data', 'assignment.sqlite'))
};

module.exports = {
  env
};
