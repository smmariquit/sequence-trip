// Service worker: offline app shell + static asset cache (#2).
//
// - hashed bundles (/_expo/static/) and small assets: cache-first (immutable)
// - navigations: network-first, cached shell fallback when offline
// - the 130MB oeis.db is excluded — expo-sqlite imports it into OPFS, which
//   owns offline persistence for the database
// - /oeis/ proxy responses (b-files, entries): network-first with cache
//   fallback so previously seen sequences work offline

const SHELL_CACHE = "shell-v1";
const STATIC_CACHE = "static-v1";
const OEIS_CACHE = "oeis-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.add("/")).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, STATIC_CACHE, OEIS_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cacheFirst(cacheName, request) {
  return caches.open(cacheName).then((cache) =>
    cache.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
    )
  );
}

function networkFirst(cacheName, request, fallbackUrl) {
  return caches.open(cacheName).then((cache) =>
    fetch(request)
      .then((res) => {
        if (res.ok) cache.put(request, res.clone());
        return res;
      })
      .catch(() =>
        cache.match(request).then((hit) => hit || (fallbackUrl ? cache.match(fallbackUrl) : undefined))
      )
  );
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.endsWith(".db")) return; // OPFS owns the big database

  if (url.pathname.startsWith("/_expo/static/") || /\.(png|svg|ico|ogg|mp3|wav|css|js|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(STATIC_CACHE, event.request));
    return;
  }
  if (url.pathname.startsWith("/oeis/")) {
    event.respondWith(networkFirst(OEIS_CACHE, event.request));
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(networkFirst(SHELL_CACHE, event.request, "/"));
  }
});
