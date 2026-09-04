const fs = require('fs');
let code = fs.readFileSync('server/src/services/providers/llm/GeminiLLMProvider.js', 'utf8');

code = code.replace(/model: "gemini-1\.5-flash"/, 'model: "gemini-1.5-flash-latest"');

fs.writeFileSync('server/src/services/providers/llm/GeminiLLMProvider.js', code);
