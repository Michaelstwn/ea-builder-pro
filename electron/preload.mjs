import { contextBridge, ipcRenderer } from 'electron';

// Example of exposing IPC to window (if we used contextBridge)
// For MVP, we set contextIsolation: false, so this might just be empty or provide basics.
// But it's good practice to have it.
window.ipcRenderer = ipcRenderer;
