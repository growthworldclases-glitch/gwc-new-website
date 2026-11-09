/* GWC V30 Service Worker: background Web Push notifications */
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'Growth World Classes';
  const options = { body: data.body || 'Aapko naya message mila hai.', icon: '/favicon.ico', badge: '/favicon.ico', tag: data.tag || 'gwc-background-push', renotify: true, data: { url: data.url || '/' } };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const client of list) if (client.url.startsWith(self.location.origin) && 'focus' in client) { client.navigate(target); return client.focus(); }
    return clients.openWindow ? clients.openWindow(target) : undefined;
  }));
});
