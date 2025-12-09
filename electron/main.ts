import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

const distPath = process.env.DIST || path.join(__dirname, '../dist')
const publicPath = process.env.VITE_PUBLIC || path.join(distPath, '../public')

let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: path.join(publicPath, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true,
    titleBarStyle: 'hidden', // Custom title bar for that modern look
    titleBarOverlay: {
        color: '#00000000',
        symbolColor: '#ffffff',
        height: 30
    }
  })

  let isMiniMode = false;
  const originalSize = { width: 1000, height: 800 };

  ipcMain.on('toggle-mini-mode', (_event, shouldBeMini) => {
    if (!win) return;
    
    if (shouldBeMini) {
        if (!isMiniMode) {
            const [w, h] = win.getSize();
            originalSize.width = w;
            originalSize.height = h;
        }
        win.setSize(300, 180);
        win.setAlwaysOnTop(true, 'screen-saver');
        isMiniMode = true;
    } else {
        win.setSize(originalSize.width, originalSize.height);
        win.setAlwaysOnTop(false);
        isMiniMode = false;
    }
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(distPath, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
