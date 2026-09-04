const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');

// Add activeCallRef
code = code.replace(
  /const socketRef = useRef\(null\);/,
  "const socketRef = useRef(null);\n  const activeCallRef = useRef(null);"
);

// Keep activeCallRef in sync
code = code.replace(
  /setActiveCall\((.*?)\);/g,
  "setActiveCall($1);\n    activeCallRef.current = $1;"
);
code = code.replace(
  /setActiveCall\(null\);/g,
  "setActiveCall(null);\n      activeCallRef.current = null;"
);

// Prevent playback if call ended
code = code.replace(
  /const playTranslatedVoice = async \(base64Audio, fallbackText, lang\) => \{/,
  "const playTranslatedVoice = async (base64Audio, fallbackText, lang) => {\n    if (!activeCallRef.current) return; // Ignore delayed audio if call is ended\n"
);

fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
