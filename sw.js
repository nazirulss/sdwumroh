const CACHE_NAME = 'sdw-umroh-pwa-v1';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/paket.html',
  '/jadwal.html',
  '/kalkulator.html',
  '/ziarah.html',
  '/tentang.html',
  '/faq.html',
  '/app.html',
  '/manifest.json',
  '/css/styles.min.css',
  '/assets/sdw-logo.png',
  '/assets/hero-twilight.jpg',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/js/pwa.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[PWA SW] Pre-caching some assets failed:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya proses request GET http/https
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Network-first strategy: ambil dari internet dulu, jika offline baru ambil dari cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Jika offline, fallback ke cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Jika navigasi halaman dan tidak ada di cache, arahkan ke index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
