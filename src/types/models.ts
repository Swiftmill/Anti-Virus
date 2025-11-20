export type User = {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
};

export type LogEntry = {
  id: string;
  type: 'scan' | 'threat' | 'quarantine' | 'restore' | 'delete' | 'settings' | 'user';
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type ScanResult = {
  scanned: number;
  threats: Threat[];
  startedAt: string;
  finishedAt: string;
  durationMs: number;
};

export type Threat = {
  filePath: string;
  reason: string;
  severity: string;
  hash: string;
};

export type QuarantineItem = {
  id: string;
  fileName: string;
  originalPath: string;
  storedPath: string;
  reason: string;
  severity: string;
  userId: string;
  addedAt: string;
};

export type Settings = {
  theme: 'neo-blue' | 'neo-purple';
  language: string;
  rememberedUserId: string | null;
  quickScanPaths: string[];
  realtimeProtection: boolean;
};
