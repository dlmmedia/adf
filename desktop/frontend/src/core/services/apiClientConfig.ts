const BACKEND_URL_STORAGE_KEY = "dlmadf_backend_url";

const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/**
 * Get the base URL for API requests (Stirling-style /api/v1 tools).
 *
 * Priority:
 * 1. window.STIRLING_PDF_API_BASE_URL (runtime override)
 * 2. Persisted backend URL from user preferences (desktop only)
 * 3. import.meta.env.VITE_API_BASE_URL (build-time env var)
 * 4. '/' (relative path - works for same-origin web deployments)
 *
 * In Tauri desktop builds there is no local HTTP server, so the URL must be
 * explicitly configured to point at a running Stirling PDF / ADF backend.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined" && (window as any).STIRLING_PDF_API_BASE_URL) {
    return (window as any).STIRLING_PDF_API_BASE_URL;
  }

  if (isTauri()) {
    const stored = getStoredBackendUrl();
    if (stored) return stored;
    return import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  }

  return import.meta.env.VITE_API_BASE_URL || "/";
}

export function getStoredBackendUrl(): string | null {
  try {
    return localStorage.getItem(BACKEND_URL_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredBackendUrl(url: string): void {
  try {
    localStorage.setItem(BACKEND_URL_STORAGE_KEY, url);
  } catch {
    /* localStorage may not be available */
  }
}
