import { useEffect, useState } from 'react';
import type { LogEntry } from '../types/models';

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      const entries = await window.electronAPI.getLogs();
      setLogs(entries);
    };
    load();
  }, []);

  const filtered = logs.filter((log) => filter === 'all' || log.type === filter);

  return (
    <div className="card glass logs">
      <h2>System Logs</h2>
      <select value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="all">All</option>
        <option value="scan">Scans</option>
        <option value="threat">Threats</option>
        <option value="quarantine">Quarantine</option>
        <option value="restore">Restores</option>
        <option value="delete">Deletions</option>
        <option value="settings">Settings</option>
        <option value="user">Users</option>
      </select>
      <ul className="timeline">
        {filtered.map((log) => (
          <li key={log.id}>
            <div>
              <p className="title">{log.type.toUpperCase()}</p>
              <p className="subtitle">{log.message}</p>
            </div>
            <span>{new Date(log.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LogsPage;
