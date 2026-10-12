// BEMS FutureSkills Progressive Web App Service Worker
const CACHE_NAME = "bems-pwa-v2";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/courses/web-dev",
  "/images/bems-logo.jpg",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-first: always try to fetch the live page/asset first, so a new
// deploy is visible on the very next load. Only fall back to the cache
// (then the offline page) when the network request actually fails — a
// cache-first strategy here previously meant anyone who ever visited the
// site stayed stuck on whatever was cached on their very first visit,
// forever, since a cache hit was returned before the network was ever
// checked again.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.ok) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match("/dashboard");
        });
      })
  );
});
