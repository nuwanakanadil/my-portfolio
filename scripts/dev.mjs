import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import net from 'node:net';
import { resolve } from 'node:path';
import process from 'node:process';

const projectRoot = resolve(process.cwd());
const defaultBackendPort = 8787;

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return;
  }

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(projectRoot, '.env.local'));
loadEnvFile(resolve(projectRoot, '.env'));

async function findFreePort(startPort) {
  for (let port = startPort; port < startPort + 20; port += 1) {
    const isFree = await new Promise((resolvePort) => {
      const tester = net.createServer();

      tester.once('error', () => resolvePort(false));
      tester.once('listening', () => {
        tester.close(() => resolvePort(true));
      });

      tester.listen(port);
    });

    if (isFree) {
      return port;
    }
  }

  return startPort;
}

const backendPort = await findFreePort(Number(process.env.DEV_API_PORT || defaultBackendPort));
process.env.DEV_API_PORT = String(backendPort);
console.log(`[dev] using API port ${backendPort}`);

const backend = spawn(process.execPath, [resolve(projectRoot, 'server/assistant-server.mjs')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: String(backendPort),
  },
});

const viteBinary = process.platform === 'win32'
  ? resolve(projectRoot, 'node_modules/.bin/vite.cmd')
  : resolve(projectRoot, 'node_modules/.bin/vite');
const vite = process.platform === 'win32'
  ? spawn('cmd.exe', ['/c', viteBinary, '--port', '5173'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      DEV_API_PORT: String(backendPort),
    },
  })
  : spawn(viteBinary, ['--port', '5173'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DEV_API_PORT: String(backendPort),
  },
  });

function shutdown() {
  if (!backend.killed) {
    backend.kill();
  }
  if (!vite.killed) {
    vite.kill();
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

backend.on('exit', (code) => {
  if (code && code !== 0) {
    vite.kill();
    process.exit(code);
  }
});

vite.on('exit', (code) => {
  if (code && code !== 0) {
    backend.kill();
    process.exit(code);
  }
});
