// RamClaw installer for Pinokio
const path = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');
const { bootstrapSandbox, SANDBOX_ROOT } = require('./create_sandbox');

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed with code ${result.status}`);
  }
}

function findPython() {
  const candidates = process.platform === 'win32'
    ? ['python', 'py', 'python3']
    : ['python3', 'python'];
  for (const cand of candidates) {
    const check = spawnSync(cand, ['--version'], { stdio: 'ignore' });
    if (check.status === 0) return cand;
  }
  throw new Error('Python is required but was not found on PATH. Please install Python >=3.9.');
}

function installSandbox() {
  const pythonCmd = findPython();

  // Create virtual environment inside sandbox
  const venvPath = path.join(SANDBOX_ROOT, 'venv');
  if (!fs.existsSync(path.join(venvPath, 'pyvenv.cfg'))) {
    run(pythonCmd, ['-m', 'venv', venvPath]);
  }

  const pip = process.platform === 'win32'
    ? path.join(venvPath, 'Scripts', 'pip.exe')
    : path.join(venvPath, 'bin', 'pip');
  const python = process.platform === 'win32'
    ? path.join(venvPath, 'Scripts', 'python.exe')
    : path.join(venvPath, 'bin', 'python');

  // Upgrade pip
  run(python, ['-m', 'pip', 'install', '--upgrade', 'pip']);

  // Install bundled OpenClaw
  run(pip, ['install', path.join(__dirname, 'openclaw')]);

  // Install Playwright and Chromium inside sandbox
  run(pip, ['install', 'playwright']);
  run(python, ['-m', 'playwright', 'install', 'chromium']);

  // Ensure git is present and install gitpython as a helper
  try {
    run('git', ['--version']);
  } catch (err) {
    console.warn('Git binary not found on host PATH. Please install git for full functionality.');
  }

  try {
    run(pip, ['install', 'gitpython']);
  } catch (err) {
    console.warn('gitpython install failed, continuing:', err.message);
  }

  return { python, pip, venvPath };
}

function main() {
  try {
    const { pubKey } = bootstrapSandbox();
    const { python, venvPath } = installSandbox();

    console.log('\nRamClaw sandbox ready.');
    console.log('Sandbox root:', SANDBOX_ROOT);
    console.log('Virtualenv:', venvPath);
    console.log('\nGitHub public key (add to your GitHub SSH keys):');
    console.log(pubKey);

    // Validate LM Studio endpoint placeholder notice
    console.log('\nRemember to start LM Studio at http://127.0.0.1:1234/v1 and set a local model in sandbox/config.json');
    console.log('Start RamClaw with: node start.js');
  } catch (err) {
    console.error('Install failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
