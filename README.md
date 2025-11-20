# Vortex Anti-Virus

> Educational, fully local antivirus desktop application built with Electron + React.

## Requirements
- Node.js 18+
- npm 9+

## Install
```bash
npm install
```

## Development
```bash
npm run dev
```
This runs Vite for the renderer and launches Electron once the dev server is ready.

## Production build
```bash
npm run build
```
The renderer bundle is emitted to `dist/` and the Electron TypeScript is compiled to `dist-electron/` for packaging.

## Project structure
```
├── data/                # JSON stores for settings, users, logs, quarantine
├── electron/            # Electron main process + backend modules
├── src/                 # React renderer
├── vite.config.ts       # Vite configuration for renderer
├── tsconfig.json        # Root TypeScript config
└── package.json         # Scripts & dependencies
```

## Disclaimer
Vortex is an educational proof-of-concept. It should not replace commercial antivirus solutions for production environments.
