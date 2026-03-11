import { getApiBaseUrl } from "@app/services/apiClientConfig";

const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

let lastCheckResult: boolean | null = null;
let lastCheckTime = 0;
const CHECK_CACHE_MS = 10_000;

/**
 * Backend readiness guard.
 *
 * Web builds: always returns true (backend is same-origin).
 * Tauri desktop builds: pings the configured backend URL and returns false
 * (with a console warning) if it is unreachable, so the caller can show a
 * meaningful error instead of silently hanging.
 */
export async function ensureBackendReady(_endpoint?: string): Promise<boolean> {
  if (!isTauri()) return true;

  const now = Date.now();
  if (lastCheckResult !== null && now - lastCheckTime < CHECK_CACHE_MS) {
    return lastCheckResult;
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl || baseUrl === "/") {
    console.warn("[backendReadinessGuard] No backend URL configured for desktop.");
    lastCheckResult = false;
    lastCheckTime = now;
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`${baseUrl}/api/v1/info/status`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    lastCheckResult = res.ok;
  } catch {
    console.warn("[backendReadinessGuard] Backend unreachable at", baseUrl);
    lastCheckResult = false;
  }

  lastCheckTime = now;
  return lastCheckResult;
}

export function resetBackendReadinessCache(): void {
  lastCheckResult = null;
  lastCheckTime = 0;
}
