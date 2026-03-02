const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

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
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
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

export async function uploadPdf(file: File): Promise<{ job_id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/api/convert`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export function streamStatus(
  jobId: string,
  onUpdate: (status: ConversionStatus) => void,
  onDone: () => void,
  onError: (err: string) => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/api/status/${jobId}`, {
    withCredentials: true,
  });
  eventSource.onmessage = (event) => {
    const data: ConversionStatus = JSON.parse(event.data);
    onUpdate(data);
    if (data.status === "completed" || data.status === "failed") {
      eventSource.close();
      if (data.status === "completed") onDone();
      else onError(data.message);
    }
  };
  eventSource.onerror = () => {
    eventSource.close();
    onError("Connection lost");
  };
  return () => eventSource.close();
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
