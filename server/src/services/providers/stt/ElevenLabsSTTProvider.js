import axios from 'axios';
import FormData from 'form-data';

class ElevenLabsSTTProvider {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
  }

  /**
   * Transcribes a single audio buffer using ElevenLabs Scribe v2.
   */
  async transcribe(audioBuffer, language = 'eng') {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API Key is missing for STT.');
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBuffer, {
        filename: 'audio.wav',
        contentType: 'audio/wav',
      });
      formData.append('model_id', 'scribe_v1'); // ElevenLabs scribe

      const response = await axios.post(
        'https://api.elevenlabs.io/v1/speech-to-text',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'xi-api-key': this.apiKey,
          },
        }
      );

      return response.data.text || '';
    } catch (err) {
      console.error('ElevenLabs STT transcription error:', err.response?.data || err.message);
      throw err;
    }
  }
}

export const elevenLabsSTT = new ElevenLabsSTTProvider();
