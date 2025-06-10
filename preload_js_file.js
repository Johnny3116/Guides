const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Navigation
  onNavigate: (callback) => {
    ipcRenderer.on('navigate-to', callback);
  },
  
  // File operations
  onExportProgress: (callback) => {
    ipcRenderer.on('export-progress', callback);
  },
  
  onImportProgress: (callback) => {
    ipcRenderer.on('import-progress', callback);
  },
  
  saveFile: (filePath, data) => {
    return ipcRenderer.invoke('save-file', filePath, data);
  },
  
  // App information
  getAppInfo: () => {
    return ipcRenderer.invoke('get-app-info');
  },
  
  // Utility
  platform: process.platform,
  
  // Remove listeners (cleanup)
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  
  // Version info
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  }
});

// Log that preload script has loaded
console.log('YoloTech New Hire Guide - Preload script loaded');

// Security: Remove any global Node.js APIs that might have leaked
delete window.require;
delete window.exports;
delete window.module;