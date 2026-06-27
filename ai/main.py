import anyio
from fastapi import FastAPI

from models import GenerateRequest, GenerateResponse
from terraform_graph import run_generation

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello world"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "python-ai"}


@app.post("/generate", response_model=GenerateResponse)
async def generate(body: GenerateRequest):
    canvas = body.model_dump()
    return await anyio.to_thread.run_sync(run_generation, canvas)


@app.post("/review")
async def review(body: dict):
    return {"findings": []}
