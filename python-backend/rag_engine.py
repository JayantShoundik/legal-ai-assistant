import os
import chromadb
from pypdf import PdfReader
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
COLLECTION_NAME = "legal_docs"

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

# Use in-memory client — no disk persistence needed on Render (rebuilt each deploy)
chroma_client = chromadb.Client()

class GeminiEmbeddingFunction(chromadb.EmbeddingFunction):
    def __call__(self, input):
        result = genai.embed_content(
            model="models/embedding-001",
            content=input,
            task_type="retrieval_document"
        )
        return result["embedding"] if isinstance(input, str) else result["embeddings"]

embedding_fn = GeminiEmbeddingFunction()
collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME,
    embedding_function=embedding_fn
)


def _chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end].strip())
        start += chunk_size - overlap
    return [c for c in chunks if len(c) > 50]


def ingest_pdfs() -> dict:
    if not os.path.exists(DATA_DIR):
        return {"status": "no_data_dir", "ingested": [], "total_chunks": 0}

    files = [f for f in os.listdir(DATA_DIR) if f.endswith(".pdf") or f.endswith(".txt")]
    if not files:
        return {"status": "no_files", "ingested": [], "total_chunks": 0}

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
        batch_size = 50
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
    if collection.count() == 0:
        return ""
    try:
        embedding = genai.embed_content(
            model="models/embedding-001",
            content=query,
            task_type="retrieval_query"
        )
        results = collection.query(
            query_embeddings=[embedding["embedding"]],
            n_results=min(n_results, collection.count())
        )
        docs = results.get("documents", [[]])[0]
        return "\n\n---\n\n".join(docs)
    except Exception as e:
        print(f"⚠️ RAG retrieve error: {e}")
        return ""
