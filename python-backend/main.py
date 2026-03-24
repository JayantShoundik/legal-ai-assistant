import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load API Key
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env")

# Initialize AI
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    domain_tag: str
    user_input: str
    language: str

@app.post("/api/v1/query")
async def process_query(request: QueryRequest):
    print(f"🚨 INCOMING INCIDENT: {request.domain_tag} | Input: {request.user_input}")
    
    # DUAL-OUTPUT PROMPT
    prompt = f"""
    Aap ek Indian emergency legal AI assistant hain. 
    Incident Category: '{request.domain_tag}'
    User Issue: "{request.user_input}"
    
    Aapko strictly ek valid JSON return karna hai jisme do keys hon: "ui_text" aur "voice_text".
    
    1. "ui_text": Ye screen par dikhega. Ise proper lawyer style mein likhein. Headings, BNS Sections, aur bullet points use karein taaki padhne mein asaan ho. (Do not use Markdown stars **).
    2. "voice_text": Ye text-to-speech engine padhega. Ise ekdum natural, human, aur conversational tone mein likhein. Isme koi brackets, section numbers ya bullet points mat daalna, bas sidha fluid explanation dena jise sun kar user shaant ho jaye. Hindi/Hinglish use karein.
    """

    try:
        # Force Gemini to return JSON
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON response
        ai_data = json.loads(response.text)
        
        return {
            "status": "success",
            "reply": ai_data
        }
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate dual-response")