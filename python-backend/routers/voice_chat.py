import os
import json
import subprocess
import requests
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from gemini_client import generate_with_fallback
from rag_engine import retrieve_context

load_dotenv()
router = APIRouter()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

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
        ffmpeg_path = "/opt/homebrew/bin/ffmpeg" if os.path.exists("/opt/homebrew/bin/ffmpeg") else "ffmpeg"
        result = subprocess.run(
            [ffmpeg_path, "-y", "-i", temp_input, "-ar", "16000", "-ac", "1", "-f", "wav", temp_wav],
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
        stt_data = stt_response.json()
        user_spoken_text = stt_data.get("transcript", "").strip()
        # Use Sarvam's detected language — it's the ground truth from actual speech
        # Normalize: Sarvam may return 'or' or 'od' for Odia, map to standard code
        raw_lang = stt_data.get("language_code", "").strip()
        lang_normalize = {
            'or': 'od-IN', 'od': 'od-IN', 'od-IN': 'od-IN',
            'hi': 'hi-IN', 'hi-IN': 'hi-IN',
            'en': 'en-IN', 'en-IN': 'en-IN', 'en-US': 'en-IN',
            'bn': 'bn-IN', 'ta': 'ta-IN', 'te': 'te-IN', 'mr': 'mr-IN',
        }
        detected_lang = lang_normalize.get(raw_lang, 'hi-IN')
        print(f"🗣️ Transcript: '{user_spoken_text}' | Sarvam raw lang: '{raw_lang}' | Normalized: '{detected_lang}'")

        # Empty transcript → polite "can't hear you" in detected language
        if not user_spoken_text:
            sorry_map = {
                'hi-IN': ("Maafi chahta hoon, mujhe aapki awaaz clearly nahi aayi. Kya aap thoda aur paas aakar ya thoda zyada awaaz mein bol sakte hain?", "shubh"),
                'en-IN': ("I'm sorry, I couldn't hear you clearly. Could you please speak a little louder or move closer to the microphone?", "amelia"),
                'od-IN': ("Maafi kariben, mo aapananka swara spashta shuniba pailena. Daya kari thoda jore ba kachha re katha kahanti?", "anand"),
                'te-IN': ("Maafi cheyandi, meeru cheppindi naaku spashtanga vinipinchaledhu. Dayachesi kodhigaa dooramga vachi matladagalara?", "arvind"),
            }
            sorry_text, sorry_speaker = sorry_map.get(detected_lang, sorry_map['hi-IN'])
            tts_sorry = requests.post(
                "https://api.sarvam.ai/text-to-speech",
                headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
                json={"text": sorry_text, "target_language_code": detected_lang, "speaker": sorry_speaker, "model": "bulbul:v3", "output_audio_codec": "mp3"}
            )
            sorry_audio = tts_sorry.json().get("audios", [""])[0]
            return {
                "status": "unclear",
                "user_text": "",
                "reply": {"ui_text": "🔇 Awaaz clearly nahi aayi. Thoda aur paas aakar bolein.", "voice_text": sorry_text, "lang_code": detected_lang},
                "audio_base64": sorry_audio
            }

        # 3. Gemini Brain with RAG
        rag_context = retrieve_context(user_spoken_text)
        context_block = f"""
    RELEVANT LEGAL REFERENCE (from BNS/Traffic Rules documents):
    {rag_context}
    --- END OF REFERENCE ---
    """ if rag_context else ""

        history_list = json.loads(chat_history)
        contents = []
        for m in history_list:
            role = "user" if m["role"] == "user" else "model"
            if contents and contents[-1]["role"] == role:
                contents[-1]["parts"][0] += "\n" + m["text"]
            else:
                contents.append({"role": role, "parts": [m["text"]]})
        
        agent_prompt = f"""
        You are Vidhan.ai, an Indian Legal AI. Respond like a real lawyer on a phone call.
        Domain: '{domain_tag}'
        User Spoke: "{user_spoken_text}"
        DETECTED LANGUAGE: {detected_lang} — You MUST reply in this exact language. Do NOT change it.
        {context_block}

        STRICT RULES:
        1. Reply language is FIXED as {detected_lang}. Do not detect or guess — use this.
           - hi-IN = Hindi/Hinglish
           - en-IN = English
           - od-IN = Odia (use Odia script)
           - te-IN = Telugu (use Telugu script, e.g., "BNS 2023 యొక్క సెక్షన్ [X] ప్రకారం")
        2. ALWAYS cite law like a lawyer in that language.
        3. Use ONLY laws from the LEGAL REFERENCE block. Do NOT hallucinate.
        4. ui_text: Applicable Law (exact section) + Your Rights + Recommended Action.
        5. voice_text: max 3 sentences, mention law name, in {detected_lang} language.
        ...

        RETURN EXACTLY THIS JSON:
        {{
            "ui_text": "Structured response in {detected_lang}:\n\n⚖️ Applicable Law:\n[Act + Section]\n\n🛡️ Your Rights:\n[Rights]\n\n✅ Recommended Action:\n[Steps]",
            "voice_text": "Max 3 sentences in {detected_lang}. Mention law name.",
            "lang_code": "{detected_lang}",
            "doc_status": {{
                "requested": true/false,
                "ready_to_generate": true/false,
                "missing_fields": []
            }}
        }}
        """
        contents.append({"role": "user", "parts": [agent_prompt]})
        gemini_res = generate_with_fallback("gemini-2.5-flash", contents, generation_config={"response_mime_type": "application/json"})
        ai_data = json.loads(gemini_res.text)

        # Always use Sarvam's detected language — override whatever Gemini returned
        ai_data['lang_code'] = detected_lang
        lang_code = detected_lang
        # Sarvam speaker map per language
        speaker_map = {
            'hi-IN': 'shubh',
            'en-IN': 'amelia',
            'od-IN': 'anand',
            'te-IN': 'arvind',
            'bn-IN': 'shubh',
            'ta-IN': 'shubh',
            'mr-IN': 'shubh',
        }
        speaker = speaker_map.get(lang_code, 'shubh')
        print(f"🔊 TTS | lang: {lang_code} | speaker: {speaker} | text: {ai_data['voice_text'][:60]}")
        tts_response = requests.post(
            "https://api.sarvam.ai/text-to-speech",
            headers={"api-subscription-key": SARVAM_API_KEY, "Content-Type": "application/json"},
            json={
                "text": ai_data['voice_text'],
                "target_language_code": lang_code,
                "speaker": speaker,
                "model": "bulbul:v3",
                "output_audio_codec": "mp3"
            }
        )
        print(f"🔊 TTS status: {tts_response.status_code}")
        audio_base64 = tts_response.json().get("audios", [""])[0]

        return {"status": "success", "user_text": user_spoken_text, "reply": ai_data, "audio_base64": audio_base64}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for f in [temp_input, temp_wav]:
            if os.path.exists(f):
                os.remove(f)