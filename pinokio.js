// Pinokio app manifest for RamClaw
// Provides install/start/update actions and quick shortcuts

module.exports = {
	id: 'ramclaw',
	name: 'RamClaw',
	version: '0.1.0',
	description: 'Fully sandboxed, LM Studio-only OpenClaw fork packaged for Pinokio.',
	actions: [
		{
			label: 'Install RamClaw',
			command: 'node install.js'
		},
		{
			label: 'Start RamClaw',
			command: 'node start.js'
		},
		{
			label: 'Update RamClaw',
			command: 'node update.js'
		},
		{
			label: 'View Logs',
			command: process.platform === 'win32'
				? 'type sandbox/ramclaw.log'
				: 'tail -f sandbox/ramclaw.log'
		},
		{
			label: 'Open Workspace',
			command: 'echo Workspace lives in sandbox/workspace (inside Pinokio sandbox)'
		},
		{
			label: 'Show GitHub Public Key',
			command: process.platform === 'win32'
				? 'type sandbox/.ssh/id_rsa.pub'
				: 'cat sandbox/.ssh/id_rsa.pub'
		}
	]
};
