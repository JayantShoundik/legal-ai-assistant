import os
import json
import requests
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load API Keys
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env")

# Initialize Gemini
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for Text Mode
class ChatMessage(BaseModel):
    role: str
    text: str

class QueryRequest(BaseModel):
    domain_tag: str
    user_input: str
    language: str
    chat_history: list[ChatMessage] = []  # 🧠 MEMORY ADDED HERE

# ==========================================
# 1. TEXT ENDPOINT (WITH MEMORY)
# ==========================================
@app.post("/api/v1/query")
async def process_query(request: QueryRequest):
    print(f"🚨 TEXT CHAT | Category: {request.domain_tag} | Input: {request.user_input}")
    
    # Format History for Gemini
    contents = []
    for msg in request.chat_history:
        role = "user" if msg.role == "user" else "model"
        contents.append({"role": role, "parts": [msg.text]})
    
    # Add Current Prompt
    new_prompt = f"""
    Incident Category: '{request.domain_tag}'
    User Issue: "{request.user_input}"
    
    TASK: Analyze the user issue and language (English, Hinglish, or Odia).
    RETURN EXACTLY THIS JSON STRUCTURE:
    {{
        "ui_text": "[Part 1: Solution]\\n\\n⚖️ Applicable Laws / Your Rights\\n[Part 2: 1-line simple law]",
        "voice_text": "Conversational, comforting short response in the same language without section numbers.",
        "lang_code": "Return exactly 'hi-IN' for Hindi/Hinglish, 'en-IN' for English, or 'od-IN' for Odia."
    }}
    """
    contents.append({"role": "user", "parts": [new_prompt]})

    try:
        response = model.generate_content(contents, generation_config={"response_mime_type": "application/json"})
        ai_data = json.loads(response.text)
        return {"status": "success", "reply": ai_data}
    except Exception as e:
        print(f"❌ Gemini Error: {e}")
        raise HTTPException(status_code=500, detail="Gemini failed to respond")


# ==========================================
# 2. VOICE ENDPOINT (SARVAM AI + GEMINI + MEMORY)
# ==========================================
@app.post("/api/v1/voice-query")
async def process_voice_query(
    audio: UploadFile = File(...),
    domain_tag: str = Form(...),
    chat_history: str = Form(...) # Comes as JSON string from React
):
    print(f"🎙️ VOICE CALL INCOMING | Category: {domain_tag}")
    if not SARVAM_API_KEY:
        raise HTTPException(status_code=500, detail="SARVAM_API_KEY is missing!")

    temp_audio_path = f"temp_{audio.filename}"
    try:
        # 1. Save Audio Temporarily
        with open(temp_audio_path, "wb") as buffer:
            buffer.write(await audio.read())

        # 2. SARVAM STT (Listen to User)
        stt_response = requests.post(
            "https://api.sarvam.ai/speech-to-text",
            headers={"api-subscription-key": SARVAM_API_KEY},
            files={'file': open(temp_audio_path, 'rb')},
            data={'model': 'saaras:v3', 'mode': 'transcribe'}
        )
        stt_data = stt_response.json()
        user_spoken_text = stt_data.get("transcript", "")
        
        if not user_spoken_text:
            raise Exception("Could not hear anything in the audio.")
            
        print(f"🗣️ User Said: {user_spoken_text}")

        # 3. GEMINI BRAIN (Think & Remember)
        history_list = json.loads(chat_history)
        contents = [{"role": "user" if m["role"] == "user" else "model", "parts": [m["text"]]} for m in history_list]
        
        new_prompt = f"""
        Incident Category: '{domain_tag}'
        User Audio Transcript: "{user_spoken_text}"
        
        RETURN EXACTLY THIS JSON STRUCTURE:
        {{
            "ui_text": "[Solution]\\n\\n⚖️ Applicable Laws\\n[Law]",
            "voice_text": "Keep it under 3 sentences. Very conversational, like you are talking on a phone call.",
            "lang_code": "hi-IN" 
        }}
        """
        contents.append({"role": "user", "parts": [new_prompt]})
        gemini_res = model.generate_content(contents, generation_config={"response_mime_type": "application/json"})
        ai_data = json.loads(gemini_res.text)

        # 4. SARVAM TTS (Speak Back)
        print(f"🤖 AI Thinking Complete. Generating Voice in {ai_data['lang_code']}...")
        tts_response = requests.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
            json={
                "text": ai_data['voice_text'],
                "target_language_code": ai_data.get('lang_code', 'hi-IN'),
                "speaker": "shubh",
                "model": "bulbul:v3",
                "output_audio_codec": "mp3"
            }
        )
        tts_data = tts_response.json()
        audio_base64 = tts_data.get("audios", [""])[0]

        return {
            "status": "success",
            "user_text": user_spoken_text,
            "reply": ai_data,
            "audio_base64": audio_base64
        }

    except Exception as e:
        print(f" Voice Pipeline Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup audio file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)