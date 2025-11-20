import { useEffect, useState } from 'react';
import type { Settings } from '../types/models';

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await window.electronAPI.getSettings();
      setSettings(data);
    };
    load();
  }, []);

  const update = async (partial: Partial<Settings>) => {
    if (!settings) return;
    const updated = await window.electronAPI.updateSettings(partial);
    setSettings(updated);
  };

  if (!settings) {
    return <p>Loading settings...</p>;
  }

  return (
    <div className="card glass settings">
      <h2>Preferences</h2>
      <label>
        Theme
        <select value={settings.theme} onChange={(e) => update({ theme: e.target.value as Settings['theme'] })}>
          <option value="neo-blue">Neo Blue</option>
          <option value="neo-purple">Neo Purple</option>
        </select>
      </label>
      <label>
        Real-time protection
        <input type="checkbox" checked={settings.realtimeProtection} onChange={(e) => update({ realtimeProtection: e.target.checked })} />
      </label>
      <label>
        Quick scan paths
        <textarea value={settings.quickScanPaths.join('\n')} onChange={(e) => update({ quickScanPaths: e.target.value.split('\n').filter(Boolean) })} />
      </label>
      <label>
        Language
        <input value={settings.language} onChange={(e) => update({ language: e.target.value })} />
      </label>
    </div>
  );
};

export default SettingsPage;
