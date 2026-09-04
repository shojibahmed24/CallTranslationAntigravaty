import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Volume2, Volume1, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { motion, AnimatePresence } from 'framer-motion';

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
          {/* Enriched Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/80 to-black/95 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 via-blue-500/5 to-transparent mix-blend-screen opacity-50 animate-[pulse_15s_ease-in-out_infinite]" />
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
          <div className="relative z-10 pt-12 pb-4 flex flex-col items-center gap-1 opacity-90">
            <div className="flex items-center gap-1.5 text-xs text-slate-200 bg-white/10 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-xl shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <Lock className="w-3.5 h-3.5 text-teal-400 drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]" />
              <span className="tracking-wide">End-to-end encrypted</span>
            </div>
          </div>

          {/* Center Section: Avatar & Info */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center -mt-10">
            
            {/* Dynamic Visualizer around Avatar */}
            <div className="relative flex items-center justify-center mb-10">
              {/* Dual-tone Inner Glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-xl animate-[ping_3s_ease-in-out_infinite]" />
              {/* Slower Outer Glow */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-teal-500/10 to-blue-500/10 blur-2xl animate-[ping_4s_ease-in-out_infinite_0.5s]" />
              
              <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-blue-500/40 to-teal-400/40 shadow-[0_0_30px_rgba(45,212,191,0.2)]">
                <img
                  src={avatarUrl}
                  alt={peer?.name}
                  className="w-36 h-36 rounded-full object-cover shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 border-white/10 relative z-10"
                />
              </div>
            </div>
            
            <h2 className="text-4xl font-medium tracking-tight mb-2 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">{peer?.name}</h2>
            
            <p className={`text-lg font-medium tracking-wide ${callDuration > 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-emerald-400 animate-pulse drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]'}`}>
              {callDuration > 0 ? formatDuration(callDuration) : 'Calling...'}
            </p>
            
            {/* Audio Visualizer Bars */}
            <div className="flex items-end justify-center gap-1.5 h-10 mt-6">
              {visualizerLevels.map((level, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${level}px` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.15 }}
                  className={`w-1.5 rounded-full ${
                    i % 3 === 0 ? 'bg-emerald-400' : i % 3 === 1 ? 'bg-teal-400' : 'bg-blue-400'
                  } shadow-[0_0_8px_currentColor]`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-center min-h-[20px]">
              {!isMuted ? (
                <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase">
                  <Sparkles className="w-3 h-3 text-teal-400 drop-shadow-[0_0_5px_rgba(45,212,191,0.8)]" />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-teal-300 font-bold drop-shadow-sm">AI Translation Active</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-slate-400">
                  <MicOff className="w-3 h-3" />
                  <span>Microphone Muted</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Bottom Section: Controls */}
      <motion.div 
        initial={{ y: 150 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative z-20"
      >
        {/* Ambient upward glow bleed */}
        <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
        
        <div className="relative bg-white/10 backdrop-blur-3xl border-t border-t-teal-500/20 rounded-t-[40px] px-8 py-10 shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {/* Speaker Button */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`relative overflow-hidden p-4 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
                isSpeakerOn ? 'bg-gradient-to-tr from-blue-500 to-teal-400 text-white shadow-[0_0_20px_rgba(45,212,191,0.4)]' : 'bg-black/30 text-white hover:bg-black/40 border border-white/10'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSpeakerOn ? 'on' : 'off'}
                  initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  {isSpeakerOn ? <Volume2 className="w-6 h-6 drop-shadow-sm" /> : <Volume1 className="w-6 h-6 opacity-70" />}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* End Call Button */}
            <button
              onClick={endCurrentCall}
              className="relative p-5 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white transition-all duration-300 active:scale-90 shadow-[0_0_25px_rgba(239,68,68,0.5)] group"
            >
              <div className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-[ping_2s_ease-in-out_infinite]" />
              <PhoneOff className="w-7 h-7 relative z-10 drop-shadow-md" />
            </button>

            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`relative overflow-hidden p-4 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 ${
                isMuted ? 'bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]' : 'bg-black/30 text-white hover:bg-black/40 border border-white/10'
              }`}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isMuted ? 'muted' : 'unmuted'}
                  initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMuted ? <MicOff className="w-6 h-6 drop-shadow-sm" /> : <Mic className="w-6 h-6 opacity-70" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

}