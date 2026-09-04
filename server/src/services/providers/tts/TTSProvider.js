class TTSProvider {
  /**
   * Converts text to an audio stream.
   * @param {string} text - The text to synthesize.
   * @param {string} language - Target language code.
   * @returns {Promise<Buffer|Stream>} The audio data.
   */
  async synthesize(text, language) {
    throw new Error('Not implemented');
  }

  /**
   * Initializes or caches resources needed for TTS.
   */
  async initialize() {
    throw new Error('Not implemented');
  }
}

export default TTSProvider;
