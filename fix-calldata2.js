const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');

const regex = /const callData = \{\s*\.\.\.res\.call,\s*peer: peerUser,\s*livekitToken: res\.livekitToken\s*\};/m;

const replacement = `const callData = {
        ...res.call,
        id: res.call.id,
        callerId: res.call.caller_id,
        receiverId: res.call.receiver_id,
        callerLang: res.call.caller_lang,
        receiverLang: res.call.receiver_lang,
        isTranslated: res.call.is_translated,
        peer: peerUser,
        livekitToken: res.livekitToken
      };`;

code = code.replace(regex, replacement);
fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
