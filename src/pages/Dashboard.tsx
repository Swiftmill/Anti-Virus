import { useEffect, useState } from 'react';
import StatsCard from '../components/StatsCard';
import type { User, LogEntry } from '../types/models';

const Dashboard = ({ user }: { user: User }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      const entries = await window.electronAPI.getLogs();
      setLogs(entries.slice(0, 5));
    };
    load();
  }, []);

  const lastScan = logs.find((log) => log.type === 'scan');
  const threats = logs.filter((log) => log.type === 'threat');

  return (
    <div className="dashboard">
      <div className="grid">
        <StatsCard title="Last Scan" value={lastScan ? new Date(lastScan.createdAt).toLocaleString() : 'No scans yet'} />
        <StatsCard title="Threats" value={threats.length} subtitle="Detected in recent scans" />
        <StatsCard title="Security Score" value={Math.max(100 - threats.length * 10, 30)} subtitle="Simulated metric" />
      </div>
      <div className="card glass">
        <h2>Recent Activity</h2>
        <ul className="timeline">
          {logs.map((log) => (
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
    </div>
  );
};

export default Dashboard;
