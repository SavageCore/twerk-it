const saveButton = document.querySelector('#save');
const enabledOnStartButton = document.querySelector('#enabledOnStart');
const startOnBootButton = document.querySelector('#startOnBoot');

let enabledOnStart = window.config.get('enabledOnStart');
let startOnBoot = window.config.get('startOnBoot');

updateButtonValues();

saveButton.addEventListener('click', () => {
	window.ipc.sendInformation({
		save: true,
		data: {
			enabledOnStart,
			startOnBoot
		}
	});
	window.ipc.sendInformation({
		page: 'index'
	});
}, false);

enabledOnStartButton.addEventListener('click', () => {
	enabledOnStart = !enabledOnStart;

	updateButtonValues();
}, false);

startOnBootButton.addEventListener('click', () => {
	startOnBoot = !startOnBoot;

	updateButtonValues();
}, false);

function updateButtonValues() {
	if (enabledOnStart === true) {
		enabledOnStartButton.textContent = 'Enabled on start: ON';
	} else {
		enabledOnStartButton.textContent = 'Enabled on start: OFF';
	}

	if (startOnBoot === true) {
		startOnBootButton.textContent = 'Start on boot: ON';
	} else {
		startOnBootButton.textContent = 'Start on boot: OFF';
	}
}
