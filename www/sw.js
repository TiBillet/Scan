// const CACHE_NAME = "cordova-app-v1";
// const STATIC_ASSETS = [
//   "index.html",
//   "events.html",
//   "scanner.html",
//   "lieux.html",
//   "event.html",
//   "css/style.css",
//   "js/index.js",
//   "js/auth.js",
//   "js/scanner.js",
//   "js/api.js",
//   "js/rsa.js",
//   "favicon.ico",
//   "img/logo.png",
// ];

// // INSTALLATION : mise en cache des fichiers statiques
// self.addEventListener("install", (event) => {
//   console.log("[SW] Installation");
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(STATIC_ASSETS);
//     })
//   );
//   self.skipWaiting();
// });

// // ACTIVATION : suppression des anciens caches
// self.addEventListener("activate", (event) => {
//   console.log("[SW] Activation");
//   event.waitUntil(
//     caches
//       .keys()
//       .then((keys) =>
//         Promise.all(
//           keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
//         )
//       )
//   );
//   self.clients.claim();
// });

// // FETCH : réponse depuis le cache en priorité
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((cached) => {
//       return (
//         cached ||
//         fetch(event.request)
//           .then((response) => {
//             return caches.open(CACHE_NAME).then((cache) => {
//               cache.put(event.request, response.clone());
//               return response;
//             });
//           })
//           .catch(() => {
//             // Fallback si offline
//             if (event.request.mode === "navigate") {
//               return caches.match("index.html");
//             }
//           })
//       );
//     })
//   );
// });

const CACHE_NAME = "cordova-app-v2";
const STATIC_ASSETS = [
  "index.html",
  "events.html",
  "scanner.html",
  "lieux.html",
  "event.html",
  "css/style.css",
  "js/index.js",
  "js/auth.js",
  "js/scanner.js",
  "js/api.js",
  "js/rsa.js",
  "img/logo.png",
  "favicon.ico",
];

// INSTALLATION : Mise en cache des fichiers statiques
self.addEventListener("install", (event) => {
  console.log("[SW] Installation");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATION : Suppression des anciens caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activation");
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// FETCH : Répondre depuis le cache, sinon réseau, sinon fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            // Mettre en cache les réponses statiques
            if (
              event.request.method === "GET" &&
              STATIC_ASSETS.some((asset) => event.request.url.includes(asset))
            ) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response.clone());
              });
            }
            return response;
          })
          .catch((error) => {
            console.warn("[SW] ⚠️ Échec de fetch, fallback :", error);
            if (event.request.mode === "navigate") {
              return caches.match("index.html");
            }
            return new Response("Mode hors ligne - ressource non dispo", {
              status: 503,
              statusText: "Offline",
              headers: { "Content-Type": "text/plain" },
            });
          })
      );
    })
  );
});
