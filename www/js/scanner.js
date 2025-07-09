document.addEventListener("deviceready", function () {
  // Affiche le nom de l'événement sélectionné
  const eventUuid = localStorage.getItem("selectedEventUuid");
  if (eventUuid) {
    cordova.plugin.http.get(
      `https://lespass.demo.tibillet.org/api/events/${eventUuid}/`,
      {},
      { Accept: "application/json" },
      function (response) {
        const event = JSON.parse(response.data);
        const nameElement = document.getElementById("event-name");
        if (nameElement) {
          nameElement.innerText = `${event.name}`;
        }
      },
      function (error) {
        console.error("Erreur chargement de l'événement :", error);
        const nameElement = document.getElementById("event-name");
        if (nameElement) {
          nameElement.innerText = "❌ Événement introuvable.";
        }
      }
    );
  }

  console.log("Cordova est prêt !");
  initScanner();

  document.getElementById("startScan").addEventListener("click", scanQRCode);
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

document.addEventListener("deviceready", async () => {
  console.log("Initialisation des clés publiques...");
  await fetchEvents();
});

async function handleQRScan(qrContent) {
  console.log("Contenu brut du QR:", qrContent);

  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    alert("Vous devez d'abord appairer l'appareil !");
    return;
  }

  const selectedEventUuid = localStorage.getItem("selectedEventUuid");
  if (!selectedEventUuid) {
    alert("Aucun événement sélectionné !");
    return;
  }

  if (navigator.onLine) {
    console.log(" Envoi en ligne...");
    await envoyerBilletServeur(qrContent, selectedEventUuid);
  } else {
    console.log(" Hors ligne, stockage temporaire...");
    const uuid = crypto.randomUUID();
    await saveOfflineTicket(uuid, qrContent, selectedEventUuid);
    alert("Billet stocké en mode hors ligne ✅");

    const enAttente = await getPendingTickets();
    console.log("Tickets en attente de sync :", enAttente);
  }
}

// envoi billet serveur
async function envoyerBilletServeur(qrcodeData, event_uuid = null) {
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) {
    alert("Clé API manquante !");
    return;
  }

  try {
    const response = await fetch(
      "https://lespass.demo.tibillet.org/scan/ticket/",
      {
        method: "POST",
        headers: {
          Authorization: `Api-Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrcode_data: qrcodeData,
          ...(event_uuid && { event_uuid }),
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur HTTP :", response.status, errorText);

      if (response.status === 406 && errorText.includes("Event error")) {
        alert("❌ Le billet ne correspond pas à l’événement sélectionné.");
      } else if (
        response.status === 500 &&
        errorText.includes("n’est pas un UUID valide")
      ) {
        alert("❌ Billet non conforme.");
      } else if (response.status === 403) {
        alert("❌ Clé API invalide ou non autorisée.");
      } else {
        alert("❌ Erreur serveur : " + response.status);
      }

      return;
    }

    const result = await response.json();
    console.log("Réponse complète du serveur :", result);

    if (result.success) {
      alert("✅ Billet conforme, scanné avec succès !");
    } else if (result.error === "Event error") {
      alert("❌ Le billet ne correspond pas à l’événement sélectionné.");
    } else if (result.message === "Ticket already scanned") {
      alert("❌ Ce billet a déjà été scanné !");
    } else {
      alert(
        "❌ Billet refusé : " + (result.message || result.error || "invalide")
      );
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
