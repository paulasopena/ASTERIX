const { app, BrowserWindow, dialog } = require('electron');

const path = require('path');
const url = require('url');
const { spawn } = require('node:child_process');
const fs = require('fs');

//require('@electron/remote/main').initialize();

function createWindow() {

  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });


  win.loadURL(`file://${__dirname}/../build/index.html`);

  const tscProcess = spawn('node', [path.join(__dirname, '/server/asterix/server.js')]);

  tscProcess.on('error', (err) => {
    console.error(`Error spawning process: ${err.message}`);
    dialog.showErrorBox('Error', `Error spawning process: ${err.message}`);
    win.webContents.send('server-data', err.message);
  });

  tscProcess.stdout.on('data', (data) => {
    const message = `Server Output: ${data}`;
    console.log(message);
    win.webContents.send('server-data', message);
  });
}
 
app.on('ready', createWindow);

// Quit when windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});