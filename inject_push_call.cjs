const fs = require('fs');
const file = 'server/src/controllers/callController.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('sendPushNotification')) {
  content = "const { sendPushNotification } = require('./pushController');\n" + content;
  
  const receiverQuery = "const { data: receiver, error: receiverErr } = await supabase.from('users').select('id, name, caller_lang').eq('id', receiverId).single();";
  const newReceiverQuery = "const { data: receiver, error: receiverErr } = await supabase.from('users').select('id, name, caller_lang, expo_push_token').eq('id', receiverId).single();";
  
  content = content.replace(receiverQuery, newReceiverQuery);
  
  const callCreatedHook = "return res.json({\n        success: true,";
  const notificationLogic = `
      // Send push notification to receiver
      if (receiver.expo_push_token) {
        sendPushNotification(
          receiver.expo_push_token, 
          'Incoming Call', 
          caller.name + ' is calling you via Unicom.',
          { type: 'incoming_call', callId: newCall.id, callerId: caller.id, callerName: caller.name }
        );
      }
      return res.json({
        success: true,`;
        
  content = content.replace(callCreatedHook, notificationLogic);
  
  fs.writeFileSync(file, content);
  console.log('Injected push notification to callController');
}
