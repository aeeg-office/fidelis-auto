const CACHE_NAME = "fidelis-auto-v1";
const STATIC_ASSETS = [
  "/",
  "/offline",
];

// Install — cache static shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Helper — is this a navigation request?
function isNavigation(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"))
  );
}

// Helper — is this a static asset?
function isStaticAsset(url) {
  const { pathname } = new URL(url);
  return (
    pathname.match(/\.(css|js|json|svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|eot)$/) ||
    pathname.startsWith("/_next/static/")
  );
}

// Helper — is this an API call?
function isApiCall(url) {
  return url.includes("/api/");
}

// Fetch — strategy router
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = request.url;

  // Navigation requests: network-first with offline fallback
  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the latest version
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match("/offline");
          });
        })
    );
    return;
  }

  // API calls: network-first (fresh data)
  if (isApiCall(url)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache-first (fast)
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
        );
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});