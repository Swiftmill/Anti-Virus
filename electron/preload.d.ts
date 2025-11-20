declare global {
  interface Window {
    electronAPI: {
      login: (payload: { identifier: string; password: string; remember: boolean }) => Promise<any>;
      register: (payload: { username: string; email: string; password: string }) => Promise<any>;
      logout: () => Promise<void>;
      getSession: () => Promise<any>;
      runScan: (payload: { type: 'quick' | 'full' | 'custom'; paths: string[]; userId: string }) => Promise<any>;
      openDialog: () => Promise<string[]>;
      listQuarantine: () => Promise<any>;
      quarantineFile: (payload: { targetPath: string; reason: string; severity: string; userId: string }) => Promise<any>;
      restoreFile: (id: string) => Promise<any>;
      deleteQuarantine: (id: string) => Promise<any>;
      getLogs: () => Promise<any>;
      getSettings: () => Promise<any>;
      updateSettings: (partial: Record<string, unknown>) => Promise<any>;
    };
  }
}

export {};
