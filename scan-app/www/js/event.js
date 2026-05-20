document.addEventListener("deviceready", fetchSelectedEvent);

function fetchSelectedEvent() {
  const uuid = localStorage.getItem("selectedEventUuid");
  const baseUrl = localStorage.getItem("apiBaseUrl");

  if (!uuid || !baseUrl) {
    document.getElementById("event-info").innerText =
      "Aucun événement sélectionné.";
    return;
  }

  if (window.cordova && cordova.plugin && cordova.plugin.http) {
    cordova.plugin.http.get(
      `${baseUrl}/api/events/${uuid}/`,
      {},
      { Accept: "application/json" },
      function (response) {
        const eventData = JSON.parse(response.data);
        afficherEvenement(eventData);
      },
      function (error) {
        console.error("Erreur HTTP (native) :", error);
        document.getElementById("event-info").innerText =
          "Erreur de chargement.";
      }
    );
  }
}

function afficherEvenement(event) {
  const container = document.getElementById("event-info");
  container.innerHTML = `
    <h2>${event.name}</h2>
    <p><strong>Date :</strong> ${event.startDate}</p>
    <p>${event.description}</p>
    <a href="${event.url}" target="_blank">Voir sur le site</a>
  `;
}
