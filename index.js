'use strict';
const path = require('path');
const {app, BrowserWindow, Menu, globalShortcut, ipcMain, Tray} = require('electron');
/// const {autoUpdater} = require('electron-updater');
const unhandled = require('electron-unhandled');
const debug = require('electron-debug');
const contextMenu = require('electron-context-menu');
const config = require('./config');
const menu = require('./menu');
const robot = require('robotjs');

unhandled();
debug();
contextMenu();

try {
	require('electron-reloader')(module);
} catch (_) { }

// Note: Must match `build.appId` in package.json
app.setAppUserModelId('eu.savagecore.twerkit');

// Uncomment this before publishing your first version.
// It's commented out as it throws an error if there are no published versions.
// if (!is.development) {
// 	const FOUR_HOURS = 1000 * 60 * 60 * 4;
// 	setInterval(() => {
// 		autoUpdater.checkForUpdates();
// 	}, FOUR_HOURS);
//
// 	autoUpdater.checkForUpdates();
// }

// Prevent window from being garbage collected
let mainWindow;

const createMainWindow = async () => {
	const win = new BrowserWindow({
		title: app.name,
		show: false,
		width: 600,
		height: 400,
		webPreferences: {
			nodeIntegration: false,
			preload: `${__dirname}/preload.js`
		},
		resizable: false,
		icon: `${__dirname}/img/icon.ico`
	});

	win.on('ready-to-show', () => {
		win.show();
	});

	win.on('close', event => {
		event.preventDefault();
		mainWindow.hide();
	});

	const tray = new Tray(path.join(__dirname, '/img/icon.ico'));

	await win.loadFile(path.join(__dirname, 'index.html'));

	const contextMenu = Menu.buildFromTemplate([
		{
			label: 'Show App', click() {
				mainWindow.show();
			}
		},
		{
			label: 'Quit', click() {
				mainWindow.destroy();
				app.quit();
			}
		}
	]);

	tray.setContextMenu(contextMenu);

	tray.on('double-click', () => {
		mainWindow.show();
	});

	return win;
};

// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on('second-instance', () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on('activate', async () => {
	if (!mainWindow) {
		mainWindow = await createMainWindow();
	}
});

(async () => {
	await app.whenReady();
	Menu.setApplicationMenu(menu);
	mainWindow = await createMainWindow();

	if (await config.get('enabledOnStart') === true) {
		registerKeybinds();
	}

	ipcMain.on('send', async (event, data) => {
		if (typeof data.message.keybinds !== 'undefined') {
			if (data.message.keybinds === 'toggle') {
				if (config.get('keybindsEnabled') === true) {
					unregisterKeybinds();
				} else {
					registerKeybinds();
				}
			}
		}

		if (typeof data.message.save !== 'undefined') {
			if (data.message.save === true) {
				for (const key of Object.keys(data.message.data)) {
					if (key === 'startOnBoot') {
						app.setLoginItemSettings({
							openAtLogin: data.message.data[key]
						});
					}

					config.set(key, data.message.data[key]);
				}
			}
		}

		if (typeof data.message.page !== 'undefined') {
			loadPage(data.message.page);
		}
	});
})();

function registerKeybinds() {
	config.set('keybindsEnabled', true);
	robot.setKeyboardDelay(50);
	let twerkInterval;

	mainWindow.webContents.executeJavaScript('document.querySelector(\'#status\').textContent = \'Idle\'');
	mainWindow.webContents.executeJavaScript('document.querySelector(\'#toggle-keybinds > span\').textContent = \'Disable\'');

	globalShortcut.register('CommandOrControl+num1', () => {
		mainWindow.webContents.executeJavaScript('document.querySelector(\'#status\').textContent = \'Twerking\'');
		twerkInterval = setInterval(async () => {
			robot.keyTap('shift');
		}, 100);
	});

	globalShortcut.register('CommandOrControl+numdec', () => {
		clearInterval(twerkInterval);
		mainWindow.webContents.executeJavaScript('document.querySelector(\'#status\').textContent = \'Idle\'');
	});
}

function unregisterKeybinds() {
	config.set('keybindsEnabled', false);
	mainWindow.webContents.executeJavaScript('document.querySelector(\'#toggle-keybinds > span\').textContent = \'Enable\'');
	mainWindow.webContents.executeJavaScript('document.querySelector(\'#status\').textContent = \'Keybinds disabled\'');
	globalShortcut.unregister('CommandOrControl+num1');
	globalShortcut.unregister('CommandOrControl+numdec');
}

async function loadPage(page) {
	await mainWindow.loadFile(path.join(__dirname, `${page}.html`));
	if (page === 'preferences') {
		console.log('Loaded preferences');
		const enabledOnStart = config.get('enabledOnStart');
		console.log('enabledOnStart', enabledOnStart);
		if (enabledOnStart === true) {
			mainWindow.webContents.executeJavaScript('document.querySelector(\'#enabledOnStart\').checked = \'true\'');
		} else {
			mainWindow.webContents.executeJavaScript('document.querySelector(\'#enabledOnStart\').checked = \'false\'');
		}
	}
}
