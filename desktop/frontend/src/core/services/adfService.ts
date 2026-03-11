import axios from "axios";
import type { ConversionStatus, DocumentData } from "@app/types/adf";
import { getApiBaseUrl } from "@app/services/apiClientConfig";

function getAdfApiBase(): string {
  const base = getApiBaseUrl();
  return base === "/" ? "" : base;
}

export async function uploadPdfForConversion(
  file: File,
  token?: string | null
): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await axios.post(`${getAdfApiBase()}/api/convert`, formData, {
    headers,
    withCredentials: true,
  });
  return res.data;
}

export function streamConversionStatus(
  jobId: string,
  onUpdate: (status: ConversionStatus) => void,
  onDone: () => void,
  onError: (err: string) => void,
  token?: string | null
): () => void {
  let closed = false;
  let retries = 0;
  const MAX_RETRIES = 5;
  let pollErrorCount = 0;
  const MAX_POLL_ERRORS = 10;
  let es: EventSource | null = null;

  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";

  function connect() {
    if (closed) return;
    es = new EventSource(`${getAdfApiBase()}/api/status/${jobId}${tokenQuery}`, {
      withCredentials: true,
    });
    es.onmessage = (event) => {
      retries = 0;
      try {
        const data: ConversionStatus = JSON.parse(event.data);
        onUpdate(data);
        if (data.status === "completed" || data.status === "failed") {
          cleanup();
          if (data.status === "completed") onDone();
          else onError(data.message);
        }
      } catch {
        /* ignore heartbeat parse errors */
      }
    };
    es.onerror = () => {
      es?.close();
      if (closed) return;
      if (retries < MAX_RETRIES) {
        retries++;
        setTimeout(connect, 1000 * retries);
      } else {
        pollFallback();
      }
    };
  }

  async function pollFallback() {
    const headers: Record<string, string> = { Accept: "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    while (!closed) {
      try {
        const res = await fetch(`${getAdfApiBase()}/api/status/${jobId}`, {
          credentials: "include",
          headers,
        });
        if (!res.ok) {
          pollErrorCount++;
          if (pollErrorCount >= MAX_POLL_ERRORS) {
            closed = true;
            onError(`Server error (${res.status}). Please try again.`);
            return;
          }
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }
        pollErrorCount = 0;
        const text = await res.text();
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          const data: ConversionStatus = JSON.parse(line.slice(6));
          onUpdate(data);
          if (data.status === "completed" || data.status === "failed") {
            closed = true;
            if (data.status === "completed") onDone();
            else onError(data.message);
            return;
          }
        }
      } catch {
        pollErrorCount++;
        if (pollErrorCount >= MAX_POLL_ERRORS) {
          closed = true;
          onError("Connection lost. Please try again.");
          return;
        }
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  function cleanup() {
    closed = true;
    es?.close();
  }

  connect();
  return cleanup;
}

export async function fetchDocument(jobId: string): Promise<DocumentData> {
  const res = await axios.get(`${getAdfApiBase()}/api/doc/${jobId}`, {
    withCredentials: true,
  });
  return res.data;
}

export function getDownloadUrl(jobId: string): string {
  return `${getAdfApiBase()}/api/doc/${jobId}/download`;
}

export function getPdfUrl(jobId: string): string {
  return `${getAdfApiBase()}/api/doc/${jobId}/pdf`;
}
