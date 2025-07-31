document.addEventListener("deviceready", function () {
  const showBtn = document.getElementById("btn-show-reservations");
  const panel = document.getElementById("reservation-panel");
  const list = document.getElementById("reservation-list");
  const search = document.getElementById("search-reservation");

  let reservations = []; // Contiendra les billets

  showBtn.addEventListener("click", () => {
    panel.style.display = "block";
    renderList(reservations);
  });

  search.addEventListener("input", () => {
    const term = search.value.toLowerCase();
    const filtered = reservations.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term)
    );
    renderList(filtered);
  });

  function renderList(data) {
    list.innerHTML = "";
    data.forEach((res) => {
      const li = document.createElement("li");
      li.textContent = `${res.name} – ${res.email}`;
      list.appendChild(li);
    });
  }

  // 🔄 Exemple de chargement des billets
  function fetchReservations() {
    const apiKey = localStorage.getItem("apiKey");
    const eventUuid = localStorage.getItem("selectedEventUuid");

    cordova.plugin.http.get(
      `https://lespass.demo.tibillet.org/api/events/${eventUuid}/reservations/`,
      {},
      { Authorization: `Api-Key ${apiKey}`, Accept: "application/json" },
      function (response) {
        const data = JSON.parse(response.data);
        reservations = data.map((ticket) => ({
          name: ticket.full_name || "Sans nom",
          email: ticket.email || "Aucune adresse",
          uuid: ticket.uuid,
        }));
        console.log("Réservations chargées :", reservations);
      },
      function (error) {
        console.error("Erreur de chargement billets", error);
      }
    );
  }

  fetchReservations(); // Appelé dès le lancement
});
