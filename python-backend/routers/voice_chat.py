import os
import json
import subprocess
import requests
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

router = APIRouter()

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

@router.post("/query")
async def process_voice_query(
    audio: UploadFile = File(...),
    domain_tag: str = Form(...),
    chat_history: str = Form(...) 
):
    print(f"🎙️ VOICE CALL INCOMING | Category: {domain_tag}")
    if not SARVAM_API_KEY:
        raise HTTPException(status_code=500, detail="SARVAM_API_KEY missing")

    temp_input = "temp_input_voice"
    temp_wav = "temp_voice.wav"
    try:
        # 1. Save uploaded audio
        raw_bytes = await audio.read()
        print(f"📦 Received audio bytes: {len(raw_bytes)}")
        with open(temp_input, "wb") as f:
            f.write(raw_bytes)

        # 2. Convert to 16kHz mono WAV using ffmpeg
        result = subprocess.run(
            ["/opt/homebrew/bin/ffmpeg", "-y", "-i", temp_input, "-ar", "16000", "-ac", "1", "-f", "wav", temp_wav],
            capture_output=True, text=True
        )
        print(f"🔧 ffmpeg exit: {result.returncode}")
        if result.returncode != 0:
            raise Exception(f"ffmpeg failed: {result.stderr[-300:]}")

        # 3. Sarvam STT
        with open(temp_wav, 'rb') as wav_file:
            stt_response = requests.post(
                "https://api.sarvam.ai/speech-to-text",
                headers={"api-subscription-key": SARVAM_API_KEY},
                files={'file': ('voice.wav', wav_file, 'audio/wav')},
                data={'model': 'saaras:v3', 'mode': 'transcribe'}
            )
        print(f"🔍 Sarvam STT: {stt_response.status_code} | {stt_response.text}")
        user_spoken_text = stt_response.json().get("transcript", "")
        if not user_spoken_text:
            raise Exception(f"STT failed: {stt_response.text}")

        # 3. Gemini Brain
        history_list = json.loads(chat_history)
        contents = [{"role": "user" if m["role"] == "user" else "model", "parts": [m["text"]]} for m in history_list]
        
        agent_prompt = f"""
        Domain: '{domain_tag}'
        User Spoke: "{user_spoken_text}"
        
        RETURN EXACTLY THIS JSON:
        {{
            "ui_text": "Your helpful response.",
            "voice_text": "Keep it under 3 sentences. Very conversational phone call style.",
            "lang_code": "hi-IN",
            "doc_status": {{
                "requested": true/false, 
                "ready_to_generate": true/false, 
                "missing_fields": [] 
            }}
        }}
        """
        contents.append({"role": "user", "parts": [agent_prompt]})
        gemini_res = model.generate_content(contents, generation_config={"response_mime_type": "application/json"})
        ai_data = json.loads(gemini_res.text)

        # 4. Sarvam TTS (Speak)
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
        audio_base64 = tts_response.json().get("audios", [""])[0]

        return {"status": "success", "user_text": user_spoken_text, "reply": ai_data, "audio_base64": audio_base64}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for f in [temp_input, temp_wav]:
            if os.path.exists(f):
                os.remove(f)