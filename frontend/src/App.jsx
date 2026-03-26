import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase'; 

// ==========================================
// 1. CONSTANTS (Domains Array)
// ==========================================
const domains = [
  { id: 'traffic_police', icon: '🚨', title: 'Traffic Police Stop', desc: 'Challans, vehicle impounds, harassment', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'police_station', icon: '👮', title: 'Police Station / FIR', desc: 'Filing complaints, rights during arrest', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'consumer_fraud', icon: '🛒', title: 'Consumer Fraud', desc: 'Fake products, refund denials', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'workplace', icon: '🏢', title: 'Workplace Issue', desc: 'Unpaid salary, harassment', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'tenant_landlord', icon: '🏠', title: 'Tenant / Landlord', desc: 'Eviction, deposit disputes', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
];

// ==========================================
// 2. LANDING PAGE
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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">⚖️ Legal AI</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your personal AI lawyer. Get instant legal advice, draft documents, and know your rights in Hindi, English, and Odia.
        </p>
        <button 
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-1" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. WORKSPACE (Voice + Memory Engine)
// ==========================================
const Workspace = ({ user }) => {
  const [activeDomain, setActiveDomain] = useState(domains[0]);
  const [mode, setMode] = useState('text');
  const [inputText, setInputText] = useState('');
  
  // Memory State
  const [chatHistory, setChatHistory] = useState([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  if (!user) return <Navigate to="/" />;

  // --- TEXT CHAT LOGIC ---
  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    const currentInput = inputText;
    const newHistory = [...chatHistory, { role: 'user', text: currentInput }];
    setChatHistory(newHistory);
    setInputText('');
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:9000/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain_tag: activeDomain.id,
          user_input: currentInput,
          language: 'hi-IN',
          chat_history: chatHistory 
        })
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      setChatHistory(prev => [...prev, { role: 'model', text: data.reply.ui_text }]);

    } catch (error) {
      console.error("Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: "⚠️ Server connection failed." }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- VOICE CHAT LOGIC ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        setIsProcessingVoice(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');
        formData.append('domain_tag', activeDomain.id);
        formData.append('chat_history', JSON.stringify(chatHistory));

        try {
          const response = await fetch('http://localhost:9000/api/v1/voice-query', {
            method: 'POST',
            body: formData
          });
          const data = await response.json();

          setChatHistory(prev => [
            ...prev, 
            { role: 'user', text: `🎙️ (Voice): ${data.user_text}` },
            { role: 'model', text: data.reply.ui_text }
          ]);

          if (data.audio_base64) {
            const audioUrl = `data:audio/mp3;base64,${data.audio_base64}`;
            const audio = new Audio(audioUrl);
            audio.play();
          }

        } catch (error) {
          console.error("Voice Error:", error);
          alert("Voice processing failed. Check Python console.");
        } finally {
          setIsProcessingVoice(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone permission denied! Browser settings check karo.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const changeDomain = (domain) => {
    setActiveDomain(domain);
    setChatHistory([]); 
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col h-screen p-4 shadow-sm shrink-0">
        <div className="mb-8 mt-2 px-2 flex justify-between items-center">
          <h1 className="text-2xl font-extrabold text-gray-900">⚖️ Legal AI</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Select Situation</h2>
          <div className="flex flex-col gap-2">
            {domains.map((domain) => (
              <button
                key={domain.id}
                onClick={() => changeDomain(domain)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${activeDomain.id === domain.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'}`}
              >
                <span className="text-2xl">{domain.icon}</span>
                <p className="font-semibold text-sm text-gray-700">{domain.title}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button onClick={() => signOut(auth)} className="w-full py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
            Logout Securely
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen">
        
        {/* Top Header */}
        <div className="h-20 border-b border-gray-200 bg-white flex items-center justify-between px-8 shadow-sm shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{activeDomain.icon} {activeDomain.title}</h2>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button onClick={() => setMode('text')} className={`px-6 py-2 rounded-lg text-sm font-bold ${mode === 'text' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>⌨️ Text</button>
            <button onClick={() => setMode('voice')} className={`px-6 py-2 rounded-lg text-sm font-bold ${mode === 'voice' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500'}`}>🎙️ Voice</button>
          </div>
        </div>

        {/* Dynamic Area */}
        <div className="flex-1 bg-gray-50 p-8 flex flex-col overflow-y-auto">
          
          {/* CHAT HISTORY RENDERER */}
          <div className="w-full max-w-3xl mx-auto flex-1 mb-6 flex flex-col gap-4">
            {chatHistory.length === 0 ? (
               <div className="m-auto text-gray-400 text-center pt-20">No chat history yet. Start talking!</div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}`}>
                    {msg.role === 'model' && <span className="block text-xs font-bold text-blue-600 mb-2">🧠 AI Advisor</span>}
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            {isSubmitting && <div className="text-gray-400 text-sm animate-pulse">AI is typing...</div>}
          </div>
          
          {/* INPUT CONTROLS */}
          <div className="w-full max-w-3xl mx-auto shrink-0 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
            {mode === 'text' ? (
              <>
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="Type your issue here..."
                  className="flex-1 bg-transparent focus:outline-none text-gray-800 px-2"
                />
                <button onClick={handleSubmit} disabled={isSubmitting || !inputText.trim()} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:bg-gray-300">
                   Send
                </button>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center py-4">
                 {isProcessingVoice ? (
                    <div className="text-green-600 font-bold animate-pulse flex items-center gap-2">
                       <span className="text-2xl">🤖</span> AI is thinking & speaking...
                    </div>
                 ) : (
                    <button 
                      onMouseDown={startRecording}
                      onMouseUp={stopRecording}
                      onTouchStart={startRecording}
                      onTouchEnd={stopRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-xl transition-all ${isRecording ? 'bg-red-500 scale-110 animate-pulse' : 'bg-green-500 hover:bg-green-600'}`}
                    >
                      🎙️
                    </button>
                 )}
                 <p className="text-gray-400 text-sm mt-4">
                   {isRecording ? "Release to Send..." : "Hold button to speak"}
                 </p>
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
    return <div className="min-h-screen flex items-center justify-center">Loading Engine...</div>;
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