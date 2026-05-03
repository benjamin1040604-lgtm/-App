const CACHE_NAME = 'qiantu-v1';
 
// 需要快取的檔案（改成你實際的檔案名稱）
const FILES_TO_CACHE = [
  './',
  './game_v3__1_.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];
 
// 安裝：把所有檔案存到快取
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});
 
// 啟動：清除舊版快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});
 
// 攔截請求：優先用快取，沒有才連網
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
 