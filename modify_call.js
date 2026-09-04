const fs = require('fs');
let content = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');

content = content.replace(
  'const startVoiceCall = async (peerUser) => {',
  'const startVoiceCall = async (peerUser, isVideo = false) => {'
);

content = content.replace(
  'const callData = {\n          ...res.call,',
  'const callData = {\n          ...res.call,\n          isVideo,'
);

const aliasCode = `
  const startVideoCall = async (peerUser) => {
    return startVoiceCall(peerUser, true);
  };
`;
content = content.replace(
  'const acceptIncomingCall = async () => {',
  aliasCode + '\n  const acceptIncomingCall = async () => {'
);

content = content.replace(
  'startVoiceCall,',
  'startVoiceCall,\n          startVideoCall,'
);

content = content.replace(
  'socketRef.current.emit(\'call:offer\', {\n        callId: res.call.id,',
  'socketRef.current.emit(\'call:offer\', {\n        callId: res.call.id,\n        isVideo,'
);

fs.writeFileSync('mobile/src/context/CallContext.jsx', content);
