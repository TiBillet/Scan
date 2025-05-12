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

  initScanner();
}

// Sécurité : Si "deviceready" ne se déclenche pas sous localhost, tenter un fallback
if (location.hostname === "localhost") {
  console.log(" Mode localhost détecté, tentative de fallback...");
  setTimeout(() => {
    onDeviceReady();
  }, 500); // Petite pause pour laisser charger les autres scripts
}
