const CACHE_NAME = "drawtool-shell-v2";
const APP_SHELL = ["/manifest.webmanifest", "/frontend.png"];

async function networkFirst(request, fallbackUrl = "/index.html") {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (
      (await cache.match(request)) ??
      (fallbackUrl ? await cache.match(fallbackUrl) : undefined) ??
      Response.error()
    );
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (
    event.request.mode === "navigate" ||
    event.request.headers.get("accept")?.includes("text/html") ||
    url.pathname === "/" ||
    url.pathname.endsWith(".html")
  ) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/frontend.png"
  ) {
    event.respondWith(cacheFirst(event.request));
  }
});
