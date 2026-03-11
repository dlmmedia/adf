/**
 * Local enrichment — generates document metadata without requiring an LLM.
 * Port of the _fallback_enrich path from backend/app/converter/enrichment.py.
 *
 * Produces: summary, entities, keywords, document type classification, and a
 * knowledge graph — all derived from word-frequency heuristics.
 */
import type {
  SemanticData,
  AgentMeta,
  Entity,
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
} from "@app/types/adf";

export function enrichLocally(
  fullText: string,
  semantic: SemanticData
): { agentMeta: AgentMeta; graph: KnowledgeGraph } {
  const words = fullText.split(/\s+/);
  const summary =
    words.slice(0, 150).join(" ") + (words.length > 150 ? "..." : "");

  const wordFreq: Record<string, number> = {};
  for (const w of words) {
    const cleaned = w.replace(/[^a-zA-Z]/g, "").toLowerCase();
    if (cleaned.length > 4) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
    }
  }

  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  const entities: Entity[] = topWords.map(([name, mentions]) => ({
    type: "keyword",
    name,
    mentions,
  }));

  const keywords = topWords.slice(0, 10).map(([w]) => w);

  const readingOrder = semantic.sections
    .slice(0, 10)
    .map((s) => s.title.toLowerCase());

  // Classify document type by simple keyword matching
  const docType = classifyDocType(fullText);

  const maxMentions = topWords.length > 0 ? topWords[0][1] : 1;

  const entityNodes: GraphNode[] = entities.slice(0, 10).map((e, i) => ({
    id: `e_${i}`,
    label: e.name,
    type: e.type,
    description: `Keyword '${e.name}' appears ${e.mentions} time(s) in the document.`,
    importance: Math.min(1.0, 0.3 + (e.mentions / maxMentions) * 0.7),
  }));

  const docNode: GraphNode = {
    id: "doc",
    label: "Document",
    type: "document",
    description: "The source document being analyzed.",
    importance: 1.0,
  };

  const edges: GraphEdge[] = entityNodes.map((n) => ({
    source: "doc",
    target: n.id,
    relationship: "contains",
    weight: n.importance,
  }));

  // Generate section summaries from content
  for (const s of semantic.sections) {
    if (!s.summary) {
      const sectionWords = s.content.split(/\s+/);
      s.summary =
        sectionWords.slice(0, 30).join(" ") +
        (sectionWords.length > 30 ? "..." : "");
    }
  }

  return {
    agentMeta: {
      doc_type: docType,
      confidence: 0.7,
      reading_order: readingOrder,
      capabilities: ["search", "summarize", "extract"],
      summary,
      entities,
      keywords,
    },
    graph: {
      nodes: [docNode, ...entityNodes],
      edges,
    },
  };
}

function classifyDocType(text: string): string {
  const lower = text.toLowerCase();
  const patterns: [RegExp, string][] = [
    [/\babstract\b.*\bintroduction\b.*\bconclusion\b/s, "research_paper"],
    [/\bwhereas\b.*\bhereby\b|\bparty\b.*\bagreement\b/s, "legal_contract"],
    [/\bchapter\s+\d/i, "book"],
    [/\binstallation\b.*\bconfiguration\b|\buser\s+guide\b/i, "manual"],
    [/\bexecutive\s+summary\b|\bfindings\b.*\brecommendations\b/s, "report"],
  ];
  for (const [pattern, docType] of patterns) {
    if (pattern.test(lower)) return docType;
  }
  return "document";
}
