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
// 💎 PREMIUM ANIMATED LOGO COMPONENT (Abstract 'V', Scale & AI Spark)
const AnimatedLogo = ({ className = "w-10 h-10", isDark = false }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    {/* Soft background glow */}
    <div className={`absolute w-full h-full rounded-full blur-xl z-0 opacity-30 animate-pulse ${isDark ? 'bg-indigo-500' : 'bg-blue-500'}`}></div>

    {/* Orbiting AI Sparkle (Shows intelligence/processing) */}
    <div className="absolute inset-0 z-20 animate-[spin_3s_linear_infinite]">
      <svg className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/4 h-1/4 ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
      </svg>
    </div>

    {/* Minimalist Tech Ring */}
    <svg className={`absolute inset-0 w-full h-full z-10 ${isDark ? 'text-white/20' : 'text-slate-900/10'}`} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 8" className="animate-[spin_20s_linear_infinite]" />
    </svg>

    {/* The Modern 'V' & Scale Concept */}
    <svg className={`absolute inset-0 w-full h-full z-30 ${isDark ? 'text-white' : 'text-slate-800'}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
       {/* Elegant V for Vidhan */}
       <path d="M30 40 L50 65 L70 40" strokeWidth="6" className="drop-shadow-md" />
       {/* The balance beam (Scales of justice) */}
       <path d="M22 40 L78 40" strokeWidth="4" />
       {/* Center gravity node */}
       <circle cx="50" cy="65" r="4" fill="currentColor" />
    </svg>
  </div>
);

// ==========================================
// 2. ENHANCED LANDING PAGE (Vidhan.ai Theme)
// ==========================================
const LandingPage = ({ user }) => {
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
    <div className="min-h-screen bg-[#F8FAFC] overflow-hidden font-sans relative flex flex-col items-center justify-center pt-20 pb-10">
      {/* Background Animated Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse delay-1000"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 w-full text-center flex flex-col items-center">
        
        {/* HERO SECTION */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-3xl">
          <div className="flex justify-center mb-8">
            <AnimatedLogo className="w-24 h-24" />
          </div>
          
          {/* Trust Badge added */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6 text-xs font-semibold text-slate-500">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
           
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Meet <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 drop-shadow-sm">Vidhan.ai</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed font-medium">
            Your definitive AI Legal Counsel. Understand your rights, draft notices, and navigate the Indian legal system with precision.
          </p>
        </div>

        {/* CALL TO ACTION */}
        <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300 mb-16">
          <button 
            onClick={handleGoogleLogin}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-slate-900 rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-3">
              <div className="bg-white p-1 rounded-full"><img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /></div>
              <span className="text-lg tracking-wide">Access Vidhan.ai Securely</span>
            </div>
          </button>
          <p className="text-xs text-slate-400 mt-4 flex items-center gap-1 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            End-to-end Encrypted & Private
          </p>
        </div>

        {/* NEW ADDITION: FEATURES HIGHLIGHT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm text-left hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100">🎙️</div>
            <h3 className="font-bold text-slate-800 mb-2">Live Voice Advisory</h3>
            <p className="text-sm text-slate-500">Speak naturally in Hindi, English, or Odia. The AI listens and talks back like a real lawyer.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm text-left hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4 border border-blue-100">⚖️</div>
            <h3 className="font-bold text-slate-800 mb-2">BNS & IPC Mapped</h3>
            <p className="text-sm text-slate-500">Instantly get exact sections and laws applicable to your unique situation to protect yourself.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 shadow-sm text-left hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">📄</div>
            <h3 className="font-bold text-slate-800 mb-2">Document Generation</h3>
            <p className="text-sm text-slate-500">Automatically draft legal notices, complaints, and emails tailored to your specific case.</p>
          </div>

        </div>

      </div>
    </div>
  );
};

// ==========================================
// 3. WORKSPACE (Text Page Upgraded + Voice)
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

  // Quick Prompts for Empty State
  const handleQuickPrompt = (prompt) => {
    setInputText(prompt);
  };

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
    } catch (err) { alert("Microphone permission denied! Browser settings check karo."); }
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
    if (isRecording) stopRecording();
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-screen p-5 shrink-0 z-10 text-slate-300">
        <div className="mb-8 mt-2 px-2 flex items-center gap-4">
          <AnimatedLogo className="w-10 h-10" isDark={true} />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Vidhan.ai</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Legal Categories</h2>
          <div className="flex flex-col gap-2">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => changeDomain(domain)}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all text-left group ${
                  activeDomain.id === domain.id 
                  ? 'bg-white-600/20 border border-white-500/30 text-white' 
                  : 'hover:bg-slate-800 border border-transparent text-slate-400'
                }`}
              >
                <span className={`text-xl mt-0.5 ${activeDomain.id === domain.id ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'}`}>{domain.icon}</span>
                <div>
                  <p className={`font-semibold text-sm ${activeDomain.id === domain.id ? 'text-indigo-300' : ''}`}>{domain.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800 px-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-500 truncate">{user.email}</span>
          </div>
          <button onClick={() => signOut(auth)} className="w-full py-2.5 rounded-lg text-sm font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors">
            End Session
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-blend-overlay">
        
        {/* Top Header */}
        <div className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md flex items-center justify-between px-8 shrink-0 sticky top-0 z-10">
          <div>
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <span className="opacity-80 text-xl">{activeDomain.icon}</span> {activeDomain.title} Advisory
            </h2>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner">
            <button onClick={() => {setMode('text'); if(isRecording) stopRecording();}} className={`px-5 py-1 text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-full ${mode === 'text' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Text Log</button>
            <button onClick={() => setMode('voice')} className={`px-5 py-1 text-xs font-bold uppercase tracking-wide transition-all duration-300 rounded-full ${mode === 'voice' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Live Call</button>
          </div>
        </div>

        {/* Dynamic Area */}
        <div className="flex-1 p-4 md:p-8 flex flex-col overflow-y-auto">
          
          <div className="w-full max-w-4xl mx-auto flex-1 mb-6 flex flex-col gap-6">
            
            {/* EMPTY STATE (Upgraded Professional Look) */}
            {chatHistory.length === 0 ? (
               <div className="m-auto flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 w-full max-w-lg">
                 <AnimatedLogo className="w-20 h-20 mb-6" isDark={false} />
                 <h3 className="text-2xl font-bold text-slate-800 mb-2">Vidhan.ai Advisory Ready</h3>
                 <p className="text-slate-500 text-center mb-8">Describe your situation related to <strong className="text-indigo-600">{activeDomain.title}</strong> below, or choose a quick prompt to begin.</p>
                 
                 {/* Quick Prompts */}
                 {mode === 'text' && (
                   <div className="flex flex-col gap-3 w-full">
                     <button onClick={() => handleQuickPrompt("What are my immediate rights in this situation?")} className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-400 hover:shadow-md transition-all text-sm text-slate-600 font-medium flex justify-between items-center group">
                       What are my immediate rights in this situation? <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">→</span>
                     </button>
                     <button onClick={() => handleQuickPrompt("How do I file an official complaint for this?")} className="w-full text-left p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-400 hover:shadow-md transition-all text-sm text-slate-600 font-medium flex justify-between items-center group">
                       How do I file an official complaint for this? <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">→</span>
                     </button>
                   </div>
                 )}
               </div>
            ) : (
              // CHAT HISTORY RENDERER (Legal Memo Style)
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`max-w-[85%] p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-slate-800 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 border-l-4 border-l-indigo-500 text-slate-700 rounded-tl-sm'
                  }`}>
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-2 mb-3 border-b border-slate-100 pb-2">
                        <AnimatedLogo className="w-4 h-4" />
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vidhan.ai Analysis</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))
            )}

            {/* TYPING INDICATOR (Legal Scanner Style) */}
            {isSubmitting && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-300 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3 w-48 overflow-hidden relative">
                  <AnimatedLogo className="w-5 h-5 opacity-50" />
                  <span className="text-xs font-semibold text-slate-400">Analyzing laws...</span>
                  {/* Scanning bar animation */}
                  <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-transparent via-indigo-100 to-transparent animate-[slide_1.5s_ease-in-out_infinite] opacity-50"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>
          
          {/* INPUT CONTROLS */}
          <div className="w-full max-w-4xl mx-auto shrink-0 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-2">
            {mode === 'text' ? (
              <>
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                  placeholder="Detail your legal query here..."
                  className="flex-1 bg-transparent focus:outline-none text-slate-800 px-4 py-3 placeholder:text-slate-400 text-sm resize-none h-12"
                  rows="1"
                />
                <button onClick={handleSubmit} disabled={isSubmitting || !inputText.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl disabled:bg-slate-200 disabled:text-slate-400 transition-colors font-semibold text-sm h-full flex items-center justify-center min-w-[100px]">
                   {isSubmitting ? <span className="animate-spin text-xl">⚙️</span> : 'Submit'}
                </button>
              </>
            ) : (
              // Voice Controls remain the same solid structure
              <div className="flex-1 flex flex-col items-center py-6">
                 {isPlayingAudio ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center animate-pulse border border-indigo-100">
                        <AnimatedLogo className="w-8 h-8" />
                      </div>
                      <p className="text-sm font-semibold text-indigo-600">Vidhan.ai is speaking...</p>
                    </div>
                 ) : isProcessingVoice ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center animate-pulse border border-slate-100">
                        <span className="text-xl">⚙️</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-500">Processing audio transcript...</p>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center gap-4">
                      <button 
                        onClick={toggleRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 relative group ${
                          isRecording ? 'bg-rose-50 border border-rose-200' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        {isRecording && <span className="absolute inset-0 rounded-full border-4 border-rose-200 animate-ping opacity-50"></span>}
                        <span className="text-2xl z-10">{isRecording ? '⏹️' : '🎙️'}</span>
                      </button>
                      <p className={`text-sm font-medium ${isRecording ? 'text-rose-500' : 'text-slate-500'}`}>
                        {isRecording ? "Recording... Tap to conclude" : "Tap to start voice consultation"}
                      </p>
                    </div>
                 )}
              </div>
            )}
          </div>

        </div>
      </div>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <AnimatedLogo className="w-16 h-16" />
        <p className="text-slate-500 font-semibold tracking-wide">Initializing Vidhan.ai Engine...</p>
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