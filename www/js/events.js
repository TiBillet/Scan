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
      document.getElementById("events-container").innerText =
        "Erreur de chargement.";
    }
  );
});

function displayEvents(events) {
  const container = document.getElementById("events-container");
  container.innerHTML = "";

  events.forEach((event) => {
    const eventElement = document.createElement("div");
    eventElement.classList.add("event-card");

    const date = new Date(event.startDate).toLocaleString();

    eventElement.innerHTML = `
        <h2>${event.name}</h2>
        <p>${event.startDate}</p>

      `;

    eventElement.addEventListener("click", () => {
      localStorage.setItem("selectedEventUuid", event.uuid);
      window.location.href = "scanner.html";
    });
    container.appendChild(eventElement);
  });
}
