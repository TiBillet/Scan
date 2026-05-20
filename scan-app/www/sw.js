// const CACHE_NAME = "cordova-app-v3";
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
//   "js/rsa.js",
//   "img/logo.png",
//   "favicon.ico",
// ];

// // mise en cache des fichiers statiques
// self.addEventListener("install", (event) => {
//   console.log("[SW] Installation");
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(STATIC_ASSETS);
//     })
//   );
//   self.skipWaiting();
// });

// // suppression des anciens caches
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

// // fetch cache, sinon réseau, sinon fallback
// self.addEventListener("fetch", (event) => {
//   event.respondWith(
//     caches.match(event.request).then((cached) => {
//       return (
//         cached ||
//         fetch(event.request)
//           .then((response) => {
//             // cache les réponses statiques
//             if (
//               event.request.method === "GET" &&
//               STATIC_ASSETS.some((asset) => event.request.url.includes(asset))
//             ) {
//               caches.open(CACHE_NAME).then((cache) => {
//                 cache.put(event.request, response.clone());
//               });
//             }
//             return response;
//           })
//           .catch((error) => {
//             console.warn("[SW] ⚠️ Échec de fetch, fallback :", error);
//             if (event.request.mode === "navigate") {
//               return caches.match("index.html");
//             }
//             return new Response("Mode hors ligne - ressource non dispo", {
//               status: 503,
//               statusText: "Offline",
//               headers: { "Content-Type": "text/plain" },
//             });
//           })
//       );
//     })
//   );
// });
