const fs = require('fs');
let code = fs.readFileSync('server/src/socket/socketHandler.js', 'utf8');

const regex = /socket\.on\('call:answer', \(\{ callId, callerId \}\) => \{[\s\S]*?\}\);/;

const replacement = `socket.on('call:answer', ({ callId, callerId }) => {
        console.log('[DEBUG] call:answer received', { callId, callerId });
        const callerSocketId = userSocketMap.get(callerId);
        console.log('[DEBUG] callerSocketId found:', callerSocketId);
        if (callerSocketId) {
          io.to(callerSocketId).emit('call:connected', { callId });
          console.log('[DEBUG] call:connected emitted to', callerSocketId);
        } else {
          console.log('[DEBUG] Error: callerSocketId not found in userSocketMap for callerId', callerId);
          console.log('[DEBUG] Current userSocketMap:', Array.from(userSocketMap.entries()));
        }
      });`;

code = code.replace(regex, replacement);
fs.writeFileSync('server/src/socket/socketHandler.js', code);
