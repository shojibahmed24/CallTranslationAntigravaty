import { DeepgramClient } from '@deepgram/sdk';

class DeepgramSTTProvider {
  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY;
    if (this.apiKey) {
      this.client = new DeepgramClient({ token: this.apiKey });
    }
  }

  /**
   * Initializes a live streaming STT connection.
   */
  async createLiveStream(language = 'en-US') {
    if (!this.client) {
      throw new Error('Deepgram API Key is missing.');
    }

    const live = await this.client.listen.v1.connect({
      model: 'nova-2',
      language: language,
      smart_format: "true",
      interim_results: "true",
      endpointing: 300 // 300ms pause triggers endpoint
    });

    return live;
  }

  /**
   * Transcribes a single audio buffer.
   */
  async transcribe(audioBuffer, language = 'en-US') {
    if (!this.client) {
      throw new Error('Deepgram API Key is missing.');
    }

    try {
      const { result, error } = await this.client.listen.v1.transcribeFile(
        audioBuffer,
        {
          model: 'nova-2',
          language: language,
          smart_format: true,
        }
      );
      
      if (error) throw error;
      
      const transcript = result?.results?.channels[0]?.alternatives[0]?.transcript || '';
      return transcript;
    } catch (err) {
      console.error('Deepgram transcription error:', err);
      throw err;
    }
  }
}

export const deepgramSTT = new DeepgramSTTProvider();
