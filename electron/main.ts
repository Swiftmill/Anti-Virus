import path from 'node:path';
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { ensureDataDir } from './modules/fileStore';
import { getSettings, updateSettings } from './modules/settingsManager';
import { getSession, updateSession } from './modules/sessionManager';
import { registerUser, validateCredentials, getUserById } from './modules/userManager';
import { scanPaths } from './modules/scanEngine';
import { addLog, getLogs } from './modules/logManager';
import { deleteQuarantineFile, listQuarantine, quarantineFile, restoreFile } from './modules/quarantineManager';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  await ensureDataDir();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1200,
    minHeight: 720,
    title: 'Vortex Anti-Virus',
    backgroundColor: '#05060a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

app.whenReady().then(createWindow);

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

ipcMain.handle('auth:register', async (_event, payload) => {
  return registerUser(payload);
});

ipcMain.handle('auth:login', async (_event, payload: { identifier: string; password: string; remember: boolean }) => {
  const user = await validateCredentials(payload.identifier, payload.password);
  await updateSession({ userId: user.id, remember: payload.remember });
  if (payload.remember) {
    await updateSettings({ rememberedUserId: user.id });
  }
  return user;
});

ipcMain.handle('auth:logout', async () => {
  await updateSession({ userId: null, remember: false });
});

ipcMain.handle('session:get', async () => {
  const session = await getSession();
  if (session.userId) {
    return getUserById(session.userId);
  }
  const settings = await getSettings();
  if (settings.rememberedUserId) {
    return getUserById(settings.rememberedUserId);
  }
  return null;
});

ipcMain.handle('scan:run', async (_event, payload) => {
  return scanPaths(payload);
});

ipcMain.handle('dialog:open', async () => {
  if (!mainWindow) return [];
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths;
});

ipcMain.handle('quarantine:list', async () => listQuarantine());

ipcMain.handle('quarantine:add', async (_event, payload) => quarantineFile(payload));

ipcMain.handle('quarantine:restore', async (_event, id: string) => restoreFile(id));

ipcMain.handle('quarantine:delete', async (_event, id: string) => deleteQuarantineFile(id));

ipcMain.handle('logs:list', async () => getLogs());

ipcMain.handle('settings:get', async () => getSettings());

ipcMain.handle('settings:update', async (_event, partial) => {
  const updated = await updateSettings(partial);
  await addLog({ type: 'settings', message: 'Settings updated' });
  return updated;
});
