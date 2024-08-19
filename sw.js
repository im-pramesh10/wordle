self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('my-cache').then(function(cache) {
        return cache.addAll([
          '/',
          '/index.html',
          '/style.css',
          '/index.js',
          '/wordlist.js',
          '/fallback.html'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', function(event) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request).then(function(response) {
          return response || caches.match('/fallback.html');
        });
      })
    );
  });
  