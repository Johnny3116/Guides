const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Keep a global reference of the window object
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    show: false, // Don't show until ready
    titleBarStyle: 'default'
  });

  // Load the app
  mainWindow.loadFile('index.html');

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus on window
    if (process.platform === 'darwin') {
      app.dock.show();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Create application menu
  createMenu();

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Progress',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            exportProgress();
          }
        },
        {
          label: 'Import Progress',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            importProgress();
          }
        },
        { type: 'separator' },
        {
          label: 'Print Guide',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.print();
          }
        },
        { type: 'separator' },
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Welcome',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'welcome');
          }
        },
        {
          label: 'Getting Started',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'getting-started');
          }
        },
        {
          label: 'Inside Yolo',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'inside-yolo');
          }
        },
        {
          label: 'Team Dynamics',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'team-dynamics');
          }
        },
        {
          label: 'OneDrive',
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'onedrive');
          }
        },
        {
          label: 'Outlook',
          accelerator: 'CmdOrCtrl+6',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'outlook');
          }
        },
        { type: 'separator' },
        {
          label: 'FAQ',
          accelerator: 'CmdOrCtrl+F',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'faq');
          }
        },
        {
          label: 'Contacts',
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'contacts');
          }
        },
        {
          label: 'Checklist',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow.webContents.send('navigate-to', 'checklist');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About YoloTech New Hire Guide',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About',
              message: 'YoloTech New Hire Guide',
              detail: 'Version 1.0.0\n\nInteractive onboarding guide for new employees.\n\n© 2025 YoloTech, Inc.',
              buttons: ['OK']
            });
          }
        },
        {
          label: 'Keyboard Shortcuts',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Keyboard Shortcuts',
              message: 'Keyboard Shortcuts',
              detail: 'Navigation:\nCtrl/Cmd + 1-6: Jump to sections\nCtrl/Cmd + F: FAQ\nCtrl/Cmd + K: Contacts\nCtrl/Cmd + L: Checklist\n\nFile Operations:\nCtrl/Cmd + E: Export Progress\nCtrl/Cmd + I: Import Progress\nCtrl/Cmd + P: Print\n\nView:\nF11: Toggle Fullscreen\nCtrl/Cmd + Plus/Minus: Zoom In/Out\nCtrl/Cmd + R: Reload',
              buttons: ['OK']
            });
          }
        },
        { type: 'separator' },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('mailto:helpdesk@yolotech.com?subject=New Hire Guide Issue');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });

    // Window menu
    template[5].submenu = [
      { role: 'close' },
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function exportProgress() {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Onboarding Progress',
      defaultPath: `yolotech-onboarding-progress-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled) {
      mainWindow.webContents.send('export-progress', result.filePath);
    }
  } catch (error) {
    console.error('Export error:', error);
    dialog.showErrorBox('Export Error', 'Failed to export progress. Please try again.');
  }
}

async function importProgress() {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Onboarding Progress',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const filePath = result.filePaths[0];
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        mainWindow.webContents.send('import-progress', data);
      } catch (readError) {
        throw new Error('Failed to read file: ' + readError.message);
      }
    }
  } catch (error) {
    console.error('Import error:', error);
    dialog.showErrorBox('Import Error', 'Failed to import progress file. Please check the file format and try again.');
  }
}

// Handle file operations from renderer
ipcMain.handle('save-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, data, 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Save file error:', error);
    return { success: false, error: error.message };
  }
});

// Handle app info requests
ipcMain.handle('get-app-info', async () => {
  return {
    version: app.getVersion(),
    name: app.getName(),
    platform: process.platform
  };
});

// App event handlers
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle certificate errors
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  // In development, ignore certificate errors
  if (process.env.NODE_ENV === 'development') {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Prevent navigation to external websites
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});