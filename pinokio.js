// Pinokio app manifest for RamClaw with dynamic menu (install / start / update)

module.exports = {
	version: '2.0',
	title: 'RamClaw',
	description: 'Sandboxed LM Studio-only OpenClaw fork packaged for Pinokio.',
	icon: 'icon.png',
	menu: async (kernel, info) => {
		const sandboxExists = info.exists('sandbox');
		const venvExists = info.exists('sandbox/venv');
		const installed = sandboxExists && venvExists;

		const running = {
			install: info.running('install.js'),
			start: info.running('start.js'),
			update: info.running('update.js'),
		};

		if (running.install) {
			return [{
				default: true,
				icon: 'fa-solid fa-plug',
				text: 'Installing',
				href: 'install.js'
			}];
		}

		if (installed) {
			if (running.start) {
				const local = info.local('start.js');
				const webUrl = (local && local.url) ? local.url : 'http://localhost:3000';
				return [
					{
						default: true,
						icon: 'fa-solid fa-display',
						text: 'Open Web UI',
						href: webUrl
					},
					{
						icon: 'fa-solid fa-stop',
						text: 'Stop',
						href: 'start.js',
						action: 'stop'
					},
					{
						icon: 'fa-solid fa-terminal',
						text: 'Terminal',
						href: 'start.js'
					}
				];
			}

			if (running.update) {
				return [{
					default: true,
					icon: 'fa-solid fa-arrows-rotate',
					text: 'Updating',
					href: 'update.js'
				}];
			}

			// Idle + installed: show Start, Update, Logs, Workspace, Key
			return [
				{
					default: true,
					icon: 'fa-solid fa-power-off',
					text: 'Start',
					href: 'start.js?ts=' + Date.now()
				},
				{
					icon: 'fa-solid fa-arrows-rotate',
					text: 'Update',
					href: 'update.js'
				},
				{
					icon: 'fa-solid fa-eye',
					text: 'View Logs',
					href: 'sandbox/ramclaw.log'
				},
				{
					icon: 'fa-solid fa-folder-open',
					text: 'Open Workspace',
					href: 'sandbox/workspace'
				},
				{
					icon: 'fa-regular fa-key',
					text: 'Show GitHub Public Key',
					href: 'sandbox/.ssh/id_rsa.pub'
				}
			];
		}

		// Not installed yet
		return [{
			default: true,
			icon: 'fa-solid fa-plug',
			text: 'Install',
			href: 'install.js'
		}];
	}
};
