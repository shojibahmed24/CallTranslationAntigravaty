const fs = require('fs');
const file = 'native-app/src/context/ChatContext.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("setChatMessages(prev => {", "setMessages(prev => {");
// Also in handleNewMessage we need to update the specific chat array, not the whole state as an array
content = content.replace(
  /setMessages\(prev => \{\s*if \(prev\.find\(m => m\.id === newMsg\.id\)\) return prev;\s*return \[\.\.\.prev, newMsg\]\.sort\(\(a, b\) => new Date\(a\.created_at\)\.getTime\(\) - new Date\(b\.created_at\)\.getTime\(\)\);\s*\}\);/,
  `setMessages(prev => {
          const chatId = newMsg.chat_id;
          const chatMsgs = prev[chatId] || [];
          if (chatMsgs.find(m => m.id === newMsg.id)) return prev;
          const updatedMsgs = [...chatMsgs, newMsg].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); // sort desc
          const updatedState = { ...prev, [chatId]: updatedMsgs };
          storage.set('@chat_messages', JSON.stringify(updatedState));
          return updatedState;
        });`
);
fs.writeFileSync(file, content);
console.log('Fixed handleNewMessage');
