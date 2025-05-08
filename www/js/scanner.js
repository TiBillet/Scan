document.addEventListener("deviceready", function () {
  console.log("Cordova est prêt !");
  initScanner();
  document.getElementById("startScan").addEventListener("click", scanQRCode);
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

//  Fonction de scan QR Code
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
    alert("QR Code détecté : " + text); // Affiche le texte brut scanné

    // Vérifier si c'est une URL
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

// Fonction pour ouvrir URL dans le navigateur
function openInAppBrowser(url) {
  cordova.InAppBrowser.open(url, "_system");
}

// Vérification et validation du billet
async function handleQRScan(qrContent) {
  console.log("Contenu brut du QR:", qrContent);

  // Séparation du JSON et de la signature
  const [jsonStr, signature] = qrContent.split(":");
  if (!jsonStr || !signature) {
    console.error("Format invalide - séparateur ':' manquant");
    alert("QR Code invalide ! Format attendu: {json}:{signature}");
    return;
  }

  try {
    // 1. Parse le JSON (en supprimant d'éventuels espaces)
    const billetData = JSON.parse(jsonStr.trim());
    console.log("Données parsées:", billetData);

    // 2. Vérifie la signature avec le JSON original (avant parsing)
    const isValid = await verify_signature(signature, jsonStr.trim()); // Utilise jsonStr, pas billetData
    if (!isValid) {
      console.error("Signature invalide !");
      alert("Billet falsifié !");
      return;
    }

    console.log("✅ Billet valide !");
    alert(`Billet valide pour l'événement: ${billetData.event}`);

    // Vérifier si on est connecté
    if (navigator.onLine) {
      console.log(" Envoi au serveur...");
      envoyerBilletServeur(billetData.uuid);
    } else {
      console.log(" Hors ligne, stockage temporaire...");
      await stockerBilletHorsLigne(billetData.uuid);
    }
  } catch (error) {
    console.error(" Erreur lors du traitement du QR code :", error);
    alert("Erreur lors de l'analyse du QR Code !");
  }
}

// Envoi au serveur si connecté
async function envoyerBilletServeur(uuid) {
  try {
    const response = await fetch("http://localhost:3000/api/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uuid }),
    });

    const result = await response.json();
    if (result.valid) {
      console.log(" Billet validé !");
      alert("Billet valide !");
    } else {
      console.error(" Billet refusé !");
      alert("Billet invalide !");
    }
  } catch (error) {
    console.error(" Erreur d'envoi au serveur :", error);
    alert("Erreur de communication avec le serveur !");
  }
}

// Stockage IndexedDB si hors ligne
async function stockerBilletHorsLigne(uuid) {
  const db = await openDB();
  const tx = db.transaction("billets_offline", "readwrite");
  await tx.objectStore("billets_offline").put({ uuid, date: new Date() });
  await tx.done;
  console.log(" Billet stocké hors ligne.");
}

// Envoi billets stockés quand connexion rétablie
async function envoyerBilletsStockes() {
  const db = await openDB();
  const billets = await db
    .transaction("billets_offline")
    .objectStore("billets_offline")
    .getAll();

  for (const billet of billets) {
    await envoyerBilletServeur(billet.uuid);
    await db
      .transaction("billets_offline", "readwrite")
      .objectStore("billets_offline")
      .delete(billet.uuid);
  }

  console.log(" Tous les billets offline ont été envoyés.");
}

// Écouteur pour détecter retour réseau
window.addEventListener("online", envoyerBilletsStockes);

// Initialisation IndexedDB
async function openDB() {
  return idb.openDB("BilletsDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("billets_offline")) {
        db.createObjectStore("billets_offline", { keyPath: "uuid" });
      }
    },
  });
}
