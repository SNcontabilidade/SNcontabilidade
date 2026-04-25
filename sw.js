// SN Soluções Contábeis – Service Worker
// Versão mínima: garante instalabilidade PWA no Android/Chrome.
// O app usa Firebase (online), então não há cache offline complexo.

const CACHE_NAME = 'sn-v1';

// Arquivos estáticos para cache (carregam mesmo sem internet)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ── Instalação: faz cache dos arquivos estáticos ─────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Ativação: remove caches antigos ──────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network First (sempre busca dados frescos do Firebase) ─────────────
// Fallback para cache só se estiver offline.
self.addEventListener('fetch', event => {
  // Ignora requisições Firebase, Cloudinary e CDNs externas (sempre online)
  const url = new URL(event.request.url);
  const isExternal = !url.origin.includes(self.location.origin);
  if (isExternal) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Atualiza cache com versão nova
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Offline: retorna do cache
        return caches.match(event.request);
      })
  );
});
