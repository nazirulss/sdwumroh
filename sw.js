const CACHE_NAME = 'sdw-umroh-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app',
  '/app.html',
  '/css/styles.min.css',
  '/js/app-config.js',
  '/js/data-mock.js',
  '/js/api.js',
  '/js/catalog.js',
  '/js/departures.js',
  '/js/estimator.js',
  '/js/auth.js',
  '/js/jamaah.js',
  '/js/backoffice.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline assets...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Cleaning old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Hanya tangani GET requests
  if (event.request.method !== 'GET') return;

  // Jangan cache request ke Google Apps Script atau eksternal API
  const url = event.request.url;
  if (url.includes('script.google.com') || url.includes('google-analytics')) {
    return;
  }

  // Network-First untuk HTML/Navigation agar perubahan halaman selalu fresh
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first dengan background network update untuk asset statis
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback jika offline dan membuka halaman app
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/app.html');
        }
      });
    })
  );
});
