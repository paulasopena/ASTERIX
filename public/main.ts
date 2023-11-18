const { app, BrowserWindow } = require('electron');

const path = require('path');


//require('@electron/remote/main').initialize();

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    // icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      enableRemoteModule: true,
    },
  });
  win.loadURL('http://localhost:3000');
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