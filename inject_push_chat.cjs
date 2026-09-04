const fs = require('fs');
const file = 'server/src/controllers/chatController.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('sendPushNotification')) {
  content = "const { sendPushNotification } = require('./pushController');\n" + content;
  
  // Find where receiver's push token is needed
  // chatController.sendMessage has:
  // const receiverQuery = await supabase.from('users').select('id, name').eq('id', receiverId).single();
  // Let's just find the exact line.
  
  // We can just append the push notification logic before `return res.json({ success: true, message: newMessage });`
  const successHook = "return res.json({\n        success: true,\n        message: newMessage\n      });";
  
  const notificationLogic = `
      // Send push notification to receiver if offline
      const { data: receiver } = await supabase.from('users').select('expo_push_token').eq('id', receiverId).single();
      if (receiver && receiver.expo_push_token) {
        sendPushNotification(
          receiver.expo_push_token,
          sender.name || 'New Message',
          text || 'Sent an attachment',
          { type: 'chat_message', senderId: sender.id, conversationId }
        );
      }
      
      return res.json({
        success: true,
        message: newMessage
      });`;
      
  content = content.replace(successHook, notificationLogic);
  
  fs.writeFileSync(file, content);
  console.log('Injected push notification to chatController');
}
