// Zameen Gem Minimal Safe PWA Service Worker (Zero Stale-Data Caching)
// Fulfills Chrome Android PWA installability criteria without caching dynamic Supabase API calls or user session data.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch handler: network-first with zero caching of Supabase or state
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
