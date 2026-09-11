// Cache public app files only. Firebase owns authenticated data persistence.
const CACHE = "arcadia-games-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const response = await fetch("/friends-offline-manifest.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Offline manifest unavailable");
      const cache = await caches.open(CACHE);
      await cache.addAll(await response.json());
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith("arcadia-games-") && key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin ||
    (!url.pathname.startsWith("/assets/") &&
      !url.pathname.startsWith("/room-game") &&
      event.request.mode !== "navigate")
  )
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(event.request);
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      } catch {
        const cached = (await cache.match(event.request)) || (await cache.match(url.pathname));
        return (
          cached ||
          new Response("This page has not been saved offline yet. Reconnect once to load it.", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          })
        );
      }
    })(),
  );
});
