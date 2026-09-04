const fs = require('fs');
let code = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');

code = code.replace(/callerLang: res\.call\.caller_lang,\n\s*receiverLang: res\.call\.receiver_lang,\n\s*peer: peerUser,/m, 
`callerLang: res.call.caller_lang,
          receiverLang: res.call.receiver_lang,
          isTranslated: res.call.is_translated,
          peer: peerUser,`);

// Also fix the call:offer payload to send isTranslated properly
code = code.replace(/isTranslated: res\.isTranslated,/m, 'isTranslated: res.call.is_translated,');

fs.writeFileSync('mobile/src/context/CallContext.jsx', code);
