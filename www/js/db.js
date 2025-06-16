// db.js — Gestion locale des clés publiques et billets scannés offline

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

// 💾 Enregistrer ou mettre à jour une clé publique pour un événement
async function savePublicKey(event_uuid, publicKeyPem) {
  const db = await openDatabase();
  const tx = db.transaction("publicKeys", "readwrite");
  const store = tx.objectStore("publicKeys");

  await store.put({ event_uuid, publicKeyPem });
  db.close();
}

// 📦 Récupérer la clé publique liée à un événement
async function getPublicKey(event_uuid) {
  const db = await openDatabase();
  const tx = db.transaction("publicKeys", "readonly");
  const store = tx.objectStore("publicKeys");

  const result = await store.get(event_uuid);
  db.close();
  return result?.publicKeyPem || null;
}

// 📲 Enregistrer un ticket scanné offline
async function saveOfflineTicket(
  uuid,
  signature,
  event_uuid,
  status = "pending"
) {
  const db = await openDatabase();
  const tx = db.transaction("tickets", "readwrite");
  const store = tx.objectStore("tickets");

  await store.put({ uuid, signature, event_uuid, status }); // status = pending | synced | invalid
  db.close();
}

// 🔍 Récupérer tous les tickets non synchronisés
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

// 🧪 Marquer un ticket comme "synced" (utile après POST à l’API)
async function markTicketAsSynced(uuid) {
  const db = await openDatabase();
  const tx = db.transaction("tickets", "readwrite");
  const store = tx.objectStore("tickets");

  const ticket = await store.get(uuid);
  if (ticket) {
    ticket.status = "synced";
    await store.put(ticket);
  }
  db.close();
}
