// const stations = [
//   { name: "Paris Gare de Lyon", lat: 48.8443, lon: 2.3743 },
//   { name: "Lyon Part-Dieu", lat: 45.7600, lon: 4.8610 },
//   { name: "Marseille Saint-Charles", lat: 43.3032, lon: 5.3798 },
//   { name: "Bordeaux Saint-Jean", lat: 44.8250, lon: -0.5560 },
//   { name: "Lille Flandres", lat: 50.6368, lon: 3.0709 },
// ];

// const departSelect = document.getElementById("depart");
// const arriveeSelect = document.getElementById("arrivee");

// stations.forEach(station => {
//   const option1 = document.createElement("option");
//   option1.value = station.name;
//   option1.textContent = station.name;

//   const option2 = option1.cloneNode(true);

//   departSelect.appendChild(option1);
//   arriveeSelect.appendChild(option2);
// });

fetch("./data/gares-de-voyageurs.json")
  .then(response => {
    if (!response.ok) {
      throw new Error(`Erreur HTTP : ${response.status} (${response.statusText})`);
    }
    return response.json();
  })
  .then(data => {
    // On garde seulement les gares qui ont une position valide
    stations = data
      .filter(station => station.position_geographique && station.position_geographique.lat && station.position_geographique.lon)
      .map(station => ({
        name: station.nom,
        lat: station.position_geographique.lat,
        lon: station.position_geographique.lon,
      }));

    stations.sort((a, b) => a.name.localeCompare(b.name));

    const departSelect = document.getElementById("depart");
    const arriveeSelect = document.getElementById("arrivee");

    stations.forEach(station => {
      const option1 = document.createElement("option");
      option1.value = station.name;
      option1.textContent = station.name;

      const option2 = option1.cloneNode(true);
      departSelect.appendChild(option1);
      arriveeSelect.appendChild(option2);
    });
  })
  .catch(err => {
    console.error("Erreur lors du chargement des gares :", err);
    alert("Impossible de charger la liste des gares. Détail : " + err.message);
  });

  
// ---- FONCTION D’AUTOCOMPLÉTION ----
function setupAutocomplete(inputId, stationList) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.createElement("div");
  suggestionBox.classList.add("suggestions");
  input.parentNode.appendChild(suggestionBox);

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    suggestionBox.innerHTML = "";

    if (query.length < 2) return; // n'affiche rien si trop court

    const matches = stationList.filter(st =>
      st.name.toLowerCase().includes(query)
    ).slice(0, 10); // max 10 résultats

    matches.forEach(st => {
      const option = document.createElement("div");
      option.classList.add("suggestion-item");
      option.textContent = st.name;
      option.addEventListener("click", () => {
        input.value = st.name;
        suggestionBox.innerHTML = "";
      });
      suggestionBox.appendChild(option);
    });
  });

  // ferme la liste quand on clique ailleurs
  document.addEventListener("click", (e) => {
    if (e.target !== input) suggestionBox.innerHTML = "";
  });
}