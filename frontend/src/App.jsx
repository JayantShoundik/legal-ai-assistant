import React, { useState, useRef } from 'react';

const domains = [
  { id: 'traffic_police', icon: '🚨', title: 'Traffic Police Stop', desc: 'Challans, vehicle impounds, harassment', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'police_station', icon: '👮', title: 'Police Station / FIR', desc: 'Filing complaints, rights during arrest', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'consumer_fraud', icon: '🛒', title: 'Consumer Fraud', desc: 'Fake products, refund denials', color: 'bg-green-50 text-green-700 border-green-200' },
  { id: 'workplace', icon: '🏢', title: 'Workplace Issue', desc: 'Unpaid salary, harassment', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'tenant_landlord', icon: '🏠', title: 'Tenant / Landlord', desc: 'Eviction, deposit disputes', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
];

function App() {
  const [activeDomain, setActiveDomain] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);

  const recognitionRef = useRef(null);

  const handleDomainSelect = (domain) => {
    setActiveDomain(domain);
    setTranscript('');
    setAiResponse(null); // Clear old responses when opening a new modal
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Input. Please use the text box.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };
  // 🔊 Function to make the browser speak
  // --- NEW: Text-to-Speech Engine with Dynamic Language ---
// 1. THE VOICE ENGINE (Put this right above handleSubmit)
  const speakResponse = (text) => {
    window.speechSynthesis.cancel(); // Stop any current audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Keeps the Indian accent/Hinglish fluid
    utterance.rate = 0.95;    // Slightly slower for a calm tone
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // 2. THE SUBMIT FUNCTION
  const handleSubmit = async () => {
    if (!promptText.trim()) return;
    setIsLoading(true);
    setAiResponse('');
    
    try {
      // NOTE: Make sure this port matches where your Python server is running (9000) 
      // OR Java server (8080) depending on which one you are handing over to the team.
      const response = await fetch('http://localhost:9000/api/v1/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain_tag: activeDomain.id,
          user_input: promptText,
          language: 'hi-IN'
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const data = await response.json();
      
      // -> SEPARATING THE CHAT FROM THE VOICE <-
      // Show structured lawyer text on the screen
      setAiResponse(data.reply.ui_text); 
      
      // Play the fluid conversational text through the speakers
      speakResponse(data.reply.voice_text); 

    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAiResponse("⚠️ Connection failed. Please check your backend servers.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center font-sans relative">
      <div className="w-full max-w-md mt-6 mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Legal AI</h1>
        <p className="text-sm text-gray-500 mt-2">Select your situation to get instant BNS rights and drafting help.</p>
      </div>
      
      {/* Category Grid */}
      <div className="w-full max-w-md grid grid-cols-1 gap-4">
        {domains.map((domain) => (
          <button 
            key={domain.id}
            onClick={() => handleDomainSelect(domain)}
            className={`w-full ${domain.color} border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center space-x-5 text-left active:scale-95`}
          >
            <span className="text-4xl">{domain.icon}</span>
            <div className="flex flex-col">
              <span className="font-bold text-lg">{domain.title}</span>
              <span className="text-xs opacity-80 mt-1">{domain.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Voice Input Modal */}
      {activeDomain && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 pb-10">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>{activeDomain.icon}</span> {activeDomain.title}
              </h2>
             {/* CHANGE IT TO THIS: */}
<button 
  onClick={() => {
    window.speechSynthesis.cancel(); // Stops the audio!
    setActiveDomain(null);           // Closes the modal!
  }} 
  className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
>
  ✕
</button>
            </div>

            {/* Mic UI */}
            <div className="flex flex-col items-center justify-center py-6">
              <button 
                onClick={toggleRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                </svg>
              </button>
              <p className="mt-4 text-sm font-medium text-gray-600">
                {isRecording ? "Listening... Tap mic to stop" : "Tap to speak (Hindi/English)"}
              </p>
            </div>

            {/* Text Input */}
            <textarea 
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Or type your situation here..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32"
            ></textarea>

            {/* AI Response Box (Only shows when there is a response) */}
            {/* --- RESTORED: VOICE-ENABLED CHAT UI --- */}
        {aiResponse && (
          <div className="border-t border-gray-100 bg-gray-50 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span>🧠</span> AI Legal Advisory
            </h3>
            
            {/* AI Text Bubble */}
            <div className="bg-white border border-gray-200 p-5 rounded-lg mb-4 whitespace-pre-wrap text-gray-700 leading-relaxed shadow-sm">
              {aiResponse}
            </div>
            
            {/* Voice Control Panel (USP Focus) */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center animate-pulse text-2xl">
                        🗣️
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Voice Assistant Running</p>
                        <p className="text-sm text-gray-500">Listening and replying in Hinglish</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={() => speakResponse(aiResponse, 'en-IN')}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                    >
                        English
                    </button>
                    <button 
                        onClick={() => speakResponse(aiResponse, 'hi-IN')}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                    >
                        Hindi
                    </button>
                    {/* Odia will sound robotic, but you have a button for it now */}
                    <button 
                        onClick={() => speakResponse(aiResponse, 'or-IN')}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
                    >
                        Odia
                    </button>
                    <button 
                        onClick={() => window.speechSynthesis.cancel()}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
                    >
                        Stop
                    </button>
                </div>
            </div>
          </div>
        )}

            {/* Single Action Button */}
            <button 
              onClick={handleSubmit}
              disabled={!transcript.trim() || isSubmitting}
              className="w-full mt-4 bg-gray-900 text-white font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors flex justify-center items-center"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                "Get Legal Help"
              )}
            </button>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;