'use strict'

import { screen, app, shell, BrowserWindow } from 'electron'
import pluginloader from './helpers/pluginloader'
import dbUpdate from './jobs/dbUpdate'
import startupLoader from './jobs/startupLoader'
import fs from 'fs'
import './jobs/chromiumCrawler'
import './listeners/auditListener'
import './helpers/filesaver'
import './helpers/iconHelper'
import './helpers/projectHelper'
import './helpers/screenshotHelper'

// If a main process should run from plugins
let pluginDir = './src/core/plugins'
let plugins = fs.readdirSync(pluginDir)
for (var plugin of plugins) {
  var mainFile = pluginDir + '/' + plugin + '/main/index.js'
  if (fs.existsSync(mainFile)) {
    require('../plugins/' + plugin + '/main')
  }
}

dbUpdate.init()
startupLoader.init()

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

pluginloader.loadMenu()

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  var displays = screen.getAllDisplays()
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 850,
    useContentSize: true,
    width: 1800,
    x: displays[0].bounds.x + 50,
    y: displays[0].bounds.y + 50,
    webPreferences: {webSecurity: false}
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('new-window', function (event, url) {
    event.preventDefault()
    shell.openExternal(url)
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
