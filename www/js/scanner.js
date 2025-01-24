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
          document.getElementById("qr-content").innerText = "Contenu : " + text;
          console.log("QR Code scanné :", text);
        }

        QRScanner.destroy(); // Arrêter la caméra
      });

      QRScanner.show(); // Afficher la caméra
    } else if (status.denied) {
      alert("Permission refusée. Activez-la dans les paramètres.");
    } else {
      alert("Permission non accordée. Essayez à nouveau.");
    }
  });
}
