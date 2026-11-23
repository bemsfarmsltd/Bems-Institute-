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

self.addEventListener("push", (event) => {
  let payload = {
    title: "BEMS Institute",
    body: "You have a new learning reminder.",
    tag: "bems-reminder",
    url: "/dashboard"
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        title: parsed.title || payload.title,
        body: parsed.body || payload.body,
        tag: parsed.tag || payload.tag,
        url: parsed.url || (parsed.data && parsed.data.url) || "/dashboard"
      };
    } catch {
      const text = event.data.text();
      if (text) payload.body = text;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: "/images/bems-logo.jpg",
      badge: "/images/bems-logo.jpg",
      data: { url: payload.url }
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/dashboard";
  const safePath =
    typeof targetUrl === "string" && targetUrl.startsWith("/") ? targetUrl : "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(safePath);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(safePath);
      }
      return undefined;
    })
  );
});
