const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');

let win;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createWindow() {
  win = new BrowserWindow({width: 960, height: 1080, icon: path.join(__dirname, '../public/postmen.png')});
  win.setMenu(null);
  win.webContents.setZoomFactor(1.0);
  win.webContents.openDevTools();

  win.loadURL(url.format({
    pathname: path.join(__dirname, '../public/loading.html'),
    protocol: 'file:',
    slashes: true
  }));

  //waiting for the server to be running on localhost
  sleep(10000)
  .then(() => {
    win.webContents.setZoomFactor(0.8);
    win.loadURL('http://localhost:3000/');
    win.on('closed', () => {
      win = null
    });
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});