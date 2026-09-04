const fs = require('fs');
let code = fs.readFileSync('mobile/src/screens/call/LiveCallScreen.jsx', 'utf8');

code = code.replace(
  /<RoomAudioRenderer \/>/g,
  "<RoomAudioRenderer volume={activeCall?.isTranslated ? 0 : 1} />"
);

fs.writeFileSync('mobile/src/screens/call/LiveCallScreen.jsx', code);
