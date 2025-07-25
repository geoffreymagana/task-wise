import type { WebPushSubscription } from './types';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
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

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker support in this browser.');
  }
  await navigator.serviceWorker.register('/service-worker.js');
}

export async function subscribeToPush(): Promise<WebPushSubscription> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('No Service Worker support in this browser.');
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
  });
  return subscription.toJSON() as WebPushSubscription;
}

export async function getSubscription(): Promise<WebPushSubscription | null> {
    if (!('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription ? (subscription.toJSON() as WebPushSubscription) : null;
}
