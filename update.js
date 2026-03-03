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
          'echo RamClaw update completed. No install or start steps were executed.'
        ]
      }
    }
  ]
};
