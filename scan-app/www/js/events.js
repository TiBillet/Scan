var are_event_loaded = false;

document.addEventListener("deviceready", () => {
  const baseUrl = localStorage.getItem("apiBaseUrl");
  const search = document.getElementById("search");
  search.value = "" // reset search value

  cordova.plugin.http.get(
    `${baseUrl}/api/events?only_futur=true`,
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

  if (search) {
    search.addEventListener("input", () => {
      filterEvents(search.value || "");
    });
  }
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
      <strong class="event-name">${event.name}</strong>
      <div class="email">${eventDate} à ${eventTime}</div>
    `;

    li.addEventListener("click", () => {
      localStorage.setItem("selectedEventUuid", event.uuid);
      window.location.href = "scanner.html";
    });

    list.appendChild(li);
  });
  are_event_loaded = true;
}

function filterEvents(textValue = ""){
  // Si les événements n'ont pas chargé, ne fais rien
  if(!are_event_loaded){
    return;
  }
  var eventsList = document.querySelector("#events-list").querySelectorAll("li")
  // Trim the
  textValue = textValue.toLowerCase().trim()
  // Replace all the accent in the searched
  textValue = textValue.normalize('NFD').replace(/[\u0300-\u036f]/g, "");

  // If search text is empty, just set all events to visible
  if (textValue === ""){
    for (let event of eventsList) {
      event.classList.remove("hidden")
    }
    return
  }

  for(let event of eventsList){
    // Remove space, set text to lowercase and remove accent to make the search easier
    let name = event.querySelector(".event-name").textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    let name_contain = name.includes(textValue)

    if(!name_contain){
      event.classList.add("hidden");
      continue;
    }

    event.classList.remove("hidden")
  }

}