// Pinokio update manifest for RamClaw

module.exports = {
  run: [
    {
      method: 'shell.run',
      params: {
        message: [
          'git pull'
        ]
      }
    },
    {
      when: "{{exists('sandbox/venv/Scripts/python.exe')}}",
      method: 'shell.run',
      params: {
        venv: 'sandbox/venv',
        message: [
          'python -m pip install --upgrade ./openclaw',
          'python -m pip install --upgrade playwright gitpython',
          'python -m playwright install chromium'
        ]
      }
    },
    {
      when: "{{exists('sandbox/venv/Scripts/python.exe')}}",
      method: 'shell.run',
      params: {
        message: [
          'node create_sandbox.js',
          'echo RamClaw update completed.'
        ]
      }
    },
    {
      when: "{{!exists('sandbox/venv/Scripts/python.exe')}}",
      method: 'shell.run',
      params: {
        message: [
          'echo RamClaw is not installed yet. Run install.js first.'
        ]
      }
    }
  ]
};
