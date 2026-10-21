/*
 * Service worker de "Extra beställning".
 * Hace dos cosas: permite instalar la app y deja abrirla sin conexión (solo la pantalla;
 * guardar pedidos siempre necesita internet).
 * Pide SIEMPRE primero la red, revalidando con el servidor. Así las versiones nuevas llegan
 * solas y nadie tiene que borrar la caché. La copia guardada solo se usa sin conexión.
 */
const CACHE = 'extra-bestallning-shell-v1';
const SHELL = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'assets/iss-logo.png', 'assets/icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           // Apps Script y CDN: directo a la red

  const key = url.origin + url.pathname;                     // sin ?v= ni ?_= para no duplicar copias
  e.respondWith(
    fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(key, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(key).then((hit) =>
          hit ||
          (req.mode === 'navigate' ? caches.match(new URL('index.html', self.registration.scope).href) : undefined) ||
          Response.error()
        )
      )
  );
});
