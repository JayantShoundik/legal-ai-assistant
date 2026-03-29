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
    
    # Smart Agent Prompt
    agent_prompt = f"""
    You are Vidhan.ai, a professional Indian Legal AI Assistant.
    Domain: '{request.domain_tag}'
    Current User Input: "{request.user_input}"
    
    MISSION:
    1. Answer the user's legal query professionally.
    2. DETECT if they want to write an application, legal notice, or complaint.
    3. If they want a document, check if you have all details (Names, Dates, Vehicle Number, etc.) in the chat history.
    
    RETURN EXACTLY THIS JSON:
    {{
        "ui_text": "Your helpful response. If they asked for a doc but details are missing, politely ask for them here.",
        "voice_text": "Short conversational version.",
        "lang_code": "hi-IN or en-IN",
        "doc_status": {{
            "requested": true/false, 
            "ready_to_generate": true/false, 
            "missing_fields": ["List", "of", "missing", "info"] 
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