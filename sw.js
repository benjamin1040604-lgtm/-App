const CACHE_NAME = 'qiantu-v1';

const FILES_TO_CACHE = [
  './',
  './game_v3(05.03).html',
  './manifest.json',
  './android-chrome-192x192.png',
  './android-chrome-512x512.png'
];

// ─── 安裝 ───
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// ─── 啟動 ───
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── 快取攔截 ───
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});

// ─── 每天提醒記帳 ───
// 當 app 被打開時，前端會發訊息過來觸發檢查
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CHECK_DAILY_REMINDER') {
    checkAndNotify();
  }
});

async function checkAndNotify() {
  const now = new Date();
  const hour = now.getHours();
  const todayKey = `notified_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;

  // 只在晚上 8 點之後、還沒通知過今天的情況下發送
  const cache = await caches.open('qiantu-meta');
  const alreadyNotified = await cache.match(todayKey);

  if (hour >= 20 && !alreadyNotified) {
    // 記錄今天已通知
    await cache.put(todayKey, new Response('1'));

    // 發送通知
    self.registration.showNotification('💰 錢途無量', {
      body: '今天還沒記帳喔！花了什麼都記下來，錢途無量 🚀',
      icon: './android-chrome-192x192.png',
      badge: './android-chrome-192x192.png',
      tag: 'daily-reminder',
      renotify: false,
      data: { url: './game_v3(05.03).html' }
    });
  }
}

// ─── 點通知後開啟 app ───
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./game_v3(05.03).html');
    })
  );
});