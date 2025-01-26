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
          // mettre à jour le contenu scanné
          const qrContent = document.getElementById("qr-content");
          qrContent.innerText = text;

          // rendre l'URL cliquable
          qrContent.onclick = function () {
            openInAppBrowser(text);
          };
          console.log("QR Code scanné :", text);
        }

        QRScanner.destroy(); // arreter la cam
      });

      QRScanner.show(); // afficher la cam
    } else if (status.denied) {
      alert("Permission refusée. Activez-la dans les paramètres.");
    } else {
      alert("Permission non accordée. Essayez à nouveau.");
    }
  });
}

// fonction pour ouvrir l'url dans InAppBrowser
function openInAppBrowser(url) {
  cordova.InAppBrowser.open(url, "_system");
  // "_system" pour ouvrir dans le navigateur par défaut
  //"_blank" pour l'ouvrir dans fenetre de l'app
}
