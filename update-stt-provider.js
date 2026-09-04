const fs = require('fs');
let code = fs.readFileSync('server/src/services/providers/stt/ElevenLabsSTTProvider.js', 'utf8');
code = code.replace(/filename: 'audio\.wav',/g, "filename: 'audio.webm',");
code = code.replace(/contentType: 'audio\/wav',/g, "contentType: 'audio/webm',");
fs.writeFileSync('server/src/services/providers/stt/ElevenLabsSTTProvider.js', code);
