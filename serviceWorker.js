const staticAQI = "com.shishirsingh.aqi-site-v1"
const assets = [
    "/",
    "/index.html",
    "/js/main.js",
    "https://unpkg.com/chota@latest",
    "https://icongr.am/clarity/cloud.svg",
];

self.addEventListener("install", installEvent => {
    console.log('Installing event');
    installEvent.waitUntil(
        caches.open(staticAQI).then(cache => {
            cache.addAll(assets)
        })
    )
});


self.addEventListener('fetch', event => {
    if (event.request.method === 'GET' && event.request.url.indexOf('https://api.openaq.org/v1') !== -1) {
        event.respondWith(
            caches.open(staticAQI).then(cache => {
                return fetch(event.request).then(response => {
                    cache.put(event.request, response.clone());
                    return response;
                }).catch(() => caches.match(event.request).then(res => {
                    return res;
                }) );
            })
        );
    } 
    else {event.respondWith(
        caches.match(event.request).then(res => {
            return res || fetch(event.request)
        })
    );}
   
});