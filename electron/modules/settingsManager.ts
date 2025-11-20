import { readJson, writeJson } from './fileStore';

export type Settings = {
  theme: 'neo-blue' | 'neo-purple';
  language: string;
  rememberedUserId: string | null;
  quickScanPaths: string[];
  realtimeProtection: boolean;
};

const fileName = 'settings.json';

export const getSettings = async () => readJson<Settings>(fileName, {
  theme: 'neo-blue',
  language: 'en',
  rememberedUserId: null,
  quickScanPaths: ['~/Documents', '~/Downloads', '~/Desktop'],
  realtimeProtection: false
});

export const updateSettings = async (partial: Partial<Settings>) => {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await writeJson(fileName, updated);
  return updated;
};
