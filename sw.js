const CACHE_NAME = 'sdw-umroh-pwa-v17';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/paket.html',
  '/hotel.html',
  '/koper.html',
  '/kiblat.html',
  '/galeri.html',
  '/live.html',
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
  '/js/pwa.js',
  '/js/berita-kalender.js'
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
          // Fallback clean URLs jika server lokal mengembalikan 404 untuk navigasi
          if (response && response.status === 404 && event.request.mode === 'navigate') {
            const url = new URL(event.request.url);
            if (url.pathname.endsWith('/paket')) return caches.match('/paket.html');
            if (url.pathname.endsWith('/ziarah')) return caches.match('/ziarah.html');
            if (url.pathname.endsWith('/jadwal')) return caches.match('/jadwal.html');
            if (url.pathname.endsWith('/kalkulator')) return caches.match('/kalkulator.html');
            if (url.pathname.endsWith('/tentang')) return caches.match('/tentang.html');
            if (url.pathname.endsWith('/faq')) return caches.match('/faq.html');
          }
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
          // Fallback navigasi offline clean URLs
          if (event.request.mode === 'navigate') {
            const url = new URL(event.request.url);
            if (url.pathname.endsWith('/paket')) return caches.match('/paket.html');
            if (url.pathname.endsWith('/ziarah')) return caches.match('/ziarah.html');
            if (url.pathname.endsWith('/jadwal')) return caches.match('/jadwal.html');
            if (url.pathname.endsWith('/kalkulator')) return caches.match('/kalkulator.html');
            return caches.match('/index.html');
          }
        });
      })
  );
});
