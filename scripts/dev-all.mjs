import { spawn } from 'node:child_process';

const cwd = process.cwd();
const commands = [
  ['gateway', [process.execPath, '--disable-warning=ExperimentalWarning', 'gateway/server.js']],
  ['user-service', [process.execPath, '--disable-warning=ExperimentalWarning', 'services/user-service/src/server.js']],
  ['transport-service', [process.execPath, '--disable-warning=ExperimentalWarning', 'services/transport-service/src/server.js']],
  ['assignment-service', [process.execPath, '--disable-warning=ExperimentalWarning', 'services/assignment-service/src/server.js']],
  ['notification-service', [process.execPath, '--disable-warning=ExperimentalWarning', 'services/notification-service/src/server.js']]
];

let stopping = false;
let remainingChildren = commands.length;

const children = commands.map(([name, [command, ...args]]) => {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env
  });

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
      console.error(`${name} exited unexpectedly with ${reason}`);
      shutdown('SIGTERM');
      process.exitCode = code ?? 1;
    }
  });

  return child;
});

function shutdown(signal) {
  if (stopping) {
    return;
  }

  stopping = true;

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
