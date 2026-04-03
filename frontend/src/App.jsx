import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; 

// ==========================================
// 1. CONSTANTS & CLEAR TRANSLATIONS
// ==========================================
const domains = [
  { id: 'traffic_police', icon: '🚨', title: 'Traffic Police Stop', desc: 'Challans, vehicle impounds' },
  { id: 'police_station', icon: '🏛️', title: 'Police Station / FIR', desc: 'Filing complaints, rights' },
  { id: 'consumer_fraud', icon: '📦', title: 'Consumer Fraud', desc: 'Fake products, refunds' },
  { id: 'workplace', icon: '💼', title: 'Workplace Issue', desc: 'Unpaid salary, harassment' },
  { id: 'tenant_landlord', icon: '🔑', title: 'Tenant / Landlord', desc: 'Eviction, deposit disputes' }
];

const translations = {
  en: {
    breath: "Legal Trouble? Don't Panic.",
    alone: "is your Free AI Legal Guide.",
    desc: "We make Indian law easy to understand. Whether you need help with a traffic challan, a police complaint, or knowing your rights, we explain everything in simple words. Chat, speak, or upload a document to get started.",
    btn: "Start Your Free Legal Session",
    how: "What do you need help with today?",
    step: "Pick an option below. We will guide you step-by-step in simple language.",
    talk: "Chat or Speak",
    talkDesc: "Don't know legal terms? No problem. Just tap the mic and tell us your problem in everyday English, Hindi, or Odia. We will listen and tell you what to do.",
    rights: "Know Your Rights",
    rightsDesc: "Find out exactly what the police, your boss, or your landlord can and cannot do under the new Indian Laws (BNS). No fake advice, just pure facts.",
    write: "Draft Legal Papers",
    writeDesc: "Need to send an official police complaint, legal notice, or warning? Tell us the story, and we will instantly generate a professional PDF for you.",
    birdCall: "Change Language 🕊️",
    birdShoo: "Hide Languages 💨",
    // Workspace Translations
    w_ready: "Vidhan.ai is Ready",
    w_desc: "Describe your situation related to",
    w_prompt1_title: "🛡️ Rights",
    w_prompt1_desc: "What are my immediate rights here?",
    w_prompt2_title: "📄 Procedure",
    w_prompt2_desc: "How do I file an official complaint?",
    w_placeholder: "Detail your legal query completely...",
    w_submit: "Submit",
    w_quick: "Quick Draft",
    w_logout: "End Session",
    w_voice_prompt: "Tap to begin voice consultation",
    w_recording: "Recording... Tap to conclude",
    w_notice_title: "📋 Notice Analyzer",
    w_notice_desc: "Upload any legal notice, challan, or official letter — we will explain it simply.",
    w_upload: "Click to upload image or PDF"
  },
  hi: {
    breath: "कानूनी परेशानी है? घबराएं नहीं।",
    alone: "आपका अपना AI कानूनी सहायक है।",
    desc: "हम भारत के कानून को बिल्कुल आसान भाषा में समझाते हैं। पुलिस FIR, ट्रैफिक चालान, या अपने अधिकार जानने हों—हम आपकी मदद करेंगे।",
    btn: "अपनी मुफ़्त कानूनी मदद शुरू करें",
    how: "आज आपको क्या मदद चाहिए?",
    step: "नीचे दिया गया कोई भी विकल्प चुनें। हम आपको एक-एक कदम समझाएंगे।",
    talk: "बोलकर या लिखकर बताएं",
    talkDesc: "कानूनी शब्द नहीं आते? कोई बात नहीं। माइक दबाएं और अपनी परेशानी अपनी आम भाषा में बताएं।",
    rights: "अपने असली अधिकार जानें",
    rightsDesc: "नए भारतीय कानूनों (BNS) के तहत जानें कि पुलिस या आपका मकान मालिक आपके साथ क्या कर सकता है और क्या नहीं।",
    write: "कानूनी नोटिस बनाएं",
    writeDesc: "क्या पुलिस या किसी कंपनी को शिकायत भेजनी है? बस हमें कहानी बताएं, और हम तुरंत PDF लिखकर दे देंगे।",
    birdCall: "भाषा बदलें 🕊️",
    birdShoo: "भाषा छुपाएं 💨",
    // Workspace Translations
    w_ready: "विधान.एआई तैयार है",
    w_desc: "अपनी समस्या विस्तार से बताएं जो संबंधित है:",
    w_prompt1_title: "🛡️ अधिकार",
    w_prompt1_desc: "यहाँ मेरे तत्काल अधिकार क्या हैं?",
    w_prompt2_title: "📄 प्रक्रिया",
    w_prompt2_desc: "मैं आधिकारिक शिकायत कैसे दर्ज करूँ?",
    w_placeholder: "अपना कानूनी सवाल यहाँ लिखें...",
    w_submit: "भेजें",
    w_quick: "तुरंत ड्राफ्ट",
    w_logout: "सत्र समाप्त करें",
    w_voice_prompt: "बोलकर सवाल पूछने के लिए टैप करें",
    w_recording: "रिकॉर्ड हो रहा है... रोकने के लिए टैप करें",
    w_notice_title: "📋 नोटिस समझें",
    w_notice_desc: "अपना कानूनी नोटिस या चालान अपलोड करें — हम उसे आसान हिंदी में समझा देंगे।",
    w_upload: "फोटो या PDF अपलोड करने के लिए क्लिक करें"
  },
  od: {
    breath: "ଆଇନଗତ ସମସ୍ୟା? ବ୍ୟସ୍ତ ହୁଅନ୍ତୁ ନାହିଁ।",
    alone: "ଆପଣଙ୍କର ମାଗଣା ଏଆଇ ଆଇନଗତ ସାହାଯ୍ୟ।",
    desc: "ଆମେ ଆଇନକୁ ଅତି ସହଜ ଭାଷାରେ ବୁଝାଉ। ପୋଲିସ FIR, ଟ୍ରାଫିକ୍ ଚାଲାଣ କିମ୍ବା ଆପଣଙ୍କର ଅଧିକାର ଜାଣିବାକୁ ଚାହୁଁଛନ୍ତି କି? ଆମକୁ କୁହନ୍ତୁ।",
    btn: "ମାଗଣା ଆଇନଗତ ସାହାଯ୍ୟ ଆରମ୍ଭ କରନ୍ତୁ",
    how: "ଆଜି ଆମେ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିବୁ?",
    step: "ତଳେ ଥିବା ଗୋଟିଏ ବିକଳ୍ପ ବାଛନ୍ତୁ। ଆମେ ଆପଣଙ୍କୁ ସହଜରେ ବାଟ ଦେଖାଇବୁ।",
    talk: "କଥା ହୁଅନ୍ତୁ ବା ଲେଖନ୍ତୁ",
    talkDesc: "ଆଇନ ଶବ୍ଦ ଜାଣିନାହାଁନ୍ତି? ଚିନ୍ତା ନାହିଁ। ମାଇକ୍ ଦବାନ୍ତୁ ଏବଂ ନିଜ ଭାଷାରେ ସମସ୍ୟା କୁହନ୍ତୁ।",
    rights: "ଆପଣଙ୍କର ପ୍ରକୃତ ଅଧିକାର ଜାଣନ୍ତୁ",
    rightsDesc: "ନୂଆ ଭାରତୀୟ ଆଇନ (BNS) ଅନୁଯାୟୀ ପୋଲିସ କିମ୍ବା ମାଲିକ କଣ କରିପାରିବେ ତାହା ଜାଣନ୍ତୁ।",
    write: "ଆପ୍ଲିକେସନ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    writeDesc: "ଅଫିସିଆଲ୍ ଅଭିଯୋଗ ପଠାଇବାର ଅଛି କି? ଆମକୁ ଘଟଣା କୁହନ୍ତୁ, ଆମେ ଏକ PDF ପ୍ରସ୍ତୁତ କରିଦେବୁ।",
    birdCall: "ଭାଷା ବଦଳାନ୍ତୁ 🕊️",
    birdShoo: "ଭାଷା ଲୁଚାନ୍ତୁ 💨",
    // Workspace Translations
    w_ready: "ବିଧାନ.ଏଆଇ ପ୍ରସ୍ତୁତ ଅଛି",
    w_desc: "ଆପଣଙ୍କର ସମସ୍ୟା ବିସ୍ତୃତ ଭାବରେ କୁହନ୍ତୁ:",
    w_prompt1_title: "🛡️ ଅଧିକାର",
    w_prompt1_desc: "ଏଠାରେ ମୋର ତୁରନ୍ତ ଅଧିକାର କଣ?",
    w_prompt2_title: "📄 ପ୍ରକ୍ରିୟା",
    w_prompt2_desc: "ମୁଁ କିପରି ଅଭିଯୋଗ ଦାଖଲ କରିବି?",
    w_placeholder: "ଆପଣଙ୍କର ଆଇନଗତ ପ୍ରଶ୍ନ ଏଠାରେ ଲେଖନ୍ତୁ...",
    w_submit: "ପଠାନ୍ତୁ",
    w_quick: "ତୁରନ୍ତ ଡ୍ରାଫ୍ଟ",
    w_logout: "ସେସନ୍ ଶେଷ କରନ୍ତୁ",
    w_voice_prompt: "ଭଏସ୍ ପରାମର୍ଶ ପାଇଁ ଟ୍ୟାପ୍ କରନ୍ତୁ",
    w_recording: "ରେକର୍ଡିଂ ହେଉଛି... ବନ୍ଦ କରିବାକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ",
    w_notice_title: "📋 ନୋଟିସ୍ ବିଶ୍ଳେଷଣ",
    w_notice_desc: "କୌଣସି ଆଇନଗତ ନୋଟିସ୍ ଅପଲୋଡ୍ କରନ୍ତୁ - ଆମେ ଏହାକୁ ସହଜରେ ବୁଝାଇଦେବୁ।",
    w_upload: "ଫଟୋ କିମ୍ବା PDF ଅପଲୋଡ୍ କରିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ"
  }
};

