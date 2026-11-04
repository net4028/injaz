/* يجعل صفحة الإدارة قابلة للتثبيت كتطبيق، ويحفظ ملفات الواجهة لفتح أسرع */
const CACHE = 'injaz-v2';
const SHELL = ['admin.html', 'index.html', 'style.css', 'common.js', 'config.js', 'manifest.webmanifest', 'icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
/* الشبكة أولاً (لتظهر التحديثات فوراً)، والمحفوظ عند انقطاع الاتصال. طلبات Google لا تُلمس */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
