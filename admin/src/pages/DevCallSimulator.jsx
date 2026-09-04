import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, PhoneOff, Mic, Volume2, Sparkles, Radio, Play, Square, RefreshCw, Zap, VolumeX } from 'lucide-react';
import io from 'socket.io-client';

export default function DevCallSimulator() {
  const [activeCall, setActiveCall] = useState(false);
  const [callerLang, setCallerLang] = useState('bn');
  const [receiverLang, setReceiverLang] = useState('en');
  const [spokenText, setSpokenText] = useState('');
  const [translatedResult, setTranslatedResult] = useState(null);
  const [latency, setLatency] = useState(0);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [bargeInTriggered, setBargeInTriggered] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Connect socket
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('user:join', { userId: 'usr_dev_001' });

    socketRef.current.on('call:translated_audio', (data) => {
      setTranslatedResult(data);
      setLatency(data.latencyMs);
      playSynthesizedAudio(data.translatedText, data.targetLang);
    });

    socketRef.current.on('call:cancel_audio', () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSynthesizing(false);
      setBargeInTriggered(true);
      setTimeout(() => setBargeInTriggered(false), 3000);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleStartCall = () => {
    setActiveCall(true);
    setCallDuration(0);
    setTranslatedResult(null);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
  };

  const handleEndCall = () => {
    setActiveCall(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        
        reader.onload = () => {
          socketRef.current.emit('call:speech_input', {
            callId: 'dev_sim_call_01',
            speakerId: 'usr_dev_001',
            peerId: 'usr_sarah_003',
            sourceLang: callerLang,
            targetLang: receiverLang,
            rawText: '',
            audioBuffer: reader.result,
            isFinal: true
          });
        };
        reader.readAsArrayBuffer(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranslatedResult(null);
    } catch (err) {
      console.error("Mic error:", err);
      alert("Microphone access is required for live audio testing.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSpeakPhrase = (textToSpeak) => {
    const text = textToSpeak || spokenText;
    if (!text.trim()) return;

    setTranslatedResult(null);
    setBargeInTriggered(false);

    socketRef.current.emit('call:speech_input', {
      callId: 'dev_sim_call_01',
      speakerId: 'usr_dev_001',
      peerId: 'usr_sarah_003',
      sourceLang: callerLang,
      targetLang: receiverLang,
      rawText: text.trim(),
      isFinal: true
    });
  };

  const handleBargeIn = () => {
    socketRef.current.emit('call:interrupt', {
      callId: 'dev_sim_call_01',
      speakerId: 'usr_sarah_003',
      peerId: 'usr_dev_001'
    });
  };

  const playSynthesizedAudio = (text, lang) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (lang === 'bn') utterance.lang = 'bn-BD';
    else if (lang === 'hi') utterance.lang = 'hi-IN';
    else if (lang === 'ar') utterance.lang = 'ar-SA';
    else utterance.lang = 'en-US';

    utterance.rate = 1.0;
    utterance.onstart = () => setIsSynthesizing(true);
    utterance.onend = () => setIsSynthesizing(false);
    utterance.onerror = () => setIsSynthesizing(false);

    window.speechSynthesis.speak(utterance);
  };

  const presetSamples = {
    'bn-en': [
      'হ্যালো, কেমন আছেন? আমি আপনার প্রজেক্টের কাজ শেষ করেছি।',
      'দয়া করে ফাইলটি দেখুন এবং পেমেন্ট গেটওয়ে চেক করুন।',
      'কালকের মধ্যে সম্পূর্ণ ডেলিভারি দেওয়া হবে।'
    ],
    'en-bn': [
      'Hello, how are you? I reviewed the payment architecture.',
      'Can you send me the updated invoice for milestone two?',
      'Let us discuss the project timeline because we are behind schedule.'
    ],
    'hi-en': [
      'नमस्ते, प्रोजेक्ट की स्थिति क्या है?',
      'हम कल तक काम पूरा कर देंगे, बहुत बढ़िया काम किया आपने।'
    ],
    'ar-bn': [
      'مرحبا، هل المشروع جاهز للتسليم اليوم؟',
      'سوف نرسل الدفعة الآن، شكرا جزيلا.'
    ],
    'bn-bn': [
      'আমি ঢাকা থেকে বলছি, কোনো অনুবাদ ছাড়া সরাসরি কথা হচ্ছে।'
    ]
  };

  const currentPairKey = `${callerLang}-${receiverLang}`;
  const presets = presetSamples[currentPairKey] || presetSamples['bn-en'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          Simultaneous AI Voice Call Simulator & Audio Tester
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Test real-time speech translation, barge-in interruption, and audio synthesis in the browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Controls Box */}
        <div className="bg-[#0F1829] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Language Configuration</span>
            {activeCall && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Speaker 1 Language (You)</label>
              <select
                value={callerLang}
                onChange={(e) => setCallerLang(e.target.value)}
                disabled={activeCall}
                className="w-full bg-[#131D31] border border-slate-700 rounded-xl px-3 py-2.5 text-white"
              >
                <option value="bn">বাংলা (Bengali)</option>
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Speaker 2 Language (Peer)</label>
              <select
                value={receiverLang}
                onChange={(e) => setReceiverLang(e.target.value)}
                disabled={activeCall}
                className="w-full bg-[#131D31] border border-slate-700 rounded-xl px-3 py-2.5 text-white"
              >
                <option value="en">English</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>
          </div>

          {/* Mode Badge */}
          <div className="p-3 bg-[#131D31] rounded-xl text-xs">
            <span className="text-slate-400">Call Mode: </span>
            {callerLang === receiverLang ? (
              <strong className="text-cyan-300">Same-Language Direct Mode (0 Usage Charge)</strong>
            ) : (
              <strong className="text-teal-300">Real-time Simultaneous Interpretation Mode</strong>
            )}
          </div>

          {/* Start / End Call */}
          {!activeCall ? (
            <button
              onClick={handleStartCall}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Start Live Voice Call
            </button>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleEndCall}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-red-600/20 transition flex items-center justify-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>

              <button
                onClick={handleBargeIn}
                className="w-full py-2 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2"
              >
                <VolumeX className="w-4 h-4" />
                Test Barge-in / Interruption (Cut Audio)
              </button>
            </div>
          )}
        </div>

        {/* Live Audio & Phrase Stream */}
        <div className="lg:col-span-2 bg-[#0F1829] border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-400 animate-pulse" />
              Live Speech Input & Natural Interpretation
            </h2>
            {isSynthesizing && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                Playing Translated Voice...
              </span>
            )}
            {bargeInTriggered && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                Audio Interrupted!
              </span>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-xs font-semibold text-slate-400 mb-2 block">Quick Test Phrases:</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSpokenText(p);
                    if (activeCall) handleSpeakPhrase(p);
                  }}
                  className="px-3 py-1.5 bg-[#131D31] hover:bg-[#1A2740] border border-slate-700 text-slate-300 hover:text-white rounded-lg text-xs transition"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {/* Speech Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Live Audio or Text Input</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={spokenText}
                onChange={(e) => setSpokenText(e.target.value)}
                placeholder="Type text OR use the record button to speak..."
                className="flex-1 bg-[#131D31] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
              />
              <button
                onClick={() => handleSpeakPhrase()}
                disabled={!activeCall || !spokenText.trim()}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-40"
              >
                Send Text
              </button>
              <button
                onMouseDown={handleStartRecording}
                onMouseUp={handleStopRecording}
                onTouchStart={handleStartRecording}
                onTouchEnd={handleStopRecording}
                disabled={!activeCall}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition flex items-center gap-1.5 disabled:opacity-40 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white shadow-blue-600/20'
                }`}
              >
                <Mic className="w-4 h-4" />
                {isRecording ? 'Recording...' : 'Hold to Speak'}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 ml-1">Hold the microphone button to record live audio and send to the STT pipeline.</p>
          </div>

          {/* Output Display */}
          {translatedResult && (
            <div className="p-4 bg-[#131D31] border border-slate-700/60 rounded-2xl space-y-3 mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400 uppercase tracking-wider">
                  Target Audio Synthesized ({translatedResult.targetLang.toUpperCase()})
                </span>
                <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                  Latency: {latency} ms
                </span>
              </div>

              <div className="text-lg font-bold text-white bg-[#0A101C] p-4 rounded-xl border border-slate-800 leading-relaxed">
                {translatedResult.translatedText}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Original Speech: <em className="text-slate-300">"{translatedResult.originalText}"</em></span>
                <button
                  onClick={() => playSynthesizedAudio(translatedResult.translatedText, translatedResult.targetLang)}
                  className="inline-flex items-center gap-1 text-teal-400 hover:text-teal-300 font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Replay Voice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
