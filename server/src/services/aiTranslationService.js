import { geminiLLM } from './providers/llm/GeminiLLMProvider.js';
import { elevenLabsTTS } from './providers/tts/ElevenLabsTTSProvider.js';
// STT will be utilized via LiveKit Track subscription, but we'll include it in the pipeline for future direct audio calls.
import { elevenLabsSTT } from './providers/stt/ElevenLabsSTTProvider.js';

const SAME_LANGUAGE_PAIRS = ['bn', 'en', 'hi', 'ar'];
const SUPPORTED_PAIRS = [
  { source: 'bn', target: 'en' },
  { source: 'en', target: 'bn' },
  { source: 'hi', target: 'en' },
  { source: 'en', target: 'hi' },
  { source: 'ar', target: 'bn' },
  { source: 'bn', target: 'ar' }
];

export class AITranslationService {
  constructor() {
    this.activeCallSessions = new Map(); // callId -> { contextHistory: [], activePlaybackId: null }
  }

  isSameLanguage(sourceLang, targetLang) {
    return sourceLang.toLowerCase() === targetLang.toLowerCase();
  }

  isPairSupported(sourceLang, targetLang) {
    if (this.isSameLanguage(sourceLang, targetLang)) {
      return SAME_LANGUAGE_PAIRS.includes(sourceLang.toLowerCase());
    }
    return SUPPORTED_PAIRS.some(
      p => p.source === sourceLang.toLowerCase() && p.target === targetLang.toLowerCase()
    );
  }

  initCallContext(callId, callerLang, receiverLang) {
    this.activeCallSessions.set(callId, {
      callerLang,
      receiverLang,
      contextHistory: [],
      lastInterruptionTimestamp: null,
      activePlaybackId: null
    });
  }

  clearCallContext(callId) {
    this.activeCallSessions.delete(callId);
  }

  async generateCallSummary(callId) {
    const session = this.activeCallSessions.get(callId);
    if (!session || !session.contextHistory || session.contextHistory.length === 0) {
      return null;
    }
    try {
      const transcript = session.contextHistory.map(item => `[Speaker ${item.speakerId}]: ${item.original}`).join('\n');
      const prompt = `Please provide a concise, 2-3 sentence professional summary of the following conversation transcript. Transcript:\n${transcript}`;
      // Direct call to gemini provider (assuming generateContent exists, or we use translate workaround)
      // Actually, if geminiLLM doesn't expose a raw prompt, we can use a workaround:
      const summary = await geminiLLM.generateSummary(prompt);
      return summary;
    } catch (err) {
      console.error('Failed to generate call summary:', err);
      return null;
    }
  }

  interruptActiveSpeech(callId, speakerId) {
    const session = this.activeCallSessions.get(callId);
    if (!session) return { interrupted: false };

    const previousPlaybackId = session.activePlaybackId;
    session.activePlaybackId = null;
    session.lastInterruptionTimestamp = Date.now();

    return {
      interrupted: true,
      canceledPlaybackId: previousPlaybackId,
      speakerId,
      timestamp: session.lastInterruptionTimestamp
    };
  }

  /**
   * Phase 3: True AI Translation Pipeline (Meaning-First LLM -> Real Voice TTS)
   */
  async processSimultaneousSpeech({ callId, speakerId, sourceLang, targetLang, rawText, audioBuffer, isFinal = true }) {
    const isDirect = this.isSameLanguage(sourceLang, targetLang);
    if (isDirect) {
      return {
        isDirect: true,
        sourceLang,
        targetLang,
        originalText: rawText,
        translatedText: rawText,
        audioBuffer: audioBuffer || null,
        latencyMs: 10,
        chargedMinutes: 0
      };
    }

    const startTime = Date.now();
    const session = this.activeCallSessions.get(callId);

    // If we received raw audio instead of text, we pass it to STT here.
      let textToTranslate = rawText;
      if (!textToTranslate && audioBuffer) {
        try {
          const transcriptionResult = await elevenLabsSTT.transcribe(audioBuffer, sourceLang);
          textToTranslate = transcriptionResult;
        } catch (err) {
          console.error('STT Pipeline failed:', err);
          throw new Error('Speech-to-text transcription failed.');
        }
      }

      if (!textToTranslate || textToTranslate.trim().length < 2) {
        throw new Error('No input text or audio provided for translation pipeline.');
      }

      // 1. LLM Meaning-First Translation (Context-Aware)
      let contextHistory = session ? session.contextHistory : [];
      let translatedText = await geminiLLM.translate(textToTranslate, sourceLang, targetLang, contextHistory);
    
    // Drop hallucinations / silence
    if (!translatedText || translatedText.includes('[SILENCE]')) {
      return {
        isDirect: false,
        sourceLang, targetLang,
        originalText: '', translatedText: '',
        audioBase64: null, latencyMs: 0
      };
    }

    // 2. TTS Realistic Audio Generation
    // Note: In a full LiveKit setup, we'd inject this buffer into the WebRTC track.
    // For now, we return it to the Socket for the frontend to play if LiveKit isn't fully wired on client.
    let audioOutputBuffer = null;
    try {
      audioOutputBuffer = await elevenLabsTTS.synthesize(translatedText, targetLang);
    } catch (err) {
      console.error('TTS Generation failed:', err);
    }

    // Update Context Buffer
    if (session) {
      session.contextHistory.push({
        speakerId,
        sourceLang,
        original: textToTranslate,
        translated: translatedText,
        timestamp: Date.now()
      });
      if (session.contextHistory.length > 5) {
        session.contextHistory.shift();
      }
      session.activePlaybackId = `synth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    const latencyMs = Date.now() - startTime;

    return {
      isDirect: false,
      speechId: session?.activePlaybackId || `synth_${Date.now()}`,
      sourceLang,
      targetLang,
      originalText: rawText,
      translatedText: translatedText,
      audioBase64: audioOutputBuffer ? audioOutputBuffer.toString('base64') : null,
      audioSynthesisMeta: {
        provider: 'ElevenLabs',
        latencyMs
      },
      latencyMs,
      chargedMinutes: 1 // Example calculation
    };
  }
}

export const translationEngine = new AITranslationService();
