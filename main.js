const electron = require('electron');
const url = require('url');
const path = require('path');
var fs = require('fs');
const isDev = require('electron-is-dev');

var sass = null;
if (isDev)
    sass = require('sass');

var playerWindow;
var app = electron.app;
var iconPath = path.join(__dirname, 'assets', 'img', 'beatbucket.png')
var scssPath = path.join(__dirname, 'assets', 'scss', 'style.scss')
var scssOutPath = path.join(__dirname, 'assets', 'css', 'style.css')

function createWindow() { 
    //create browser window
    playerWindow = new electron.BrowserWindow({
        width: 556,
        height: 389,
        icon: iconPath,
        resizable: false,        
        frame: false,
        transparent: true,
        fullscreen: false,
        webPreferences: {
            nodeIntegration: true
        }
    })

    // load index.html
    playerWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Open devtools
    if (isDev)
        playerWindow.webContents.openDevTools();

    playerWindow.on('close', () => {
        playerWindow = null
    });
}

function compile_scss() {
    var result = sass.renderSync({file: scssPath});      
    
    fs.writeFileSync(scssOutPath, result.css.toString()); 
}

if (isDev)
    compile_scss();

// startup application
app.on('ready', createWindow)

// quit when all windows are closed (except on mac)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});