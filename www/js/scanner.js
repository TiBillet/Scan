function scanQRCode() {
  QRScanner.prepare(function (err, status) {
    if (err) {
      alert("Erreur d'initialisation : " + err);
      console.error(err);
      return;
    }

    if (status.authorized) {
      QRScanner.scan(function (err, text) {
        if (err) {
          if (err.name === "SCAN_CANCELED") {
            document.getElementById("qr-content").innerText =
              "Le scan a été annulé.";
          } else {
            alert("Erreur lors du scan : " + err);
            console.error(err);
          }
        } else {
          console.log("QR Code scanné :", text);
          alert("QR Code détecté : " + text); // Affiche le texte brut scanné

          // Vérifier si c'est une URL
          if (text.startsWith("http://") || text.startsWith("https://")) {
            console.log("🔗 C'est une URL, ouverture dans InAppBrowser !");
            openInAppBrowser(text);
          } else {
            console.log("🎟️ C'est un billet, vérification en cours...");
            verifierBilletLocal(text);
          }

          QRScanner.destroy();
        }
      });

      QRScanner.show();
    } else if (status.denied) {
      alert("Permission refusée. Activez-la dans les paramètres.");
    } else {
      alert("Permission non accordée. Essayez à nouveau.");
    }
  });
}

// Fonction pour ouvrir une URL dans le navigateur
function openInAppBrowser(url) {
  cordova.InAppBrowser.open(url, "_system");
}
