const toggleKeybindButton = document.querySelector('#toggle-keybinds');
console.log(toggleKeybindButton);
toggleKeybindButton.addEventListener('click', () => {
	console.log('clicked toggle');
	window.ipc.sendInformation({keybinds: 'toggle'});
}, false);
