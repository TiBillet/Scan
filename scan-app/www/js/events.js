document.addEventListener("deviceready", () => {
  const baseUrl = localStorage.getItem("apiBaseUrl");
  const search = document.getElementById("search");

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

  function filterEvent(Event) {
    let searchValue = search.value
    const searchString = (searchValue || "").trim();

    const url = `${baseUrl}/api/events?only_futur=true&filter=${searchString}`;

    cordova.plugin.http.get(
        url,
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
  }


  if (search) {
    search.addEventListener("input", debounce(filterEvent,1000))

    // search.addEventListener("input", () => {
    //   filterEvent(search.value || "");
    // });
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

function debounce(callback, delay) {
  let timer; // Variable to store the timeout ID

  return function (...args) {
    clearTimeout(timer); // Clear the previous timeout
    timer = setTimeout(() => callback(...args), delay); // Set a new timeout
  };
}