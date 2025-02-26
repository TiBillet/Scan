// async function verifierSignature(signatureBase64, message) {
//   const publicKeyPem = `-----BEGIN PUBLIC KEY-----
//     MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr... (ta clé ici)
//     -----END PUBLIC KEY-----`;

//   try {
//     // Importer la clé publique
//     const publicKey = await importPublicKey(publicKeyPem);

//     // Convertir la signature en buffer
//     const signature = Uint8Array.from(atob(signatureBase64), (c) =>
//       c.charCodeAt(0)
//     );

//     // Encoder le message en buffer
//     const enc = new TextEncoder();
//     const messageBuffer = enc.encode(message);

//     // Vérifier la signature
//     const isValid = await crypto.subtle.verify(
//       { name: "RSASSA-PKCS1-v1_5" },
//       publicKey,
//       signature,
//       messageBuffer
//     );

//     if (isValid) {
//       console.log("✅ Signature valide !");
//       alert("Billet valide !");
//     } else {
//       console.log("❌ Signature invalide !");
//       alert("Billet invalide !");
//     }
//   } catch (error) {
//     console.error("Erreur vérification signature:", error);
//   }
// }

// // Fonction pour importer une clé publique PEM
// async function importPublicKey(pem) {
//   const binaryDer = Uint8Array.from(
//     atob(pem.replace(/-----[^-]+-----|\n/g, "")),
//     (c) => c.charCodeAt(0)
//   );
//   return crypto.subtle.importKey(
//     "spki",
//     binaryDer.buffer,
//     { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
//     false,
//     ["verify"]
//   );
// }

async function verifierSignature(signatureBase64, message) {
  console.log("🔍 Vérification de la signature RSA...");

  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
  MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr...(la clé ici)
  -----END PUBLIC KEY-----`;

  try {
    console.log("📜 Importation de la clé publique...");
    const publicKey = await importPublicKey(publicKeyPem);

    console.log("🔠 Conversion du message en buffer...");
    const enc = new TextEncoder();
    const messageBuffer = enc.encode(message);

    console.log("🔑 Conversion de la signature...");
    const signature = base64ToArrayBuffer(signatureBase64);

    console.log("🛠 Vérification en cours...");
    const isValid = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      publicKey,
      signature,
      messageBuffer
    );

    if (isValid) {
      console.log("✅ Signature RSA valide !");
      alert("Billet valide !");
    } else {
      console.error("❌ Signature RSA invalide !");
      alert("Billet invalide !");
    }
  } catch (error) {
    console.error("🚨 Erreur lors de la vérification RSA :", error);
    alert("Une erreur est survenue lors de la vérification !");
  }
}

// Fonction pour convertir un Base64 en ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Fonction pour importer une clé publique PEM
async function importPublicKey(pem) {
  const binaryDer = base64ToArrayBuffer(pem.replace(/-----[^-]+-----|\n/g, ""));
  return crypto.subtle.importKey(
    "spki",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}
