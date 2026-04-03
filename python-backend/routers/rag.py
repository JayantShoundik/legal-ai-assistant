from fastapi import APIRouter
from rag_engine import ingest_pdfs

router = APIRouter()

@router.post("/ingest")
def ingest():
    return ingest_pdfs()

@router.get("/status")
def status():
    from rag_engine import _chunks
    return {"total_chunks": len(_chunks)}
