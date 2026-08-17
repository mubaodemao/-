/* 今天起飞不起飞 —— Service Worker（离线可用 + 自动更新） */
const CACHE = 'lfq-v18';
const ASSETS = [
  './',
  './index.html',
  './checkin.html',
  './report.html',
  './settings.html',
  './css/style.css',
  './js/main.js',
  './js/music.js',
  './js/checkin.js',
  './js/calendar.js',
  './js/settings.js',
  './js/sound.js',
  './js/report.js',
  './manifest.json',
  './assets/bg.jpg',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* stale-while-revalidate：先给缓存（秒开），同时后台拉新版本更新缓存 */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const networkFetch = fetch(e.request).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || caches.match('./index.html'));
      return cached || networkFetch;
    })
  );
});
