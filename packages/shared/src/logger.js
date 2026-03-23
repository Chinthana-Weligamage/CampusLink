function serializeMeta(meta) {
  if (!meta) {
    return undefined;
  }

  if (meta instanceof Error) {
    return {
      name: meta.name,
      message: meta.message,
      stack: meta.stack
    };
  }

  return meta;
}

function createLogger(service) {
  function write(level, message, meta) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message
    };

    const serialized = serializeMeta(meta);

    if (serialized !== undefined) {
      entry.meta = serialized;
    }

    const line = JSON.stringify(entry);

    if (level === 'error') {
      console.error(line);
      return;
    }

    console.log(line);
  }

  return {
    info: (message, meta) => write('info', message, meta),
    warn: (message, meta) => write('warn', message, meta),
    error: (message, meta) => write('error', message, meta),
    child(scope) {
      return createLogger(`${service}:${scope}`);
    }
  };
}

module.exports = {
  createLogger
};
