async function verify_signature(signatureBase64, message) {
  console.log(" Vérification de la signature RSA...");

  // Clé publique récupérée une seule fois et stocké localement
  const publicKeyPem = await getPublicKeyFromServer();

  try {
    console.log(" Importation de la clé publique...");
    const publicKey = await importPublicKey(publicKeyPem);

    console.log(" Conversion du message en buffer...");
    const enc = new TextEncoder();
    const messageBuffer = enc.encode(message);

    console.log(" Conversion de la signature...");
    const signature = base64ToArrayBuffer(signatureBase64);

    console.log(" Vérification en cours...");
    const isValid = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      publicKey,
      signature,
      messageBuffer
    );

    return isValid;
  } catch (error) {
    console.error(" Erreur lors de la vérification RSA :", error);
    return false;
  }
}

//  Récupération clé publique du serveur UNE SEULE FOIS
async function getPublicKeyFromServer() {
  const cachedKey = localStorage.getItem("publicKey");
  if (cachedKey) return cachedKey;

  try {
    const response = await fetch("https://nomduserv/api/public_key");
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
