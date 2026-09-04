const fs = require('fs');
let code = fs.readFileSync('server/src/services/aiTranslationService.js', 'utf8');

const regex = /\/\/ If we received raw audio instead of text, we pass it to STT here\.[\s\S]*?\/\/ 1\. LLM Meaning-First Translation \(Context-Aware\)/m;

const replacement = `// 1. LLM Meaning-First Translation (Context-Aware)
    // We now send audioBuffer DIRECTLY to Gemini 1.5 Flash for multimodal translation!
    let textToTranslate = rawText;`;

code = code.replace(regex, replacement);

const regex2 = /let translatedText = await geminiLLM\.translate\(textToTranslate, sourceLang, targetLang, contextHistory\);/m;
const replacement2 = `let translatedText = await geminiLLM.translate(textToTranslate, sourceLang, targetLang, contextHistory, audioBuffer);
    
    // Drop hallucinations / silence
    if (!translatedText || translatedText.includes('[SILENCE]')) {
      return {
        isDirect: false,
        sourceLang, targetLang,
        originalText: '', translatedText: '',
        audioBase64: null, latencyMs: 0
      };
    }`;

code = code.replace(regex2, replacement2);

fs.writeFileSync('server/src/services/aiTranslationService.js', code);
