import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Load all available keys — skip empty/placeholder ones
_ALL_KEYS = [
    os.getenv("GEMINI_API_KEY", ""),
    os.getenv("GEMINI_API_KEY_2", ""),
    os.getenv("GEMINI_API_KEY_3", ""),
]
GEMINI_KEYS = [k.strip() for k in _ALL_KEYS if k.strip() and not k.startswith("YOUR_")]

if not GEMINI_KEYS:
    raise ValueError("No valid GEMINI_API_KEY found in .env")

print(f"🔑 Gemini: {len(GEMINI_KEYS)} API key(s) loaded for rotation.")

_current_index = 0

def _get_model(model_name: str = "gemini-2.5-flash"):
    genai.configure(api_key=GEMINI_KEYS[_current_index])
    return genai.GenerativeModel(model_name)

def generate_with_fallback(model_name: str, *args, **kwargs):
    """
    Try each API key in order. On quota error (429), rotate to next key.
    Raises the last exception if all keys are exhausted.
    """
    global _current_index
    last_error = None

    for attempt in range(len(GEMINI_KEYS)):
        try:
            model = _get_model(model_name)
            return model.generate_content(*args, **kwargs)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "quota" in err_str.lower() or "RESOURCE_EXHAUSTED" in err_str:
                _current_index = (_current_index + 1) % len(GEMINI_KEYS)
                print(f"⚠️ Quota hit — rotating to key #{_current_index + 1}")
                last_error = e
                continue
            raise  # Non-quota error — raise immediately

    raise last_error  # All keys exhausted
