import { contextBridge, ipcRenderer } from 'electron';

type ApiChannels =
  | 'auth:login'
  | 'auth:register'
  | 'auth:logout'
  | 'session:get'
  | 'scan:run'
  | 'dialog:open'
  | 'quarantine:list'
  | 'quarantine:add'
  | 'quarantine:restore'
  | 'quarantine:delete'
  | 'logs:list'
  | 'settings:get'
  | 'settings:update';

const invoke = <T = unknown>(channel: ApiChannels, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args) as Promise<T>;

contextBridge.exposeInMainWorld('electronAPI', {
  login: (payload: { identifier: string; password: string; remember: boolean }) => invoke('auth:login', payload),
  register: (payload: { username: string; email: string; password: string }) => invoke('auth:register', payload),
  logout: () => invoke('auth:logout'),
  getSession: () => invoke('session:get'),
  runScan: (payload: { type: 'quick' | 'full' | 'custom'; paths: string[]; userId: string }) => invoke('scan:run', payload),
  openDialog: () => invoke<string[]>('dialog:open'),
  listQuarantine: () => invoke('quarantine:list'),
  quarantineFile: (payload: { targetPath: string; reason: string; severity: string; userId: string }) => invoke('quarantine:add', payload),
  restoreFile: (id: string) => invoke('quarantine:restore', id),
  deleteQuarantine: (id: string) => invoke('quarantine:delete', id),
  getLogs: () => invoke('logs:list'),
  getSettings: () => invoke('settings:get'),
  updateSettings: (partial: Record<string, unknown>) => invoke('settings:update', partial)
});
