'use strict';
const Store = require('electron-store');

module.exports = new Store({
	defaults: {
		enabledOnStart: false,
		startOnBoot: false,
		keybindsEnabled: false
	}
});
