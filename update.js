// Pinokio update manifest for RamClaw
// Refreshes bundled OpenClaw and Playwright dependencies without deleting sandbox

const path = require('path');

const venvPython = process.platform === 'win32'
  ? path.join('sandbox', 'venv', 'Scripts', 'python.exe')
  : path.join('sandbox', 'venv', 'bin', 'python');

module.exports = {
  run: [
    // Reinstall bundled OpenClaw (upgrade)
    {
      method: 'shell.run',
      params: {
        message: [
          `${venvPython} -m pip install --upgrade ./openclaw`,
          `${venvPython} -m pip install --upgrade playwright`,
          `${venvPython} -m playwright install chromium`,
          `${venvPython} -m pip install --upgrade gitpython`
        ]
      }
    }
  ]
};
