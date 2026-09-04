const fs = require('fs');
let code = fs.readFileSync('mobile/src/screens/call/LiveCallScreen.jsx', 'utf8');

// Update SpeechRecognition condition
code = code.replace(
  /if \(SpeechRecognition && activeCall && !isMuted\) \{/,
  "if (SpeechRecognition && activeCall && activeCall.isTranslated && !isMuted) {"
);

// Update LiveKitRoom audio prop
code = code.replace(
  /audio=\{!isMuted\}/g,
  "audio={!isMuted && !activeCall?.isTranslated}"
);

// Mute remote audio tracks explicitly if they somehow get through
code = code.replace(
  /<RoomAudioRenderer volume=\{activeCall\?\.isTranslated \? 0 : 1\} \/>/g,
  "<RoomAudioRenderer muted={activeCall?.isTranslated} />"
);
code = code.replace(
  /<RoomAudioRenderer \/>/g,
  "<RoomAudioRenderer muted={activeCall?.isTranslated} />"
);

fs.writeFileSync('mobile/src/screens/call/LiveCallScreen.jsx', code);
