import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from rag_engine import retrieve_context

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

class ChatMessage(BaseModel):
    role: str
    text: str

class QueryRequest(BaseModel):
    domain_tag: str
    user_input: str
    language: str
    chat_history: list[ChatMessage] = []

@router.post("/query")
async def process_text_query(request: QueryRequest):
    print(f"💬 TEXT CHAT | Domain: {request.domain_tag}")
    
    contents = []
    for msg in request.chat_history:
        role = "user" if msg.role == "user" else "model"
        contents.append({"role": role, "parts": [msg.text]})
    
    # RAG: Fetch relevant legal context
    rag_context = retrieve_context(request.user_input)
    context_block = f"""
    RELEVANT LEGAL REFERENCE (from BNS/Traffic Rules documents):
    {rag_context}
    --- END OF REFERENCE ---
    """ if rag_context else ""

    agent_prompt = f"""
    You are Vidhan.ai, a professional Indian Legal AI. Respond like a real lawyer giving advice.
    Domain: '{request.domain_tag}'
    User Input: "{request.user_input}"
    {context_block}

    STRICT RULES:
    1. Detect language (Hindi/Hinglish → hi-IN, English → en-IN, Odia → od-IN). Reply in SAME language.
    2. ALWAYS cite exact law like a lawyer:
       - "BNS 2023 ki Dhara [X] ke tahat" (Hindi) OR "Under Section [X] of BNS 2023" (English)
       - "Motor Vehicles Act 1988 ki Dhara [X]" OR "Under Section [X] of Motor Vehicles Act, 1988"
       - "Labour Act" / "Consumer Protection Act 2019" / "IPC Section [X]" as applicable
    3. Use ONLY laws from the LEGAL REFERENCE block above. Do NOT hallucinate sections.
    4. Format ui_text with clear sections:
       - Your Rights / Aapke Adhikar
       - Applicable Law / Laagu Kanoon (with exact section numbers)
       - Recommended Action / Kya Karein
    5. Detect if user wants a document (notice/complaint/application).

    RETURN EXACTLY THIS JSON:
    {{
        "ui_text": "Structured response with:\n\n⚖️ Applicable Law:\n[Exact Act name + Section number + what it says]\n\n🛡️ Your Rights:\n[Rights in user's language]\n\n✅ Recommended Action:\n[Step by step what to do]",
        "voice_text": "Max 3 sentences. Same language. Mention the law name naturally like a lawyer.",
        "lang_code": "hi-IN or en-IN or od-IN",
        "doc_status": {{
            "requested": true/false,
            "ready_to_generate": true/false,
            "missing_fields": []
        }}
    }}
    """
    contents.append({"role": "user", "parts": [agent_prompt]})

    try:
        response = model.generate_content(contents, generation_config={"response_mime_type": "application/json"})
        ai_data = json.loads(response.text)
        return {"status": "success", "reply": ai_data}
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        raise HTTPException(status_code=500, detail="Gemini Engine Failed")