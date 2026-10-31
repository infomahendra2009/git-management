const CACHE_NAME = 'quizportal-shell-v1';
const APP_SHELL = [
  '/',
  '/manifest.webmanifest',
  '/icons/quiz-portal-192.svg',
  '/icons/quiz-portal-512.svg',
];
const STATIC_DESTINATIONS = new Set(['script', 'style', 'font', 'image']);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (!response.ok) return response;
          await (await caches.open(CACHE_NAME)).put('/', response.clone());
          return response;
        })
        .catch(async () => (await caches.match('/')) || Response.error())
    );
    return;
  }

  if (!STATIC_DESTINATIONS.has(request.destination)) return;
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then(async (response) => {
        if (response.ok && response.type === 'basic') {
          await (await caches.open(CACHE_NAME)).put(request, response.clone());
        }
        return response;
      });
    })
  );
});
