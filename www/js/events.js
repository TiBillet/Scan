document.addEventListener("deviceready", () => {
  const baseUrl = localStorage.getItem("apiBaseUrl");

  cordova.plugin.http.get(
    `${baseUrl}/api/events/`,
    {},
    { Accept: "application/json" },
    function (response) {
      const events = JSON.parse(response.data);
      displayEvents(events);
    },
    function (error) {
      console.error("Erreur HTTP native :", error);
      const list = document.getElementById("events-list");
      list.innerHTML = "<li>Erreur de chargement.</li>";
    }
  );
});

function displayEvents(events) {
  const list = document.getElementById("events-list");
  list.innerHTML = "";

  if (!events || events.length === 0) {
    list.innerHTML = "<li>Aucun événement trouvé.</li>";
    return;
  }

  events.forEach((event) => {
    const li = document.createElement("li");
    li.classList.add("ticket-item");
    const eventDateObj = new Date(event.startDate);
    const eventDate = eventDateObj.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const eventTime = eventDateObj.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });

    li.innerHTML = `
      <strong>${event.name}</strong>
      <div class="email">${eventDate} à ${eventTime}</div>
    `;

    li.addEventListener("click", () => {
      localStorage.setItem("selectedEventUuid", event.uuid);
      window.location.href = "scanner.html";
    });

    list.appendChild(li);
  });
}
