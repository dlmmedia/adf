"""Structure detection: headings, paragraphs, tables, references via font-size heuristics."""

from __future__ import annotations

import re
import statistics

from app.models import PageBlock, Section, SemanticData


def detect_structure(blocks: list[PageBlock]) -> SemanticData:
    """Detect document structure from extracted blocks using font-size heuristics."""
    if not blocks:
        return SemanticData()

    font_sizes = [b.font_size for b in blocks if b.font_size > 0]
    if not font_sizes:
        return _fallback_structure(blocks)

    median_size = statistics.median(font_sizes)
    heading_threshold = median_size * 1.15

    sections: list[Section] = []
    references: list[str] = []
    current_section: Section | None = None
    in_references = False

    for block in blocks:
        text = block.text.strip()
        if not text:
            continue

        is_heading = (
            (block.font_size > heading_threshold or block.is_bold)
            and len(text) < 200
            and not text.endswith(".")
        )

        ref_header = re.match(r"^(references|bibliography|works cited)", text, re.IGNORECASE)
        if ref_header:
            in_references = True
            if current_section:
                sections.append(current_section)
            current_section = Section(
                title="References", level=1, content="", page=block.page
            )
            continue

        if in_references:
            references.append(text)
            if current_section:
                current_section.content += text + "\n"
            continue

        if is_heading:
            if current_section:
                sections.append(current_section)

            level = _estimate_level(block.font_size, font_sizes, heading_threshold)
            current_section = Section(
                title=text, level=level, content="", page=block.page
            )
        else:
            if current_section is None:
                current_section = Section(
                    title="Introduction", level=1, content="", page=block.page
                )
            current_section.content += text + " "

    if current_section:
        sections.append(current_section)

    for s in sections:
        s.content = s.content.strip()

    tables = _detect_tables(blocks)

    return SemanticData(sections=sections, tables=tables, references=references)


def _estimate_level(
    font_size: float, all_sizes: list[float], threshold: float
) -> int:
    large_sizes = sorted(set(s for s in all_sizes if s >= threshold), reverse=True)
    if not large_sizes:
        return 1
    for i, s in enumerate(large_sizes):
        if font_size >= s - 0.5:
            return i + 1
    return len(large_sizes)


def _detect_tables(blocks: list[PageBlock]) -> list[dict]:
    """Simple heuristic: sequences of lines with tab/multiple-space separation."""
    tables: list[dict] = []
    table_lines: list[str] = []
    table_page = 0

    for block in blocks:
        if "\t" in block.text or re.search(r" {3,}", block.text):
            if not table_lines:
                table_page = block.page
            table_lines.append(block.text)
        else:
            if len(table_lines) >= 2:
                tables.append({"page": table_page, "rows": table_lines})
            table_lines = []

    if len(table_lines) >= 2:
        tables.append({"page": table_page, "rows": table_lines})

    return tables


def _fallback_structure(blocks: list[PageBlock]) -> SemanticData:
    """When font metadata is unavailable, create a single section from all text."""
    full_text = " ".join(b.text for b in blocks)
    return SemanticData(
        sections=[
            Section(title="Document", level=1, content=full_text, page=1)
        ]
    )
