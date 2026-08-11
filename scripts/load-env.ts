import { loadEnvConfig } from '@next/env';

let loaded = false;

export function ensureScriptEnvLoaded(): void {
  if (loaded) {
    return;
  }

  loadEnvConfig(process.cwd());
  loaded = true;
}
