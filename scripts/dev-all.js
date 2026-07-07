const { spawn } = require('child_process');

const commands = [
  {
    name: 'api-server',
    cmd: 'pnpm --dir ./artifacts/api-server exec cross-env PORT=8080 pnpm run dev',
  },
  {
    name: 'todo-angular',
    cmd: 'pnpm --dir ./artifacts/todo-angular exec node serve.mjs',
  },
];

const processes = [];
let failed = false;

function startProcess({ name, cmd }) {
  const proc = spawn(cmd, { shell: true, stdio: 'inherit' });

  proc.on('exit', (code, signal) => {
    if (code !== 0 && !failed) {
      failed = true;
      console.error(`\n[dev-all] ${name} exited with code ${code}${signal ? ` signal ${signal}` : ''}`);
      processes.forEach((p) => {
        if (p && !p.killed) {
          p.kill('SIGINT');
        }
      });
      process.exit(code);
    }
  });

  proc.on('error', (error) => {
    if (!failed) {
      failed = true;
      console.error(`\n[dev-all] ${name} failed to start:`, error);
      process.exit(1);
    }
  });

  processes.push(proc);
}

process.on('SIGINT', () => {
  processes.forEach((p) => p.kill('SIGINT'));
  process.exit();
});

process.on('SIGTERM', () => {
  processes.forEach((p) => p.kill('SIGTERM'));
  process.exit();
});

console.log('[dev-all] Starting api-server and todo-angular...');
commands.forEach(startProcess);
