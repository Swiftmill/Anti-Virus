import fs from 'fs-extra';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { addLog } from './logManager';
import { readJson, getDataPath } from './fileStore';

export type ScanOptions = {
  type: 'quick' | 'full' | 'custom';
  paths: string[];
  userId: string;
};

export type Threat = {
  filePath: string;
  reason: string;
  severity: string;
  hash: string;
};

export type ScanResult = {
  scanned: number;
  threats: Threat[];
  startedAt: string;
  finishedAt: string;
  durationMs: number;
};

const SIGNATURES_FILE = 'signatures.json';
const SUSPICIOUS_EXT = ['.exe', '.bat', '.cmd', '.scr', '.ps1'];
const SUSPICIOUS_NAMES = ['crack', 'keygen', 'hacktool'];

const expandHome = (p: string) => (p.startsWith('~/') ? path.join(os.homedir(), p.slice(2)) : p);

const hashFile = async (filePath: string) => {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  return new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
};

const isThreat = (filePath: string, signatures: { pattern: string; description: string; severity: string }[], hash: string) => {
  const lower = path.basename(filePath).toLowerCase();
  const signature = signatures.find((sig) => lower.includes(sig.pattern.toLowerCase()) || hash.includes(sig.pattern.toLowerCase()));
  if (signature) {
    return {
      reason: signature.description,
      severity: signature.severity
    };
  }
  if (SUSPICIOUS_EXT.includes(path.extname(filePath).toLowerCase())) {
    return {
      reason: 'Suspicious executable extension',
      severity: 'medium'
    };
  }
  if (SUSPICIOUS_NAMES.some((name) => lower.includes(name))) {
    return {
      reason: 'Filename flagged by heuristic rule',
      severity: 'high'
    };
  }
  return null;
};

export const scanPaths = async (options: ScanOptions): Promise<ScanResult> => {
  const signatures = await readJson<{ pattern: string; description: string; severity: string }[]>(SIGNATURES_FILE, []);
  const expandedPaths = options.paths.map(expandHome);
  let scanned = 0;
  const threats: Threat[] = [];
  const startedAt = new Date().toISOString();

  for (const p of expandedPaths) {
    const exists = await fs.pathExists(p);
    if (!exists) continue;
    const stats = await fs.stat(p);
    if (stats.isDirectory()) {
      const files = await fs.readdir(p);
      for (const file of files) {
        const full = path.join(p, file);
        const fileStat = await fs.stat(full);
        if (fileStat.isDirectory()) continue;
        scanned += 1;
        const hash = await hashFile(full);
        const threatInfo = isThreat(full, signatures, hash);
        if (threatInfo) {
          threats.push({ filePath: full, reason: threatInfo.reason, severity: threatInfo.severity, hash });
        }
      }
    } else {
      scanned += 1;
      const hash = await hashFile(p);
      const threatInfo = isThreat(p, signatures, hash);
      if (threatInfo) {
        threats.push({ filePath: p, reason: threatInfo.reason, severity: threatInfo.severity, hash });
      }
    }
  }

  const finishedAt = new Date().toISOString();
  const result: ScanResult = {
    scanned,
    threats,
    startedAt,
    finishedAt,
    durationMs: new Date(finishedAt).getTime() - new Date(startedAt).getTime()
  };
  await addLog({ type: 'scan', message: `${options.type} scan completed`, userId: options.userId, metadata: result });
  if (threats.length) {
    for (const threat of threats) {
      await addLog({
        type: 'threat',
        message: `Threat detected at ${threat.filePath}`,
        userId: options.userId,
        metadata: threat
      });
    }
  }
  return result;
};

export const getQuarantineDir = () => getDataPath('quarantine_files');
