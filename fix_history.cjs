const fs = require('fs');
const file = 'server/src/services/aiTranslationService.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("original: rawText,", "original: textToTranslate,");

fs.writeFileSync(file, content);
console.log('Fixed contextHistory tracking in aiTranslationService');
