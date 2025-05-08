// VERSION ACCES HTTPS CORS

// async function fetchEvents() {
//   const apiUrl = "https://lespass.demo.tibillet.org/api/events/";
//   try {
//     const response = await fetch(apiUrl);
//     if (!response.ok)
//       throw new Error("Erreur lors du chargement des événements");

//     const events = await response.json();

//     const container = document.getElementById("events-container");
//     container.innerHTML = "";

//     events.forEach((event) => {
//       const eventElement = document.createElement("div");
//       eventElement.classList.add("event");

//       const date = new Date(event.startDate).toLocaleString();

//       eventElement.innerHTML = `
//           <h2>${event.name}</h2>
//           <p><strong>Date :</strong> ${date}</p>
//           <p>${event.description}</p>
//           <a href="${event.url}" target="_blank">Voir l'événement</a>
//           <hr>
//         `;

//       container.appendChild(eventElement);
//     });
//   } catch (error) {
//     console.error("Erreur :", error);
//     document.getElementById("events-container").innerHTML =
//       "Impossible de charger les événements.";
//   }
// }

// // Exécution au chargement de la page
// document.addEventListener("DOMContentLoaded", fetchEvents);

// VERSION TEST OUTREPASS CORS

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
    const eventElement = document.createElement("div");
    eventElement.innerHTML = `
        <h2>${event.name}</h2>
        <p>${event.startDate}</p>
        <p>${event.description}</p>
        <a href="${event.url}" target="_blank">Lien</a>
        <hr>
      `;
    container.appendChild(eventElement);
  });
}