// ==========================================
// 2. PREMIUM MOTHER JUSTICE LOGO (Layered 3D SVG)
// ==========================================
const MotherJusticeLogo = ({ className = "w-14 h-14", isDark = false }) => (
  <div className={`relative flex items-center justify-center perspective-[1000px] group transition-all duration-1000 ${className}`}>
    <div className={`absolute w-[140%] h-[140%] rounded-full blur-2xl z-0 opacity-50 animate-[pulse_4s_ease-in-out_infinite] transition-all duration-700 group-hover:scale-110 group-hover:opacity-80 ${isDark ? 'bg-emerald-500/30' : 'bg-teal-400/40'}`}></div>
    <div className="absolute inset-0 z-20 transform-style-3d shadow-2xl rounded-full animate-[float_6s_ease-in-out_infinite] transition-transform duration-500 group-hover:-translate-y-2">
      <svg className={`w-full h-full drop-shadow-2xl transition-colors duration-1000 ${isDark ? 'text-emerald-50' : 'text-teal-900'}`} viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="1" />
          </linearGradient>
          <radialGradient id="haloGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g className="origin-[50px_95px] animate-[breathe_4s_ease-in-out_infinite_alternate]">
          <path d="M40 90 Q50 85 60 90 Q50 96 40 90 Z" fill="url(#goldGradient)" className="opacity-60"/>
          <path d="M30 92 Q50 96 70 92 Q65 98 50 98 Q35 98 30 92 Z" fill="url(#goldGradient)"/>
          <path d="M42 94 Q50 91 58 94 Q50 99 42 94 Z" fill="currentColor" className="opacity-80"/>
        </g>
        <g className="origin-[50px_88px] animate-[breathe_5s_ease-in-out_infinite_alternate_reverse]">
          <path d="M50 25 C40 25, 36 40, 36 55 C36 78, 28 88, 50 88 C72 88, 64 78, 64 55 C64 40, 60 25, 50 25 Z" fill="url(#goldGradient)" />
          <path d="M36 50 Q50 65 64 50" stroke="currentColor" strokeWidth="1.5" className="opacity-30"/>
          <path d="M40 65 Q50 78 60 65" stroke="currentColor" strokeWidth="1" className="opacity-20"/>
          <path d="M45 40 Q50 50 55 40" stroke="currentColor" strokeWidth="1" className="opacity-40"/>
        </g>
        <circle cx="50" cy="18" r="6.5" fill="url(#goldGradient)" />
        <circle cx="50" cy="18" r="16" fill="url(#haloGlow)" />
        <circle cx="50" cy="18" r="14" stroke="url(#goldGradient)" strokeWidth="1.5" strokeDasharray="3 4" className="origin-[50px_18px] animate-[spin_25s_linear_infinite] opacity-70"/>
        <circle cx="50" cy="18" r="12" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" className="origin-[50px_18px] animate-[spin_15s_linear_infinite_reverse] opacity-40"/>
        <g className="origin-[60px_45px] transform rotate-12 transition-all duration-700 group-hover:rotate-0">
          <path d="M60 45 L75 40 L80 50 L65 55 Z" fill="url(#goldGradient)" />
          <path d="M59 46 L74 41 L76 45 L61 50 Z" fill={isDark ? '#064E3B' : '#FDFBF7'} />
          <path d="M60 47 L75 42 L77 46 L62 51 Z" fill={isDark ? '#022C22' : '#FFFFFF'} />
          <path d="M61 48 L76 43 L78 48 L63 53 Z" fill="url(#goldGradient)" />
          <line x1="72" y1="44" x2="74" y2="52" stroke={isDark ? '#34D399' : '#0F766E'} strokeWidth="1.5" />
        </g>
        <g className="origin-[35px_35px] animate-[balance_5s_ease-in-out_infinite_alternate] group-hover:animate-none group-hover:rotate-0 transition-transform duration-700">
          <line x1="38" y1="42" x2="25" y2="35" stroke="url(#goldGradient)" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="8" y1="35" x2="42" y2="35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="25" cy="35" r="2" fill="currentColor" />
          <g>
            <line x1="8" y1="35" x2="4" y2="55" stroke="currentColor" strokeWidth="0.75" className="opacity-80"/>
            <line x1="8" y1="35" x2="12" y2="55" stroke="currentColor" strokeWidth="0.75" className="opacity-80"/>
            <path d="M1 55 Q8 63 15 55 Z" fill="url(#goldGradient)" />
            <ellipse cx="8" cy="55" rx="7" ry="1.5" fill={isDark ? '#064E3B' : '#FDFBF7'} className="opacity-50" />
          </g>
          <g>
            <line x1="42" y1="35" x2="38" y2="55" stroke="currentColor" strokeWidth="0.75" className="opacity-80"/>
            <line x1="42" y1="35" x2="46" y2="55" stroke="currentColor" strokeWidth="0.75" className="opacity-80"/>
            <path d="M35 55 Q42 63 49 55 Z" fill="url(#goldGradient)" />
            <ellipse cx="42" cy="55" rx="7" ry="1.5" fill={isDark ? '#064E3B' : '#FDFBF7'} className="opacity-50" />
          </g>
        </g>
      </svg>
    </div>
    <style>{`
      @keyframes balance { 0% { transform: rotate(-6deg); } 100% { transform: rotate(6deg); } }
      @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
      @keyframes breathe { 0% { transform: scaleY(0.98); } 100% { transform: scaleY(1.02); } }
      .transform-style-3d { transform-style: preserve-3d; }
    `}</style>
  </div>
);

