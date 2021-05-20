'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'
import { format as formatUrl } from 'url'
const { Client, Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();

const isDevelopment = process.env.NODE_ENV !== 'production'

// global reference to mainWindow (necessary to prevent window from being garbage collected)
let mainWindow

function createMainWindow() {
  const window = new BrowserWindow({webPreferences: {nodeIntegration: true}})

  if (isDevelopment) {
    window.webContents.openDevTools()
  }

  if (isDevelopment) {
    window.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
  }
  else {
    window.loadURL("./index.html")
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})

ipcMain.on("launcher", (e, authD) => {
	//console.log(authD)
	let opts = {
		clientPackage: null,
		//For production launchers, I recommend not passing 
		//the getAuth function through the authorization field and instead
		// // handling authentication outside before you initialize
		// // MCLC so you can handle auth based errors and validation!
		authorization: Authenticator.getAuth(authD[0], authD[1]),
		root: require("minecraft-folder-path"),
		version: {
			number: "1.16.5",
			type: "release"
		},	
		memory: {
			max: "6G",
			min: "4G"
		}
	}

	launcher.launch(opts);
	launcher.on("package-extract", () => {console.log("Extracting...")})
	launcher.on('debug', (ev) => console.log(ev))
	launcher.on('data', (ev) => console.log(ev));
})
