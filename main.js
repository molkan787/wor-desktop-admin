const { app, BrowserWindow } = require('electron');
const DownloadManager = require("electron-download-manager");

DownloadManager.register({
  downloadFolder: app.getPath('desktop') + '\\WalkOnRetail'
});

let win

function createWindow () {
  win = new BrowserWindow({
    width: 800, height: 600, 'min-width': 1000, 'min-height': 600, webPreferences: {
      nodeIntegration: true
    }, show: false
  });
  win.setMenu(null);
  win.maximize();

  win.webContents.on('did-finish-load', function () {
    win.setMinimumSize(1000, 600);
    win.show();
  });

  win.loadFile(`www/index.html`)

  // win.webContents.openDevTools()
  
  win.on('closed', () => {
    win = null
  })

}

function init(){
    createWindow();
}

app.on('ready', init)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})