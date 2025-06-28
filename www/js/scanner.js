document.addEventListener("deviceready", function () {
  console.log("Cordova est prêt !");
  initScanner();

  document.getElementById("startScan").addEventListener("click", scanQRCode);

  // Écouteur réseau : sync automatique quand ça revient
  window.addEventListener("online", envoyerBilletsStockes);
});

// Initialisation du scanner
function initScanner() {
  console.log(" Initialisation de QRScanner...");

  QRScanner.prepare(function (err, status) {
    if (err) {
      console.error("Erreur d'initialisation QRScanner :", err);
      return;
    }

    if (status.authorized) {
      console.log("✅ Permission accordée, QRScanner prêt.");
    } else if (status.denied) {
      alert(
        " Permission refusée pour la caméra. Activez-la dans les paramètres."
      );
    } else {
      alert(" Permission non accordée. Essayez à nouveau.");
    }
  });
}

// Démarrage du scan
function scanQRCode() {
  if (typeof QRScanner === "undefined") {
    alert(
      " QRScanner n'est pas disponible. Lance l'application sur un téléphone !"
    );
    return;
  }

  console.log(" Démarrage du scan...");
  document.body.style.backgroundColor = "transparent";

  QRScanner.scan(function (err, text) {
    if (err) {
      console.error(" Erreur lors du scan :", err);
      if (err.name === "SCAN_CANCELED") {
        document.getElementById("qr-content").innerText =
          "Le scan a été annulé.";
      }
      return;
    }

    console.log(" QR Code scanné :", text);
    alert("QR Code détecté : " + text);

    if (text.startsWith("http://") || text.startsWith("https://")) {
      console.log(" C'est une URL, ouverture dans InAppBrowser !");
      openInAppBrowser(text);
    } else {
      console.log(" C'est un billet, vérification en cours...");
      handleQRScan(text);
    }

    QRScanner.hide();
    QRScanner.destroy();
  });

  QRScanner.show();
}

// Ouvre URL externe
function openInAppBrowser(url) {
  cordova.InAppBrowser.open(url, "_system");
}

// Traitement complet du billet
async function handleQRScan(qrContent) {
  console.log("Contenu brut du QR:", qrContent);

  const [jsonStr, signature] = qrContent.split(":");
  if (!jsonStr || !signature) {
    console.error("Format invalide - séparateur ':' manquant");
    alert("QR Code invalide ! Format attendu: {json}:{signature}");
    return;
  }

  try {
    const billetData = JSON.parse(jsonStr.trim());
    console.log("Données parsées:", billetData);

    // 🧠 Récupère la clé publique locale
    const publicKey = await getPublicKey(billetData.event);
    if (!publicKey) {
      alert("Clé publique manquante pour cet événement !");
      return;
    }

    // ✅ Vérifie la signature avec la clé
    const isValid = await verify_signature(
      signature,
      jsonStr.trim(),
      publicKey
    );
    if (!isValid) {
      console.error("Signature invalide !");
      alert("Billet falsifié !");
      return;
    }

    console.log("✅ Billet valide !");
    alert(`Billet valide pour l'événement: ${billetData.event}`);

    if (navigator.onLine) {
      console.log(" Envoi au serveur...");
      await envoyerBilletServeur(qrContent);
    } else {
      console.log(" Hors ligne, stockage temporaire...");
      await saveOfflineTicket(billetData.uuid, qrContent, billetData.event);
      alert("Billet stocké en mode hors ligne ✅");

      // (optionnel) debug
      const enAttente = await getPendingTickets();
      console.log("Tickets en attente de sync :", enAttente);
    }
  } catch (error) {
    console.error(" Erreur lors du traitement du QR code :", error);
    alert("Erreur lors de l'analyse du QR Code !");
  }
}

// Envoi d’un billet au serveur
async function envoyerBilletServeur(qrcodeData) {
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    alert("Clé API manquante !");
    return;
  }

  try {
    const response = await fetch(
      "https://lespass.demo.tibillet.org/scan/ticket",
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrcode_data: qrcodeData,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.valid) {
      alert("✅ Billet validé par le serveur !");
    } else {
      alert("❌ Billet refusé : " + (result.message || "invalide"));
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi au serveur :", error);
    alert("Erreur réseau ou serveur !");
  }
}

// Sync offline → online : on envoie les billets stockés
async function envoyerBilletsStockes() {
  try {
    const billets = await getPendingTickets();
    console.log("🌀 Tentative de sync des billets offline :", billets);

    for (const billet of billets) {
      await envoyerBilletServeur(billet.qrcode_data);
      await markTicketAsSynced(billet.uuid); // MAJ du status local
    }

    console.log("✅ Tous les billets offline ont été synchronisés !");
  } catch (error) {
    console.error("Erreur pendant la synchronisation offline :", error);
  }
}
