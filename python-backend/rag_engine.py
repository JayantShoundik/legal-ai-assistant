import os
import chromadb
from pypdf import PdfReader
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
CHROMA_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
COLLECTION_NAME = "legal_docs"

embedding_fn = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
chroma_client = chromadb.PersistentClient(path=CHROMA_DIR)
collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME,
    embedding_function=embedding_fn
)


def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end].strip())
        start += chunk_size - overlap
    return [c for c in chunks if len(c) > 50]


def ingest_pdfs() -> dict:
    """Load all PDFs and TXT files from data/ folder into ChromaDB."""
    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".pdf") or f.endswith(".txt")]
    if not files:
        return {"status": "no_files", "message": f"No PDFs/TXTs found in {DATA_DIR}"}

    ingested = []
    for filename in files:
        filepath = os.path.join(DATA_DIR, filename)
        existing = collection.get(where={"source": filename}, limit=1)
        if existing["ids"]:
            print(f"⏭️  Already ingested: {filename}")
            continue

        print(f"📄 Ingesting: {filename}")
        if filename.endswith(".pdf"):
            reader = PdfReader(filepath)
            full_text = "\n".join(page.extract_text() or "" for page in reader.pages)
        else:
            with open(filepath, "r", encoding="utf-8") as f:
                full_text = f.read()

        chunks = _chunk_text(full_text)

        # Add to ChromaDB in batches
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]
            collection.add(
                documents=batch,
                ids=[f"{filename}_chunk_{i+j}" for j, _ in enumerate(batch)],
                metadatas=[{"source": filename, "chunk_index": i + j} for j, _ in enumerate(batch)]
            )
        print(f"✅ {filename}: {len(chunks)} chunks added")
        ingested.append(filename)

    return {"status": "success", "ingested": ingested, "total_chunks": collection.count()}


def retrieve_context(query: str, n_results: int = 4) -> str:
    """Search vector DB and return top matching legal text chunks."""
    if collection.count() == 0:
        return ""
    results = collection.query(query_texts=[query], n_results=min(n_results, collection.count()))
    docs = results.get("documents", [[]])[0]
    return "\n\n---\n\n".join(docs)
