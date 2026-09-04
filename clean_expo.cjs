const fs = require('fs');
const file = 'native-app/app/call/[id].tsx';
let content = fs.readFileSync(file, 'utf8');

// We will just remove the entire block related to recording to avoid any mic locks
content = content.replace(/const \[recording, setRecording\] = React\.useState<any>\(null\);[\s\S]*?if \(Platform\.OS !== 'web'\) updateAudioMode\(\);/s, '');

fs.writeFileSync(file, content);
console.log('Cleaned up expo-av logic');
