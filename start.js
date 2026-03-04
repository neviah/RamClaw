// Pinokio start manifest for RamClaw

module.exports = {
  run: [
    {
      when: "{{!exists('sandbox/config.json')}}",
      method: 'shell.run',
      params: {
        message: [
          'echo RamClaw is not installed yet. Run install.js first.'
        ]
      }
    },
    {
      when: "{{exists('sandbox/config.json')}}",
      method: 'shell.run',
      params: {
        message: [
          'node ramclaw_server.js'
        ],
        on: [{
          event: '/RamClaw UI running at http:\\/\\/localhost:\\d+/',
          done: true
        }]
      }
    },
    {
      when: "{{exists('sandbox/config.json')}}",
      method: 'local.set',
      params: {
        url: 'http://localhost:3000/'
      }
    }
  ]
};
