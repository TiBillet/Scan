document.addEventListener("deviceready", function () {
  const apiBaseUrl = localStorage.getItem("apiBaseUrl");
  const eventUuid = localStorage.getItem("selectedEventUuid");

  if (eventUuid && apiBaseUrl) {
    cordova.plugin.http.get(
      `${apiBaseUrl}/api/events/${eventUuid}/`,
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

  initScanner();

  const startScanBtn = document.getElementById("startScan");
  const scannerOverlay = document.getElementById("scanner-overlay");

  startScanBtn.addEventListener("click", () => {
    startScanBtn.style.display = "none";
    scannerOverlay.classList.remove("hidden");
    scanQRCode();
  });

  window.addEventListener("online", () => {
    console.log("Connexion rétablie, tentative de synchro.");
    envoyerBilletsStockes();
  });
  if (navigator.onLine) {
    envoyerBilletsStockes();
  }
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
      // forcer l’autofocus continu si dispo
      if (typeof QRScanner.setCameraPreviewConfiguration === "function") {
        QRScanner.setCameraPreviewConfiguration(
          {
            focusMode: "continuous",
          },
          function (err) {
            if (err) {
              console.warn("Impossible de définir le focusMode :", err);
            } else {
              console.log("Autofocus continu activé.");
            }
          }
        );
      }
    } else if (status.denied) {
      alert(
        "Permission refusée pour la caméra. Activez-la dans les paramètres."
      );
    } else {
      alert("Permission non accordée. Essayez à nouveau.");
    }
  });
}

// Démarrage du scan
function scanQRCode() {
  if (typeof QRScanner === "undefined") {
    alert(
      "QRScanner n'est pas disponible. Lance l'application sur un téléphone !"
    );
    return;
  }

  // Fond transparent pour la caméra
  document.body.style.backgroundColor = "transparent";
  showScannerFrame();

  QRScanner.scan(async function (err, text) {
    if (err) {
      console.error("Erreur lors du scan :", err);
      if (err.name === "SCAN_CANCELED") {
        document.getElementById("qr-content").innerText =
          "Le scan a été annulé.";
      }
      return;
    }

    // traiter comme un billet
    await handleQRScan(text);

    // Nettoyage après scan
    QRScanner.hide();
    QRScanner.destroy();
    document.getElementById("scanner-overlay")?.classList.add("hidden");
    hideScannerFrame();
  });

  QRScanner.show();
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

  // Si online, comportement existant
  if (navigator.onLine) {
    console.log(" envoi en ligne..");
    await envoyerBilletServeur(qrContent, selectedEventUuid);
    return;
  }

  // Si OFFLINE + vérification RSA locale
  console.log(" Hors ligne, tentative de vérification locale...");

  const [jsonPart, signatureBase64] = qrContent.split(":");
  if (!jsonPart || !signatureBase64) {
    alert("QR code invalide (structure incorrecte)");
    return;
  }

  let ticketData;
  try {
    const decodedJson = atob(jsonPart);
    ticketData = JSON.parse(decodedJson);
  } catch (e) {
    alert("QR code invalide (JSON mal formé)");
    return;
  }

  const uuid = ticketData.uuid || crypto.randomUUID();

  // Récupère la clé publique de l'événement
  const publicKeyPem = await getPublicKey(selectedEventUuid);
  if (!publicKeyPem) {
    alert("Clé publique introuvable pour l'événement.");
    return;
  }

  const isValid = await verify_signature(
    signatureBase64,
    jsonPart,
    publicKeyPem
  );

  if (isValid) {
    afficherFeedbackScan("success");
  } else {
    afficherFeedbackScan("error", "Signature invalide. Billet non conforme.");
  }

  // On stock de toute façon le billet
  await saveOfflineTicket(uuid, qrContent, selectedEventUuid);
  const enAttente = await getPendingTickets();
  console.log("billet en attente de sync :", enAttente);
}

