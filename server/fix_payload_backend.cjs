const fs = require('fs');
let file = 'src/socket/socketHandler.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    socket.on('call:speech_input', async ({ callId, speakerId, peerId, sourceLang, targetLang, rawText, audioBuffer, isFinal = true }) => {
      speakerId = socket.user.id; // Enforce authenticated speaker
      try {
        const result = await translationEngine.processSimultaneousSpeech({
          callId,
          speakerId,
          sourceLang,
          targetLang,
          rawText,
          audioBuffer,
          isFinal
        });`;

const replaceStr = `    socket.on('call:speech_input', async ({ callId, speakerId, peerId, sourceLang, targetLang, rawText, audioBuffer, audioBase64, isFinal = true }) => {
      speakerId = socket.user.id; // Enforce authenticated speaker
      try {
        // Convert audioBase64 to Buffer if sent from frontend
        let finalAudioBuffer = audioBuffer;
        if (!finalAudioBuffer && audioBase64) {
          finalAudioBuffer = Buffer.from(audioBase64, 'base64');
        }

        const result = await translationEngine.processSimultaneousSpeech({
          callId,
          speakerId,
          sourceLang,
          targetLang,
          rawText,
          audioBuffer: finalAudioBuffer,
          isFinal
        });`;

if (content.includes("socket.on('call:speech_input'")) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(file, content);
  console.log('Fixed call:speech_input payload handler in backend');
}
