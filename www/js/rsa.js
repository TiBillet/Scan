async function verifierSignature(signatureBase64, message) {
  const publicKeyPem = `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr... (ta clé ici)
    -----END PUBLIC KEY-----`;

  try {
    // Importer la clé publique
    const publicKey = await importPublicKey(publicKeyPem);

    // Convertir la signature en buffer
    const signature = Uint8Array.from(atob(signatureBase64), (c) =>
      c.charCodeAt(0)
    );

    // Encoder le message en buffer
    const enc = new TextEncoder();
    const messageBuffer = enc.encode(message);

    // Vérifier la signature
    const isValid = await crypto.subtle.verify(
      { name: "RSASSA-PKCS1-v1_5" },
      publicKey,
      signature,
      messageBuffer
    );

    if (isValid) {
      console.log("✅ Signature valide !");
      alert("Billet valide !");
    } else {
      console.log("❌ Signature invalide !");
      alert("Billet invalide !");
    }
  } catch (error) {
    console.error("Erreur vérification signature:", error);
  }
}

// Fonction pour importer une clé publique PEM
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
