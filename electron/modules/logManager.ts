import dayjs from 'dayjs';
import { readJson, writeJson } from './fileStore';

export type LogEntry = {
  id: string;
  type: 'scan' | 'threat' | 'quarantine' | 'restore' | 'delete' | 'settings' | 'user';
  message: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

const fileName = 'logs.json';

export const getLogs = async () => readJson<LogEntry[]>(fileName, []);

export const addLog = async (entry: Omit<LogEntry, 'id' | 'createdAt'>) => {
  const logs = await getLogs();
  const log: LogEntry = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: dayjs().toISOString()
  };
  logs.unshift(log);
  await writeJson(fileName, logs);
  return log;
};
