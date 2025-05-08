async function verify_signature(signatureBase64, message) {
  console.log("=== Début vérification RSA ===");
  console.log("Message original:", message);
  console.log("Type de message:", typeof message);
  console.log("Signature (base64):", signatureBase64);

  // 1. Récupération clé publique
  const publicKeyPem = await getPublicKeyFromServer();
  console.log("Clé publique reçue:", publicKeyPem?.substring(0, 50) + "...");

  if (!publicKeyPem) {
    console.error("Aucune clé publique trouvée");
    return false;
  }

  try {
    // 2. Importation de la clé
    const publicKey = await importPublicKey(publicKeyPem);
    console.log("Clé publique importée avec succès");

    // 3. Conversion des données
    const enc = new TextEncoder();
    const messageBuffer = enc.encode(message);
    console.log("Message encodé:", messageBuffer);

    const signature = base64ToArrayBuffer(signatureBase64);
    console.log("Signature convertie:", signature);

    // 4. Vérification
    const isValid = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      publicKey,
      signature,
      messageBuffer
    );

    console.log("=== Résultat vérification ===", isValid);
    return isValid;
  } catch (error) {
    console.error("Erreur complète:", error);
    return false;
  }
}

//  Récupération clé publique du serveur UNE SEULE FOIS
async function getPublicKeyFromServer() {
  const cachedKey = localStorage.getItem("publicKey");
  if (cachedKey) return cachedKey;

  try {
    const response = await fetch("http://localhost:3000/api/events");
    const data = await response.json();
    localStorage.setItem("publicKey", data.publicKey);
    return data.publicKey;
  } catch (error) {
    console.error(" Erreur de récupération de la clé publique :", error);
    return null;
  }
}

//  Import clé publique PEM
async function importPublicKey(pem) {
  const binaryDer = Uint8Array.from(
    atob(pem.replace(/-----[^-]+-----|\n/g, "")),
    (c) => c.charCodeAt(0)
  );

  return crypto.subtle.importKey(
    "spki",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

// Convertir Base64 en ArrayBuffer
function base64ToArrayBuffer(base64) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}
