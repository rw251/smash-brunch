// Change this to force update 
var VERSION = 'v1.1.2';
var CACHE = 'cache-update-and-refresh-' + VERSION;
var isDebug = false;

var cachedLocalItems = [
  '/css/app.css',
  '/img/down-green.png',
  '/img/up-green.png',
  '/img/down-red.png',
  '/img/up-red.png',
  '/img/logo_nihr.png',
  '/img/logo_uom.png',
  '/fonts/glyphicons-halflings-regular.eot',
  '/fonts/glyphicons-halflings-regular.svg',
  '/fonts/glyphicons-halflings-regular.ttf',
  '/fonts/glyphicons-halflings-regular.woff',
  '/fonts/glyphicons-halflings-regular.woff2',
  '/favicon.ico',
  '/js/libraries.js', //don't need app.js but things like bootstrap jquery might be needed
];

var cachedRemoteItems = [
  'https://fonts.googleapis.com/css?family=PT+Mono|PT+Sans:400,700'
];

var allCachedItems = cachedLocalItems.concat(cachedRemoteItems);
allCachedItems.push('/html/offline.html');

function logIt(message) {
  if(isDebug) console.log(message);
}

self.addEventListener('install', function (e) {
  // Add the following assets on install
  logIt('/sw.js -> Install to ' + CACHE);
  e.waitUntil(caches.open(CACHE).then(function (cache) {
    cache.addAll(allCachedItems)
  }));
});

self.addEventListener('activate', function(event) {
  var cacheWhitelist = [CACHE];

  // Removing old caches
  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheWhitelist.indexOf(key) === -1) {
          logIt('Removing old cache: ' + key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', function (evt) {
  logIt('/sw.js -> Fetch ' +evt.request.url);
  // On fetch immediately return from cache if it is something
  // we currently cache
  if(cachedLocalItems.indexOf(evt.request.url.replace(/^https?:\/\/[^/]+\//,"/")) > -1 ||
      cachedRemoteItems.indexOf(evt.request.url)>-1) {

    evt.respondWith(fromCache(evt.request));

    // Then try to get a network version
    evt.waitUntil(update(evt.request).then(refresh));
  } else {
    evt.respondWith(fetch(evt.request).catch(function () {
      logIt("Error caught - /html/offline.html returned");
      return caches.match('/html/offline.html');
    }));
  }
});

function fromCache(request) {
  logIt('/sw.js -> Fetch ' + request.url + ' from cache.');
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request);
  });
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response.clone()).then(function () {
        return response;
      });
    });
  }).catch(function(){
    return null;
  });
}

function refresh(response) {
  if(!response) return;
  logIt('/sw.js -> Response url ' + response.url);
  logIt('/sw.js -> Response headers ' + Array.from(response.headers.keys()));
  return self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
 
      var message = {
        type: 'refresh',
        url: response.url,
 
        eTag: response.headers.get('ETag')
      };
 
      client.postMessage(JSON.stringify(message));
    });
  });
}
