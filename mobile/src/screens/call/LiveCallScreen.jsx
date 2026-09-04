import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Volume1, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { motion } from 'framer-motion';

export default function LiveCallScreen() {
  const { user } = useAuth();
  const { 
    activeCall, callDuration, isMuted, setIsMuted, 
    isSpeakerOn, setIsSpeakerOn, speakInCall, endCurrentCall 
  } = useCall();

  const recognitionRef = useRef(null);
  const [visualizerLevels, setVisualizerLevels] = useState(Array(5).fill(10));

  // Background Magical Translation Engine (MediaRecorder for STT with VAD)
  useEffect(() => {
    let mediaRecorder = null;
    let stream = null;
    let interval = null;
    let volumeInterval = null;
    let audioCtx = null;

    if (activeCall && activeCall.isTranslated && !isMuted) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((s) => {
        stream = s;
        
        // VAD (Voice Activity Detection) Setup
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        const microphone = audioCtx.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let isSpeakingInChunk = false;

        volumeInterval = setInterval(() => {
          if (stream.active) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;
            if (average > 15) { // Volume threshold
              isSpeakingInChunk = true;
            }
          }
        }, 100);

        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        
        mediaRecorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && speakInCall && isSpeakingInChunk) {
            const arrayBuffer = await e.data.arrayBuffer();
            speakInCall(null, arrayBuffer);
          }
          isSpeakingInChunk = false; // reset for next chunk
        };

        mediaRecorder.start();
        interval = setInterval(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            mediaRecorder.start();
          }
        }, 4000); // 4-second chunks
      }).catch(err => console.warn("MediaRecorder setup failed:", err));

      return () => {
        if (interval) clearInterval(interval);
        if (volumeInterval) clearInterval(volumeInterval);
        if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
        if (stream) stream.getTracks().forEach(t => t.stop());
      };
    }
  }, [activeCall, isMuted, speakInCall]);

  // Simulated Audio Visualizer Logic
  useEffect(() => {
    let interval;
    if (activeCall && callDuration > 0 && !isMuted) {
      interval = setInterval(() => {
        setVisualizerLevels(Array.from({ length: 5 }, () => Math.random() * 20 + 8));
      }, 150);
    } else {
      setVisualizerLevels(Array(5).fill(4));
    }
    return () => clearInterval(interval);
  }, [activeCall, callDuration, isMuted]);

  if (!activeCall) return null;

  const peer = activeCall.peer;
  const avatarUrl = peer?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#060B13] z-50 flex flex-col justify-between font-sans text-white overflow-hidden"
    >
      {/* Glassmorphism Background Image (Audio Only) */}
      {!activeCall?.isVideo && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={avatarUrl} 
            alt="" 
            className="w-full h-full object-cover opacity-30 scale-110 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
        </div>
      )}

      {activeCall.livekitToken && (
        <div className="absolute inset-0 z-0" style={{ opacity: activeCall?.isVideo ? 1 : 0, pointerEvents: activeCall?.isVideo ? 'auto' : 'none' }}>
          <LiveKitRoom
            serverUrl={import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880'}
            token={activeCall.livekitToken}
            connect={true}
            audio={!isMuted && !activeCall?.isTranslated}
            video={!!activeCall?.isVideo}
            data-lk-theme="default"
            style={{ width: '100%', height: '100%', position: 'absolute' }}
            onDisconnected={() => endCurrentCall()}
          >
            {activeCall?.isVideo ? <VideoConference /> : <RoomAudioRenderer muted={activeCall?.isTranslated} />}
          </LiveKitRoom>
        </div>
      )}

      {!activeCall?.isVideo && (
        <>
          {/* Top Section */}
          <div className="relative z-10 pt-12 pb-4 flex flex-col items-center gap-1 opacity-70">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-black/20 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
              <Lock className="w-3 h-3" />
              End-to-end encrypted
            </div>
          </div>

          {/* Center Section: Avatar & Info */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-10">
            
            {/* Dynamic Visualizer around Avatar */}
            <div className="relative flex items-center justify-center mb-8">
              {/* Animated Glow */}
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-[ping_3s_ease-in-out_infinite]" />
              
              <img
                src={avatarUrl}
                alt={peer?.name}
                className="w-36 h-36 rounded-full object-cover shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative z-10"
              />
            </div>
            
            <h2 className="text-4xl font-medium tracking-tight mb-2 text-white drop-shadow-md">{peer?.name}</h2>
            <p className="text-lg text-emerald-400 font-medium tracking-wide">
              {callDuration > 0 ? formatDuration(callDuration) : 'Calling...'}
            </p>
            
            {/* Audio Visualizer Bars */}
            <div className="flex items-end justify-center gap-1.5 h-10 mt-6">
              {visualizerLevels.map((level, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${level}px` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.15 }}
                  className="w-1.5 bg-white/70 rounded-full"
                />
              ))}
            </div>
            <p className="text-[10px] text-white/40 mt-3 tracking-widest uppercase">
              {isMuted ? 'Microphone Muted' : 'AI Translation Active'}
            </p>
          </div>
        </>
      )}

      {/* Bottom Section: Controls */}
      <motion.div 
        initial={{ y: 150 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative z-10 bg-white/10 backdrop-blur-2xl border-t border-white/20 rounded-t-[40px] px-8 py-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]"
      >
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isSpeakerOn ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-black/30 text-white hover:bg-black/40 border border-white/10'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <Volume1 className="w-6 h-6" />}
          </button>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isMuted ? 'bg-white text-black shadow-lg shadow-white/20' : 'bg-black/30 text-white hover:bg-black/40 border border-white/10'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={endCurrentCall}
            className="p-5 rounded-full bg-red-500 hover:bg-red-400 text-white transition-all active:scale-90 shadow-lg shadow-red-500/30"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
