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

export interface SemanticData {
  sections: Section[];
  tables: unknown[];
  references: string[];
}

export interface AgentMeta {
  doc_type: string;
  confidence: number;
  reading_order: string[];
  capabilities: string[];
  summary: string;
  entities: Entity[];
  keywords: string[];
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface DocumentData {
  job_id: string;
  semantic: SemanticData;
  agent: AgentMeta;
  graph: KnowledgeGraph;
  benchmarks: BenchmarkData;
}

export type AdfViewMode = "pdf" | "semantic" | "hybrid" | "graph";
