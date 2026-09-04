const fs = require('fs');
let code = fs.readFileSync('server/src/socket/socketHandler.js', 'utf8');

const regex = /socket\.on\('call:answer', \(\{ callId, callerId \}\) => \{[\s\S]*?\}\);\s*\}\s*\}\);\s*\/\/\ 3\./m;

// actually just replace the whole messed up block
code = code.replace(/socket\.on\('call:answer', \(\{ callId, callerId \}\) => \{[\s\S]*?\/\/\ 3\.\ Reject/m, 
`socket.on('call:answer', ({ callId, callerId }) => {
        console.log('[DEBUG] call:answer received', { callId, callerId });
        const callerSocketId = userSocketMap.get(callerId);
        console.log('[DEBUG] callerSocketId found:', callerSocketId);
        if (callerSocketId) {
          io.to(callerSocketId).emit('call:connected', { callId });
          console.log('[DEBUG] call:connected emitted to', callerSocketId);
        } else {
          console.log('[DEBUG] Error: callerSocketId not found in userSocketMap for callerId', callerId);
        }
      });

      // 3. Reject`);

fs.writeFileSync('server/src/socket/socketHandler.js', code);
