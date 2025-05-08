// const crypto = require("crypto");
// const fs = require("fs");

// // On garde exactement ce JSON, même format
// const ticketData = JSON.stringify({
//   uuid: "billet-test-123",
//   event: "event1",
//   date: "2025-04-30T18:00:00Z",
// });

// // Lire la clé privée
// const privateKey = fs.readFileSync("event1_private.pem", "utf8");

// // Créer le signateur
// const sign = crypto.createSign("RSA-SHA256");
// sign.update(ticketData);
// sign.end();

// // Signer
// const signature = sign.sign(privateKey, "base64");

// // Afficher le billet signé
// console.log(`${ticketData}:${signature}`);

const crypto = require("crypto");
const fs = require("fs");

// Lire les données du billet depuis un fichier (garantit qu'on a EXACTEMENT le même JSON à chaque fois)
const ticketData = fs.readFileSync("ticket.json", "utf8");

// Lire la clé privée
const privateKey = fs.readFileSync("event1_private.pem", "utf8");

// Signer
const sign = crypto.createSign("RSA-SHA256");
sign.update(ticketData);
sign.end();
const signature = sign.sign(privateKey, "base64");

// Afficher résultat
console.log(`${ticketData}:${signature}`);
