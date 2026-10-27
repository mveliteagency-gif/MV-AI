/**
 * MV.ai — Service Worker (PWA Offline & Caching Engine)
 */

const CACHE_NAME = 'mv-ai-v2.1';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './assets/logo.svg',
  './assets/logo.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './js/app.js',
  './js/auth.js',
  './js/api.js',
  './js/api-manager.js',
  './js/background-3d.js',
  './js/chat.js',
  './js/cloner.js',
  './js/developer.js',
  './js/ebook.js',
  './js/viral-trends.js',
  './js/ad-creative.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[MV.ai SW] Pre-caching offline assets...');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[MV.ai SW] Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[MV.ai SW] Clearing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-first for AI APIs, CDNs, or POST requests
  if (
    event.request.method !== 'GET' ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('pollinations.ai') ||
    url.hostname.includes('pexels.com') ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('allorigins.win') ||
    url.hostname.includes('corsproxy.io')
  ) {
    return;
  }

  // Stale-while-revalidate for local files
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
