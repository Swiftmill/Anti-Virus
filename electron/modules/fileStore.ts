import path from 'node:path';
import fs from 'fs-extra';

const baseDir = path.resolve(__dirname, '../..');
const dataDir = path.join(baseDir, 'data');

export const ensureDataDir = async () => {
  await fs.ensureDir(dataDir);
};

export const readJson = async <T>(fileName: string, fallback: T): Promise<T> => {
  const filePath = path.join(dataDir, fileName);
  try {
    const exists = await fs.pathExists(filePath);
    if (!exists) {
      await fs.outputJson(filePath, fallback, { spaces: 2 });
      return fallback;
    }
    return await fs.readJson(filePath);
  } catch (error) {
    console.error(`Failed to read ${fileName}`, error);
    return fallback;
  }
};

export const writeJson = async <T>(fileName: string, data: T): Promise<void> => {
  const filePath = path.join(dataDir, fileName);
  await fs.outputJson(filePath, data, { spaces: 2 });
};

export const getDataPath = (...segments: string[]) => {
  return path.join(dataDir, ...segments);
};