// envoi billet serveur
async function envoyerBilletServeur(qrcodeData, event_uuid = null) {
  const apiKey = localStorage.getItem("apiKey");
  const apiBaseUrl = localStorage.getItem("apiBaseUrl");

  if (!apiKey || !apiBaseUrl) {
    alert("Appairage nécessaire (clé API ou URL manquante).");
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/scan/ticket/`, {
      method: "POST",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        qrcode_data: qrcodeData,
        ...(event_uuid && { event_uuid }),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Erreur HTTP :", response.status, errorText);

      if (response.status === 406 && errorText.includes("Event error")) {
        afficherFeedbackScan(
          "error",
          "❌ Le billet ne correspond pas à l’événement sélectionné."
        );
      } else if (
        response.status === 500 &&
        errorText.includes("n’est pas un UUID valide")
      ) {
        afficherFeedbackScan("error", "❌ Billet non conforme.");
      } else if (response.status === 403) {
        afficherFeedbackScan("error", "❌ Clé API invalide ou non autorisée.");
      } else {
        afficherFeedbackScan("error", "❌ Erreur serveur : " + response.status);
      }

      return setTimeout(scanQRCode, 1000);
    }

    const result = await response.json();
    console.log("Réponse complète du serveur :", result);

    if (result.success) {
      afficherFeedbackScan("success");
    } else if (result.error === "Event error") {
      afficherFeedbackScan(
        "error",
        "❌ Le billet ne correspond pas à l’événement sélectionné."
      );

      // } else if (result.message === "Ticket already scanned") {
      //   let extraInfo = "";

      //   // Si l'API a renvoyé des infos sur le scan précédent
      //   if (result.scan_date || result.responsable) {
      //     extraInfo += "\n\n";
      //     if (result.scan_date) {
      //       extraInfo += `📅 Scanné le : ${new Date(result.scan_date).toLocaleString("fr-FR")}\n`;
      //     }
      //     if (result.responsable) {
      //       extraInfo += `👤 Responsable : ${result.responsable}`;
      //     }
      //   }

      //   afficherFeedbackScan("error", `❌ Ce billet a déjà été scanné !${extraInfo}`);
      // }
    } else if (result.message === "Ticket already scanned") {
      afficherFeedbackScan("error", "❌ Ce billet a déjà été scanné !");
    } else {
      afficherFeedbackScan(
        "error",
        "❌ Billet refusé : " + (result.message || result.error || "invalide")
      );
    }

    return setTimeout(scanQRCode, 1000);
  } catch (error) {
    console.error("Erreur lors de l'envoi au serveur :", error);
    alert("Erreur réseau ou serveur !");
  }
}

// Sync offline - online envoie des billets stockés
async function envoyerBilletsStockes() {
  try {
    const billets = await getPendingTickets();
    console.log("essaie de sync des billets offline :", billets);

    for (const billet of billets) {
      if (!billet.event_uuid) {
        console.warn(" Billet effacé (quand gardé en stock offline) :", billet);
        continue;
      }

      await envoyerBilletServeur(billet.qrcode_data, billet.event_uuid);
      await markTicketAsSynced(billet.uuid);
    }

    console.log("✅ Tous les billets offline ont été synchronisés !");
  } catch (error) {
    console.error("Erreur pendant la synchronisation offline :", error);
  }
}

function afficherFeedbackScan(type, message) {
  const box = document.getElementById("scan-feedback");
  const icon = document.getElementById("scan-icon");
  const msg = document.getElementById("scan-message");
  const soundSuccess = document.getElementById("sound-success");
  const soundError = document.getElementById("sound-error");

  if (!box || !icon || !msg) return;

  box.classList.remove("hidden", "success", "error");
  box.classList.add(type);

  if (type === "success") {
    icon.textContent = "✅";
    soundSuccess.play();
  } else {
    icon.textContent = "❌";
    soundError.play();
  }

  msg.textContent = message;

  const hide = () => {
    box.classList.add("hidden");
    box.removeEventListener("click", hide);
  };
  setTimeout(() => {
    box.classList.add("hidden");
  }, 2000);
}

function showScannerFrame() {
  document.getElementById("scanner-frame")?.classList.remove("hidden");
}

function hideScannerFrame() {
  document.getElementById("scanner-frame")?.classList.add("hidden");
}
