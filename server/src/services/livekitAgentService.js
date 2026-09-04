import { Room, RoomEvent } from '@livekit/rtc-node';
import { AccessToken } from 'livekit-server-sdk';
import { translationEngine } from './aiTranslationService.js';
import { CONFIG } from '../config/index.js';

export class LiveKitAgentService {
  constructor() {
    this.wsUrl = process.env.LIVEKIT_WS_URL || 'wss://unicom-s74unm5v.livekit.cloud';
    this.apiKey = process.env.LIVEKIT_API_KEY || 'APIyNorAZzd7BfG';
    this.apiSecret = process.env.LIVEKIT_API_SECRET || 'la7KDNDtxUKqUm8weVJpCN44QtfKmiefjzJRpmgXfQaG';
  }

  async joinCallAsBot(callId, callerId, receiverId, callerLang, receiverLang, ioObj, userSocketMap) {
    if (!this.wsUrl) return;
    const room = new Room();
    
    // Maintain state per participant
    const participantState = new Map();
    const getState = (identity) => {
      if (!participantState.has(identity)) {
        participantState.set(identity, { frames: [], silenceFrames: 0, isSpeaking: false });
      }
      return participantState.get(identity);
    };

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      if (track.kind === 'audio') {
        track.on('audioFrame', async (frame) => {
          const state = getState(participant.identity);
          let maxAmp = 0;
          const view = new Int16Array(frame.data.buffer, frame.data.byteOffset, frame.data.byteLength / 2);
          for (let i = 0; i < view.length; i++) if (Math.abs(view[i]) > maxAmp) maxAmp = Math.abs(view[i]);
          
          if (maxAmp > 500) {
            state.isSpeaking = true;
            state.silenceFrames = 0;
            state.frames.push(Buffer.from(frame.data));
          } else if (state.isSpeaking) {
            state.frames.push(Buffer.from(frame.data));
            state.silenceFrames++;
            if (state.silenceFrames > 100) {
              const pcmData = Buffer.concat(state.frames);
              state.frames = [];
              state.silenceFrames = 0;
              state.isSpeaking = false;
              
              if (pcmData.length > 10000) {
                const wavHeader = Buffer.alloc(44);
                wavHeader.write('RIFF', 0);
                wavHeader.writeUInt32LE(pcmData.length + 36, 4);
                wavHeader.write('WAVE', 8);
                wavHeader.write('fmt ', 12);
                wavHeader.writeUInt32LE(16, 16);
                wavHeader.writeUInt16LE(1, 20);
                wavHeader.writeUInt16LE(1, 22);
                const sampleRate = frame.sampleRate || 48000;
                const numChannels = frame.numChannels || 1;
                wavHeader.writeUInt32LE(sampleRate, 24);
                wavHeader.writeUInt32LE(sampleRate * 2 * numChannels, 28);
                wavHeader.writeUInt16LE(2, 32);
                wavHeader.writeUInt16LE(16, 34);
                wavHeader.write('data', 36);
                wavHeader.writeUInt32LE(pcmData.length, 40);
                
                const finalAudio = Buffer.concat([wavHeader, pcmData]);
                
                const isCaller = participant.identity === callerId;
                const sourceLang = isCaller ? callerLang : receiverLang;
                const targetLang = isCaller ? receiverLang : callerLang;
                const peerId = isCaller ? receiverId : callerId;
                const peerSocketId = userSocketMap.get(peerId);
                
                try {
                  const result = await translationEngine.processSimultaneousSpeech({
                    callId,
                    speakerId: participant.identity,
                    sourceLang,
                    targetLang,
                    audioBuffer: finalAudio
                  });
                  
                  if (result && result.audioBase64 && ioObj && peerSocketId) {
                    ioObj.to(peerSocketId).emit('call:translated_audio', result);
                  }
                } catch(e) {}
              }
            }
          }
        });
      }
    });

    try {
      const at = new AccessToken(this.apiKey, this.apiSecret, {
        identity: `ai_bot_${callId}`,
        name: 'AI Translator',
      });
      at.addGrant({ roomJoin: true, room: callId, canPublish: false, canSubscribe: true });
      const token = await at.toJwt();
      
      await room.connect(this.wsUrl, token);
      console.log(`[Agent] Joined LiveKit room ${callId} successfully for Bidirectional translation`);
    } catch (e) {
      console.error(`[Agent] Failed to join room ${callId}:`, e.message);
    }
  }
}

export const livekitAgent = new LiveKitAgentService();
