import os
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from gemini_client import generate_with_fallback
from rag_engine import retrieve_context

load_dotenv()
router = APIRouter()

class ChatMessage(BaseModel):
    role: str
    text: str

class DocRequest(BaseModel):
    domain_tag: str
    chat_history: list[ChatMessage]

@router.post("/generate")
async def generate_legal_document(request: DocRequest):
    print(f"📄 GENERATING DOCUMENT | Domain: {request.domain_tag}")

    history_text = "\n".join([f"{m.role.upper()}: {m.text}" for m in request.chat_history])

    # Pull relevant laws from RAG for this domain
    rag_context = retrieve_context(f"{request.domain_tag} legal notice complaint application")

    prompt = f"""
    You are an expert Indian Legal Drafter with deep knowledge of BNS 2023, IPC, Motor Vehicles Act, Labour Act, Consumer Protection Act, and CrPC/BNSS.

    Domain: {request.domain_tag}

    CONVERSATION HISTORY (extract all facts from here):
    {history_text}

    RELEVANT LEGAL REFERENCES:
    {rag_context}

    TASK: Draft a formal legal document based on the conversation above.

    STRICT RULES:
    1. Cite EXACT law sections (e.g., "Under Section 184 of Motor Vehicles Act, 1988", "Under Section 115 of BNS 2023", "Under Section 12 of Consumer Protection Act, 2019").
    2. Use proper legal format: Date, From, To, Subject, Body paragraphs numbered, Prayer/Relief, Signature.
    3. Fill ALL details from the conversation. Use [PLACEHOLDER] only if truly missing.
    4. Return ONLY raw HTML starting with <div class="legal-doc"> — NO markdown, NO ```html wrapper.
    5. Use inline styles for formatting since this will be rendered directly.

    HTML FORMAT TO FOLLOW:
    <div class="legal-doc" style="font-family: 'Times New Roman', serif; line-height: 2; color: #000;">
      <p style="text-align:right;">Date: [Date]</p>
      <p><strong>From:</strong><br/>[Sender Name]<br/>[Address]</p>
      <p><strong>To:</strong><br/>[Recipient Name & Designation]<br/>[Address]</p>
      <h3 style="text-align:center; text-decoration:underline;">SUBJECT: [Subject in caps]</h3>
      <p>Respected Sir/Madam,</p>
      <p>1. [First paragraph - facts]</p>
      <p>2. [Second paragraph - legal violation with exact section]</p>
      <p>3. [Third paragraph - demand/relief]</p>
      <p><strong>PRAYER:</strong> It is therefore prayed that [relief sought].</p>
      <br/>
      <p>Yours faithfully,<br/>[Name]<br/>[Contact]</p>
    </div>
    """

    try:
        response = generate_with_fallback("gemini-2.5-flash", prompt)
        html_draft = response.text.strip()
        if html_draft.startswith("```html"): html_draft = html_draft[7:]
        if html_draft.startswith("```"): html_draft = html_draft[3:]
        if html_draft.endswith("```"): html_draft = html_draft[:-3]
        return {"status": "success", "draft_html": html_draft.strip()}
    except Exception as e:
        err = str(e)
        print(f"❌ Document Generation Error: {err}")
        msg = "🙏 Document generate karne mein thodi problem aayi. Ek minute baad dobara try karein." if "429" in err or "quota" in err.lower() else "⚠️ Document nahi ban paya. Please thodi der baad try karein."
        raise HTTPException(status_code=500, detail=msg)
