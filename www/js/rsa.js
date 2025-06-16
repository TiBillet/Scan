// Vérification RSA en local avec clé publique donnée
async function verify_signature(signatureBase64, message, publicKeyPem) {
  console.log("=== Début vérification RSA ===");
  console.log("Message original:", message);
  console.log("Signature (base64):", signatureBase64);

  if (!publicKeyPem) {
    console.error("Aucune clé publique fournie !");
    return false;
  }

  try {
    // Importation de la clé
    const publicKey = await importPublicKey(publicKeyPem);
    console.log("Clé publique importée avec succès");

    // Encodage du message
    const enc = new TextEncoder();
    const messageBuffer = enc.encode(message);

    // Conversion de la signature
    const signature = base64ToArrayBuffer(signatureBase64);

    // Vérification
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

// Import clé publique PEM (SPKI)
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

// Convertir base64 → ArrayBuffer
function base64ToArrayBuffer(base64) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}
