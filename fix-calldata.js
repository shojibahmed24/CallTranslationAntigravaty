const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');

const regex = /const callData = \{\n\s*\.\.\.res\.call,\n\s*peer: peerUser,\n\s*livekitToken: res\.livekitToken\n\s*\};/m;

const replacement = `const callData = {
          ...res.call,
          id: res.call.id,
          callerId: res.call.caller_id,
          receiverId: res.call.receiver_id,
          callerLang: res.call.caller_lang,
          receiverLang: res.call.receiver_lang,
          peer: peerUser,
          livekitToken: res.livekitToken
        };`;

code = code.replace(regex, replacement);
fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
