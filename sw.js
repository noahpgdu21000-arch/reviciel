/* RéviCIEL — service worker : garde tout le site sur l'appareil pour réviser sans connexion.
   La partie entre les marqueurs BUILD est réécrite par « node outils/build.js ». */
// @@BUILD-START
const VERSION = "2026-11-17-d2f303cf";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "css/app.css",
  "js/app.js",
  "js/data.js",
  "js/editor.js",
  "js/markdown.js",
  "js/pages.js",
  "js/pwa.js",
  "js/store.js",
  "js/study.js",
  "js/trainers.js",
  "js/ui.js",
  "js/views.js",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/icon-maskable.svg",
  "icons/icon.svg",
  "js/content.js"
];
// @@BUILD-END

const CACHE = 'reviciel-' + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('reviciel-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navigation : la page de l'appli (routage par « # »), même hors connexion
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('index.html').then((cached) => cached || fetch(req))
        .catch(() => caches.match('./'))
    );
    return;
  }
  // Fichiers : cache d'abord, puis réseau (et on garde une copie)
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
