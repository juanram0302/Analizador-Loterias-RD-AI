const CACHE_NAME = 'loterias-rd-v2.1';

// Use relative paths so it works regardless of where the app is hosted
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/styles.css',
    './js/lotteries.js',
    './js/parser.js',
    './js/analyzer.js',
    './js/ui.js',
    './js/ai.js',
    './js/app.js',
    './img/favicon.svg',
    './img/icon-192.png',
    './img/icon-512.png',
    './manifest.json'
];

// Install: cache all core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;

    // For navigation requests (HTML pages), always try network first then fallback to cached index.html
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Try multiple cache keys for index.html
                    return caches.match(event.request)
                        .then(cached => cached || caches.match('./index.html'))
                        .then(cached => cached || caches.match('./'))
                        .then(cached => {
                            if (cached) return cached;
                            // Last resort: find any cached index.html
                            return caches.open(CACHE_NAME).then(cache =>
                                cache.keys().then(keys => {
                                    const htmlKey = keys.find(k => k.url.endsWith('index.html') || k.url.endsWith('/'));
                                    return htmlKey ? cache.match(htmlKey) : new Response('Offline', {
                                        status: 503,
                                        headers: { 'Content-Type': 'text/plain' }
                                    });
                                })
                            );
                        });
                })
        );
        return;
    }

    // For other assets: network first, then cache
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
