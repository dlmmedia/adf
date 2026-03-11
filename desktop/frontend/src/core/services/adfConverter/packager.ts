/**
 * ADF packaging — assembles all artifacts into a ZIP-based .adf container.
 * Port of backend/app/converter/packager.py using JSZip.
 */
import JSZip from "jszip";
import type {
  SemanticData,
  AgentMeta,
  KnowledgeGraph,
  BenchmarkData,
} from "@app/types/adf";

export interface PackageInput {
  pdfData: ArrayBuffer;
  semantic: SemanticData;
  agentMeta: AgentMeta;
  graph: KnowledgeGraph;
  benchmarks: BenchmarkData;
}

export async function packageAdf(input: PackageInput): Promise<Blob> {
  const zip = new JSZip();

  zip.file("document.pdf", input.pdfData);
  zip.file("semantic.json", JSON.stringify(input.semantic, null, 2));
  zip.file("agent.json", JSON.stringify(input.agentMeta, null, 2));
  zip.file("graph.json", JSON.stringify(input.graph, null, 2));
  zip.file("benchmarks.json", JSON.stringify(input.benchmarks, null, 2));

  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}
