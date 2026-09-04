// Using native Node 18+ fetch

class ElevenLabsTTSProvider {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'; // Rachel as fallback
  }

  /**
   * Converts text to an audio stream (buffer) using ElevenLabs API.
   * @param {string} text - The text to synthesize.
   * @param {string} language - Target language code.
   * @returns {Promise<Buffer>} The audio data (mp3).
   */
  async synthesize(text, language = 'en') {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key is missing. Cannot synthesize speech.');
    }

    try {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.defaultVoiceId}?output_format=mp3_44100_128`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2', // Multilingual model for i18n support
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      console.error('TTS error:', err);
      throw err; // Fail explicitly instead of returning null
    }
  }
}

export const elevenLabsTTS = new ElevenLabsTTSProvider();
