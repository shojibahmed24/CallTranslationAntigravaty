const fs = require('fs');
const file = 'server/src/services/livekitAgentService.js';
let content = fs.readFileSync(file, 'utf8');

// Replace hardcoded 48000 with frame sample rate in VAD logic
const regex = /wavHeader\.writeUInt32LE\(48000, 24\);.*?wavHeader\.writeUInt32LE\(48000 \* 2, 28\);/s;
const replacement = `const sampleRate = frame.sampleRate || 48000;
                const numChannels = frame.numChannels || 1;
                wavHeader.writeUInt32LE(sampleRate, 24);
                wavHeader.writeUInt32LE(sampleRate * 2 * numChannels, 28);`;

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log('Fixed WAV header sample rate');
} else {
  console.log('Regex 1 failed');
}
