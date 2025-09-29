document.addEventListener("deviceready", function () {
  const list = document.getElementById("reservation-list");
  const search = document.getElementById("search");

  console.log("✅ Script list.js chargé");

  // Affiche la liste des billets
  function renderList(data) {
    list.innerHTML = "";

    if (!data.length) {
      const li = document.createElement("li");
      li.textContent = "Aucun résultat trouvé.";
      list.appendChild(li);
      return;
    }

    data.forEach((res) => {
      const li = document.createElement("li");
      li.innerHTML = `
    <strong>${res.name}</strong>
    <div class="email">${res.email}</div>
    <div class="status">${res.status}</div>
    `;

      list.appendChild(li);
    });
  }

  // Effectue la requête API
  function fetchReservations(term = "*") {
    const apiKey = localStorage.getItem("apiKey");
    const apiBaseUrl = localStorage.getItem("apiBaseUrl");
    const eventUuid = localStorage.getItem("selectedEventUuid");

    if (!apiKey || !apiBaseUrl || !eventUuid) {
      console.error("❌ Clé API, URL ou UUID événement manquant");
      return;
    }

    const url = `${apiBaseUrl}/scan/search_ticket/`;

    const headers = {
      Authorization: `Api-Key ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const searchString = term.trim();
    if (!searchString) {
      console.warn("⚠️ Aucun terme de recherche — remplacement par '*'");
    }

    const body = {
      search: searchString || "*", // 🔥 fallback pour éviter erreur 400
      event_uuid: eventUuid,
    };

    console.log("📡 Envoi requête pour :", body.search);

    cordova.plugin.http.post(
      url,
      body,
      headers,
      function (response) {
        try {
          const data = JSON.parse(response.data);
          console.log("📥 Données reçues :", data);

          if (!Array.isArray(data.results)) {
            console.error("❌ Format inattendu (results manquant)", data);
            renderList([]);
            return;
          }

          const results = data.results.map((ticket) => ({
            name:
              ticket.first_name || ticket.last_name
                ? `${ticket.first_name || ""} ${ticket.last_name || ""}`.trim()
                : ticket.email || "(Nom inconnu)",
            email: ticket.email || "—",
            status: ticket.status || "Statut inconnu",
          }));

          renderList(results);
        } catch (e) {
          console.error("❌ Erreur parsing :", e);
          renderList([]);
        }
      },
      function (error) {
        console.error("❌ Erreur API search_ticket :", error);
        renderList([]);
      }
    );
  }

  // Recherche live sur input
  search.addEventListener("input", () => {
    const term = search.value.trim();
    fetchReservations(term);
  });

  // Chargement initial — recherche vide
  fetchReservations("*"); // Tu peux remplacer "" par "*" si ton backend l’accepte
});
