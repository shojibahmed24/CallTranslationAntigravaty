const fs = require('fs');
let code = fs.readFileSync('server/src/services/aiTranslationService.js', 'utf8');
code = code.replace(/let contextHistory = session \? session\.contextHistory : \[\];\\n      let translatedText = await geminiLLM\.translate\(textToTranslate, sourceLang, targetLang, contextHistory\);/g, `let contextHistory = session ? session.contextHistory : [];\n      let translatedText = await geminiLLM.translate(textToTranslate, sourceLang, targetLang, contextHistory);`);
fs.writeFileSync('server/src/services/aiTranslationService.js', code);
