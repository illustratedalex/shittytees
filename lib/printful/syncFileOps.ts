import { copyFile, mkdir, writeFile } from 'fs/promises';
import { resolve } from 'path';

export type LocalSyncPlan = {
  targetPath: string;
  changed: boolean;
  wouldChangeOnApply: boolean;
};

export function planLocalSyncUpdate(targetPath: string, currentContent: string, nextContent: string): LocalSyncPlan {
  const changed = currentContent !== nextContent;
  return {
    targetPath,
    changed,
    wouldChangeOnApply: changed,
  };
}

export async function applyLocalSyncUpdate(targetPath: string, nextContent: string, backupRoot = resolve(process.cwd(), '.generated/backups')): Promise<string> {
  await mkdir(backupRoot, { recursive: true });
  const backupPath = resolve(backupRoot, `printfulImportedCatalog.${Date.now()}.ts`);
  await copyFile(targetPath, backupPath);
  await writeFile(targetPath, nextContent, 'utf8');
  return backupPath;
}
