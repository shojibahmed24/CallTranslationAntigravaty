const fs = require('fs');

// 1. Fix backend callController.js
let callCode = fs.readFileSync('server/src/controllers/callController.js', 'utf8');
callCode = callCode.replace(
  /minutesToCharge = Number\(\(durationSeconds \/ 60\)\.toFixed\(2\)\);/g,
  "minutesToCharge = Math.ceil(durationSeconds / 60);"
);
fs.writeFileSync('server/src/controllers/callController.js', callCode);

// 2. Fix frontend CallContext.jsx
let ctxCode = fs.readFileSync('mobile/src/context/CallContext.jsx', 'utf8');
ctxCode = ctxCode.replace(
  /try \{\s*await api\.endCall\(activeCall\.id, callDuration, callLatency\);\s*if \(socketRef\.current\) \{\s*socketRef\.current\.emit\('call:end', \{\s*callId: activeCall\.id,\s*peerId: activeCall\.peer\?\.id,\s*durationSeconds: callDuration,\s*avgLatencyMs: callLatency\s*\}\);\s*\}\s*refreshUser\(\);\s*\} catch \(err\) \{\s*console\.error\(err\);\s*\}/,
  `try {
        await api.endCall(activeCall.id, callDuration, callLatency);
      } catch (err) {
        console.error('Failed to end call in backend:', err);
      } finally {
        if (socketRef.current) {
          socketRef.current.emit('call:end', {
            callId: activeCall.id,
            peerId: activeCall.peer?.id,
            durationSeconds: callDuration,
            avgLatencyMs: callLatency
          });
        }
        refreshUser();
      }`
);
fs.writeFileSync('mobile/src/context/CallContext.jsx', ctxCode);
