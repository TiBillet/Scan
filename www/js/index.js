document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  console.log("✅ App Cordova prête !");

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
  console.log("🌐 Fallback localhost actif.");
  setTimeout(() => {
    onDeviceReady();
  }, 500);
}
