self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

const CACHE_NAME = "app-cache-v1";
const STATIC_ASSETS = [
  "/index.html",
  "/css/style.css",
  "/js/index.js",
  "/img/logo.png",
];

// INSTALLATION : Mise en cache des fichiers avec gestion d'erreurs
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installation en cours...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(
          STATIC_ASSETS.map((url) =>
            fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(
                    `Erreur de chargement : ${url} (${response.status})`
                  );
                }
                return cache.put(url, response);
              })
              .catch((err) =>
                console.warn(
                  `[Service Worker] ⚠️ Impossible d'ajouter ${url} au cache :`,
                  err
                )
              )
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATION : Nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activation en cours...");
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// INTERCEPTION DES REQUÊTES : Servir les fichiers en offline
self.addEventListener("fetch", (event) => {
  console.log("[Service Worker] Interception de", event.request.url);
  event.respondWith(
    caches
      .match(event.request)
      .then(
        (response) =>
          response ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
      )
      .catch(() => {
        // Si le fichier demandé n'est pas en cache et qu'on est offline, renvoyer index.html
        return caches.match("/index.html").then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return new Response("Mode hors ligne - fichier non disponible", {
            status: 503,
          });
        });
      })
  );
});
