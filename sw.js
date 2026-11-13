/// <reference lib="webworker" />
const CACHE_NAME = 'sdw-umroh-pwa-v67';
const RUNTIME_CACHE = 'sdw-runtime-v67';

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/admin.html',
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
  '/assets/sdw-logo.webp',
  '/assets/hero-haram.png',
  '/assets/hero-haram.webp',
  '/assets/hero-twilight.jpg',
  '/assets/hero-twilight.webp',
  '/assets/pkg-hemat.webp',
  '/assets/pkg-plus-turki.webp',
  '/assets/pkg-ramadhan.webp',
  '/assets/pkg-reguler-syawal.webp',
  '/assets/pkg-vip-khidmat.webp',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-maskable.png',
  '/assets/certificate-badal-template.jpg',
  '/js/components.js',
  '/js/app-config.js',
  '/js/data-mock.js',
  '/js/api.js',
  '/js/auth.js',
  '/js/jamaah.js',
  '/js/kiblat.js',
  '/js/pwa.js',
  '/js/admin/admin-state.js',
  '/js/admin/admin-nav.js',
  '/js/admin/admin-crm.js',
  '/js/admin/admin-packages.js',
  '/js/admin/admin-departures.js',
  '/js/admin/admin-hotels.js',
  '/js/admin/admin-airlines.js',
  '/js/admin/admin-gallery.js',
  '/js/admin/admin-articles.js',
  '/js/admin/admin-faq.js',
  '/js/admin/admin-users.js',
  '/js/admin/admin-roles.js',
  '/js/admin/admin-docs.js',
  '/js/admin/admin-registrations.js',
  '/js/admin/admin-finance.js',
  '/js/admin/admin-operations.js',
  '/js/admin/admin-certificates.js',
  '/js/admin/admin-badal.js',
  '/js/admin/admin-security.js',
  '/js/admin/admin-sync.js',
  '/js/admin/admin-export.js',
  '/js/admin-core.js',
  '/js/berita-kalender.js'
];

// 0. Message Event: Listens for SKIP_WAITING from client update banner
self.addEventListener('message', (event) => {
  if (event.data && (event.data.type === 'SKIP_WAITING' || event.data.action === 'skipWaiting')) {
    self.skipWaiting();
  }
});

// 1. Install Event: Precaches core app shell
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

// 2. Activate Event: Cleans up obsolete cache versions
self.addEventListener('activate', (event) => {
  const allowedCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !allowedCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Helper for clean URL navigation fallback
function resolveNavigationFallback(pathname) {
  if (pathname === '/' || pathname === '') return '/index.html';
  if (pathname.endsWith('/admin') || pathname.endsWith('/backoffice')) return '/admin.html';
  if (pathname.endsWith('/app') || pathname.endsWith('/jamaah') || pathname.includes('/app/')) return '/app.html';
  if (pathname.endsWith('/paket')) return '/paket.html';
  if (pathname.endsWith('/hotel')) return '/hotel.html';
  if (pathname.endsWith('/koper')) return '/koper.html';
  if (pathname.endsWith('/kiblat')) return '/kiblat.html';
  if (pathname.endsWith('/galeri')) return '/galeri.html';
  if (pathname.endsWith('/live')) return '/live.html';
  if (pathname.endsWith('/jadwal')) return '/jadwal.html';
  if (pathname.endsWith('/kalkulator')) return '/kalkulator.html';
  if (pathname.endsWith('/ziarah')) return '/ziarah.html';
  if (pathname.endsWith('/tentang')) return '/tentang.html';
  if (pathname.endsWith('/faq')) return '/faq.html';
  return '/index.html';
}

// 3. Fetch Event: Dual-Strategy (Network-First for HTML/Data, Stale-While-Revalidate for CDN Fonts & Assets)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = new URL(event.request.url);

  // Strategy A: Stale-While-Revalidate for Third-Party CDN (Fonts & FontAwesome)
  const isCdn = url.hostname.includes('fonts.googleapis.com') ||
                url.hostname.includes('fonts.gstatic.com') ||
                url.hostname.includes('cdnjs.cloudflare.com');

  if (isCdn) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Strategy B: Network-First with Offline Cache Fallback for Core App
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200) {
          // If 404 on navigation, try clean URL fallback
          if (response && response.status === 404 && event.request.mode === 'navigate') {
            const fallbackPath = resolveNavigationFallback(url.pathname);
            return caches.match(fallbackPath);
          }
          return response;
        }

        // Cache successful basic responses
        if (response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Offline: Match cache or fallback
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Navigation fallback when completely offline
          if (event.request.mode === 'navigate') {
            const fallbackPath = resolveNavigationFallback(url.pathname);
            return caches.match(fallbackPath).then((fallbackRes) => {
              return fallbackRes || caches.match('/index.html');
            });
          }
        });
      })
  );
});
