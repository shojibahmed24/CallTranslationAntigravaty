const fs = require('fs');
const file = 'native-app/src/context/ChatContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Supabase subscription with Socket.io subscription
content = content.replace(
  /const messageSubscription = supabase[\s\S]*?supabase\.removeChannel\(messageSubscription\);/m,
  `// Listen to Socket.IO instead of Supabase to respect RLS
    const handleNewMessage = (newMsg) => {
      setChatMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
      // Acknowledge read if chat is open
      const { socket } = require('./CallContext').useCall();
      if (socket) {
        socket.emit('message:read', { messageIds: [newMsg.id], senderId: newMsg.sender_id });
      }
    };
    
    // We assume the socket is available via a global event or we can just fetch it
    // Wait, in this app, Socket is in CallContext. 
    // We should probably just subscribe to the event if we can.
    // Actually, ChatContext doesn't have socket directly. Let's look at the imports.`
);

fs.writeFileSync(file, content);
