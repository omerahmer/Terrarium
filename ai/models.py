from typing import Literal

from pydantic import BaseModel


class NodeData(BaseModel):
    label: str
    resourceType: str
    config: dict[str, str | list[str]] = {}


class CanvasNode(BaseModel):
    id: str
    data: NodeData
    parentId: str | None = None


class EdgeData(BaseModel):
    relationship: str | None = None


class CanvasEdge(BaseModel):
    id: str
    source: str
    target: str
    data: EdgeData | None = None


class GenerateRequest(BaseModel):
    nodes: list[CanvasNode]
    edges: list[CanvasEdge]


class GenerateResponse(BaseModel):
    files: dict[str, str]
    validated: bool
    attempts: int
    errors: list[str] = []


class Finding(BaseModel):
    severity: Literal["error", "warning", "info"]
    title: str
    message: str
    suggestion: str | None = None
    node_ids: list[str] = []
    source: Literal["deterministic", "llm"]


class ReviewResponse(BaseModel):
    findings: list[Finding]
