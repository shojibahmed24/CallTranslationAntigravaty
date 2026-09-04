const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');

const regex = /const speakInCall = \(text, audioBuffer = null\) => \{[\s\S]*?rawText: text \? text\.trim\(\) : '',\s*audioBuffer,\s*isFinal: true\s*\}\);\s*\};/m;

const replacement = `const speakInCall = useCallback((text, audioBuffer = null) => {
    if (!activeCallRef.current || (!text?.trim() && !audioBuffer)) return;

    setTranslationStatus('interpreting');

    const sourceLang = user.id === activeCallRef.current.callerId ? activeCallRef.current.callerLang : activeCallRef.current.receiverLang;
    const targetLang = user.id === activeCallRef.current.callerId ? activeCallRef.current.receiverLang : activeCallRef.current.callerLang;

    socketRef.current.emit('call:speech_input', {
      callId: activeCallRef.current.id,
      speakerId: user.id,
      peerId: activeCallRef.current.peer.id,
      sourceLang,
      targetLang,
      rawText: text ? text.trim() : '',
      audioBuffer,
      isFinal: true
    });
  }, [user]);`;

code = code.replace(regex, replacement);

if (!code.includes('useCallback')) {
  code = code.replace(/import React, \{ createContext, useContext, useState, useEffect, useRef \} from 'react';/, "import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';");
}

// Also fix Sadaf's activeCallRef issue!
code = code.replace(/setActiveCall\(\{\n\s*id: incomingCall\.callId,\n\s*callerId: incomingCall\.caller\.id,\n\s*receiverId: user\.id,\n\s*callerLang: incomingCall\.callerLang,\n\s*receiverLang: incomingCall\.receiverLang,\n\s*isTranslated: incomingCall\.isTranslated,\n\s*peer: incomingCall\.caller,\n\s*livekitToken: res\.livekitToken\n\s*\}\);/m, 
`const callData = {
          id: incomingCall.callId,
          callerId: incomingCall.caller.id,
          receiverId: user.id,
          callerLang: incomingCall.callerLang,
          receiverLang: incomingCall.receiverLang,
          isTranslated: incomingCall.isTranslated,
          peer: incomingCall.caller,
          livekitToken: res.livekitToken
        };
        setActiveCall(callData);
        activeCallRef.current = callData;`);

fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
