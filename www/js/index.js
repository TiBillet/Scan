document.addEventListener(
  "deviceready",
  function () {
    console.log(" L'événement 'deviceready' a bien été déclenché !");
  },
  false
);

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  console.log(" onDeviceReady est exécuté !");

  //   if ("serviceWorker" in navigator) {
  //     console.log(" Tentative d'enregistrement du Service Worker...");

  //     navigator.serviceWorker
  //       .register("service-worker.js", { scope: "./" }) // Chemin relatif pour éviter les conflits
  //       .then((reg) => {
  //         console.log("✅ Service Worker enregistré avec succès :", reg.scope);
  //         if (reg.waiting) {
  //           reg.waiting.postMessage({ type: "SKIP_WAITING" });
  //         }
  //       })
  //       .catch((err) =>
  //         console.error("❌ Échec de l’enregistrement du Service Worker :", err)
  //       );
  //   } else {
  //     console.warn(" Le navigateur ne supporte pas les Service Workers.");
  //   }

  // Initialiser QRScanner après deviceready
  initScanner();
}

// Sécurité : Si "deviceready" ne se déclenche pas sous localhost, tenter un fallback
if (location.hostname === "localhost") {
  console.log(" Mode localhost détecté, tentative de fallback...");
  setTimeout(() => {
    onDeviceReady();
  }, 500); // Petite pause pour laisser charger les autres scripts
}
