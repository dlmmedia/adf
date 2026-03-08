from __future__ import annotations

from pydantic import BaseModel, Field


class PageBlock(BaseModel):
    page: int
    text: str
    x0: float = 0.0
    y0: float = 0.0
    x1: float = 0.0
    y1: float = 0.0
    font_size: float = 0.0
    font_name: str = ""
    is_bold: bool = False


class Section(BaseModel):
    title: str
    level: int = 1
    content: str = ""
    page: int = 0
    summary: str = ""


class Entity(BaseModel):
    type: str
    name: str
    mentions: int = 1


class SemanticData(BaseModel):
    sections: list[Section] = Field(default_factory=list)
    tables: list[dict] = Field(default_factory=list)
    references: list[str] = Field(default_factory=list)


class AgentMeta(BaseModel):
    doc_type: str = "unknown"
    confidence: float = 0.0
    reading_order: list[str] = Field(default_factory=list)
    capabilities: list[str] = Field(
        default_factory=lambda: ["summarize", "cite", "extract_methods"]
    )
    summary: str = ""
    entities: list[Entity] = Field(default_factory=list)
    keywords: list[str] = Field(default_factory=list)


class GraphNode(BaseModel):
    id: str
    label: str
    type: str
    description: str = ""
    importance: float = 0.5


class GraphEdge(BaseModel):
    source: str
    target: str
    relationship: str
    weight: float = 0.5


class KnowledgeGraph(BaseModel):
    nodes: list[GraphNode] = Field(default_factory=list)
    edges: list[GraphEdge] = Field(default_factory=list)


class BenchmarkData(BaseModel):
    conversion_time_ms: float = 0.0
    extraction_time_ms: float = 0.0
    structure_time_ms: float = 0.0
    enrichment_time_ms: float = 0.0
    embedding_time_ms: float = 0.0
    structure_accuracy: float = 0.0
    entity_accuracy: float = 0.0
    summary_quality_score: float = 0.0
    token_savings_percent: float = 0.0
    total_pages: int = 0
    total_sections: int = 0
    total_entities: int = 0


class ConversionStatus(BaseModel):
    job_id: str
    status: str = "pending"
    step: str = ""
    progress: float = 0.0
    sections_detected: int = 0
    entities_extracted: int = 0
    confidence: float = 0.0
    message: str = ""
