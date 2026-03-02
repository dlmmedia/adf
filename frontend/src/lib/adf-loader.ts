import JSZip from "jszip";
import type { DocumentData } from "./api";

export interface AdfLoadResult {
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
    throw new Error("Invalid ADF file: missing required metadata");
  }

  const semantic = JSON.parse(await semanticEntry.async("string"));
  const agent = JSON.parse(await agentEntry.async("string"));
  const graph = graphEntry
    ? JSON.parse(await graphEntry.async("string"))
    : { nodes: [], edges: [] };
  const benchmarks = benchmarksEntry
    ? JSON.parse(await benchmarksEntry.async("string"))
    : null;

  const document: DocumentData = {
    job_id: "local",
    semantic,
    agent,
    graph,
    benchmarks: benchmarks ?? {
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
    },
  };

  return {
    pdfBlobUrl,
    document,
    fileName: file.name.replace(/\.adf$/i, ""),
  };
}

export function revokeAdfBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}
