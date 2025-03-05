// // MODE SERVEUR : Vérifier la signature avec l'API
// function fetchSignatureFromServer(billetID) {
//   console.log(
//     "🌐 Recherche de la signature en ligne pour le billet :",
//     billetID
//   );

//   // Changer nom serveur
//   fetch("https://le-serveur.com/api/get_signature", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ billetID }),
//   })
//     .then((response) => {
//       if (!response.ok) throw new Error("Réponse serveur non valide !");
//       return response.json();
//     })
//     .then((data) => {
//       if (data.signature && data.message) {
//         console.log(" Signature reçue du serveur !");
//         verifierSignature(data.signature, data.message);
//       } else {
//         console.error("⚠️ Signature manquante, passage au mode hors ligne...");
//         fetchSignatureFromLocal(billetID);
//       }
//     })
//     .catch((error) => {
//       console.error(" Erreur API :", error);
//       console.log(" Serveur inaccessible, utilisation du mode hors ligne.");
//       fetchSignatureFromLocal(billetID);
//     });
// }

// // MODE LOCAL : Vérifier la signature depuis un JSON
// function fetchSignatureFromLocal(billetID) {
//   console.log("🔍 Recherche du billet local :", billetID);

//   fetch("billets.json")
//     .then((response) => response.json())
//     .then((data) => {
//       const billet = data.find((b) => b.id === billetID);
//       if (billet && billet.signature && billet.event && billet.date) {
//         console.log(" Billet trouvé :", billet);

//         // Créer le message comme sur le serveur
//         const message = JSON.stringify({
//           id: billet.id,
//           event: billet.event,
//           date: billet.date,
//         });

//         verifierSignature(billet.signature, message);
//       } else {
//         console.error(" Billet non trouvé ou mal formé !");
//         alert("Billet invalide !");
//       }
//     })
//     .catch((error) => console.error(" Erreur chargement des billets:", error));
// }

// // Vérification locale du billet
// function verifierBilletLocal(billetID) {
//   fetchSignatureFromLocal(billetID);
// }

// MODE SERVEUR : Vérifier la signature avec l'API
async function fetchSignatureFromServer(billetID) {
  console.log(
    "🌐 Recherche de la signature en ligne pour le billet :",
    billetID
  );

  try {
    const response = await fetch("https://le-serveur.com/api/get_signature", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ billetID }),
    });

    if (!response.ok) throw new Error("Réponse serveur non valide !");
    const data = await response.json();

    if (data.signature && data.message) {
      console.log("✅ Signature reçue du serveur !");
      verifierSignature(data.signature, data.message);
    } else {
      console.error("⚠️ Signature manquante, passage au mode hors ligne...");
      fetchSignatureFromLocal(billetID);
    }
  } catch (error) {
    console.error("🚨 Erreur API :", error);
    console.log("⚠️ Serveur inaccessible, utilisation du mode hors ligne.");
    fetchSignatureFromLocal(billetID);
  }
}

// MODE LOCAL : Vérifier la signature depuis IndexedDB
async function fetchSignatureFromLocal(billetID) {
  console.log("🔍 Recherche du billet en mode hors ligne :", billetID);

  const billet = await getBilletFromDB(billetID);
  if (billet) {
    console.log("✅ Billet trouvé :", billet);

    // Vérifier l'expiration du billet
    if (isBilletExpired(billet.date)) {
      console.warn("⏳ Billet expiré !");
      alert("Billet expiré !");
      return;
    }

    // Création du message comme sur le serveur
    const message = JSON.stringify({
      id: billet.id,
      event: billet.event,
      date: billet.date,
      checksum: billet.checksum, // Ajout du checksum pour éviter la fraude
    });

    verifierSignature(billet.signature, message);
  } else {
    console.error("❌ Billet non trouvé ou invalide !");
    alert("Billet invalide !");
  }
}

// Vérification locale du billet
async function verifierBilletLocal(billetID) {
  await fetchSignatureFromLocal(billetID);
}

// Vérifier si un billet est expiré (plus de 30 jours)
function isBilletExpired(dateBillet) {
  const dateNow = new Date();
  const billetDate = new Date(dateBillet);
  return (dateNow - billetDate) / (1000 * 60 * 60 * 24) > 30;
}

// Sauvegarde et récupération des billets en IndexedDB (Stockage sécurisé)
async function saveBilletToDB(billet) {
  const db = await openDB();
  const tx = db.transaction("billets", "readwrite");
  tx.objectStore("billets").put(billet);
  await tx.done;
}

async function getBilletFromDB(billetID) {
  const db = await openDB();
  return db.transaction("billets").objectStore("billets").get(billetID);
}

async function openDB() {
  return idb.openDB("BilletsDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("billets")) {
        db.createObjectStore("billets", { keyPath: "id" });
      }
    },
  });
}
