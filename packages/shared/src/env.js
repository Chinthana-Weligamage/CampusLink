const { existsSync, readFileSync } = require('node:fs');

function loadEnvFiles(paths) {
  for (const path of paths) {
    if (!path || !existsSync(path)) {
      continue;
    }

    const contents = readFileSync(path, 'utf8');
    const lines = contents.split(/\r?\n/u);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  }
}

function readEnv(name, fallback, options = {}) {
  const raw = process.env[name];

  if (raw === undefined || raw === '') {
    if (options.required && fallback === undefined) {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    return fallback;
  }

  return raw;
}

function readNumberEnv(name, fallback) {
  const value = readEnv(name, fallback);
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }

  return parsed;
}

function loadServiceEnv(options) {
  const {
    defaultPort,
    portEnvName = 'PORT',
    serviceName
  } = options;

  return {
    nodeEnv: readEnv('NODE_ENV', 'development'),
    serviceName,
    port: readNumberEnv('PORT', readNumberEnv(portEnvName, defaultPort)),
    jwtSecret: readEnv('JWT_SECRET', 'replace_this_for_local_dev'),
    internalServiceToken: readEnv('INTERNAL_SERVICE_TOKEN', 'replace_this_internal_token'),
    gatewayPort: readNumberEnv('GATEWAY_PORT', 8080),
    userServiceUrl: readEnv('USER_SERVICE_URL', 'http://localhost:3001'),
    transportServiceUrl: readEnv('TRANSPORT_SERVICE_URL', 'http://localhost:3002'),
    assignmentServiceUrl: readEnv('ASSIGNMENT_SERVICE_URL', 'http://localhost:3003'),
    notificationServiceUrl: readEnv('NOTIFICATION_SERVICE_URL', 'http://localhost:3004')
  };
}

module.exports = {
  loadEnvFiles,
  loadServiceEnv,
  readEnv,
  readNumberEnv
};
