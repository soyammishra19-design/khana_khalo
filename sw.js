// PWA Service Worker for Offline Menu Cache
const CACHE_NAME = 'eclat-bistro-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/pakhala.png',
    'https://images.unsplash.com/photo-1514222134-b57cbf8ce673?w=1920&q=80',
    'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    // Basic cache-first strategy for static assets
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Return from cache
                }
                return fetch(event.request); // Fetch from network
            })
    );
});
