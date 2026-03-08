"""LLM semantic enrichment: summarization, entity extraction, classification, relationships."""

from __future__ import annotations

import asyncio
import json
import re

from openai import AsyncOpenAI

from app.config import settings
from app.models import (
    AgentMeta,
    Entity,
    GraphEdge,
    GraphNode,
    KnowledgeGraph,
    Section,
    SemanticData,
)


def _get_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=settings.openai_api_key)


def _truncate(text: str, max_chars: int = 12000) -> str:
    return text[:max_chars] if len(text) > max_chars else text


def _parse_json_response(text: str) -> dict | list:
    """Extract JSON from an LLM response that may contain markdown fences."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {}


async def enrich(
    full_text: str, semantic: SemanticData
) -> tuple[AgentMeta, KnowledgeGraph]:
    """Run all enrichment tasks in parallel and return agent metadata + knowledge graph."""
    if not settings.openai_api_key:
        return _fallback_enrich(full_text, semantic)

    truncated = _truncate(full_text)
    section_texts = "\n\n".join(
        f"## {s.title}\n{_truncate(s.content, 2000)}" for s in semantic.sections[:20]
    )

    summary_task = _summarize(truncated)
    section_summary_task = _summarize_sections(semantic.sections)
    entity_task = _extract_entities(truncated)
    classify_task = _classify_document(truncated)
    graph_task = _build_graph(truncated)

    results = await asyncio.gather(
        summary_task,
        section_summary_task,
        entity_task,
        classify_task,
        graph_task,
        return_exceptions=True,
    )

    summary = results[0] if isinstance(results[0], str) else ""
    section_summaries = results[1] if isinstance(results[1], list) else []
    entities = results[2] if isinstance(results[2], list) else []
    classification = results[3] if isinstance(results[3], dict) else {}
    graph = results[4] if isinstance(results[4], KnowledgeGraph) else KnowledgeGraph()

    for i, s in enumerate(semantic.sections):
        if i < len(section_summaries):
            s.summary = section_summaries[i]

    reading_order = [s.title.lower() for s in semantic.sections[:10]]

    agent_meta = AgentMeta(
        doc_type=classification.get("doc_type", "unknown"),
        confidence=classification.get("confidence", 0.85),
        reading_order=reading_order,
        summary=summary,
        entities=entities,
        keywords=classification.get("keywords", []),
    )

    return agent_meta, graph


def _fallback_enrich(
    full_text: str, semantic: SemanticData
) -> tuple[AgentMeta, KnowledgeGraph]:
    """Provide basic enrichment without an LLM (no API key configured)."""
    words = full_text.split()
    summary = " ".join(words[:150]) + ("..." if len(words) > 150 else "")

    word_freq: dict[str, int] = {}
    for w in words:
        cleaned = re.sub(r"[^a-zA-Z]", "", w).lower()
        if len(cleaned) > 4:
            word_freq[cleaned] = word_freq.get(cleaned, 0) + 1

    top_words = sorted(word_freq.items(), key=lambda x: -x[1])[:15]
    entities = [Entity(type="keyword", name=w, mentions=c) for w, c in top_words]
    keywords = [w for w, _ in top_words[:10]]

    reading_order = [s.title.lower() for s in semantic.sections[:10]]

    nodes = [
        GraphNode(
            id=f"e_{i}",
            label=e.name,
            type=e.type,
            description=f"Keyword '{e.name}' appears {e.mentions} time(s) in the document.",
            importance=min(1.0, 0.3 + (e.mentions / max(c for _, c in top_words)) * 0.7),
        )
        for i, e in enumerate(entities[:10])
    ]
    doc_node = GraphNode(
        id="doc",
        label="Document",
        type="document",
        description="The source document being analyzed.",
        importance=1.0,
    )
    edges = [
        GraphEdge(source="doc", target=n.id, relationship="contains", weight=n.importance)
        for n in nodes
    ]

    return (
        AgentMeta(
            doc_type="document",
            confidence=0.7,
            reading_order=reading_order,
            summary=summary,
            entities=entities,
            keywords=keywords,
        ),
        KnowledgeGraph(nodes=[doc_node] + nodes, edges=edges),
    )


async def _summarize(text: str) -> str:
    client = _get_client()
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "system",
                "content": "You are a document summarizer. Produce a clear, concise summary (3-5 sentences).",
            },
            {"role": "user", "content": f"Summarize this document:\n\n{text}"},
        ],
        temperature=0.3,
        max_tokens=500,
    )
    return resp.choices[0].message.content or ""


async def _summarize_sections(sections: list[Section]) -> list[str]:
    if not sections:
        return []
    client = _get_client()
    tasks = []
    for s in sections[:15]:
        if len(s.content) < 20:
            tasks.append(_immediate(s.content))
            continue
        tasks.append(
            _summarize_one_section(client, s.title, _truncate(s.content, 2000))
        )
    return list(await asyncio.gather(*tasks, return_exceptions=False))


async def _immediate(value: str) -> str:
    return value


async def _summarize_one_section(
    client: AsyncOpenAI, title: str, content: str
) -> str:
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "system",
                "content": "Summarize this section in 1-2 sentences.",
            },
            {"role": "user", "content": f"Section: {title}\n\n{content}"},
        ],
        temperature=0.3,
        max_tokens=200,
    )
    return resp.choices[0].message.content or ""


async def _extract_entities(text: str) -> list[Entity]:
    client = _get_client()
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract named entities from this document. "
                    "Return a JSON array of objects with keys: type, name, mentions. "
                    'Types can be: person, organization, method, dataset, location, concept, technology. '
                    "Return ONLY valid JSON."
                ),
            },
            {"role": "user", "content": text},
        ],
        temperature=0.2,
        max_tokens=1000,
    )
    raw = _parse_json_response(resp.choices[0].message.content or "[]")
    if isinstance(raw, list):
        return [Entity(**e) for e in raw if isinstance(e, dict) and "name" in e]
    return []


async def _classify_document(text: str) -> dict:
    client = _get_client()
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "Classify this document. Return JSON with keys: "
                    "doc_type (one of: research_paper, legal_contract, manual, report, book, article, other), "
                    "confidence (0-1 float), "
                    "keywords (list of 5-10 strings). "
                    "Return ONLY valid JSON."
                ),
            },
            {"role": "user", "content": _truncate(text, 4000)},
        ],
        temperature=0.2,
        max_tokens=300,
    )
    result = _parse_json_response(resp.choices[0].message.content or "{}")
    return result if isinstance(result, dict) else {}


async def _build_graph(text: str) -> KnowledgeGraph:
    client = _get_client()
    resp = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "Extract a rich knowledge graph from this document. "
                    "Return JSON with two keys:\n"
                    '"nodes" — array of objects with: id (string), label (string), '
                    "type (one of: document, person, organization, method, dataset, "
                    "location, concept, technology, keyword), "
                    "description (1-2 sentence explanation of what this entity is "
                    "and why it matters in the document), "
                    "importance (float 0-1, where 1 = central topic, 0.3 = minor mention).\n"
                    '"edges" — array of objects with: source (node id), target (node id), '
                    "relationship (descriptive verb phrase like 'developed by', "
                    "'applies to', 'part of'), "
                    "weight (float 0-1, where 1 = strong/primary relationship).\n"
                    "Keep it to 10-20 nodes max. "
                    "Return ONLY valid JSON."
                ),
            },
            {"role": "user", "content": _truncate(text, 6000)},
        ],
        temperature=0.3,
        max_tokens=2500,
    )
    raw = _parse_json_response(resp.choices[0].message.content or "{}")
    if isinstance(raw, dict):
        nodes = [GraphNode(**n) for n in raw.get("nodes", []) if isinstance(n, dict)]
        edges = [GraphEdge(**e) for e in raw.get("edges", []) if isinstance(e, dict)]
        return KnowledgeGraph(nodes=nodes, edges=edges)
    return KnowledgeGraph()
