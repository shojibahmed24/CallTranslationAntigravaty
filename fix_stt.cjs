const fs = require('fs');
const file = 'server/src/services/providers/stt/ElevenLabsSTTProvider.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/filename:\s*'audio\.webm'/, "filename: 'audio.wav'");
content = content.replace(/contentType:\s*'audio\/webm'/, "contentType: 'audio/wav'");

fs.writeFileSync(file, content);
console.log('Fixed ElevenLabs STT Provider content type');
