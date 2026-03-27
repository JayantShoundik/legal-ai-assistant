import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import modular routers
from routers import text_chat, voice_chat, doc_gen

# Load Env
load_dotenv()

app = FastAPI(title="Vidhan.ai Core Engine")

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

@app.get("/")
def health_check():
    return {"status": "Vidhan.ai Backend is Active 🟢"}