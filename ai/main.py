import anyio
from fastapi import FastAPI

from models import GenerateRequest, GenerateResponse, ReviewResponse
from review import run_review
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


@app.post("/review", response_model=ReviewResponse)
async def review(body: GenerateRequest):
    canvas = body.model_dump()
    return await anyio.to_thread.run_sync(run_review, canvas)
