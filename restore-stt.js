const fs = require('fs');
let code = fs.readFileSync('server/src/services/aiTranslationService.js', 'utf8');

const regex = /\/\/ 1\. LLM Meaning-First Translation \(Context-Aware\)[\s\S]*?let translatedText = await geminiLLM\.translate\(textToTranslate, sourceLang, targetLang, contextHistory, audioBuffer\);/m;

const replacement = `// If we received raw audio instead of text, we pass it to STT here.
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
      let translatedText = await geminiLLM.translate(textToTranslate, sourceLang, targetLang, contextHistory);`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/src/services/aiTranslationService.js', code);
