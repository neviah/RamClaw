const path = require('path');
const { spawnSync } = require('child_process');
const fs = require('fs');

const SANDBOX_ROOT = path.join(__dirname, 'sandbox');

function run(cmd, args, opts = {}) {
	const result = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
	if (result.status !== 0) {
		throw new Error(`${cmd} ${args.join(' ')} failed`);
	}
}

function main() {
	const venv = path.join(SANDBOX_ROOT, 'venv');
	if (!fs.existsSync(venv)) {
		console.error('Sandbox missing. Run install.js first.');
		process.exit(1);
	}
	const pip = process.platform === 'win32'
		? path.join(venv, 'Scripts', 'pip.exe')
		: path.join(venv, 'bin', 'pip');
	const python = process.platform === 'win32'
		? path.join(venv, 'Scripts', 'python.exe')
		: path.join(venv, 'bin', 'python');

	// Reinstall bundled OpenClaw and refresh dependencies without deleting sandbox
	run(pip, ['install', '--upgrade', path.join(__dirname, 'openclaw')]);
	run(pip, ['install', '--upgrade', 'playwright']);
	run(python, ['-m', 'playwright', 'install', 'chromium']);
	console.log('Update complete. Sandbox preserved at', SANDBOX_ROOT);
}

if (require.main === module) {
	try { main(); } catch (err) { console.error('Update failed:', err.message); process.exit(1); }
}
