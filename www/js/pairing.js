document.getElementById("startPairing").addEventListener("click", () => {
  if (!window.QRScanner) {
    alert("QRScanner non disponible !");
    return;
  }

  QRScanner.prepare(function (err, status) {
    if (err || !status.authorized) {
      alert("Permission refusée pour la caméra.");
      return;
    }
    document.body.style.backgroundColor = "transparent";

    QRScanner.scan(async function (err, text) {
      QRScanner.hide();
      QRScanner.destroy();

      if (err) {
        alert("Erreur lors du scan : " + err.message);
        return;
      }

      console.log("QR d'appairage scanné :", text);

      try {
        const response = await fetch(text);
        const data = await response.json();

        if (data.api_key) {
          localStorage.setItem("apiKey", data.api_key);
          alert("✅ Appairage réussi !");
        } else {
          alert("❌ QR invalide ou clé absente.");
        }
      } catch (e) {
        alert("❌ Erreur de requête : " + e.message);
      }
    });

    QRScanner.show();
  });
});
