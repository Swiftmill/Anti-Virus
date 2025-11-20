import path from 'node:path';
import fs from 'fs-extra';
import dayjs from 'dayjs';
import { getDataPath, readJson, writeJson } from './fileStore';
import { addLog } from './logManager';
import { getQuarantineDir } from './scanEngine';

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

const fileName = 'quarantine.json';

const getItems = async () => readJson<QuarantineItem[]>(fileName, []);

export const quarantineFile = async (payload: {
  targetPath: string;
  reason: string;
  severity: string;
  userId: string;
}) => {
  const exists = await fs.pathExists(payload.targetPath);
  if (!exists) throw new Error('File no longer exists');
  const quarantineDir = getQuarantineDir();
  await fs.ensureDir(quarantineDir);
  const id = `q_${Date.now()}`;
  const fileNameOnly = path.basename(payload.targetPath);
  const storedPath = path.join(quarantineDir, `${id}_${fileNameOnly}`);
  await fs.move(payload.targetPath, storedPath, { overwrite: true });
  const newItem: QuarantineItem = {
    id,
    fileName: fileNameOnly,
    originalPath: payload.targetPath,
    storedPath,
    reason: payload.reason,
    severity: payload.severity,
    userId: payload.userId,
    addedAt: dayjs().toISOString()
  };
  const items = await getItems();
  items.unshift(newItem);
  await writeJson(fileName, items);
  await addLog({ type: 'quarantine', message: `File ${fileNameOnly} moved to quarantine`, userId: payload.userId });
  return newItem;
};

export const restoreFile = async (id: string) => {
  const items = await getItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error('Item not found');
  await fs.ensureDir(path.dirname(item.originalPath));
  await fs.move(item.storedPath, item.originalPath, { overwrite: true });
  const updated = items.filter((entry) => entry.id !== id);
  await writeJson(fileName, updated);
  await addLog({ type: 'restore', message: `File ${item.fileName} restored`, userId: item.userId });
  return item;
};

export const deleteQuarantineFile = async (id: string) => {
  const items = await getItems();
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error('Item not found');
  await fs.remove(item.storedPath);
  const updated = items.filter((entry) => entry.id !== id);
  await writeJson(fileName, updated);
  await addLog({ type: 'delete', message: `Quarantine file ${item.fileName} removed`, userId: item.userId });
  return item;
};

export const listQuarantine = async () => getItems();
