import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

from routers import text_chat, voice_chat, doc_gen
from routers import rag
from rag_engine import ingest_pdfs

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting up — ingesting PDFs into vector DB...")
    result = ingest_pdfs()
    print(f"📚 RAG ready: {result}")
    yield

app = FastAPI(title="Vidhan.ai Core Engine", lifespan=lifespan)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🚦 ROUTING THE TRAFFIC
app.include_router(text_chat.router, prefix="/api/v1/chat", tags=["Text"])
app.include_router(voice_chat.router, prefix="/api/v1/voice", tags=["Voice"])
app.include_router(doc_gen.router, prefix="/api/v1/document", tags=["Document"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["RAG"])

@app.get("/")
def health_check():
    return {"status": "Vidhan.ai Backend is Active 🟢"}