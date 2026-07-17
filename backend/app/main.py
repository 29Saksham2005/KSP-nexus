from fastapi import FastAPI

app = FastAPI(
    title="KSP NEXUS API",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "Welcome to KSP NEXUS API"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }