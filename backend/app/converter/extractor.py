"""PDF text extraction using PyMuPDF with page/position metadata."""

from __future__ import annotations

from dataclasses import dataclass

import fitz  # PyMuPDF

from app.models import PageBlock


@dataclass
class ExtractionResult:
    blocks: list[PageBlock]
    full_text: str
    page_count: int


def extract_pdf(pdf_path: str) -> ExtractionResult:
    """Extract blocks, full text, and page count in a single pass."""
    blocks: list[PageBlock] = []
    text_parts: list[str] = []
    doc = fitz.open(pdf_path)
    page_count = len(doc)

    for page_num in range(page_count):
        page = doc[page_num]

        text_parts.append(page.get_text())

        block_dicts = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)

        for block in block_dicts.get("blocks", []):
            if block.get("type") != 0:
                continue

            for line in block.get("lines", []):
                line_text = ""
                max_font_size = 0.0
                font_name = ""
                is_bold = False

                for span in line.get("spans", []):
                    line_text += span.get("text", "")
                    sz = span.get("size", 0)
                    if sz > max_font_size:
                        max_font_size = sz
                        font_name = span.get("font", "")
                        is_bold = "bold" in font_name.lower() or "Bold" in span.get("font", "")

                text = line_text.strip()
                if not text:
                    continue

                bbox = line.get("bbox", block.get("bbox", [0, 0, 0, 0]))
                blocks.append(
                    PageBlock(
                        page=page_num + 1,
                        text=text,
                        x0=bbox[0],
                        y0=bbox[1],
                        x1=bbox[2],
                        y1=bbox[3],
                        font_size=max_font_size,
                        font_name=font_name,
                        is_bold=is_bold,
                    )
                )

    doc.close()
    full_text = "\n".join(text_parts).strip()
    return ExtractionResult(blocks=blocks, full_text=full_text, page_count=page_count)
