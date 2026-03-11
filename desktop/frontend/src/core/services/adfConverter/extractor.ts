/**
 * PDF text extraction using pdfjs-dist.
 * Port of backend/app/converter/extractor.py — extracts text blocks with
 * page number, bounding box, font size, font name, and bold flag.
 */
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface PageBlock {
  page: number;
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  font_size: number;
  font_name: string;
  is_bold: boolean;
}

export interface ExtractionResult {
  blocks: PageBlock[];
  full_text: string;
  page_count: number;
}

export async function extractPdf(
  pdfData: ArrayBuffer,
  onProgress?: (progress: number) => void
): Promise<ExtractionResult> {
  const doc = await getDocument({ data: pdfData }).promise;
  const pageCount = doc.numPages;
  const blocks: PageBlock[] = [];
  const textParts: string[] = [];

  for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
    if (onProgress) {
      onProgress(pageNum / pageCount);
    }

    const page = await doc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const pageText: string[] = [];

    for (const item of textContent.items) {
      if (!("str" in item) || !item.str.trim()) continue;

      const text = item.str.trim();
      pageText.push(text);

      // pdfjs transform: [scaleX, skewY, skewX, scaleY, translateX, translateY]
      const tx = item.transform;
      const fontSize = Math.abs(tx[3]) || Math.abs(tx[0]) || 12;
      const x0 = tx[4];
      const y0 = viewport.height - tx[5] - fontSize;
      const x1 = x0 + (item.width || 0);
      const y1 = y0 + fontSize;

      const fontName = item.fontName || "";
      const isBold =
        /bold/i.test(fontName) ||
        /black/i.test(fontName) ||
        /heavy/i.test(fontName);

      blocks.push({
        page: pageNum,
        text,
        x0,
        y0,
        x1,
        y1,
        font_size: fontSize,
        font_name: fontName,
        is_bold: isBold,
      });
    }

    textParts.push(pageText.join(" "));
  }

  return {
    blocks,
    full_text: textParts.join("\n").trim(),
    page_count: pageCount,
  };
}
