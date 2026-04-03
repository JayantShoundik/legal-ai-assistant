import os
from pypdf import PdfReader

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")

_chunks = []  # in-memory list of {text, source}

def _chunk_text(text: str, chunk_size: int = 600, overlap: int = 100) -> list:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end].strip())
        start += chunk_size - overlap
    return [c for c in chunks if len(c) > 50]

def ingest_pdfs() -> dict:
    global _chunks
    if _chunks:
        return {"status": "already_loaded", "total_chunks": len(_chunks)}

    if not os.path.exists(DATA_DIR):
        return {"status": "no_data_dir", "total_chunks": 0}

    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".pdf") or f.endswith(".txt")]
    if not files:
        return {"status": "no_files", "total_chunks": 0}

    ingested = []
    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        print(f"📄 Ingesting: {filename}")
        try:
            if filename.endswith(".pdf"):
                reader = PdfReader(filepath)
                full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
            else:
                with open(filepath, "r", encoding="utf-8") as f:
                    full_text = f.read()

            for chunk in _chunk_text(full_text):
                _chunks.append({"text": chunk, "source": filename})
            ingested.append(filename)
            print(f"✅ {filename} loaded")
        except Exception as e:
            print(f"⚠️ Error ingesting {filename}: {e}")

    return {"status": "success", "ingested": ingested, "total_chunks": len(_chunks)}


def retrieve_context(query: str, n_results: int = 4) -> str:
    if not _chunks:
        return ""
    query_words = set(query.lower().split())
    scored = []
    for chunk in _chunks:
        chunk_words = set(chunk["text"].lower().split())
        score = len(query_words & chunk_words)
        if score > 0:
            scored.append((score, chunk["text"]))
    scored.sort(key=lambda x: x[0], reverse=True)
    top = [text for _, text in scored[:n_results]]
    return "\n\n---\n\n".join(top)
