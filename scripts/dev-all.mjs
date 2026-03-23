import { spawn } from 'node:child_process';

const cwd = process.cwd();
const commands = [
  ['gateway', ['node', 'gateway/server.js']],
  ['user-service', ['node', 'services/user-service/src/server.js']],
  ['transport-service', ['node', 'services/transport-service/src/server.js']],
  ['assignment-service', ['node', 'services/assignment-service/src/server.js']],
  ['notification-service', ['node', 'services/notification-service/src/server.js']]
];

const children = commands.map(([name, [command, ...args]]) => {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`${name} exited with code ${code}`);
    }
  });

  return child;
});

function shutdown(signal) {
  for (const child of children) {
    child.kill(signal);
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
