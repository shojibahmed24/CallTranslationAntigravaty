import { Room, RoomEvent } from '@livekit/rtc-node';
import { translationEngine } from './aiTranslationService.js';
import { elevenLabsSTT } from './providers/stt/ElevenLabsSTTProvider.js';
import { io } from './socketHandler.js'; // need to import io or use userSocketMap
import { userSocketMap } from './socket/socketHandler.js';

// Simple PCM buffer & VAD
class AudioStream {
  constructor(callId, participantId) {
    this.callId = callId;
    this.participantId = participantId;
    this.frames = [];
    this.silenceFrames = 0;
    this.isSpeaking = false;
  }
  
  addFrame(frame) {
    // Check amplitude (16-bit PCM)
    let maxAmp = 0;
    const view = new Int16Array(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength / 2);
    for (let i = 0; i < view.length; i++) {
      const amp = Math.abs(view[i]);
      if (amp > maxAmp) maxAmp = amp;
    }
    
    // threshold: ~500 for 16-bit audio
    if (maxAmp > 500) {
      this.isSpeaking = true;
      this.silenceFrames = 0;
      this.frames.push(Buffer.from(frame.data));
    } else {
      if (this.isSpeaking) {
        this.frames.push(Buffer.from(frame.data));
        this.silenceFrames++;
        if (this.silenceFrames > 100) { // ~1 second at 10ms frames
          this.processBuffer();
          this.reset();
        }
      }
    }
  }
  
  async processBuffer() {
    if (this.frames.length < 50) return; // Too short
    console.log(`[Agent] Processing audio for ${this.participantId}`);
    
    // Create WAV header for 48kHz 1-channel 16-bit PCM (LiveKit default)
    const pcmData = Buffer.concat(this.frames);
    const wavBuffer = this.createWavHeader(pcmData.length, 48000, 1, 16);
    const finalAudio = Buffer.concat([wavBuffer, pcmData]);
    
    try {
      // Use existing STT -> LLM -> TTS pipeline
      const text = await elevenLabsSTT.transcribe(finalAudio, 'en'); // hardcoded lang for scaffold
      console.log(`[Agent] Heard: ${text}`);
      // Send text to pipeline...
    } catch(e) { console.error('Agent STT error', e); }
  }
  
  createWavHeader(dataLen, sampleRate, numChannels, bitsPerSample) {
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(dataLen + 36, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataLen, 40);
    return header;
  }
  
  reset() {
    this.frames = [];
    this.silenceFrames = 0;
    this.isSpeaking = false;
  }
}
