/* Service Worker — static shell cache + network-first dynamic safety */
const CACHE_VERSION = 'souq-sd-v4';
const SHELL = [
   './', './index.html', './store.html', './dashboard.html', './admin.html',
   './css/core.css', './css/theme.css', './js/icons.js', './css/enhance.css', './js/ui.js', './css/store.css', './css/dashboard.css', './css/admin.css',
   './manifest.json'
];

self.addEventListener('install', (e) => {
   e.waitUntil(caches.open(CACHE_VERSION).then(c => Promise.all(SHELL.map(u => c.add(u).catch(()=>{})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
   e.waitUntil(
      caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
   );
});

self.addEventListener('fetch', (e) => {
   const req = e.request;
   if (req.method !== 'GET') return;
   const url = new URL(req.url);
   
   // Never cache Firebase backends — let the SDK manage offline.
   if (/firestore|firebaseio|googleapis\.com\/identitytoolkit|firebasestorage/.test(url.host + url.pathname)) return;
   
   // HTML shell — network-first with cache fallback
   if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
      e.respondWith(
         fetch(req).then(res => {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(req, clone));
            return res;
         }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
      );
      return;
   }
   
   // Static assets — cache-first
   e.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
         if (res.ok && (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|webp|woff2?)$/))) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then(c => c.put(req, clone));
         }
         return res;
      }).catch(() => cached))
   );
});