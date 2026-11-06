// Cache-first offline service worker for instant physical tabletop play
const CACHE_NAME = 'wb-cache-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return (
          cached ||
          fetch(event.request)
            .then((response) => {
              if (response && response.status === 200 && response.type === 'basic') {
                const clone = response.clone()
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
              }
              return response
            })
            .catch(() => cached)
        )
      })
    )
  }
})
