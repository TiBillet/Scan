// // MODEL POUR APPEL SERVEUR

// // function fetchSignatureFromServer(billetID) {
// //   fetch("https://ton-serveur.com/api/get_signature", {
// //     method: "POST",
// //     headers: { "Content-Type": "application/json" },
// //     body: JSON.stringify({ billetID }),
// //   })
// //     .then((response) => response.json())
// //     .then((data) => {
// //       if (data.signature && data.message) {
// //         verifierSignature(data.signature, data.message);
// //       } else {
// //         console.error("Signature ou message manquant !");
// //       }
// //     })
// //     .catch((error) => console.error("Erreur API:", error));
// // }

// // MODEL POUR TEST JSON LOCAL

// function fetchSignatureFromLocal(billetID) {
//   console.log("🔍 Recherche du billet :", billetID);

//   fetch("billets.json")
//     .then((response) => response.json())
//     .then((data) => {
//       const billet = data.find((b) => b.id === billetID);
//       if (billet) {
//         verifierSignature(
//           billet.signature,
//           `${billet.id}-${billet.event}-${billet.date}`
//         );
//       } else {
//         console.error("Billet non trouvé !");
//         alert("Billet invalide !");
//       }
//     })
//     .catch((error) => console.error("Erreur chargement des billets:", error));
// }

// function verifierBilletLocal(billetID) {
//   fetch("billets.json")
//     .then((response) => response.json())
//     .then((data) => {
//       const billet = data.find((b) => b.id === billetID);
//       if (billet) {
//         console.log("✅ Billet trouvé :", billet);
//         verifierSignature(
//           billet.signature,
//           `${billet.id}-${billet.event}-${billet.date}`
//         );
//       } else {
//         console.error("❌ Billet non trouvé !");
//         alert("Billet invalide !");
//       }
//     })
//     .catch((error) => console.error("Erreur chargement des billets:", error));
// }

// MODE SERVEUR : Vérifier la signature avec l'API
function fetchSignatureFromServer(billetID) {
  console.log(
    "🌐 Recherche de la signature en ligne pour le billet :",
    billetID
  );

  // Changer nom serveur
  fetch("https://le-serveur.com/api/get_signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ billetID }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Réponse serveur non valide !");
      return response.json();
    })
    .then((data) => {
      if (data.signature && data.message) {
        console.log("✅ Signature reçue du serveur !");
        verifierSignature(data.signature, data.message);
      } else {
        console.error("⚠️ Signature manquante, passage au mode hors ligne...");
        fetchSignatureFromLocal(billetID);
      }
    })
    .catch((error) => {
      console.error("🚨 Erreur API :", error);
      console.log("🛑 Serveur inaccessible, utilisation du mode hors ligne.");
      fetchSignatureFromLocal(billetID);
    });
}

// MODE LOCAL : Vérifier la signature depuis un fichier JSON
function fetchSignatureFromLocal(billetID) {
  console.log("🔍 Recherche du billet local :", billetID);

  fetch("billets.json")
    .then((response) => response.json())
    .then((data) => {
      const billet = data.find((b) => b.id === billetID);
      if (billet && billet.signature && billet.event && billet.date) {
        console.log("✅ Billet trouvé :", billet);

        // Créer le message comme sur le serveur
        const message = JSON.stringify({
          id: billet.id,
          event: billet.event,
          date: billet.date,
        });

        verifierSignature(billet.signature, message);
      } else {
        console.error("❌ Billet non trouvé ou mal formé !");
        alert("Billet invalide !");
      }
    })
    .catch((error) =>
      console.error("🚨 Erreur chargement des billets:", error)
    );
}

// Vérification locale du billet
function verifierBilletLocal(billetID) {
  fetchSignatureFromLocal(billetID);
}
