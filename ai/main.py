from fastapi import FastAPI
from pydantic import BaseModel


class NodeData(BaseModel):
    label: str
    resourceType: str


class CanvasNode(BaseModel):
    id: str
    data: NodeData
    parentId: str | None


class CanvasEdge(BaseModel):
    id: str
    source: str
    target: str


class GenerateRequest(BaseModel):
    nodes: list[CanvasNode]
    edges: list[CanvasEdge]


app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello world"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "python-ai"}


@app.post("/generate")
async def generate(body: GenerateRequest):
    return {"hcl": "# terraform will be generated here", "validated": False}


@app.post("/review")
async def review(body: dict):
    return {"findings": []}
