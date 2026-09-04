const fs = require('fs');
const file = 'native-app/src/context/ChatContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Supabase subscription with Socket.io subscription
const regex = /const messageSubscription = supabase[\s\S]*?supabase\.removeChannel\(messageSubscription\);/m;
const replacement = `
    if (!socket) return;
    const handleNewMessage = (newMsg) => {
      setChatMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
    };
    
    socket.on('message:received', handleNewMessage);
    
    return () => {
      socket.off('message:received', handleNewMessage);
`;

content = content.replace(regex, replacement);

// Remove the direct supabase insert in `sendMessage`
content = content.replace(
  /if \(user\) \{\s*supabase\.from\('messages'\)\.insert\([\s\S]*?\}\)\.then\(\);\s*\}/g,
  ''
);

fs.writeFileSync(file, content);
console.log('Fixed Database Security RLS in ChatContext');
