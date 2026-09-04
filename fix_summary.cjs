const fs = require('fs');
const file = 'server/src/socket/socketHandler.js';
let content = fs.readFileSync(file, 'utf8');

// Inject import
if (!content.includes("translationEngine")) {
  content = "const { translationEngine } = require('../services/aiTranslationService.js');\n" + content;
}

// In call:answer, inject initCallContext
const answerRegex = /livekitAgent\.joinCallAsBot\(callId, callerId, receiverId, callerLang, receiverLang, io, userSocketMap\);/;
const answerReplacement = `livekitAgent.joinCallAsBot(callId, callerId, receiverId, callerLang, receiverLang, io, userSocketMap);
        translationEngine.initCallContext(callId, callerLang, receiverLang);`;
content = content.replace(answerRegex, answerReplacement);

// In call:end, generate summary and send message
const endRegex = /socket\.on\('call:end', async \(\{ callId, peerId, durationSeconds, avgLatencyMs \}\) => \{[\s\S]*?\}\);/;
const endReplacement = `socket.on('call:end', async ({ callId, peerId, durationSeconds, avgLatencyMs }) => {
        if (activeCallTimeouts.has(callId)) {
          clearTimeout(activeCallTimeouts.get(callId));
          activeCallTimeouts.delete(callId);
        }
        
        const peerSocketId = userSocketMap.get(peerId);
        if (peerSocketId) {
          io.to(peerSocketId).emit('call:ended', { callId, durationSeconds });
        }
        
        // Generate Call Summary
        try {
          const summary = await translationEngine.generateCallSummary(callId);
          if (summary) {
            // Find chat ID
            const myId = socket.user.id;
            const { data: chats } = await supabase.rpc('get_direct_chat', { user1: myId, user2: peerId });
            let chatId;
            if (chats && chats.length > 0) {
              chatId = chats[0].id;
            } else {
              const { data: existingChat } = await supabase.from('chats')
                .select('id')
                .or(\`and(participant1_id.eq.\${myId},participant2_id.eq.\${peerId}),and(participant1_id.eq.\${peerId},participant2_id.eq.\${myId})\`)
                .single();
              if (existingChat) chatId = existingChat.id;
            }
            
            if (chatId) {
              const { data: newMsg } = await supabase.from('messages').insert({
                chat_id: chatId,
                sender_id: myId, // System generated but assigned to caller for now
                text: "📞 Call Summary (" + Math.floor((durationSeconds || 0)/60) + "m " + ((durationSeconds || 0)%60) + "s):\\n\\n" + summary,
                type: 'text'
              }).select().single();
              
              if (newMsg) {
                io.to(peerSocketId).emit('message:received', newMsg);
                socket.emit('message:received', newMsg);
              }
            }
          }
          translationEngine.clearCallContext(callId);
        } catch (e) {
          console.error('Call Summary Error:', e);
        }
      });`;
content = content.replace(endRegex, endReplacement);
fs.writeFileSync(file, content);
console.log('Injected Call Summary in socketHandler');
