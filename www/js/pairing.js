// document.getElementById("startPairing").addEventListener("click", () => {
//   if (!window.QRScanner) {
//     alert("QRScanner non disponible !");
//     return;
//   }

//   QRScanner.prepare(function (err, status) {
//     if (err || !status.authorized) {
//       alert("Permission refusée pour la caméra.");
//       return;
//     }

//     QRScanner.scan(async function (err, text) {
//       QRScanner.hide();
//       QRScanner.destroy();

//       if (err) {
//         alert("Erreur lors du scan : " + err.message);
//         return;
//       }

//       console.log("QR d'appairage scanné :", text);

//       try {
//         // const response = await fetch(text); // Lien complet du QR
//         // const data = await response.json();
//         cordova.InAppBrowser.open(text, "_system");

//         if (data.api_key) {
//           localStorage.setItem("apiKey", data.api_key);
//           alert("✅ Appairage réussi !");
//           console.log("Clé API :", data.api_key);
//         } else {
//           alert("❌ QR invalide ou clé absente.");
//         }
//       } catch (e) {
//         alert("❌ Erreur de requête : " + e.message);
//       }
//     });

//     QRScanner.show();
//   });
// });

// // Exemple de traitement de la réponse d'appairage
// function enregistrerCleAPI(reponseJson) {
//   const apiKey = reponseJson.api_key;

//   if (!apiKey) {
//     alert("❌ Clé API non trouvée dans la réponse.");
//     return;
//   }

//   localStorage.setItem("apiKey", apiKey);
//   alert("✅ Appairage réussi. Clé API enregistrée !");
//   console.log("Clé API enregistrée :", apiKey);
// }

// document.getElementById("testApi").addEventListener("click", async () => {
//   const apiKey = localStorage.getItem("apiKey");
//   if (!apiKey) return alert("❌ Clé API absente, appairez d'abord.");

//   const response = await fetch(
//     "https://lespass.demo.tibillet.org/scan/test_api/",
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Api-Key ${apiKey}`,
//       },
//     }
//   );

//   if (response.status === 200) {
//     const data = await response.json();
//     alert("✅ Test API réussi !");
//     console.log("Test API :", data);
//   } else {
//     alert("❌ Test API échoué : " + response.status);
//   }
// });

// 🔐 Clé API manuelle temporaire (à retirer plus tard)
if (!localStorage.getItem("apiKey")) {
  localStorage.setItem("apiKey", "2vWyJ3ot.7k81pzFUKDWl5iT7wU9mdN6QA3FVlph9"); // ⬅️ Remplace par ta vraie clé
  console.log("🔐 Clé API enregistrée manuellement.");
}

document.getElementById("startPairing").addEventListener("click", () => {
  if (!window.QRScanner) {
    alert("QRScanner non disponible !");
    return;
  }

  QRScanner.prepare(function (err, status) {
    if (err || !status.authorized) {
      alert("Permission refusée pour la caméra.");
      return;
    }

    QRScanner.scan(function (err, text) {
      QRScanner.hide();
      QRScanner.destroy();

      if (err) {
        alert("Erreur lors du scan : " + err.message);
        return;
      }

      console.log("QR d'appairage scanné :", text);

      // ✅ On ouvre simplement le lien dans le navigateur externe
      cordova.InAppBrowser.open(text, "_system");

      // ✅ Message clair pour l'utilisateur
      alert(
        "🔐 Le lien d'appairage s'ouvre dans ton navigateur.\nReviens dans l'application une fois l'appairage terminé."
      );
    });

    QRScanner.show();
  });
});

// VERSION A UTILISER UNE FOIS CORS FIX SANS PLUGIN HTTPS

// // ✅ Bouton test API
// document.getElementById("testApi").addEventListener("click", async () => {
//   const apiKey = localStorage.getItem("apiKey");
//   if (!apiKey) return alert("❌ Clé API absente, appairez d'abord.");

//   try {
//     const response = await fetch(
//       "https://lespass.demo.tibillet.org/scan/test_api/",
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Api-Key ${apiKey}`,
//         },
//       }
//     );

//     if (response.status === 200) {
//       const data = await response.json();
//       alert("✅ Test API réussi !");
//       console.log("Test API :", data);
//     } else {
//       alert("❌ Test API échoué : " + response.status);
//     }
//   } catch (e) {
//     alert("❌ Erreur lors du test API : " + e.message);
//   }
// });

// VERSION AVEC PLUGIN CROS HTTPS

document.getElementById("testApi").addEventListener("click", async () => {
  const apiKey = localStorage.getItem("apiKey");
  if (!apiKey) return alert("❌ Clé API absente, appairez d'abord.");

  cordova.plugin.http.setDataSerializer("json");

  cordova.plugin.http.sendRequest(
    "https://lespass.demo.tibillet.org/scan/test_api/",
    {
      method: "get",
      headers: {
        Authorization: `Api-Key ${apiKey}`,
      },
    },
    function (response) {
      try {
        const data = JSON.parse(response.data);
        alert("✅ Test API réussi !");
        console.log("Test API :", data);
      } catch (e) {
        alert("❌ Réponse invalide : " + e.message);
      }
    },
    function (error) {
      console.error("Erreur test API :", error);
      alert("❌ Test API échoué : " + error.status + " — " + error.error);
    }
  );
});
