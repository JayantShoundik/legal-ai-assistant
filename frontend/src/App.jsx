import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; 

// ==========================================
// 1. CONSTANTS & CUSTOM ANIMATED LOGO
// ==========================================
const domains = [
  { id: 'traffic_police', icon: '🚨', title: 'Traffic Police Stop', desc: 'Challans, vehicle impounds' },
  { id: 'police_station', icon: '🏛️', title: 'Police Station / FIR', desc: 'Filing complaints, rights' },
  { id: 'consumer_fraud', icon: '📦', title: 'Consumer Fraud', desc: 'Fake products, refunds' },
  { id: 'workplace', icon: '💼', title: 'Workplace Issue', desc: 'Unpaid salary, harassment' },
  { id: 'tenant_landlord', icon: '🔑', title: 'Tenant / Landlord', desc: 'Eviction, deposit disputes' }
];

// 💎 PREMIUM ANIMATED LOGO COMPONENT
const AnimatedLogo = ({ className = "w-10 h-10", isDark = false }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className={`absolute w-full h-full rounded-full blur-xl z-0 opacity-40 animate-pulse ${isDark ? 'bg-emerald-500' : 'bg-teal-300'}`}></div>
    <div className="absolute inset-0 z-20 animate-[spin_6s_linear_infinite]">
      <svg className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 ${isDark ? 'text-emerald-300' : 'text-teal-600'}`} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" opacity="0.5" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    </div>
    <svg className={`absolute inset-0 w-full h-full z-10 ${isDark ? 'text-white/20' : 'text-teal-900/10'}`} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" className="animate-[spin_30s_linear_infinite]" />
    </svg>
    <svg className={`absolute inset-0 w-full h-full z-30 ${isDark ? 'text-white' : 'text-slate-700'}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
       <path d="M40 60 Q 50 70 60 60" strokeWidth="6" fill="none" strokeLinecap="round"/>
       <circle cx="35" cy="45" r="4" fill="currentColor" />
       <circle cx="65" cy="45" r="4" fill="currentColor" />
    </svg>
  </div>
);

