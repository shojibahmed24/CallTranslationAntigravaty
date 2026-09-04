import { api } from './api';

export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported by the browser.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      console.log('Already subscribed to push notifications.');
      return;
    }

    // Get VAPID public key from server
    const response = await api.request('/push/public-key');
    if (!response.success) {
      throw new Error('Failed to fetch VAPID public key.');
    }
    
    const convertedVapidKey = urlBase64ToUint8Array(response.publicKey);

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    // Send the subscription to the backend
    await api.request('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription })
    });

    console.log('Push notification subscription successful.');
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Utility function to convert VAPID public key for PushManager
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
