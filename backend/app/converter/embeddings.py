"""Generate chunk-level embeddings via OpenAI embeddings API."""

from __future__ import annotations

import struct

from openai import AsyncOpenAI

from app.config import settings
from app.models import SemanticData


def _chunk_text(semantic: SemanticData, max_chunk_chars: int = 1000) -> list[str]:
    """Split sections into chunks suitable for embedding."""
    chunks: list[str] = []
    for section in semantic.sections:
        text = f"{section.title}\n{section.content}".strip()
        if not text:
            continue
        if len(text) <= max_chunk_chars:
            chunks.append(text)
        else:
            words = text.split()
            current: list[str] = []
            current_len = 0
            for word in words:
                if current_len + len(word) + 1 > max_chunk_chars and current:
                    chunks.append(" ".join(current))
                    current = []
                    current_len = 0
                current.append(word)
                current_len += len(word) + 1
            if current:
                chunks.append(" ".join(current))
    return chunks


async def generate_embeddings(semantic: SemanticData) -> tuple[bytes, list[str]]:
    """Generate embeddings for all chunks. Returns (binary blob, chunk texts)."""
    chunks = _chunk_text(semantic)
    if not chunks:
        return b"", []

    if not settings.openai_api_key:
        return _fallback_embeddings(chunks), chunks

    client = AsyncOpenAI(api_key=settings.openai_api_key)

    batch_size = 20
    all_vectors: list[list[float]] = []
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i : i + batch_size]
        resp = await client.embeddings.create(
            model=settings.embedding_model, input=batch
        )
        for item in resp.data:
            all_vectors.append(item.embedding)

    return _vectors_to_bytes(all_vectors), chunks


def _vectors_to_bytes(vectors: list[list[float]]) -> bytes:
    """Pack vectors into a compact binary format: [n_vectors(u32)][dim(u32)][floats...]."""
    if not vectors:
        return b""
    n = len(vectors)
    dim = len(vectors[0])
    header = struct.pack("<II", n, dim)
    data = b""
    for vec in vectors:
        data += struct.pack(f"<{dim}f", *vec)
    return header + data


def _fallback_embeddings(chunks: list[str]) -> bytes:
    """Generate deterministic pseudo-embeddings when no API key is configured."""
    dim = 64
    vectors: list[list[float]] = []
    for chunk in chunks:
        vec = [0.0] * dim
        for i, ch in enumerate(chunk.encode("utf-8")[:dim]):
            vec[i % dim] += (ch - 128) / 256.0
        norm = sum(v * v for v in vec) ** 0.5
        if norm > 0:
            vec = [v / norm for v in vec]
        vectors.append(vec)
    return _vectors_to_bytes(vectors)