// ==========================================
// 2. SOOTHING / EMPATHETIC LANDING PAGE
// ==========================================
const LandingPage = ({ user }) => {
  const [ecoMode, setEcoMode] = useState(false);

  if (user) return <Navigate to="/workspace" />;

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login Failed:", error.message);
      alert("Login failed. Check console for details.");
    }
  };

  return (
    // Changed bg color to a soothing beige (#FDFBF7) for light mode
    <div className={`min-h-screen font-sans transition-colors duration-700 flex flex-col overflow-x-hidden ${ecoMode ? 'bg-[#0B1120] text-slate-300' : 'bg-[#FDFBF7] text-slate-800'}`}>
      
      {/* Navbar with Logo on Left, Eco Mode on Right */}
      <nav className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-20 animate-in fade-in">
         <div className="flex items-center">
           <AnimatedLogo className="w-10 h-10" isDark={ecoMode} />
         </div>
         
         <div className="flex items-center gap-6">
           {/* Eco Mode Toggle */}
           <label className="flex items-center cursor-pointer gap-2 group">
             <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${ecoMode ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-600'}`}>
               {ecoMode ? 'Eco / Calm Mode' : 'Enable Calm Mode'}
             </span>
             <div className="relative">
               <input type="checkbox" className="sr-only" checked={ecoMode} onChange={() => setEcoMode(!ecoMode)} />
               <div className={`block w-12 h-7 rounded-full transition-colors duration-500 ${ecoMode ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
               <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform duration-500 flex items-center justify-center ${ecoMode ? 'transform translate-x-5' : ''}`}>
                 {ecoMode ? <span className="text-[10px]">🌙</span> : <span className="text-[10px]">☀️</span>}
               </div>
             </div>
           </label>
         </div>
      </nav>

      {/* Hero Section (Centered, Empathetic) */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 pt-10 pb-20 flex flex-col items-center text-center relative z-10">
        
        {/* Ambient Soothing Glow */}
        <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[120px] rounded-full pointer-events-none transition-colors duration-700 ${ecoMode ? 'bg-teal-900/30' : 'bg-teal-100/40'}`}></div>

        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-bold tracking-wide mb-8 animate-in fade-in slide-in-from-bottom-4 transition-colors ${ecoMode ? 'bg-slate-800/50 border-slate-700 text-emerald-400' : 'bg-white border-slate-200 text-teal-700 shadow-sm'}`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          100% Private, Safe, & Confidential
        </div>

        {/* Vidhan.ai centered above the main text */}
        <h2 className={`font-extrabold text-3xl md:text-4xl tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-6 ${ecoMode ? 'text-white/80' : 'text-slate-800/80'}`}>
          Vidhan.ai
        </h2>

        <h1 className={`text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 delay-150 leading-[1.1] ${ecoMode ? 'text-white' : 'text-slate-900'}`}>
          Take a deep breath. <br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${ecoMode ? 'from-emerald-400 to-teal-300' : 'from-teal-600 to-emerald-500'}`}>
            You don't have to face this alone.
          </span>
        </h1>

        <p className={`text-lg md:text-xl font-medium max-w-2xl mb-12 animate-in fade-in slide-in-from-bottom-8 delay-300 leading-relaxed ${ecoMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Legal issues can be deeply overwhelming and confusing. Vidhan.ai is your patient, non-judgmental AI guide. We are here to help you understand your rights and figure out your next steps, at your own pace.
        </p>

        <button
          onClick={handleGoogleLogin}
          className={`group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white rounded-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-2xl animate-in fade-in zoom-in delay-500 ${ecoMode ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-teal-700 hover:bg-teal-600 shadow-teal-500/20'}`}
        >
          <div className="relative flex items-center gap-3">
             <div className="bg-white p-1.5 rounded-full"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /></div>
             <span className="text-lg tracking-wide">Start Your Safe Session</span>
          </div>
        </button>

        {/* Calming Imagery */}
        <div className="w-full mt-20 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
           <div className={`w-full h-64 md:h-96 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 border ${ecoMode ? 'border-slate-800 opacity-80' : 'border-[#EAE5D9]'}`}>
              <img 
                src="https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=80" 
                alt="Calming Water at Dawn" 
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 transition-colors duration-700 ${ecoMode ? 'bg-slate-900/40' : 'bg-teal-900/5'}`}></div>
           </div>
        </div>

      </main>

      {/* Reassurance Features */}
      <section className={`py-24 px-6 relative z-10 transition-colors duration-700 ${ecoMode ? 'bg-[#0B1120]' : 'bg-transparent'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 tracking-tight ${ecoMode ? 'text-white' : 'text-slate-900'}`}>How we can support you today</h2>
            <p className={`font-medium text-lg ${ecoMode ? 'text-slate-400' : 'text-slate-500'}`}>Take things one step at a time. Select the tool that feels easiest for you right now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {/* Feature 1 */}
             <div className={`p-8 rounded-[2rem] border transition-all duration-300 group flex flex-col text-center items-center ${ecoMode ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-teal-100/50'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110 ${ecoMode ? 'bg-slate-800' : 'bg-teal-50 shadow-sm'}`}>🗣️</div>
                <h3 className={`text-xl font-bold mb-3 ${ecoMode ? 'text-white' : 'text-slate-900'}`}>Just Talk to Us</h3>
                <p className={`leading-relaxed text-sm font-medium ${ecoMode ? 'text-slate-400' : 'text-slate-600'}`}>Typing is hard when you're stressed. Just tap the mic and speak in English, Hindi, or Odia. We will listen and guide you patiently.</p>
             </div>
             
             {/* Feature 2 */}
             <div className={`p-8 rounded-[2rem] border transition-all duration-300 group flex flex-col text-center items-center ${ecoMode ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-teal-100/50'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110 ${ecoMode ? 'bg-slate-800' : 'bg-teal-50 shadow-sm'}`}>🛡️</div>
                <h3 className={`text-xl font-bold mb-3 ${ecoMode ? 'text-white' : 'text-slate-900'}`}>Know Your Rights</h3>
                <p className={`leading-relaxed text-sm font-medium ${ecoMode ? 'text-slate-400' : 'text-slate-600'}`}>We map your situation directly to the new BNS and IPC laws, so you know exactly what your protections are under Indian Law.</p>
             </div>
             
             {/* Feature 3 */}
             <div className={`p-8 rounded-[2rem] border transition-all duration-300 group flex flex-col text-center items-center ${ecoMode ? 'bg-slate-800/40 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-100 hover:shadow-xl hover:shadow-teal-100/50'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 transition-transform duration-300 group-hover:scale-110 ${ecoMode ? 'bg-slate-800' : 'bg-teal-50 shadow-sm'}`}>📝</div>
                <h3 className={`text-xl font-bold mb-3 ${ecoMode ? 'text-white' : 'text-slate-900'}`}>Let Us Write It</h3>
                <p className={`leading-relaxed text-sm font-medium ${ecoMode ? 'text-slate-400' : 'text-slate-600'}`}>Need to send a formal complaint or notice? Don't stress about the wording. Tell us the facts, and we will format a professional PDF for you instantly.</p>
             </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className={`py-10 text-center text-sm font-medium transition-colors duration-700 ${ecoMode ? 'bg-[#0B1120] border-t border-slate-800 text-slate-500' : 'bg-[#FDFBF7] border-t border-[#EAE5D9] text-slate-500'}`}>
        <p>© 2026 Vidhan.ai. You are safe here. (Note: AI is a guide, not a substitute for a retained lawyer).</p>
      </footer>

    </div>
  );
};

// ==========================================
// 3. WORKSPACE
// ==========================================
const Workspace = ({ user }) => {
  const [activeDomain, setActiveDomain] = useState(domains[0]);
  const [mode, setMode] = useState('text');
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [docReady, setDocReady] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const chatHistoryRef = useRef([]);
  const chatEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const modeRef = useRef(mode);

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => { modeRef.current = mode; }, [mode]);

  if (!user) return <Navigate to="/" />;

  const handleQuickPrompt = (prompt) => setInputText(prompt);

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    const currentInput = inputText;
    const historySnapshot = chatHistoryRef.current;
    setChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);
    setInputText('');
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:9000/api/v1/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain_tag: activeDomain.id, user_input: currentInput, language: 'hi-IN', chat_history: historySnapshot })
      });
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'model', text: data.reply.ui_text }]);
      if (data.reply?.doc_status?.ready_to_generate) setDocReady(true);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'model', text: "⚠️ Server connection failed." }]);
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
          const response = await fetch('http://localhost:9000/api/v1/voice/query', { method: 'POST', body: formData });
          if (!response.ok) throw new Error(`Server Error: ${response.status}`);
          const data = await response.json();
          if (data && data.reply) {
            setChatHistory(prev => [...prev, { role: 'user', text: `🎙️ (Voice): ${data.user_text}` }, { role: 'model', text: data.reply.ui_text }]);
            if (data.audio_base64) {
              setIsPlayingAudio(true);
              const audio = new Audio(`data:audio/mp3;base64,${data.audio_base64}`);
              audio.play();
              audio.onended = () => { setIsPlayingAudio(false); if (modeRef.current === 'voice') startRecording(); };
            } else { if (modeRef.current === 'voice') startRecording(); }
          }
        } catch (error) {
          setChatHistory(prev => [...prev, { role: 'model', text: "⚠️ Voice connection failed." }]);
        } finally { setIsProcessingVoice(false); }
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) { alert("Microphone permission denied! Check browser settings."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const toggleRecording = () => { if (isRecording) stopRecording(); else startRecording(); };

  const changeDomain = (domain) => {
    setActiveDomain(domain);
    setChatHistory([]);
    setDocReady(false);
    if (isRecording) stopRecording();
  };

  const handleGenerateDoc = async () => {
    setIsGeneratingDoc(true);
    try {
      const response = await fetch('http://localhost:9000/api/v1/document/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain_tag: activeDomain.id, chat_history: chatHistoryRef.current })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail);

      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>Legal Document - Vidhan.ai</title>
        <style>
          body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 40px auto; padding: 40px; color: #000; }
          .legal-doc { line-height: 1.8; }
          @media print { body { margin: 0; } }
        </style></head>
        <body>${data.draft_html}<br/><br/>
        <script>window.onload = () => { window.print(); }<\/script>
        </body></html>
      `);
      win.document.close();
    } catch (err) {
      alert('Document generation failed: ' + err.message);
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-800 selection:bg-indigo-100">
      
      {/* SIDEBAR - Rich Navy Blue */}
      <div className="w-full md:w-80 bg-[#0B132B] border-r border-[#1C2640] flex flex-col h-screen p-6 shrink-0 z-20 shadow-xl">
        <div className="mb-10 flex items-center gap-4">
          <AnimatedLogo className="w-10 h-10" isDark={true} />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Vidhan.ai</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5 px-1">Legal Categories</h2>
          <div className="flex flex-col gap-3">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => changeDomain(domain)}
                className={`flex items-start gap-4 p-3.5 rounded-2xl transition-all duration-200 text-left group ${
                  activeDomain.id === domain.id 
                  ? 'bg-indigo-600/20 border border-indigo-500/40 text-white shadow-inner' 
                  : 'bg-transparent hover:bg-[#1C2640] border border-transparent text-slate-400'
                }`}
              >
                <span className={`text-xl mt-0.5 transition-transform duration-300 ${activeDomain.id === domain.id ? 'scale-110 opacity-100' : 'opacity-60 group-hover:scale-110 group-hover:opacity-100'}`}>{domain.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${activeDomain.id === domain.id ? 'text-indigo-300' : 'group-hover:text-white'}`}>{domain.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-[#1C2640] flex flex-col gap-4">
          <div className="flex items-center gap-3 px-1">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs uppercase border border-indigo-500/30">
              {user.email.charAt(0)}
            </div>
            <span className="text-sm font-medium text-slate-300 truncate">{user.email}</span>
          </div>
          <button onClick={() => signOut(auth)} className="w-full py-3 rounded-xl text-sm font-bold text-slate-400 bg-[#151F35] hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all duration-300">
            End Session
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen relative bg-slate-50">
        
        {/* Header - Cleaner & Softer */}
        <div className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-3">
              <span className="text-2xl p-2 bg-slate-100 rounded-xl">{activeDomain.icon}</span> 
              {activeDomain.title} Advisory
            </h2>
          </div>
          
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setShowDocModal(true)}
              className="px-5 py-2 text-sm font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm border border-indigo-200 hover:-translate-y-0.5"
            >
              ⚡ Quick Draft
            </button>

            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
              <button onClick={() => {setMode('text'); if(isRecording) stopRecording();}} className={`px-6 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-lg ${mode === 'text' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Text</button>
              <button onClick={() => setMode('voice')} className={`px-6 py-1.5 text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-lg ${mode === 'voice' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-slate-700'}`}>Voice</button>
            </div>
          </div>
        </div>

        {/* Dynamic Area */}
        <div className="flex-1 p-6 md:p-10 flex flex-col overflow-y-auto">
          
          <div className="w-full max-w-4xl mx-auto flex-1 mb-8 flex flex-col gap-6">
            
            {/* EMPTY STATE */}
            {chatHistory.length === 0 ? (
               <div className="m-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-xl">
                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 flex justify-center w-24 h-24 items-center">
                    <AnimatedLogo className="w-16 h-16" isDark={false} />
                 </div>
                 <h3 className="text-3xl font-extrabold text-slate-800 mb-3 tracking-tight">Vidhan.ai is Ready</h3>
                 <p className="text-slate-500 text-center mb-10 text-lg">Describe your situation related to <strong className="text-indigo-600 font-bold">{activeDomain.title}</strong>, or select a prompt below.</p>
                 
                 {mode === 'text' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                     <button onClick={() => handleQuickPrompt("What are my immediate rights in this situation?")} className="text-left p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md hover:-translate-y-1 transition-all text-sm text-slate-700 font-semibold group">
                       <span className="block mb-2 text-indigo-500">🛡️ Rights</span>
                       What are my immediate rights here?
                     </button>
                     <button onClick={() => handleQuickPrompt("How do I file an official complaint for this?")} className="text-left p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-indigo-300 hover:shadow-md hover:-translate-y-1 transition-all text-sm text-slate-700 font-semibold group">
                       <span className="block mb-2 text-blue-500">📄 Procedure</span>
                       How do I file an official complaint?
                     </button>
                   </div>
                 )}
               </div>
            ) : (
              // CHAT HISTORY
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[80%] p-6 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                  }`}>
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                        <AnimatedLogo className="w-5 h-5" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vidhan.ai Analysis</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-medium">{msg.text}</div>
                  </div>
                </div>
              ))
            )}

            {isSubmitting && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white border border-slate-200 p-5 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-4 w-56 relative overflow-hidden">
                  <AnimatedLogo className="w-6 h-6 opacity-70" />
                  <span className="text-sm font-bold text-slate-500">Analyzing laws...</span>
                  <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-transparent via-indigo-50 to-transparent animate-[slide_1.5s_ease-in-out_infinite] opacity-80"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>
          
          {docReady && (
            <div className="w-full max-w-4xl mx-auto shrink-0 mb-4 animate-in fade-in slide-in-from-bottom-4">
              <button
                onClick={handleGenerateDoc}
                disabled={isGeneratingDoc}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-1 disabled:bg-slate-300 disabled:shadow-none disabled:transform-none"
              >
                {isGeneratingDoc ? '⏳ Drafting Document...' : '📄 Generate & Download Formal Legal Draft (PDF)'}
              </button>
            </div>
          )}

          {/* INPUT AREA */}
          <div className="w-full max-w-4xl mx-auto shrink-0 bg-white p-3 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex items-end gap-3 transition-all focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300">
            {mode === 'text' ? (
              <>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder="Detail your legal query completely..."
                  className="flex-1 bg-transparent focus:outline-none text-slate-800 px-5 py-4 placeholder:text-slate-400 text-[15px] resize-none min-h-[60px] max-h-[200px] font-medium"
                  rows="1"
                />
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !inputText.trim()} 
                  className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-4 rounded-2xl disabled:bg-slate-100 disabled:text-slate-400 transition-all duration-300 font-bold text-sm flex items-center justify-center min-w-[120px] shadow-sm mb-1 mr-1"
                >
                   {isSubmitting ? <span className="animate-spin text-xl">⚙️</span> : 'Submit'}
                </button>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center py-8">
                 {isPlayingAudio ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse border-2 border-indigo-100 shadow-inner">
                        <AnimatedLogo className="w-10 h-10" />
                      </div>
                      <p className="text-base font-bold text-indigo-600">Vidhan.ai is speaking...</p>
                    </div>
                 ) : isProcessingVoice ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center animate-pulse border-2 border-slate-100 shadow-inner">
                        <span className="text-2xl opacity-50">⚙️</span>
                      </div>
                      <p className="text-base font-bold text-slate-500">Processing audio transcript...</p>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center gap-5">
                      <button 
                        onClick={toggleRecording}
                        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 relative group hover:-translate-y-1 ${
                          isRecording ? 'bg-rose-50 border-2 border-rose-200' : 'bg-slate-900 hover:bg-indigo-600'
                        }`}
                      >
                        {isRecording && <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-30"></span>}
                        <span className="text-3xl z-10">{isRecording ? '⏹️' : '🎙️'}</span>
                      </button>
                      <p className={`text-sm font-bold tracking-wide uppercase ${isRecording ? 'text-rose-500' : 'text-slate-400'}`}>
                        {isRecording ? "Recording... Tap to conclude" : "Tap to begin voice consultation"}
                      </p>
                    </div>
                 )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* QUICK DRAFT MODAL */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 transform transition-all">
            
            <div className="bg-slate-900 p-8 text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-extrabold flex items-center gap-3 tracking-tight">⚡ Quick Legal Draft</h3>
                <p className="text-slate-400 text-sm mt-2 font-medium">Generate standard notices instantly without chat</p>
              </div>
              <button onClick={() => setShowDocModal(false)} className="text-slate-400 hover:text-white text-3xl transition-colors bg-slate-800 hover:bg-slate-700 w-10 h-10 rounded-full flex items-center justify-center pb-1">×</button>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Document Type</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm">
                  <option>Police Complaint (FIR Draft)</option>
                  <option>Traffic Challan Dispute Letter</option>
                  <option>Legal Notice to Employer</option>
                  <option>Tenant Eviction Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Key Details (Names, Dates, Issue)</label>
                <textarea 
                  placeholder="E.g., My name is Rahul. My landlord Amit is kicking me out without notice on 24th March..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-800 h-36 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium transition-all shadow-sm leading-relaxed"
                ></textarea>
              </div>

              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-600/20 mt-2 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 text-base">
                <span>📄 Generate Document Instantly</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-6">
        <AnimatedLogo className="w-20 h-20" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-sm">Initializing Vidhan.ai...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route path="/workspace" element={<Workspace user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;