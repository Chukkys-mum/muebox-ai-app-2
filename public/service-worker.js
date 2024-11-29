const CACHE_NAME = 'muebox-cache-v1';
const URLS_TO_CACHE = [
  '/', // Root route
  '/styles/globals.css', // Updated CSS reference
  '/scripts/service-worker-registration.js', // Updated JS reference
  '/favicon.ico', // Keep favicon if applicable
];

// Install event: cache resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app resources.');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      )
    )
  );
});

// Fetch event: serve cached resources
self.addEventListener('fetch', (event) => {
  console.log('Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch((error) => {
        console.error('Fetch failed:', error);
        throw error; // Optional: Handle offline fallback here
      });
    })
  );
});
