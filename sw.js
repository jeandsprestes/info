// O INFO funciona sem internet com o que já foi aberto. As edições vêm primeiro da rede (para chegar a nova); a casca, do cache.
const CASCA = 'info-casca-v1', EDICOES = 'info-edicoes-v1';
const ARQUIVOS = ['./', 'index.html', 'estilo.css', 'app.js', 'manifest.webmanifest', 'icones/icone-192.png', 'icones/icone-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CASCA).then(c => c.addAll(ARQUIVOS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => ![CASCA, EDICOES].includes(k)).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.includes('/edicoes/') || u.pathname.endsWith('.js') || u.pathname.endsWith('.css') || u.pathname.endsWith('/') || u.pathname.endsWith('.html')) {
    e.respondWith(fetch(e.request).then(r => {
      const copia = r.clone();
      caches.open(u.pathname.includes('/edicoes/') ? EDICOES : CASCA).then(c => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
