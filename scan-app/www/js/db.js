// gestion locale des clés publiques et billets scannés offline

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("billetsDB", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains("publicKeys")) {
        db.createObjectStore("publicKeys", { keyPath: "event_uuid" });
      }

      if (!db.objectStoreNames.contains("tickets")) {
        db.createObjectStore("tickets", { keyPath: "uuid" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Erreur ouverture DB :", event.target.error);
    };
  });
}

// enregistre ou mettre à jour une clé publique pour un événement
async function savePublicKey(event_uuid, publicKeyPem) {
  const db = await openDatabase();
  const tx = db.transaction("publicKeys", "readwrite");
  const store = tx.objectStore("publicKeys");

  await store.put({ event_uuid, publicKeyPem });
  db.close();
}

// recup events et stockage des clés publiques
async function fetchEvents() {
  try {
    const response = await fetch(
      "https://lespass.demo.tibillet.org/api/events?only_futur=true"
    );
    if (!response.ok)
      throw new Error("Erreur lors de la récupération des événements");

    const events = await response.json();

    for (const event of events) {
      await savePublicKey(event.uuid, event.publicKeyPem);
    }

    console.log("✅ Clés publiques mises à jour :", events.length);
    return events;
  } catch (err) {
    console.warn("Offline on garde les clés :", err.message);
    return [];
  }
}

//  recupere la clé publique liée à un événement
async function getPublicKey(event_uuid) {
  const db = await openDatabase();
  const tx = db.transaction("publicKeys", "readonly");
  const store = tx.objectStore("publicKeys");

  const result = await store.get(event_uuid);
  db.close();
  return result?.publicKeyPem || null;
}

// save un ticket scanné offline (
async function saveOfflineTicket(
  uuid,
  qrcode_data,
  event_uuid,
  status = "pending"
) {
  const db = await openDatabase();
  const tx = db.transaction("tickets", "readwrite");
  const store = tx.objectStore("tickets");

  await store.put({ uuid, qrcode_data, event_uuid, status }); // on stocke qrcode_data au lieu de signature
  db.close();
}

// recup tous les tickets non synchronisés
async function getPendingTickets() {
  const db = await openDatabase();
  const tx = db.transaction("tickets", "readonly");
  const store = tx.objectStore("tickets");

  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const pending = request.result.filter((t) => t.status === "pending");
      db.close();
      resolve(pending);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

// marque un ticket comme synced
async function markTicketAsSynced(uuid) {
  const db = await openDatabase();
  const tx = db.transaction("tickets", "readwrite");
  const store = tx.objectStore("tickets");

  const ticket = await store.get(uuid);
  if (ticket) {
    const updatedTicket = { ...ticket, status: "synced" };
    await store.put(updatedTicket);
  }

  db.close();
}
