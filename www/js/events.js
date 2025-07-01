document.addEventListener("deviceready", () => {
  cordova.plugin.http.get(
    "https://lespass.demo.tibillet.org/api/events/",
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
    console.log("event : ", event);

    const eventElement = document.createElement("div");
    eventElement.innerHTML = `
        <h2>${event.name}</h2>
        <p>${event.startDate}</p>
        <p>${event.description}</p>
        <a href="${event.url}" target="_blank">Lien</a>
        <hr>
      `;

    eventElement.addEventListener("click", () => {
      localStorage.setItem("selectedEventUuid", event.uuid);
      window.location.href = "scanner.html";
    });
    container.appendChild(eventElement);
  });
}
