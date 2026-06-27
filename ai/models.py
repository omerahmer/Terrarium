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
