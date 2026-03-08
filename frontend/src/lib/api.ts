const API_BASE = "";

export interface ConversionStatus {
  job_id: string;
  status: string;
  step: string;
  progress: number;
  sections_detected: number;
  entities_extracted: number;
  confidence: number;
  message: string;
}

export interface Entity {
  type: string;
  name: string;
  mentions: number;
}

export interface Section {
  title: string;
  level: number;
  content: string;
  page: number;
  summary: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  description: string;
  importance: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight: number;
}

export interface BenchmarkData {
  conversion_time_ms: number;
  extraction_time_ms: number;
  structure_time_ms: number;
  enrichment_time_ms: number;
  embedding_time_ms: number;
  structure_accuracy: number;
  entity_accuracy: number;
  summary_quality_score: number;
  token_savings_percent: number;
  total_pages: number;
  total_sections: number;
  total_entities: number;
}

export interface DocumentData {
  job_id: string;
  semantic: {
    sections: Section[];
    tables: unknown[];
    references: string[];
  };
  agent: {
    doc_type: string;
    confidence: number;
    reading_order: string[];
    capabilities: string[];
    summary: string;
    entities: Entity[];
    keywords: string[];
  };
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  benchmarks: BenchmarkData;
}

export async function uploadPdf(file: File, token?: string | null): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/api/convert`, {
    method: "POST",
    body: formData,
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail || `Upload failed (${res.status})`);
  }
  return res.json();
}

export function streamStatus(
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
    es = new EventSource(
      `${API_BASE}/api/status/${jobId}${tokenQuery}`,
      { withCredentials: true }
    );
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
        /* ignore parse errors from heartbeat comments */
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
        const res = await fetch(`${API_BASE}/api/status/${jobId}`, {
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
  const res = await fetch(`${API_BASE}/api/doc/${jobId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch document");
  return res.json();
}

export function getDownloadUrl(jobId: string): string {
  return `${API_BASE}/api/doc/${jobId}/download`;
}

export function getPdfUrl(jobId: string): string {
  return `${API_BASE}/api/doc/${jobId}/pdf`;
}
