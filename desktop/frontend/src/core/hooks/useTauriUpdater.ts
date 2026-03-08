import { useEffect, useState, useCallback } from 'react';

interface TauriUpdateInfo {
  available: boolean;
  version?: string;
  body?: string;
  date?: string;
}

let isTauri = false;
try {
  isTauri = !!(window as any).__TAURI_INTERNALS__;
} catch {
  // not in Tauri
}

export function useTauriUpdater() {
  const [updateInfo, setUpdateInfo] = useState<TauriUpdateInfo>({ available: false });
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingUpdate, setPendingUpdate] = useState<any>(null);

  const checkForUpdate = useCallback(async () => {
    if (!isTauri) return;

    setChecking(true);
    setError(null);

    try {
      const { check } = await import('@tauri-apps/plugin-updater');
      const update = await check();

      if (update) {
        setUpdateInfo({
          available: true,
          version: update.version,
          body: update.body ?? undefined,
          date: update.date ?? undefined,
        });
        setPendingUpdate(update);
      } else {
        setUpdateInfo({ available: false });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Update check failed';
      console.warn('[Updater] Check failed:', message);
      setError(message);
    } finally {
      setChecking(false);
    }
  }, []);

  const installUpdate = useCallback(async () => {
    if (!pendingUpdate) return;

    setInstalling(true);
    setError(null);

    try {
      await pendingUpdate.downloadAndInstall();
      const { relaunch } = await import('@tauri-apps/plugin-process');
      await relaunch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Install failed';
      console.error('[Updater] Install failed:', message);
      setError(message);
      setInstalling(false);
    }
  }, [pendingUpdate]);

  const dismissUpdate = useCallback(() => {
    setUpdateInfo({ available: false });
    setPendingUpdate(null);
  }, []);

  useEffect(() => {
    if (!isTauri) return;

    const timer = setTimeout(() => {
      checkForUpdate();
    }, 5000);

    return () => clearTimeout(timer);
  }, [checkForUpdate]);

  return {
    isTauri,
    updateInfo,
    checking,
    installing,
    error,
    checkForUpdate,
    installUpdate,
    dismissUpdate,
  };
}
