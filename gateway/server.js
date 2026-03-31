const { Readable } = require('node:stream');
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { createLogger, loadEnvFiles, readNumberEnv, readEnv, requestIdMiddleware } = require('@campuslink/shared');

loadEnvFiles([
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '.env')
]);

const logger = createLogger('gateway');
const port = readNumberEnv('PORT', readNumberEnv('GATEWAY_PORT', 8080));

const serviceMap = {
  '/user': readEnv('USER_SERVICE_URL', 'http://localhost:3001'),
  '/transport': readEnv('TRANSPORT_SERVICE_URL', 'http://localhost:3002'),
  '/assignment': readEnv('ASSIGNMENT_SERVICE_URL', 'http://localhost:3003'),
  '/notification': readEnv('NOTIFICATION_SERVICE_URL', 'http://localhost:3004')
};

const app = express();
const requestCounts = new Map();

function applyRateLimit(req, res, next) {
  const windowKey = `${req.ip}:${Math.floor(Date.now() / 60000)}`;
  const count = (requestCounts.get(windowKey) || 0) + 1;
  requestCounts.set(windowKey, count);

  if (count > 200) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests'
      }
    });
  }

  return next();
}

function buildTargetUrl(baseUrl, prefix, originalUrl) {
  const parsed = new URL(originalUrl, 'http://gateway.local');
  const stripped = parsed.pathname.slice(prefix.length) || '/';
  return `${baseUrl}${stripped}${parsed.search}`;
}

function filterRequestHeaders(headers) {
  const nextHeaders = { ...headers };
  delete nextHeaders.host;
  delete nextHeaders.connection;
  delete nextHeaders['content-length'];
  return nextHeaders;
}

function rewriteLocationHeader(location, req, prefix, baseUrl) {
  if (!location) {
    return location;
  }

  const gatewayOrigin = `${req.protocol}://${req.get('host')}`;

  if (location.startsWith('/')) {
    return `${gatewayOrigin}${prefix}${location}`;
  }

  try {
    const upstreamOrigin = new URL(baseUrl).origin;
    const absoluteLocation = new URL(location, baseUrl);

    if (absoluteLocation.origin !== upstreamOrigin) {
      return location;
    }

    return `${gatewayOrigin}${prefix}${absoluteLocation.pathname}${absoluteLocation.search}${absoluteLocation.hash}`;
  } catch {
    return location;
  }
}

function filterResponseHeaders(headers, req, prefix, baseUrl) {
  const nextHeaders = {};

  for (const [key, value] of headers.entries()) {
    if (key === 'transfer-encoding' || key === 'connection') {
      continue;
    }

    nextHeaders[key] = key === 'location'
      ? rewriteLocationHeader(value, req, prefix, baseUrl)
      : value;
  }

  return nextHeaders;
}

function proxy(prefix, baseUrl) {
  return async (req, res) => {
    const targetUrl = buildTargetUrl(baseUrl, prefix, req.originalUrl);
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';

    logger.info('proxy_request', {
      requestId: req.requestId,
      method: req.method,
      from: req.originalUrl,
      to: targetUrl
    });

    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers: filterRequestHeaders(req.headers),
      body: hasBody ? req : undefined,
      duplex: hasBody ? 'half' : undefined,
      redirect: 'manual'
    });

    res.status(upstream.status);

    for (const [key, value] of Object.entries(filterResponseHeaders(upstream.headers, req, prefix, baseUrl))) {
      res.setHeader(key, value);
    }

    if (!upstream.body) {
      res.end();
      return;
    }

    Readable.fromWeb(upstream.body).pipe(res);
  };
}

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(requestIdMiddleware(logger));
app.use(applyRateLimit);

app.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      service: 'campuslink-gateway',
      routes: {
        user: '/user/*',
        transport: '/transport/*',
        assignment: '/assignment/*',
        notification: '/notification/*'
      },
      docs: {
        user: '/user/docs',
        transport: '/transport/docs',
        assignment: '/assignment/docs',
        notification: '/notification/docs'
      }
    },
    meta: {
      port
    }
  });
});

for (const [prefix, baseUrl] of Object.entries(serviceMap)) {
  app.use(prefix, proxy(prefix, baseUrl));
}

app.use((error, req, res, next) => {
  logger.error('gateway_proxy_failed', {
    requestId: req.requestId,
    path: req.originalUrl,
    message: error.message
  });

  res.status(502).json({
    success: false,
    error: {
      code: 'BAD_GATEWAY',
      message: 'Gateway failed to reach the downstream service'
    }
  });
});

if (require.main === module) {
  app.listen(port, () => {
    logger.info('gateway_started', {
      port,
      serviceMap
    });
  });
}

module.exports = {
  app
};