// ==========================================
// 3. LANDING PAGE
// ==========================================
const LandingPage = ({ user, lang, setLang, ecoMode, setEcoMode }) => {
  const [birdState, setBirdState] = useState('hidden'); // 'hidden', 'flying', 'landed'
  const t = translations[lang];

  if (user) return <Navigate to="/workspace" />;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Failed:", error.message);
      alert("Login failed.");
    }
  };

  const callBird = () => {
    if (birdState === 'hidden') {
      setBirdState('flying');
      setTimeout(() => setBirdState('landed'), 1500); 
    } else {
      setBirdState('hidden'); 
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-1000 flex flex-col overflow-x-hidden ${ecoMode ? 'bg-[#0A1A14] text-[#E8F5EE]' : 'bg-[#FDFBF7] text-slate-800'}`}>
      
      {/* LANGUAGE BIRD (Landing Page Only) */}
      <div className={`fixed z-50 transition-all duration-[1500ms] ease-in-out flex flex-col items-center gap-2
          ${birdState === 'hidden' ? '-top-20 -right-20 opacity-0 scale-50' : 
            birdState === 'flying' ? 'top-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 scale-125 motion-safe:animate-bounce' : 
            'top-24 right-8 opacity-100 scale-100 drop-shadow-2xl'}`}>
        <div className="text-5xl cursor-pointer hover:scale-110 transition-transform origin-bottom" onClick={callBird}>
          {birdState === 'flying' ? '🐦' : '🕊️'}
        </div>
        <div className={`bg-white/95 backdrop-blur-md border border-emerald-100 p-2 rounded-2xl shadow-xl flex-col gap-1 transition-all duration-500 ${birdState === 'landed' ? 'flex opacity-100 translate-y-0' : 'hidden opacity-0 translate-y-4'}`}>
          <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${lang === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>English</button>
          <button onClick={() => setLang('hi')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${lang === 'hi' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>हिंदी</button>
          <button onClick={() => setLang('od')} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${lang === 'od' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-emerald-50'}`}>ଓଡ଼ିଆ</button>
        </div>
      </div>

      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20 animate-in fade-in">
         <div className="flex items-center gap-4">
           <MotherJusticeLogo className="w-12 h-12 md:w-14 md:h-14" isDark={ecoMode} />
           <span className={`font-extrabold text-xl md:text-2xl tracking-tight ${ecoMode ? 'text-[#E8F5EE]' : 'text-slate-900'}`}>Vidhan.ai</span>
         </div>
         
         <div className="flex items-center gap-4 md:gap-6">
           <button onClick={callBird} className={`text-xs md:text-sm font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-full border transition-all ${ecoMode ? 'bg-[#132A20] border-[#1C3D2E] text-emerald-300 hover:bg-[#1C3D2E]' : 'bg-white border-slate-200 text-teal-700 hover:shadow-md'}`}>
             {birdState === 'hidden' ? t.birdCall : t.birdShoo}
           </button>

           <label className="flex items-center cursor-pointer gap-2 group">
             <span className={`hidden md:block text-xs font-bold uppercase tracking-wider transition-colors ${ecoMode ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-600'}`}>
               {ecoMode ? 'Calm Mode' : 'Focus Mode'}
             </span>
             <div className="relative">
               <input type="checkbox" className="sr-only" checked={ecoMode} onChange={() => setEcoMode(!ecoMode)} />
               <div className={`block w-12 h-7 md:w-14 md:h-8 rounded-full transition-colors duration-500 ${ecoMode ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
               <div className={`absolute left-1 top-1 bg-white w-5 h-5 md:w-6 md:h-6 rounded-full transition-transform duration-500 flex items-center justify-center shadow-sm ${ecoMode ? 'transform translate-x-5 md:translate-x-6' : ''}`}>
                 {ecoMode ? <span className="text-[10px] md:text-[12px]">🌿</span> : <span className="text-[10px] md:text-[12px]">☀️</span>}
               </div>
             </div>
           </label>
         </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-12 pb-24 flex flex-col items-center text-center relative z-10">
        <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 ${ecoMode ? 'bg-[#10B981]/10' : 'bg-teal-100/50'}`}></div>

        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-bold tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 transition-colors ${ecoMode ? 'bg-[#132A20] border-[#1C3D2E] text-emerald-300' : 'bg-white border-slate-200 text-teal-700 shadow-sm'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          100% Free & Private Legal Help
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-6 delay-150 leading-[1.3] md:leading-[1.2]">
          <span className={`block mb-4 md:mb-3 ${ecoMode ? 'text-white' : 'text-slate-900'}`}>
            {t.breath}
          </span>
          <span className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-4 align-middle">
            <span className={`inline-flex items-center justify-center px-6 py-1 md:py-2 rounded-2xl shadow-md border-2 border-b-8 transform transition-transform hover:-translate-y-1 ${ecoMode ? 'bg-[#0A1A14] border-emerald-500/80 text-emerald-400' : 'bg-white border-teal-500 text-teal-700'}`}>
              Vidhan.ai
            </span>
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${ecoMode ? 'from-emerald-300 to-[#E8F5EE]' : 'from-teal-600 to-emerald-500'}`}>
              {t.alone}
            </span>
          </span>
        </h1>

        <p className={`text-lg md:text-xl font-medium max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 delay-300 leading-relaxed ${ecoMode ? 'text-[#B4D5C5]' : 'text-slate-600'}`}>
          {t.desc}
        </p>

        <button
          onClick={handleGoogleLogin}
          className={`group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white rounded-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl animate-in fade-in zoom-in delay-500 ${ecoMode ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40' : 'bg-teal-700 hover:bg-teal-600 shadow-teal-500/20'}`}
        >
          <div className="relative flex items-center gap-3">
             <div className="bg-white p-1.5 rounded-full"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /></div>
             <span className="text-lg tracking-wide">{t.btn}</span>
          </div>
        </button>
      </main>

      <section className={`py-24 px-6 relative z-10 transition-colors duration-1000 border-t ${ecoMode ? 'bg-[#06120E] border-[#1C3D2E]' : 'bg-white border-slate-100'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 tracking-tight ${ecoMode ? 'text-white' : 'text-slate-900'}`}>{t.how}</h2>
            <p className={`font-medium text-lg ${ecoMode ? 'text-[#B4D5C5]' : 'text-slate-500'}`}>{t.step}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className={`p-8 rounded-[2rem] border transition-all duration-300 group flex flex-col text-center items-center ${ecoMode ? 'bg-[#0A1A14] border-[#1C3D2E] hover:bg-[#132A20]' : 'bg-[#FDFBF7] border-slate-200 hover:shadow-xl hover:shadow-teal-100/50'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110 ${ecoMode ? 'bg-[#1C3D2E]' : 'bg-teal-50 shadow-sm'}`}>🗣️</div>
                <h3 className={`text-xl font-bold mb-3 ${ecoMode ? 'text-[#E8F5EE]' : 'text-slate-900'}`}>{t.talk}</h3>
                <p className={`leading-relaxed text-sm font-medium ${ecoMode ? 'text-[#B4D5C5]' : 'text-slate-600'}`}>{t.talkDesc}</p>
             </div>
             
             <div className={`p-8 rounded-[2rem] border transition-all duration-300 group flex flex-col text-center items-center ${ecoMode ? 'bg-[#0A1A14] border-[#1C3D2E] hover:bg-[#132A20]' : 'bg-[#FDFBF7] border-slate-200 hover:shadow-xl hover:shadow-teal-100/50'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110 ${ecoMode ? 'bg-[#1C3D2E]' : 'bg-teal-50 shadow-sm'}`}>🛡️</div>
                <h3 className={`text-xl font-bold mb-3 ${ecoMode ? 'text-[#E8F5EE]' : 'text-slate-900'}`}>{t.rights}</h3>
                <p className={`leading-relaxed text-sm font-medium ${ecoMode ? 'text-[#B4D5C5]' : 'text-slate-600'}`}>{t.rightsDesc}</p>
             </div>
             
             <div className={`p-8 rounded-[2rem] border transition-all duration-300 group flex flex-col text-center items-center ${ecoMode ? 'bg-[#0A1A14] border-[#1C3D2E] hover:bg-[#132A20]' : 'bg-[#FDFBF7] border-slate-200 hover:shadow-xl hover:shadow-teal-100/50'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110 ${ecoMode ? 'bg-[#1C3D2E]' : 'bg-teal-50 shadow-sm'}`}>📝</div>
                <h3 className={`text-xl font-bold mb-3 ${ecoMode ? 'text-[#E8F5EE]' : 'text-slate-900'}`}>{t.write}</h3>
                <p className={`leading-relaxed text-sm font-medium ${ecoMode ? 'text-[#B4D5C5]' : 'text-slate-600'}`}>{t.writeDesc}</p>
             </div>
          </div>
        </div>
      </section>

    </div>
  );
};


// ==========================================
// 4. WORKSPACE (Mobile Responsive & Themed)
// ==========================================
const Workspace = ({ user, lang, setLang, ecoMode, setEcoMode }) => {
  const [activeDomain, setActiveDomain] = useState(domains[0]);
  const [mode, setMode] = useState('text');
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [noticeFile, setNoticeFile] = useState(null);
  const [noticeResult, setNoticeResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [translatedResult, setTranslatedResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [noticeLang, setNoticeLang] = useState(null);
  
  // Mobile Sidebar Toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const noticeInputRef = useRef(null);
  const chatHistoryRef = useRef([]);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const currentAudioRef = useRef(null);
  const modeRef = useRef(mode);
  
  const t = translations[lang];

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  if (!user) return <Navigate to="/" />;

  const handleQuickPrompt = (prompt) => setInputText(prompt);

  const getAuthToken = async () => {
    try { return await auth.currentUser?.getIdToken(true); } 
    catch { return null; }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    const currentInput = inputText;
    const historySnapshot = chatHistoryRef.current;
    setChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);
    setInputText('');
    setIsSubmitting(true);
    try {
      const token = await getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/chat/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({ domain_tag: activeDomain.id, user_input: currentInput, language: lang, chat_history: historySnapshot })
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'model', text: data.reply.ui_text }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "⚠️ Server connection failed. Please try again." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        setIsProcessingVoice(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const cleanHistory = chatHistoryRef.current.map(m => ({ role: m.role, text: m.text.replace(/^🎙️ \(Voice\): /, '') }));
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');
        formData.append('domain_tag', activeDomain.id);
        formData.append('chat_history', JSON.stringify(cleanHistory));
        try {
          const token = await getAuthToken();
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/voice/query`, {
            method: 'POST',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            body: formData
          });
          if (!response.ok) throw new Error(`Server Error`);
          const data = await response.json();

          if (data.status === 'unclear') {
            if (data.audio_base64) {
              setIsPlayingAudio(true);
              const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
              currentAudioRef.current = audio;
              audio.play();
              audio.onended = () => { setIsPlayingAudio(false); if (modeRef.current === 'voice') startRecording(); };
            } else { if (modeRef.current === 'voice') startRecording(); }
            return;
          }

          if (data && data.reply) {
            if (data.user_text) {
              setChatHistory(prev => [...prev, { role: 'user', text: `🎙️: ${data.user_text}` }, { role: 'model', text: data.reply.ui_text }]);
            }
            if (data.audio_base64) {
              setIsPlayingAudio(true);
              const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
              currentAudioRef.current = audio;
              audio.play();
              audio.onended = () => { setIsPlayingAudio(false); if (modeRef.current === 'voice') startRecording(); };
            } else { if (modeRef.current === 'voice') startRecording(); }
          }
        } catch (error) {
          if (modeRef.current === 'voice') setTimeout(() => startRecording(), 1500);
        } finally { setIsProcessingVoice(false); }
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) { alert("Microphone permission denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const toggleRecording = () => { if (isRecording) stopRecording(); else startRecording(); };

  const endVoiceConversation = () => {
    if (currentAudioRef.current) { currentAudioRef.current.pause(); currentAudioRef.current = null; }
    stopRecording();
    setIsPlayingAudio(false);
    setIsProcessingVoice(false);
    setChatHistory([]);
  };

  const changeDomain = (domain) => {
    setActiveDomain(domain);
    setChatHistory([]);
    if (isRecording) stopRecording();
    setIsSidebarOpen(false); // Close mobile sidebar on select
  };

  const canGenerateDoc = chatHistory.length >= 3;

  const handleAnalyzeNotice = async () => {
    if (!noticeFile) return;
    if (noticeFile.size > 5 * 1024 * 1024) { alert('File too large! Max 5MB allowed.'); return; }
    setIsAnalyzing(true);
    setNoticeResult(null);
    setTranslatedResult(null);
    try {
      const formData = new FormData();
      formData.append('file', noticeFile);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/analyze-notice`, { method: 'POST', body: formData });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setNoticeResult(data.analysis);
    } catch (err) {
      setNoticeResult({ error: err.message });
    } finally { setIsAnalyzing(false); }
  };

  const handleTranslate = async (langCode) => {
    if (!noticeResult?.raw) return;
    setNoticeLang(langCode);
    if (langCode === 'en') { setTranslatedResult(noticeResult.raw); return; }
    setIsTranslating(true);
    setTranslatedResult(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/translate-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: noticeResult.raw, lang_code: langCode }),
      });
      const data = await response.json();
      setTranslatedResult(data.translated || data.detail || 'Translation failed.');
    } catch (err) {
      setTranslatedResult('⚠️ Translation failed. Please try again.');
    } finally { setIsTranslating(false); }
  };

  const handleGenerateDoc = async () => {
    setIsGeneratingDoc(true);
    try {
      const token = await getAuthToken();
      const cleanHistory = chatHistoryRef.current.map(m => ({
        role: m.role === 'model' ? 'model' : 'user', text: m.text.replace(/^🎙️: /, '')
      }));
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/document/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: JSON.stringify({ domain_tag: activeDomain.id, chat_history: cleanHistory })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Generation failed');

      const fullHtml = `<!DOCTYPE html><html><head><title>Legal Document</title><style>body { font-family: serif; max-width: 800px; margin: 40px auto; padding: 40px; color: #000; font-size: 14px; line-height: 2;}</style></head><body>${data.draft_html}</body></html>`;
      const blob = new Blob([fullHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.target = '_blank'; a.click();
      URL.revokeObjectURL(url);
    } catch (err) { alert('Failed: ' + err.message); } 
    finally { setIsGeneratingDoc(false); }
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-700 selection:bg-indigo-500/30 overflow-hidden ${ecoMode ? 'bg-[#081510] text-[#E8F5EE]' : 'bg-[#F8FAFC] text-slate-800'}`}>
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Responsive Sliding Drawer) */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${ecoMode ? 'bg-[#050D0A] border-r border-[#1C3D2E]' : 'bg-[#0B132B] border-r border-[#1C2640]'}`}>
        
        <div className="p-6 pb-2 mb-6 flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-3">
            <MotherJusticeLogo className="w-10 h-10" isDark={true} />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Vidhan.ai</h1>
          </div>
          {/* Close button on mobile */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-5 px-1">Legal Categories</h2>
          <div className="flex flex-col gap-3">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => changeDomain(domain)}
                className={`flex items-start gap-4 p-3.5 rounded-2xl transition-all duration-200 text-left group ${
                  activeDomain.id === domain.id 
                  ? (ecoMode ? 'bg-emerald-600/20 border border-emerald-500/30 text-white shadow-inner' : 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-inner')
                  : 'bg-transparent hover:bg-white/5 border border-transparent text-slate-400'
                }`}
              >
                <span className={`text-xl mt-0.5 transition-transform duration-300 ${activeDomain.id === domain.id ? 'scale-110 opacity-100' : 'opacity-60 group-hover:scale-110 group-hover:opacity-100'}`}>{domain.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${activeDomain.id === domain.id ? (ecoMode ? 'text-emerald-300' : 'text-indigo-300') : 'group-hover:text-white'}`}>{domain.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`p-6 mt-4 border-t flex flex-col gap-4 ${ecoMode ? 'border-[#1C3D2E]' : 'border-[#1C2640]'}`}>
          <div className="flex items-center gap-3 px-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase border ${ecoMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'}`}>
              {user.email.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-300 truncate">{user.email}</span>
          </div>
          <button onClick={() => signOut(auth)} className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 ${ecoMode ? 'text-emerald-400/60 bg-[#0A1A14] hover:bg-rose-900/30 hover:text-rose-400 border border-[#1C3D2E]' : 'text-slate-400 bg-[#151F35] hover:bg-rose-500/10 hover:text-rose-400 border border-transparent'}`}>
            {t.w_logout}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen relative min-w-0">
        
        {/* Header */}
        <div className={`h-20 backdrop-blur-xl border-b flex items-center justify-between px-4 md:px-8 shrink-0 z-10 transition-colors duration-700 ${ecoMode ? 'bg-[#0A1A14]/90 border-[#1C3D2E]' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className={`md:hidden p-2 rounded-xl border ${ecoMode ? 'text-emerald-400 border-[#1C3D2E]' : 'text-slate-600 border-slate-200'}`}>
              ☰
            </button>
            <h2 className="text-sm md:text-base font-bold flex items-center gap-2 md:gap-3 truncate">
              <span className={`text-xl md:text-2xl p-1.5 md:p-2 rounded-xl ${ecoMode ? 'bg-[#132A20]' : 'bg-slate-100'}`}>{activeDomain.icon}</span> 
              <span className="truncate">{activeDomain.title}</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            {/* Eco Mode Toggle for Workspace */}
            <label className="hidden md:flex items-center cursor-pointer gap-2 group mr-2">
               <div className="relative">
                 <input type="checkbox" className="sr-only" checked={ecoMode} onChange={() => setEcoMode(!ecoMode)} />
                 <div className={`block w-12 h-6 rounded-full transition-colors duration-500 ${ecoMode ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                 <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-500 flex items-center justify-center shadow-sm ${ecoMode ? 'transform translate-x-6' : ''}`}>
                   {ecoMode ? <span className="text-[9px]">🌿</span> : <span className="text-[9px]">☀️</span>}
                 </div>
               </div>
            </label>

            {/* Language Selector for Workspace */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className={`hidden md:block text-xs font-bold px-3 py-2 rounded-xl border outline-none transition-all ${ecoMode ? 'bg-[#132A20] border-[#1C3D2E] text-emerald-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="od">ଓଡ଼ିଆ</option>
            </select>

            <button onClick={() => setShowDocModal(true)} className={`hidden md:flex px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300 items-center gap-2 shadow-sm border hover:-translate-y-0.5 ${ecoMode ? 'bg-[#132A20] text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/50' : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'}`}>
              ⚡ {t.w_quick}
            </button>

            {/* Mode Switcher */}
            <div className={`flex p-1 md:p-1.5 rounded-xl border shadow-inner ${ecoMode ? 'bg-[#050D0A] border-[#1C3D2E]' : 'bg-slate-100 border-slate-200'}`}>
              <button onClick={() => {setMode('text'); if(isRecording) stopRecording();}} className={`px-3 md:px-5 py-1 md:py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-lg ${mode === 'text' ? (ecoMode ? 'bg-[#1A382B] text-emerald-300 shadow-sm' : 'bg-white shadow-sm text-indigo-700') : (ecoMode ? 'text-emerald-500/50 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-700')}`}>Text</button>
              <button onClick={() => setMode('voice')} className={`px-3 md:px-5 py-1 md:py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-lg ${mode === 'voice' ? (ecoMode ? 'bg-[#1A382B] text-emerald-300 shadow-sm' : 'bg-white shadow-sm text-indigo-700') : (ecoMode ? 'text-emerald-500/50 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-700')}`}>Voice</button>
              <button onClick={() => { setMode('notice'); if(isRecording) stopRecording(); }} className={`px-3 md:px-5 py-1 md:py-1.5 text-[10px] md:text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-lg ${mode === 'notice' ? (ecoMode ? 'bg-[#1A382B] text-emerald-300 shadow-sm' : 'bg-white shadow-sm text-indigo-700') : (ecoMode ? 'text-emerald-500/50 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-700')}`}>📋 Notice</button>
            </div>
          </div>
        </div>

        {/* Dynamic Workspace Area */}
        <div className="flex-1 p-4 md:p-10 flex flex-col overflow-y-auto custom-scrollbar relative">
          
          <div className="w-full max-w-4xl mx-auto flex-1 mb-8 flex flex-col gap-6">
            
            {/* EMPTY STATE */}
            {chatHistory.length === 0 ? (
               <div className="m-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-xl">
                 <div className={`p-6 rounded-3xl shadow-sm border mb-6 flex justify-center w-24 h-24 items-center ${ecoMode ? 'bg-[#132A20] border-[#1C3D2E]' : 'bg-white border-slate-100'}`}>
                    <MotherJusticeLogo className="w-16 h-16" isDark={ecoMode} />
                 </div>
                 <h3 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">{t.w_ready}</h3>
                 <p className={`text-center mb-10 text-base md:text-lg ${ecoMode ? 'text-emerald-100/70' : 'text-slate-500'}`}>
                   {t.w_desc} <strong className={ecoMode ? 'text-emerald-400' : 'text-indigo-600'}>{activeDomain.title}</strong>.
                 </p>
                 
                 {mode === 'text' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                     <button onClick={() => handleQuickPrompt(t.w_prompt1_desc)} className={`text-left p-5 border rounded-2xl shadow-sm hover:-translate-y-1 transition-all text-sm font-semibold group ${ecoMode ? 'bg-[#0A1A14] border-[#1C3D2E] hover:border-emerald-500/50' : 'bg-white border-slate-200 hover:border-indigo-300'}`}>
                       <span className={`block mb-2 ${ecoMode ? 'text-emerald-400' : 'text-indigo-500'}`}>{t.w_prompt1_title}</span>
                       {t.w_prompt1_desc}
                     </button>
                     <button onClick={() => handleQuickPrompt(t.w_prompt2_desc)} className={`text-left p-5 border rounded-2xl shadow-sm hover:-translate-y-1 transition-all text-sm font-semibold group ${ecoMode ? 'bg-[#0A1A14] border-[#1C3D2E] hover:border-blue-500/50' : 'bg-white border-slate-200 hover:border-blue-300'}`}>
                       <span className={`block mb-2 ${ecoMode ? 'text-blue-400' : 'text-blue-500'}`}>{t.w_prompt2_title}</span>
                       {t.w_prompt2_desc}
                     </button>
                   </div>
                 )}
               </div>
            ) : (
              // CHAT HISTORY
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[90%] md:max-w-[80%] p-5 md:p-6 rounded-3xl text-[14px] md:text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? (ecoMode ? 'bg-emerald-700 text-white rounded-tr-sm' : 'bg-slate-800 text-white rounded-tr-sm')
                    : (ecoMode ? 'bg-[#132A20] border border-[#1C3D2E] text-emerald-50 rounded-tl-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm')
                  }`}>
                    {msg.role === 'model' && (
                      <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${ecoMode ? 'border-[#1C3D2E]' : 'border-slate-100'}`}>
                        <MotherJusticeLogo className="w-5 h-5" isDark={ecoMode} />
                        <span className={`text-xs font-bold uppercase tracking-widest ${ecoMode ? 'text-emerald-500/70' : 'text-slate-400'}`}>Vidhan.ai Analysis</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                  </div>
                </div>
              ))
            )}

            {isSubmitting && (
              <div className="flex justify-start animate-in fade-in">
                <div className={`border p-4 md:p-5 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-4 w-48 md:w-56 relative overflow-hidden ${ecoMode ? 'bg-[#132A20] border-[#1C3D2E]' : 'bg-white border-slate-200'}`}>
                  <MotherJusticeLogo className="w-5 h-5 md:w-6 md:h-6 opacity-70" isDark={ecoMode} />
                  <span className={`text-xs md:text-sm font-bold ${ecoMode ? 'text-emerald-400' : 'text-slate-500'}`}>Analyzing...</span>
                  <div className={`absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-transparent via-current to-transparent animate-[slide_1.5s_ease-in-out_infinite] opacity-10 ${ecoMode ? 'text-emerald-200' : 'text-indigo-500'}`}></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>
          
          {canGenerateDoc && (
            <div className="w-full max-w-4xl mx-auto shrink-0 mb-4 animate-in fade-in slide-in-from-bottom-4">
              <button
                onClick={handleGenerateDoc}
                disabled={isGeneratingDoc}
                className={`w-full py-3 md:py-4 rounded-2xl text-white font-bold text-sm md:text-base flex items-center justify-center gap-3 shadow-lg transition-all hover:-translate-y-1 disabled:shadow-none disabled:transform-none ${ecoMode ? 'bg-emerald-700 hover:bg-emerald-600 disabled:bg-[#1A382B]' : 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300'}`}
              >
                {isGeneratingDoc ? '⏳ Drafting...' : '📄 Generate Formal Legal Draft (PDF)'}
              </button>
            </div>
          )}

          {/* INPUT AREA */}
          {mode === 'notice' ? (
            <div className="w-full max-w-4xl mx-auto shrink-0">
              <div className={`rounded-3xl border shadow-xl p-6 md:p-8 ${ecoMode ? 'bg-[#0A1A14] border-[#1C3D2E]' : 'bg-white border-slate-200'}`}>
                <h3 className="text-lg font-bold mb-1">{t.w_notice_title}</h3>
                <p className={`text-sm mb-6 ${ecoMode ? 'text-emerald-100/60' : 'text-slate-500'}`}>{t.w_notice_desc}</p>

                <div
                  onClick={() => noticeInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-2xl p-8 md:p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
                    noticeFile 
                    ? (ecoMode ? 'border-emerald-500 bg-[#132A20]' : 'border-indigo-400 bg-indigo-50') 
                    : (ecoMode ? 'border-[#1C3D2E] hover:border-emerald-500/50 hover:bg-[#132A20]' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50')
                  }`}
                >
                  <input ref={noticeInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => { setNoticeFile(e.target.files[0]); setNoticeResult(null); }} />
                  <span className="text-4xl mb-3">{noticeFile ? '📄' : '⬆️'}</span>
                  <p className="font-semibold text-center text-sm md:text-base">{noticeFile ? noticeFile.name : t.w_upload}</p>
                  <p className={`text-xs mt-1 ${ecoMode ? 'text-emerald-500/50' : 'text-slate-400'}`}>JPG, PNG, PDF · Max 5MB</p>
                </div>

                {noticeFile && !noticeResult && (
                  <button onClick={handleAnalyzeNotice} disabled={isAnalyzing} className={`mt-5 w-full py-4 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 ${ecoMode ? 'bg-emerald-600 hover:bg-emerald-500 disabled:bg-[#1A382B]' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400'}`}>
                    {isAnalyzing ? <><span className="animate-spin">⚙️</span> Analyzing...</> : '🔍 Analyze This Notice'}
                  </button>
                )}

                {/* Results logic remains the same, just styled for ecoMode if needed */}
                {noticeResult && (
                  <div className="mt-6 flex flex-col gap-4">
                    {noticeResult.error ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm font-medium">⚠️ {noticeResult.error}</div>
                    ) : (
                      <>
                        {/* Analysis Fields */}
                        <div className={`p-5 rounded-2xl border flex flex-col gap-3 ${ecoMode ? 'bg-[#0A1A14] border-emerald-500/30' : 'bg-slate-50 border-slate-200'}`}>
                          {[['📋 Summary', noticeResult.summary], ['⏰ Deadline', noticeResult.deadline], ['✅ Next Step', noticeResult.next_step], ['⚖️ Applicable Law', noticeResult.applicable_law]].map(([label, val]) => val && (
                            <div key={label}>
                              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${ecoMode ? 'text-emerald-500' : 'text-slate-400'}`}>{label}</p>
                              <p className="text-sm font-medium leading-relaxed">{val}</p>
                            </div>
                          ))}
                          {noticeResult.severity && (
                            <div>
                              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${ecoMode ? 'text-emerald-500' : 'text-slate-400'}`}>🚨 Severity</p>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${ noticeResult.severity === 'HIGH' ? 'bg-red-100 text-red-700' : noticeResult.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{noticeResult.severity}</span>
                            </div>
                          )}
                        </div>
                        {/* Translate */}
                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs font-bold uppercase tracking-wider self-center ${ecoMode ? 'text-emerald-500' : 'text-slate-500'}`}>🌐 Translate:</span>
                          {[['en','English'],['hi','हिंदी'],['od','ଓଡ଼ିଆ']].map(([code, label]) => (
                            <button key={code} onClick={() => handleTranslate(code)} disabled={isTranslating} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${noticeLang === code ? (ecoMode ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white') : (ecoMode ? 'bg-[#132A20] text-emerald-300 hover:bg-[#1C3D2E]' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50')}`}>
                              {label}
                            </button>
                          ))}
                        </div>
                        {isTranslating && <div className="text-sm text-indigo-500 animate-pulse font-medium">⏳ Translating...</div>}
                        {translatedResult && !isTranslating && (
                          <div className={`p-5 rounded-2xl border ${ecoMode ? 'bg-[#0A1A14] border-emerald-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">🌐 Translated Version</p>
                            <p className="font-medium leading-relaxed whitespace-pre-wrap">{translatedResult}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
          <div className={`w-full max-w-4xl mx-auto shrink-0 p-2 md:p-3 rounded-3xl border shadow-xl flex items-end gap-2 md:gap-3 transition-all focus-within:ring-2 ${ecoMode ? 'bg-[#0A1A14] border-[#1C3D2E] focus-within:ring-emerald-900 focus-within:border-emerald-600 shadow-[#000000]/50' : 'bg-white border-slate-200 focus-within:ring-indigo-100 focus-within:border-indigo-300 shadow-slate-200/50'}`}>
            {mode === 'text' ? (
              <>
                <textarea 
                  value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder={t.w_placeholder}
                  className={`flex-1 bg-transparent focus:outline-none px-3 md:px-5 py-3 md:py-4 text-[14px] md:text-[15px] resize-none min-h-[50px] md:min-h-[60px] max-h-[150px] font-medium ${ecoMode ? 'text-emerald-50 placeholder:text-emerald-700' : 'text-slate-800 placeholder:text-slate-400'}`}
                  rows="1"
                />
                <button onClick={handleSubmit} disabled={isSubmitting || !inputText.trim()} className={`px-6 md:px-8 py-3 md:py-4 rounded-2xl transition-all duration-300 font-bold text-xs md:text-sm flex items-center justify-center min-w-[90px] md:min-w-[120px] shadow-sm mb-1 mr-1 ${ecoMode ? 'bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-[#1A382B] disabled:text-emerald-900' : 'bg-slate-900 hover:bg-indigo-600 text-white disabled:bg-slate-100 disabled:text-slate-400'}`}>
                   {isSubmitting ? <span className="animate-spin text-xl">⚙️</span> : t.w_submit}
                </button>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center py-6 md:py-8">
                 {isPlayingAudio ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center animate-pulse border-2 shadow-inner bg-indigo-50 border-indigo-100">
                        <MotherJusticeLogo className="w-8 h-8 md:w-10 md:h-10" />
                      </div>
                      <button onClick={endVoiceConversation} className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all">⏹ End Conversation</button>
                    </div>
                 ) : isProcessingVoice ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center animate-pulse border-2 shadow-inner bg-slate-50 border-slate-100"><span className="text-2xl opacity-50">⚙️</span></div>
                      <button onClick={endVoiceConversation} className="mt-1 px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all">⏹ End Conversation</button>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center gap-4 md:gap-5">
                      <button onClick={toggleRecording} className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 relative group hover:-translate-y-1 ${isRecording ? 'bg-rose-50 border-2 border-rose-200' : (ecoMode ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-slate-900 hover:bg-indigo-600')}`}>
                        {isRecording && <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-30"></span>}
                        <span className="text-2xl md:text-3xl z-10">{isRecording ? '⏹️' : '🎙️'}</span>
                      </button>
                      <p className={`text-xs md:text-sm font-bold tracking-wide uppercase ${isRecording ? 'text-rose-500' : (ecoMode ? 'text-emerald-500/70' : 'text-slate-400')}`}>
                        {isRecording ? t.w_recording : t.w_voice_prompt}
                      </p>
                      {isRecording && <button onClick={endVoiceConversation} className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-100 text-rose-600 hover:bg-rose-200 transition-all">⏹ End Conversation</button>}
                    </div>
                 )}
              </div>
            )}
          </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN APP COMPONENT (Global State)
// ==========================================
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // GLOBAL STATE
  const [lang, setLang] = useState('en');
  const [ecoMode, setEcoMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 ${ecoMode ? 'bg-[#0A1A14]' : 'bg-slate-50'}`}>
        <MotherJusticeLogo className="w-20 h-20" isDark={ecoMode} />
        <p className={`font-bold tracking-widest uppercase text-sm ${ecoMode ? 'text-emerald-500' : 'text-slate-500'}`}>Initializing Vidhan.ai...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={user} lang={lang} setLang={setLang} ecoMode={ecoMode} setEcoMode={setEcoMode} />} />
        <Route path="/workspace" element={<Workspace user={user} lang={lang} setLang={setLang} ecoMode={ecoMode} setEcoMode={setEcoMode} />} />
      </Routes>
    </Router>
  );
}

export default App;