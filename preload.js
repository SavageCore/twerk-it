const {ipcRenderer} = require('electron');

const winName = process.argv.pop();

console.log('preload');

ipcRenderer.on('receive', (event, args) => {
	console.log(`Received message from ${args.name}: '${args.message}'.`);
	if (typeof args.callback === 'function') {
		args.callback();
	}
});

window.ipc = {
	sendInformation(data) {
		ipcRenderer.send('send', {
			name: winName,
			message: data
		});
	}
};

window.config = require('./config');
