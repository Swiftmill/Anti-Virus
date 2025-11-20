const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('electronAPI', {
  login: (payload) => invoke('auth:login', payload),
  register: (payload) => invoke('auth:register', payload),
  logout: () => invoke('auth:logout'),
  getSession: () => invoke('session:get'),
  runScan: (payload) => invoke('scan:run', payload),
  openDialog: () => invoke('dialog:open'),
  listQuarantine: () => invoke('quarantine:list'),
  quarantineFile: (payload) => invoke('quarantine:add', payload),
  restoreFile: (id) => invoke('quarantine:restore', id),
  deleteQuarantine: (id) => invoke('quarantine:delete', id),
  getLogs: () => invoke('logs:list'),
  getSettings: () => invoke('settings:get'),
  updateSettings: (partial) => invoke('settings:update', partial)
});
