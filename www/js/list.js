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

  function fetchReservations() {
  const apiKey = localStorage.getItem("apiKey");
  const eventUuid = localStorage.getItem("selectedEventUuid");
  const apiBaseUrl = localStorage.getItem("apiBaseUrl");

  if (!apiKey || !eventUuid || !apiBaseUrl) {
    console.error("Clé API, UUID d'événement ou API base URL manquant");
    return;
  }

  const url = `${apiBaseUrl}/api/events/${eventUuid}/reservations/`;

  cordova.plugin.http.get(
    url,
    {},
    {
      Authorization: `Api-Key ${apiKey}`,
      Accept: "application/json",
    },
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

// test dummy 

const dummyReservations = [
  {
    name: "Alice Dupont",
    email: "alice@mail.com",
    uuid: "uuid-1"
  },
  {
    name: "Bob Martin",
    email: "bob@pro.com",
    uuid: "uuid-2"
  },
  {
    name: "Chloé Tixier",
    email: "chloe@demo.fr",
    uuid: "uuid-3"
  }
];

document.addEventListener("DOMContentLoaded", function () {
  const listElement = document.getElementById("reservation-list");
  const searchInput = document.getElementById("search");

  let reservations = dummyReservations;

  function renderList(data) {
    listElement.innerHTML = "";
    data.forEach((r) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${r.name}</strong><div class="email">${r.email}</div>`;
      listElement.appendChild(li);
    });
  }

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.toLowerCase();
    const filtered = reservations.filter((r) =>
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term)
    );
    renderList(filtered);
  });

  renderList(reservations);
});
