import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from gemini_client import generate_with_fallback

load_dotenv()
router = APIRouter()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

NOTICE_PROMPT = """You are an expert Indian lawyer assisting a common person. Analyze the provided image or PDF of a legal notice, traffic challan, court summons, government letter, or any official document.

DETECT the language of the document and respond in the SAME language:
- Hindi/Hinglish document → respond in easy Hinglish (Hindi in English script)
- English document → respond in simple plain English
- Odia document → respond in simple Odia
- Mixed → respond in Hinglish

Do NOT use complex legal jargon. Output STRICTLY in this exact format (one field per line):

Summary: [1-2 lines: what this document is about and why it was sent.]
Deadline: [Exact date/time/limit mentioned. If none: No deadline mentioned.]
Next Step: [Exactly what the person must do now — specific and simple.]
Applicable Law: [Exact Indian law section, e.g. Motor Vehicles Act Section 194. If none: General notice.]
Severity: [ONE word only — LOW or MEDIUM or HIGH — based on consequences if ignored.]"""

TRANSLATE_PROMPT = """Translate the following legal notice analysis into {language}.
Keep it simple, friendly, and easy to understand for a common person.
Do NOT use complex legal jargon.
Return ONLY the translated text, preserving the same structure.

Text to translate:
{text}"""

LANGUAGES = {
    "hi": "Hindi (Devanagari script)",
    "en": "English",
    "od": "Odia (Odia script)",
    "te": "Telugu (Telugu script)",
    "ta": "Tamil (Tamil script)",
    "bn": "Bengali (Bengali script)",
}


@router.post("/analyze-notice")
async def analyze_notice(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            return {"error": "File bahut bada hai. Maximum 5MB allowed hai."}

        content_type = file.content_type or ""
        print(f"📄 NOTICE ANALYSIS | {file.filename} | {content_type} | {len(file_bytes)} bytes")

        if content_type.startswith("image/"):
            parts = [{"mime_type": content_type, "data": file_bytes}, NOTICE_PROMPT]
        elif content_type == "application/pdf":
            parts = [{"mime_type": "application/pdf", "data": file_bytes}, NOTICE_PROMPT]
        else:
            return {"error": "Sirf image (JPG/PNG) ya PDF upload karein."}

        response = generate_with_fallback("gemini-2.5-flash", parts)
        raw_text = response.text.strip()
        print(f"✅ Notice analyzed: {raw_text[:100]}")

        result = {"summary": "", "deadline": "", "next_step": "", "applicable_law": "", "severity": "", "raw": raw_text}
        for line in raw_text.splitlines():
            line = line.strip().lstrip("-•* ")
            low = line.lower()
            if low.startswith("summary:"):
                result["summary"] = line[len("summary:"):].strip()
            elif low.startswith("deadline:"):
                result["deadline"] = line[len("deadline:"):].strip()
            elif low.startswith("next step:"):
                result["next_step"] = line[len("next step:"):].strip()
            elif low.startswith("applicable law:"):
                result["applicable_law"] = line[len("applicable law:"):].strip()
            elif low.startswith("severity:"):
                result["severity"] = line[len("severity:"):].strip().upper()

        return {"status": "success", "analysis": result}

    except Exception as e:
        err = str(e)
        print(f"❌ Notice Analysis Error: {err}")
        if "429" in err or "quota" in err.lower():
            return {"error": "🙏 AI thoda busy hai. Ek minute mein dobara try karein."}
        return {"error": "⚠️ Notice padh nahi paya. Clearer image ya PDF try karein."}


class TranslateRequest(BaseModel):
    text: str
    lang_code: str  # hi, en, od, te, ta, bn


@router.post("/translate-notice")
async def translate_notice(request: TranslateRequest):
    lang = LANGUAGES.get(request.lang_code)
    if not lang:
        raise HTTPException(status_code=400, detail=f"Unsupported language. Choose from: {list(LANGUAGES.keys())}")

    if request.lang_code == "en":
        # Already in English from analysis — just return as-is
        return {"status": "success", "translated": request.text, "lang": lang}

    try:
        prompt = TRANSLATE_PROMPT.format(language=lang, text=request.text)
        response = generate_with_fallback("gemini-2.5-flash", prompt)
        return {"status": "success", "translated": response.text.strip(), "lang": lang}
    except Exception as e:
        err = str(e)
        print(f"❌ Translation Error: {err}")
        if "429" in err or "quota" in err.lower():
            raise HTTPException(status_code=429, detail="🙏 Translation service busy hai. Thodi der baad try karein.")
        raise HTTPException(status_code=500, detail="⚠️ Translation nahi ho paya. Please try again.")
