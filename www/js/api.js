// MODEL POUR APPEL SERVEUR

// function fetchSignatureFromServer(billetID) {
//   fetch("https://ton-serveur.com/api/get_signature", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ billetID }),
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       if (data.signature && data.message) {
//         verifierSignature(data.signature, data.message);
//       } else {
//         console.error("Signature ou message manquant !");
//       }
//     })
//     .catch((error) => console.error("Erreur API:", error));
// }

// MODEL POUR TEST JSON LOCAL

function fetchSignatureFromLocal(billetID) {
  console.log("🔍 Recherche du billet :", billetID);

  fetch("billets.json")
    .then((response) => response.json())
    .then((data) => {
      const billet = data.find((b) => b.id === billetID);
      if (billet) {
        verifierSignature(
          billet.signature,
          `${billet.id}-${billet.event}-${billet.date}`
        );
      } else {
        console.error("Billet non trouvé !");
        alert("Billet invalide !");
      }
    })
    .catch((error) => console.error("Erreur chargement des billets:", error));
}

function verifierBilletLocal(billetID) {
  fetch("billets.json")
    .then((response) => response.json())
    .then((data) => {
      const billet = data.find((b) => b.id === billetID);
      if (billet) {
        console.log("✅ Billet trouvé :", billet);
        verifierSignature(
          billet.signature,
          `${billet.id}-${billet.event}-${billet.date}`
        );
      } else {
        console.error("❌ Billet non trouvé !");
        alert("Billet invalide !");
      }
    })
    .catch((error) => console.error("Erreur chargement des billets:", error));
}
