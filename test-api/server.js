// server.js
const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Lecture des clés publiques générées
const publicKey1 = fs.readFileSync("event1_public.pem", "utf8");
const publicKey2 = fs.readFileSync("event2_public.pem", "utf8");

// Données fake event
const events = [
  {
    uuid: "event-1",
    name: "Concert de test",
    description: "concert ficitf",
    startDate: "2025-04-30T18:00:00Z",
    publicKeyPem: publicKey1,
  },
  {
    uuid: "event-2",
    name: "Festival test",
    description: "festival fictif",
    startDate: "2025-05-01T12:00:00Z",
    publicKeyPem: publicKey2,
  },
];

// Route pour récupérer un évent
app.get("/api/events/:uuid", (req, res) => {
  const event = events.find((e) => e.uuid === req.params.uuid);
  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ error: "Event not found" });
  }
});

// Route pour récupérer toute les clés publiques
app.get("/api/public_keys", (req, res) => {
  res.json({
    event1: publicKey1,
    event2: publicKey2,
  });
});

app.listen(port, () => {
  console.log(`Fake API démarrée sur http://localhost:${port}`);
});
