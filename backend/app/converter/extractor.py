"""PDF text extraction using PyMuPDF with page/position metadata."""

from __future__ import annotations

import fitz  # PyMuPDF

from app.models import PageBlock


def extract_blocks(pdf_path: str) -> list[PageBlock]:
    """Extract text blocks from a PDF with positional and font metadata."""
    blocks: list[PageBlock] = []
    doc = fitz.open(pdf_path)

    for page_num in range(len(doc)):
        page = doc[page_num]
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
    return blocks


def extract_full_text(pdf_path: str) -> str:
    """Extract plain text from a PDF."""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    return text.strip()


def get_page_count(pdf_path: str) -> int:
    doc = fitz.open(pdf_path)
    count = len(doc)
    doc.close()
    return count
