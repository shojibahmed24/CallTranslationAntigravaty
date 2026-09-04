const fs = require('fs');
const file = 'native-app/app/call/[id].tsx';
let content = fs.readFileSync(file, 'utf8');

// The file still has startVADRecording because the regex failed or matched incorrectly.
// Let's replace the whole expo-av recording block up to the useEffect manually.
const matchStart = 'const [recording, setRecording] = React.useState<any>(null);';
const matchEnd = 'if (Platform.OS !== \'web\') updateAudioMode();';
const startIdx = content.indexOf(matchStart);
const endIdx = content.indexOf(matchEnd);
if (startIdx !== -1 && endIdx !== -1) {
  content = content.slice(0, startIdx) + content.slice(endIdx + matchEnd.length);
  fs.writeFileSync(file, content);
  console.log('Sliced out expo-av block');
} else {
  // Let's just remove specific variable declarations and references that cause errors.
  content = content.replace(/isTranslatingLocal/g, 'false');
  content = content.replace(/startVADRecording\(\);/g, '');
  content = content.replace(/processAndRestartRecording\(newRecording\);/g, '');
  
  // Fix comma error around line 359
  // We'll just run prettier or fix it manually if we can find it.
  fs.writeFileSync(file, content);
  console.log('Fixed undefined variables by replacing them');
}
