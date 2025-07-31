document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  // afficherNomLieu();
  // Si un scanner existe sur la page
  if (typeof initScanner === "function") {
    initScanner();
  }

  // Statut réseau
  updateNetworkStatus();
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
}

// Gestion du statut réseau
function updateNetworkStatus() {
  const statusDiv = document.getElementById("network-status");
  if (!statusDiv) return;

  if (navigator.onLine) {
    statusDiv.textContent = "🟢 En ligne";
    statusDiv.style.color = "green";
  } else {
    statusDiv.textContent = "🔴 Hors ligne";
    statusDiv.style.color = "red";
  }
}

// Fallback localhost
if (location.hostname === "localhost") {
  console.log("Fallback localhost actif.");
  setTimeout(() => {
    onDeviceReady();
  }, 500);
}

document.addEventListener("deviceready", function () {
  if (navigator.splashscreen) {
    navigator.splashscreen.hide();
  }
});

// function afficherNomLieu() {
//   const uuid = localStorage.getItem("selectedEventUuid");
//   const baseUrl = localStorage.getItem("apiBaseUrl");

//   if (!uuid || !baseUrl) return;

//   const container = document.querySelector(".nom-lieu");
//   if (!container) return;

//   cordova.plugin.http.get(
//     `${baseUrl}/api/events/${uuid}/`,
//     {},
//     { Accept: "application/json" },
//     function (response) {
//       try {
//         const data = JSON.parse(response.data);
//         if (data.name) {
//           container.textContent = data.name;
//         }
//       } catch (e) {
//         console.warn("Erreur parsing JSON event :", e);
//       }
//     },
//     function (error) {
//       console.warn("Erreur chargement nom du lieu :", error);
//     }
//   );
// }
