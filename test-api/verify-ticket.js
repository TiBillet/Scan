// const crypto = require("crypto");
// const fs = require("fs");

// // Remplace cette ligne par le contenu complet de ton billet (le QR Code)
// const billetQRCode = `{"uuid":"billet-test-123","event":"event1","date":"2025-04-30T18:00:00Z"}:GdIxkmcgv6hQyEAkSpXf8n9hcHKDri8iQV4XLG8u74QhnpcOjgMrUAZoEV0Y+DPYj5rg7xWOdt53xwmZ3jJLqrJRMK7gy6q5M8F7D6T/4MEZWhq3ln2QzD/PzD6ZIZe/1NSVhmh3NPonaXOqJqCcBoCZRUoIZh3Jf3LVWAZjv3nhBSMyBXhD+QyQgn2cxEAL8zqhaE7xR2IgMilMMTZtpAbulnSiHE0Zi02b2rKdICj07Qa0W/h/j/5KXORXK6cBxxSK7XSPS2aRYAjzPx/DGjg+Vsi7lFq7N+NBKxqDotls6t/qWok2UDNI3EqUCWGc7Y9u1j5heuYdmN4uyhRrRQ==`;

// const [data, signature] = billetQRCode.split(":");

// // Lire la clé publique de event1
// const publicKey = fs.readFileSync("event1_public.pem", "utf8");

// // Créer un vérificateur
// const verify = crypto.createVerify("RSA-SHA256");
// verify.update(data);
// verify.end();

// // Vérifier la signature
// const isValid = verify.verify(publicKey, signature, "base64");

// console.log(
//   isValid
//     ? "✅ Signature valide (billet authentique)"
//     : "❌ Signature invalide (faux billet)"
// );

const crypto = require("crypto");
const fs = require("fs");

// Lire les données du billet depuis le fichier
const ticketData = fs.readFileSync("ticket.json", "utf8");

// Lire la signature copiée depuis le terminal (remplace ici par ta signature copiée exactement)
const signature =
  "H+D2CKDKML6IlDmlBoDy//1nWjndZ33X1BEY3Oe0AwwVC7aAaL3V/2lTA10asyvo4vxDpKxsvW1zB1IKVE2MmsWu/3hPGFN8kH9mTs7LVFdkL9K26RLzAZYpNexfTq/zqS9QomyZ1nVkkbNj+5RZXKtDBF/IqZkV92YUi1dCMbh2BhIQJDnKOLd3GexviskL+v2Zr+NSpIdjLF538hn/rUzQ0OVowbbNmPJ7TsrvpTBf83GpHoij1GdkrMpV8pLnLL0VWMyGz0zL0jaAE5PT2npJCrsjJyK4Yim+Qd0Ut17p265LaUTWnEreXqjoWJFrcqncKm+Zuw8ZBnIkREUa/w==";

// Lire la clé publique
const publicKey = fs.readFileSync("event1_public.pem", "utf8");

// Vérifier
const verify = crypto.createVerify("RSA-SHA256");
verify.update(ticketData);
verify.end();

const isValid = verify.verify(publicKey, signature, "base64");

console.log(
  isValid ? "✅ Signature VALIDE" : "❌ Signature invalide (faux billet)"
);
