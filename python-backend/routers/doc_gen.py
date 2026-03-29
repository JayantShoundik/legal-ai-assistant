import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

router = APIRouter()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

class ChatMessage(BaseModel):
    role: str
    text: str

class DocRequest(BaseModel):
    domain_tag: str
    chat_history: list[ChatMessage]

@router.post("/generate")
async def generate_legal_document(request: DocRequest):
    print(f"📄 GENERATING DOCUMENT | Domain: {request.domain_tag}")
    
    # Put entire history into a single string to extract facts
    history_text = "\n".join([f"{m.role}: {m.text}" for m in request.chat_history])
    
    prompt = f"""
    You are an expert Indian Legal Drafter.
    Domain: {request.domain_tag}
    
    Below is the conversation history between the AI and the user. 
    The user has provided all necessary details to draft a formal legal document (like a notice, complaint letter, or application).
    
    CONVERSATION HISTORY:
    {history_text}
    
    TASK:
    Generate a highly professional, ready-to-print legal document in pure HTML format. 
    - Use standard legal formats (To, Subject, Respected Sir/Madam, Body, Signature).
    - Fill in ALL the details provided by the user in the history.
    - If a minor detail is missing (like exact pin code), use [Placeholder] so the user knows what to fill.
    - Do NOT include markdown tags like ```html. Return ONLY the raw HTML string starting with <div class="legal-doc">.
    """

    try:
        response = model.generate_content(prompt)
        html_draft = response.text.strip()
        
        # Strip markdown if AI accidentally adds it
        if html_draft.startswith("```html"):
            html_draft = html_draft[7:-3].strip()
            
        return {"status": "success", "draft_html": html_draft}
        
    except Exception as e:
        print(f"❌ Document Generation Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate document")