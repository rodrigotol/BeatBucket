const {BrowserWindow, app} = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const isDev = require('electron-is-dev');

var sass = null;
var playerWindow = null;
var frontLoaded = false;
var openUrls = [];

if (isDev)
    sass = require('sass');

function handle_second_instance(event, args, workingDirectory) {
    if (frontLoaded) {
        notify_new_song(args);
    } else {
        openUrls.push(args);
    }
}

function createWindow() { 
    var iconPath = path.join(__dirname, 'assets', 'img', 'beat_bucket.ico')

    //create browser window
    playerWindow = new BrowserWindow({
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
    });           

    //Open devtools
    if (isDev)
        playerWindow.webContents.openDevTools();

    playerWindow.on('close', () => {
        playerWindow = null;
    });
    
    // load index.html
    playerWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    playerWindow.webContents.on('did-finish-load', ()=> {
        frontLoaded = true;

        if (process.argv.length >= 2) {
            notify_new_song(process.argv);
        }

        while (openUrls.length > 0) {
            notify_new_song(openUrls.pop())
        }
    });
}

function compile_scss() {
    var scssPath = path.join(__dirname, 'assets', 'scss', 'style.scss')
    var scssOutPath = path.join(__dirname, 'assets', 'css', 'style.css')

    var result = sass.renderSync({file: scssPath});      
    
    fs.writeFileSync(scssOutPath, result.css.toString()); 
}

function notify_new_song(args) {
    return new Promise(function() {
        setTimeout(function(){
            playerWindow.webContents.send('new-song-added', args);
        }, 100);
    });
}

function setupFirstInstance() {    
    // handle attempt to open a second instance
    app.on('second-instance', handle_second_instance);

    // startup application
    app.whenReady().then(createWindow);

    // quit when all windows are closed (except on mac)
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });
    
    if (isDev)
        compile_scss();
}

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    setupFirstInstance();
}