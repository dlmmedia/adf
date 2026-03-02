"""Assemble all artifacts into a ZIP-based .adf container."""

from __future__ import annotations

import json
import zipfile
from pathlib import Path

from app.models import AgentMeta, BenchmarkData, KnowledgeGraph, SemanticData


def package_adf(
    *,
    output_path: str | Path,
    pdf_path: str | Path,
    semantic: SemanticData,
    agent_meta: AgentMeta,
    graph: KnowledgeGraph,
    benchmarks: BenchmarkData,
    embeddings_bin: bytes,
) -> Path:
    """Create a .adf ZIP container with all artifacts."""
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(str(pdf_path), "document.pdf")

        zf.writestr(
            "semantic.json",
            json.dumps(semantic.model_dump(), indent=2, default=str),
        )

        zf.writestr(
            "agent.json",
            json.dumps(agent_meta.model_dump(), indent=2, default=str),
        )

        zf.writestr(
            "graph.json",
            json.dumps(graph.model_dump(), indent=2, default=str),
        )

        zf.writestr(
            "benchmarks.json",
            json.dumps(benchmarks.model_dump(), indent=2, default=str),
        )

        if embeddings_bin:
            zf.writestr("embeddings.bin", embeddings_bin)

    return output_path
