import { spawn } from 'node:child_process';

const cwd = process.cwd();
const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';

const services = [
  {
    name: 'gateway',
    port: 8080,
    healthUrl: 'http://localhost:8080/',
    color: BLUE,
    command: [process.execPath, '--disable-warning=ExperimentalWarning', 'gateway/server.js']
  },
  {
    name: 'user-service',
    port: 3001,
    healthUrl: 'http://localhost:3001/health',
    color: CYAN,
    command: [process.execPath, '--disable-warning=ExperimentalWarning', 'services/user-service/src/server.js']
  },
  {
    name: 'transport-service',
    port: 3002,
    healthUrl: 'http://localhost:3002/health',
    color: GREEN,
    command: [process.execPath, '--disable-warning=ExperimentalWarning', 'services/transport-service/src/server.js']
  },
  {
    name: 'assignment-service',
    port: 3003,
    healthUrl: 'http://localhost:3003/health',
    color: YELLOW,
    command: [process.execPath, '--disable-warning=ExperimentalWarning', 'services/assignment-service/src/server.js']
  },
  {
    name: 'notification-service',
    port: 3004,
    healthUrl: 'http://localhost:3004/health',
    color: MAGENTA,
    command: [process.execPath, '--disable-warning=ExperimentalWarning', 'services/notification-service/src/server.js']
  }
];

let stopping = false;
let remainingChildren = services.length;

printBanner();
printStartupPlan();

const children = services.map((service) => {
  const [command, ...args] = service.command;
  const child = spawn(command, args, {
    cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: process.env
  });

  printStatus(service, 'BOOT', `Starting on port ${service.port}`);
  pipeOutput(child.stdout, service, false);
  pipeOutput(child.stderr, service, true);

  child.on('exit', (code, signal) => {
    remainingChildren -= 1;

    if (stopping) {
      if (remainingChildren === 0) {
        process.exit(0);
      }

      return;
    }

    if (code !== 0 || signal) {
      const reason = signal ? `signal ${signal}` : `code ${code}`;
      printStatus(service, 'FAIL', `Exited unexpectedly with ${reason}`, true);
      shutdown('SIGTERM');
      process.exitCode = code ?? 1;
    }
  });

  return child;
});

monitorHealth().catch((error) => {
  printLine(`${RED}Health monitor failed:${RESET} ${error.message}`);
});

function printBanner() {
  printLine('');
  printLine(`${BOLD}${CYAN}CampusLink Local Development${RESET}`);
  printLine(`${DIM}Booting gateway and all business services...${RESET}`);
  printLine('');
}

function printStartupPlan() {
  for (const service of services) {
    printStatus(service, 'PLAN', `${service.healthUrl}`);
  }
  printLine('');
}

function printLine(message) {
  process.stdout.write(`${message}\n`);
}

function printStatus(service, label, message, isError = false) {
  const labelColor = isError ? RED : service.color;
  const serviceTag = `${service.color}${service.name.padEnd(20)}${RESET}`;
  const statusTag = `${labelColor}${label.padEnd(4)}${RESET}`;
  printLine(`${serviceTag} ${statusTag} ${message}`);
}

function pipeOutput(stream, service, isError) {
  let buffer = '';

  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) {
        continue;
      }

      const message = `${service.color}[${service.name}]${RESET} ${line}`;
      if (isError) {
        process.stderr.write(`${message}\n`);
        continue;
      }

      printLine(message);
    }
  });

  stream.on('end', () => {
    if (buffer.trim()) {
      const message = `${service.color}[${service.name}]${RESET} ${buffer}`;
      if (isError) {
        process.stderr.write(`${message}\n`);
        return;
      }

      printLine(message);
    }
  });
}

async function monitorHealth() {
  const states = new Map(services.map((service) => [service.name, 'pending']));
  const timeoutAt = Date.now() + 20000;

  while (!stopping && Date.now() < timeoutAt) {
    let allHealthy = true;

    for (const service of services) {
      const healthy = await checkHealth(service);
      const nextState = healthy ? 'healthy' : 'pending';

      if (states.get(service.name) !== nextState) {
        states.set(service.name, nextState);
        printStatus(service, healthy ? 'OK' : 'WAIT', healthy ? `Health check passed at ${service.healthUrl}` : 'Waiting for health endpoint...');
      }

      if (!healthy) {
        allHealthy = false;
      }
    }

    if (allHealthy) {
      printLine('');
      printLine(`${BOLD}${GREEN}Health Summary${RESET}`);
      for (const service of services) {
        printStatus(service, 'UP', service.healthUrl);
      }
      printLine('');
      return;
    }

    await sleep(1200);
  }

  if (!stopping) {
    printLine('');
    printLine(`${YELLOW}Health Summary${RESET}`);
    for (const service of services) {
      const state = states.get(service.name) === 'healthy';
      printStatus(service, state ? 'UP' : 'WAIT', service.healthUrl, !state);
    }
    printLine('');
  }
}

async function checkHealth(service) {
  try {
    const response = await fetch(service.healthUrl, { signal: AbortSignal.timeout(900) });
    return response.ok;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shutdown(signal) {
  if (stopping) {
    return;
  }

  stopping = true;
  printLine('');
  printLine(`${DIM}Shutting down CampusLink services...${RESET}`);

  for (const child of children) {
    child.kill(signal);
  }

  setTimeout(() => {
    for (const child of children) {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    }
  }, 3000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
