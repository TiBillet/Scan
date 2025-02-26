// function scanQRCode() {
//   QRScanner.prepare(function (err, status) {
//     if (err) {
//       alert("Erreur d'initialisation : " + err);
//       console.error(err);
//       return;
//     }

//     if (status.authorized) {
//       QRScanner.scan(function (err, text) {
//         if (err) {
//           if (err.name === "SCAN_CANCELED") {
//             document.getElementById("qr-content").innerText =
//               "Le scan a été annulé.";
//           } else {
//             alert("Erreur lors du scan : " + err);
//             console.error(err);
//           }
//         } else {
//           console.log("QR Code scanné :", text);
//           alert("QR Code détecté : " + text); // Affiche le texte brut scanné

//           // Vérifier si c'est une URL
//           if (text.startsWith("http://") || text.startsWith("https://")) {
//             console.log("🔗 C'est une URL, ouverture dans InAppBrowser !");
//             openInAppBrowser(text);
//           } else {
//             console.log("🎟️ C'est un billet, vérification en cours...");
//             verifierBilletLocal(text);
//           }

//           QRScanner.destroy();
//         }
//       });

//       QRScanner.show();
//     } else if (status.denied) {
//       alert("Permission refusée. Activez-la dans les paramètres.");
//     } else {
//       alert("Permission non accordée. Essayez à nouveau.");
//     }
//   });
// }

// // Fonction pour ouvrir une URL dans le navigateur
// function openInAppBrowser(url) {
//   cordova.InAppBrowser.open(url, "_system");
// }

// function initScanner() {
//   console.log("📷 Initialisation de QRScanner...");

//   QRScanner.prepare(function (err, status) {
//     if (err) {
//       console.error("❌ Erreur d'initialisation QRScanner :", err);
//       return;
//     }

//     if (status.authorized) {
//       console.log("✅ Permission accordée, QRScanner prêt.");
//     } else if (status.denied) {
//       alert(
//         "🚫 Permission refusée pour la caméra. Activez-la dans les paramètres."
//       );
//     } else {
//       alert("⚠️ Permission non accordée. Essayez à nouveau.");
//     }
//   });
// }

// function scanQRCode() {
//   console.log("📸 Démarrage du scan...");

//   QRScanner.scan(function (err, text) {
//     if (err) {
//       console.error("❌ Erreur lors du scan :", err);
//       if (err.name === "SCAN_CANCELED") {
//         document.getElementById("qr-content").innerText =
//           "Le scan a été annulé.";
//       }
//       return;
//     }

//     console.log("✅ QR Code scanné :", text);
//     alert("QR Code détecté : " + text); // Affiche le texte brut scanné

//     // Vérifier si c'est une URL
//     if (text.startsWith("http://") || text.startsWith("https://")) {
//       console.log("🔗 C'est une URL, ouverture dans InAppBrowser !");
//       openInAppBrowser(text);
//     } else {
//       console.log("🎟️ C'est un billet, vérification en cours...");
//       verifierBilletLocal(text);
//     }

//     QRScanner.hide(); // Masquer la caméra après scan
//     QRScanner.destroy(); // Nettoyer pour éviter les bugs
//   });

//   QRScanner.show(); // Afficher la caméra
// }

// // Fonction pour ouvrir une URL dans le navigateur
// function openInAppBrowser(url) {
//   cordova.InAppBrowser.open(url, "_system");
// }

// // Écouter l'événement de clic sur le bouton scan
// document.addEventListener("DOMContentLoaded", function () {
//   document.getElementById("startScan").addEventListener("click", scanQRCode);
// });

document.addEventListener("deviceready", function () {
  console.log("📱 Cordova est prêt !");
  initScanner();
  document.getElementById("startScan").addEventListener("click", scanQRCode);
});

function initScanner() {
  console.log("📷 Initialisation de QRScanner...");

  QRScanner.prepare(function (err, status) {
    if (err) {
      console.error("❌ Erreur d'initialisation QRScanner :", err);
      return;
    }

    if (status.authorized) {
      console.log("✅ Permission accordée, QRScanner prêt.");
    } else if (status.denied) {
      alert(
        "🚫 Permission refusée pour la caméra. Activez-la dans les paramètres."
      );
    } else {
      alert("⚠️ Permission non accordée. Essayez à nouveau.");
    }
  });
}

function scanQRCode() {
  if (typeof QRScanner === "undefined") {
    alert(
      "❌ QRScanner n'est pas disponible. Lance l'application sur un téléphone !"
    );
    return;
  }

  console.log("📸 Démarrage du scan...");

  QRScanner.scan(function (err, text) {
    if (err) {
      console.error("❌ Erreur lors du scan :", err);
      if (err.name === "SCAN_CANCELED") {
        document.getElementById("qr-content").innerText =
          "Le scan a été annulé.";
      }
      return;
    }

    console.log("✅ QR Code scanné :", text);
    alert("QR Code détecté : " + text); // Affiche le texte brut scanné

    // Vérifier si c'est une URL
    if (text.startsWith("http://") || text.startsWith("https://")) {
      console.log("🔗 C'est une URL, ouverture dans InAppBrowser !");
      openInAppBrowser(text);
    } else {
      console.log("🎟️ C'est un billet, vérification en cours...");
      verifierBilletLocal(text);
    }

    QRScanner.hide();
    QRScanner.destroy();
  });

  QRScanner.show();
}

// Fonction pour ouvrir une URL dans le navigateur
function openInAppBrowser(url) {
  cordova.InAppBrowser.open(url, "_system");
}
