class STTProvider {
  /**
   * Initializes the STT connection.
   */
  async connect() {
    throw new Error('Not implemented');
  }

  /**
   * Sends audio data to the STT service.
   * @param {Buffer} audioBuffer - The audio chunk to transcribe.
   */
  sendAudio(audioBuffer) {
    throw new Error('Not implemented');
  }

  /**
   * Registers a callback for when transcription text is received.
   * @param {Function} callback - (text, isFinal) => void
   */
  onTranscription(callback) {
    throw new Error('Not implemented');
  }

  /**
   * Closes the STT connection.
   */
  disconnect() {
    throw new Error('Not implemented');
  }
}

export default STTProvider;
