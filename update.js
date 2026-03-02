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
      method: 'shell.run',
      params: {
        message: [
          'echo RamClaw update completed. Run Install to refresh dependencies if needed.'
        ]
      }
    }
  ]
};
