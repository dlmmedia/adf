import JSZip from "jszip";
import type { DocumentData, SemanticData, AgentMeta, KnowledgeGraph, BenchmarkData } from "@app/types/adf";

export interface AdfLoadResult {
  pdfBlob: Blob;
  pdfBlobUrl: string;
  document: DocumentData;
  fileName: string;
}

export async function loadAdfFile(file: File): Promise<AdfLoadResult> {
  const zip = await JSZip.loadAsync(file);

  const pdfEntry = zip.file("document.pdf");
  if (!pdfEntry) {
    throw new Error("Invalid ADF file: missing document.pdf");
  }

  const pdfBlob = await pdfEntry.async("blob");
  const pdfBlobUrl = URL.createObjectURL(
    new Blob([pdfBlob], { type: "application/pdf" })
  );

  const semanticEntry = zip.file("semantic.json");
  const agentEntry = zip.file("agent.json");
  const graphEntry = zip.file("graph.json");
  const benchmarksEntry = zip.file("benchmarks.json");

  if (!semanticEntry || !agentEntry) {
    throw new Error("Invalid ADF file: missing required metadata (semantic.json, agent.json)");
  }

  const semantic: SemanticData = JSON.parse(await semanticEntry.async("string"));
  const agent: AgentMeta = JSON.parse(await agentEntry.async("string"));
  const graph: KnowledgeGraph = graphEntry
    ? JSON.parse(await graphEntry.async("string"))
    : { nodes: [], edges: [] };
  const benchmarks: BenchmarkData = benchmarksEntry
    ? JSON.parse(await benchmarksEntry.async("string"))
    : {
        conversion_time_ms: 0,
        extraction_time_ms: 0,
        structure_time_ms: 0,
        enrichment_time_ms: 0,
        embedding_time_ms: 0,
        structure_accuracy: 0,
        entity_accuracy: 0,
        summary_quality_score: 0,
        token_savings_percent: 0,
        total_pages: 0,
        total_sections: semantic.sections?.length ?? 0,
        total_entities: agent.entities?.length ?? 0,
      };

  const document: DocumentData = {
    job_id: "local",
    semantic,
    agent,
    graph,
    benchmarks,
  };

  return {
    pdfBlob,
    pdfBlobUrl,
    document,
    fileName: file.name.replace(/\.adf$/i, ""),
  };
}

export async function loadAdfFromBytes(bytes: Uint8Array, name: string): Promise<AdfLoadResult> {
  const ab = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(ab).set(bytes);
  const file = new File([ab], name, { type: "application/zip" });
  return loadAdfFile(file);
}

export function revokeAdfBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}

export function isAdfFile(filename: string): boolean {
  return filename.toLowerCase().endsWith(".adf");
}
