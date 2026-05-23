// SERVICE WORKER — Visor Montequinto
// Solo cachea assets CDN, nunca interfiere con navegación
const CACHE = 'visor-v1.1';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // NUNCA interceptar navegación — dejar que GitHub Pages sirva index.html
  if (e.request.mode === 'navigate') return;

  // Supabase — siempre red
  if (url.hostname.includes('supabase.co')) return;

  // Solo cachear CDN
  const cdns = ['unpkg.com','cdn.jsdelivr.net','cdnjs.cloudflare.com',
                 'cartocdn.com','arcgisonline.com','openstreetmap.org'];
  if (cdns.some(d => url.hostname.includes(d))) {
    e.respondWith(
      caches.match(e.request).then(cached =>
        cached || fetch(e.request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
      )
    );
  }
  // Todo lo demás — red normal sin interceptar
});
