const fs = require('fs');
const file = 'server/src/controllers/callController.js';
let content = fs.readFileSync(file, 'utf8');

const regex = /const \{ data: receiver.*? = await supabase.*?\.eq\('id', receiverId\)\.single\(\);/m;
const replacement = "const { data: receiver, error: receiverErr } = await supabase.from('users').select('id, name, caller_lang, expo_push_token, voip_push_token').eq('id', receiverId).single();";
content = content.replace(regex, replacement);

const regex2 = /sendPushNotification\([\s\S]*?\{ type: 'incoming_call'[\s\S]*?\}\s*\);/m;
const replacement2 = `sendPushNotification(
          receiver.expo_push_token, 
          'Incoming Call', 
          caller.name + ' is calling you via Unicom.',
          { type: 'incoming_call', callId: newCall.id, callerId: caller.id, callerName: caller.name },
          receiver.voip_push_token
        );`;
content = content.replace(regex2, replacement2);

fs.writeFileSync(file, content);
console.log('Updated callController for VoIP');
