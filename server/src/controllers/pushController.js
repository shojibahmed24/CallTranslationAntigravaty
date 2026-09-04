const { Expo } = require('expo-server-sdk');
const apn = require('@parse/node-apn');
let expo = new Expo();

// You will need an APNs Auth Key (.p8 file) from the Apple Developer Portal
// Set these in your server/.env: APN_KEY_ID, APN_TEAM_ID, APN_BUNDLE_ID
let apnProvider;
try {
  apnProvider = new apn.Provider({
    token: {
      key: process.env.APN_AUTH_KEY || "path/to/AuthKey.p8",
      keyId: process.env.APN_KEY_ID || "key-id",
      teamId: process.env.APN_TEAM_ID || "team-id"
    },
    production: process.env.NODE_ENV === 'production'
  });
} catch (e) {
  console.log('APN Provider not initialized (missing keys)');
}

const sendPushNotification = async (pushToken, title, body, data, voipToken = null) => {
  // If it's a call and we have a iOS VoIP token, send via APNs
  if (data && data.type === 'incoming_call' && voipToken && apnProvider) {
    let note = new apn.Notification();
    note.topic = (process.env.APN_BUNDLE_ID || "com.unicom.app") + ".voip";
    note.payload = data;
    
    try {
      const result = await apnProvider.send(note, voipToken);
      console.log('VoIP Push result:', result);
    } catch (err) {
      console.error('VoIP Push Error:', err);
    }
  }

  // Also send standard Expo Push Notification (fallback or for chat/Android)
  if (Expo.isExpoPushToken(pushToken)) {
    const messages = [{
      to: pushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    }];
    try {
      let chunks = expo.chunkPushNotifications(messages);
      for (let chunk of chunks) {
        await expo.sendPushNotificationsAsync(chunk);
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }
};

module.exports = {
  sendPushNotification
};
