class LLMProvider {
  /**
   * Translates text with context awareness.
   * @param {string} text - The transcribed text phrase.
   * @param {string} sourceLang - The source language code.
   * @param {string} targetLang - The target language code.
   * @param {Array} contextHistory - Previous translated phrases for context.
   * @returns {Promise<string>} The translated text.
   */
  async translate(text, sourceLang, targetLang, contextHistory = []) {
    throw new Error('Not implemented');
  }
}

export default LLMProvider;
