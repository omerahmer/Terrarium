from fastapi import FastAPI

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello world"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "python-ai"}


@app.post("/generate")
async def generate(body: dict):
    return {"hcl": "# terraform will be generated here", "validated": False}


@app.post("/review")
async def review(body: dict):
    return {"findings": []}
