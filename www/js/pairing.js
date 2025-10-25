document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("startPairing");
  const pairingOverlay = document.getElementById("pairing-overlay");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!window.QRScanner) {
      alert("QRScanner non disponible !");
      return;
    }

    btn.style.display = "none";
    pairingOverlay.classList.remove("hidden");
    // btn.classList.add("hidden");

    QRScanner.prepare(function (err, status) {
      if (err || !status.authorized) {
        alert("Permission refusée pour la caméra.");
        pairingOverlay.classList.add("hidden");
        btn.style.display = "block";
        return;
      }

      document.body.style.backgroundColor = "transparent";

      showScannerFrame();

      QRScanner.scan(async function (err, text) {
        QRScanner.hide();
        QRScanner.destroy();

        hideScannerFrame();

        if (err) {
          alert("Erreur lors du scan : " + err.message);
          return;
        }

        console.log("QR d'appairage scanné :", text);

        const baseUrl = text.split("/scan/")[0];
        localStorage.setItem("apiBaseUrl", baseUrl);

        cordova.plugin.http.get(
          text,
          {},
          { Accept: "application/json" },
          function (response) {
            try {
              const data = JSON.parse(response.data);
              localStorage.setItem(
                "lastPairingResponse",
                JSON.stringify(data, null, 2)
              );

              if (data.api_key) {
                localStorage.setItem("apiKey", data.api_key);
                alert("✅ Appairage réussi !");
                window.location.href = "events.html";
              } else {
                alert("❌ QR invalide ou clé absente.");
              }
            } catch (e) {
              alert("❌ Erreur de requête : " + e.message);
            }
          },
          function (error) {
            alert(
              "❌ Erreur réseau : " +
                (error.error || error.status || "inconnue")
            );
          }
        );
      });

      QRScanner.show();
    });
  });
});

function showScannerFrame() {
  document.getElementById("scanner-frame")?.classList.remove("hidden");
}

function hideScannerFrame() {
  document.getElementById("scanner-frame")?.classList.add("hidden");
}
