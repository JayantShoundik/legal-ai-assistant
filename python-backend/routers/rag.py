from fastapi import APIRouter
from rag_engine import ingest_pdfs, collection

router = APIRouter()

@router.post("/ingest")
def ingest():
    """Trigger PDF ingestion into vector DB."""
    result = ingest_pdfs()
    return result

@router.get("/status")
def status():
    """Check how many chunks are in the vector DB."""
    return {"total_chunks": collection.count()}
