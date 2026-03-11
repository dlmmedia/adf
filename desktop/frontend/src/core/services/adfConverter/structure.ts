/**
 * Structure detection using font-size heuristics.
 * Port of backend/app/converter/structure.py — detects headings, sections,
 * tables, and references from extracted text blocks.
 */
import type { PageBlock } from "@app/services/adfConverter/extractor";
import type { Section, SemanticData } from "@app/types/adf";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function estimateLevel(
  fontSize: number,
  allSizes: number[],
  threshold: number
): number {
  const largeSizes = [
    ...new Set(allSizes.filter((s) => s >= threshold)),
  ].sort((a, b) => b - a);
  if (largeSizes.length === 0) return 1;
  for (let i = 0; i < largeSizes.length; i++) {
    if (fontSize >= largeSizes[i] - 0.5) return i + 1;
  }
  return largeSizes.length;
}

function detectTables(blocks: PageBlock[]): Array<{ page: number; rows: string[] }> {
  const tables: Array<{ page: number; rows: string[] }> = [];
  let tableLines: string[] = [];
  let tablePage = 0;

  for (const block of blocks) {
    if (block.text.includes("\t") || /\s{3,}/.test(block.text)) {
      if (tableLines.length === 0) tablePage = block.page;
      tableLines.push(block.text);
    } else {
      if (tableLines.length >= 2) {
        tables.push({ page: tablePage, rows: tableLines });
      }
      tableLines = [];
    }
  }
  if (tableLines.length >= 2) {
    tables.push({ page: tablePage, rows: tableLines });
  }
  return tables;
}

function fallbackStructure(blocks: PageBlock[]): SemanticData {
  const fullText = blocks.map((b) => b.text).join(" ");
  return {
    sections: [
      { title: "Document", level: 1, content: fullText, page: 1, summary: "" },
    ],
    tables: [],
    references: [],
  };
}

export function detectStructure(blocks: PageBlock[]): SemanticData {
  if (blocks.length === 0) {
    return { sections: [], tables: [], references: [] };
  }

  const fontSizes = blocks.filter((b) => b.font_size > 0).map((b) => b.font_size);
  if (fontSizes.length === 0) return fallbackStructure(blocks);

  const medianSize = median(fontSizes);
  const headingThreshold = medianSize * 1.15;

  const sections: Section[] = [];
  const references: string[] = [];
  let currentSection: Section | null = null;
  let inReferences = false;

  for (const block of blocks) {
    const text = block.text.trim();
    if (!text) continue;

    const isHeading =
      (block.font_size > headingThreshold || block.is_bold) &&
      text.length < 200 &&
      !text.endsWith(".");

    const refHeader = /^(references|bibliography|works cited)/i.test(text);
    if (refHeader) {
      inReferences = true;
      if (currentSection) sections.push(currentSection);
      currentSection = {
        title: "References",
        level: 1,
        content: "",
        page: block.page,
        summary: "",
      };
      continue;
    }

    if (inReferences) {
      references.push(text);
      if (currentSection) currentSection.content += text + "\n";
      continue;
    }

    if (isHeading) {
      if (currentSection) sections.push(currentSection);
      const level = estimateLevel(block.font_size, fontSizes, headingThreshold);
      currentSection = {
        title: text,
        level,
        content: "",
        page: block.page,
        summary: "",
      };
    } else {
      if (!currentSection) {
        currentSection = {
          title: "Introduction",
          level: 1,
          content: "",
          page: block.page,
          summary: "",
        };
      }
      currentSection.content += text + " ";
    }
  }

  if (currentSection) sections.push(currentSection);

  for (const s of sections) {
    s.content = s.content.trim();
  }

  const tables = detectTables(blocks);

  return { sections, tables, references };
}
