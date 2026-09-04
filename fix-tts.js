const fs = require('fs');
let code = fs.readFileSync('server/src/services/providers/tts/ElevenLabsTTSProvider.js', 'utf8');

const regex = /async synthesize\(text, language = 'en'\) \{[\s\S]*?\}/;

const replacement = `async synthesize(text, language = 'en') {
    try {
      // Use free Google TTS API to bypass ElevenLabs Payment Error
      const url = \`https://translate.google.com/translate_tts?ie=UTF-8&q=\${encodeURIComponent(text)}&tl=\${language}&client=tw-ob\`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Google TTS API error');
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (err) {
      console.error('TTS error:', err);
      return null;
    }
  }`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/src/services/providers/tts/ElevenLabsTTSProvider.js', code);
