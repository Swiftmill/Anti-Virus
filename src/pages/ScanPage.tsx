import { useState } from 'react';
import Loader from '../components/Loader';
import type { User, ScanResult, Threat } from '../types/models';

const ScanPage = ({ user }: { user: User }) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [running, setRunning] = useState(false);

  const launchScan = async (type: 'quick' | 'full' | 'custom') => {
    setRunning(true);
    try {
      let scanPaths = paths;
      if (type === 'quick') {
        const settings = await window.electronAPI.getSettings();
        scanPaths = settings.quickScanPaths;
      }
      if (type === 'full') {
        const selection = await window.electronAPI.openDialog();
        scanPaths = selection.length ? selection : scanPaths;
      }
      const payload = { type, paths: scanPaths, userId: user.id };
      const scanResult = await window.electronAPI.runScan(payload);
      setResult(scanResult);
    } finally {
      setRunning(false);
    }
  };

  const addCustomPath = async () => {
    const selection = await window.electronAPI.openDialog();
    if (selection.length) {
      setPaths(selection);
    }
  };

  const quarantine = async (threat: Threat) => {
    await window.electronAPI.quarantineFile({ targetPath: threat.filePath, reason: threat.reason, severity: threat.severity, userId: user.id });
  };

  return (
    <div className="card glass scan">
      <h2>System Scan</h2>
      <div className="actions">
        <button onClick={() => launchScan('quick')} disabled={running}>
          Quick Scan
        </button>
        <button onClick={() => launchScan('full')} disabled={running}>
          Full Scan
        </button>
        <button onClick={addCustomPath} disabled={running}>
          Choose folder
        </button>
        <button onClick={() => launchScan('custom')} disabled={!paths.length || running}>
          Custom Scan
        </button>
      </div>
      {paths.length > 0 && (
        <p className="subtitle">Custom paths: {paths.join(', ')}</p>
      )}
      {running && <Loader label="Scanning" />}
      {result && !running && (
        <div className="scan-result">
          <p>Files scanned: {result.scanned}</p>
          <p>Threats: {result.threats.length}</p>
          <p>Duration: {result.durationMs}ms</p>
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Reason</th>
                <th>Severity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {result.threats.map((threat) => (
                <tr key={threat.hash}>
                  <td>{threat.filePath}</td>
                  <td>{threat.reason}</td>
                  <td>{threat.severity}</td>
                  <td>
                    <button onClick={() => quarantine(threat)}>Quarantine</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScanPage;
