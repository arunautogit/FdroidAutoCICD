const { spawnSync } = require('child_process');
const path = require('path');

// Hard-clear any globally injected loader flags.
const env = { ...process.env, NODE_OPTIONS: '' };

// Call the local WDIO binary directly to avoid global npx/npm wrappers.
const wdioBin = path.resolve(__dirname, 'node_modules', '.bin', process.platform === 'win32' ? 'wdio.cmd' : 'wdio');

const result = spawnSync(wdioBin, ['run', 'wdio.conf.js'], {
  stdio: 'inherit',
  env
});

if (result.error) {
  console.error('Failed to start WDIO:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
