import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from './api';
import { displayIncomingCall } from './CallKeepService';

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const data = notification.request.content.data;
    // If app is foregrounded and receives a call push, we might rely on Socket.io.
    // But if we want it to ring natively anyway:
    if (data && data.type === 'incoming_call') {
      displayIncomingCall(data.callId, data.callerName || 'Unknown', data.callerName || 'Caller');
    }
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    };
  },
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'bfa05d6f-23df-469b-89da-b4a1f33f1190',
      })).data;
      console.log('Expo Push Token:', token);
      
      await api.request('/users/push-token', { method: 'POST', body: JSON.stringify({ token }) });
    } catch (e) {
      console.error('Error fetching Expo Push Token:', e);
    }
  }

  return token;
};
