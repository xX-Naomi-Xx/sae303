// === CARTE ET LIEUX CULTURELS ===
// Ce fichier gère l'affichage de la carte Leaflet,
// des marqueurs départ/arrivée et des lieux culturels proches

let carte;
let coucheCulture;
const listeLieuxContainer = document.getElementById("listeLieux");

function afficherCarte(gareA, gareB) {
  if (!carte) {
    carte = L.map("carte").setView([46.8, 2.5], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(carte);
  }

  // Nettoyage des marqueurs et lignes précédentes
  carte.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      carte.removeLayer(layer);
    }
  });

  // Marqueurs départ/arrivée avec icônes différentes
  const marqueurA = L.marker([gareA.lat, gareA.lon], {
    icon: L.icon({
      iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      iconSize: [32,32],
      iconAnchor: [16,32]
    })
  }).addTo(carte).bindPopup(gareA.name);

  const marqueurB = L.marker([gareB.lat, gareB.lon], {
    icon: L.icon({
      iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      iconSize: [32,32],
      iconAnchor: [16,32]
    })
  }).addTo(carte).bindPopup(gareB.name);

  // Ligne entre les deux gares
  const ligne = L.polyline([[gareA.lat, gareA.lon], [gareB.lat, gareB.lon]], { color: "blue", weight: 4 }).addTo(carte);
  carte.fitBounds(ligne.getBounds(), { padding: [40, 40] });

  // Mise à jour du panneau avec infos du trajet
  const distance = calculerDistance(gareA.lat, gareA.lon, gareB.lat, gareB.lon);
  const co2Train = distance * 0.003;
  const co2Voiture = distance * 0.12;

  const panneau = document.getElementById("zoneResultat");
  panneau.innerHTML = `
    <h3>Trajet ${gareA.name} → ${gareB.name}</h3>
    <p>Distance : ${distance.toFixed(1)} km</p>
    <p>🚄 Train : ${co2Train.toFixed(1)} kg CO₂</p>
    <p>🚗 Voiture : ${co2Voiture.toFixed(1)} kg CO₂</p>
    <p>💚 Économie : ${(co2Voiture - co2Train).toFixed(1)} kg CO₂</p>
  `;

  // Affichage des lieux culturels proches
  afficherLieuxCulturels(gareB.lat, gareB.lon);
}

function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI)/180;
  const dLon = ((lon2 - lon1) * Math.PI)/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

// Affichage des lieux culturels avec clustering
function afficherLieuxCulturels(lat, lon) {
  const rayonKm = 5;
  const R = 6371;

  if (coucheCulture) carte.removeLayer(coucheCulture);
  if (listeLieuxContainer) listeLieuxContainer.innerHTML = "";

  fetch("./data/lieux-culturels-simplifies.geojson")
    .then(res => res.json())
    .then(data => {
      const markers = L.markerClusterGroup();

      const proches = data.features.filter(f => {
        const [lon2, lat2] = f.geometry.coordinates;
        const dLat = ((lat2 - lat) * Math.PI)/180;
        const dLon = ((lon2 - lon) * Math.PI)/180;
        const aCalc = Math.sin(dLat/2)**2 + Math.cos(lat*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
        const distance = R*(2*Math.atan2(Math.sqrt(aCalc), Math.sqrt(1-aCalc)));
        return distance <= rayonKm;
      });

      proches.forEach(f => {
        const [lon2, lat2] = f.geometry.coordinates;
        const p = f.properties;

        const marqueur = L.marker([lat2, lon2]).bindPopup(`<b>${p.nom}</b><br>${p.type}<br>${p.adresse}`);
        markers.addLayer(marqueur);

        const div = document.createElement("div");
        div.className = "lieu-item";
        div.innerHTML = `<strong>${p.nom}</strong><br>${p.type || ""} - ${p.adresse || ""}`;
        div.addEventListener("click", () => {
          carte.setView([lat2, lon2], 16);
          marqueur.openPopup();
        });
        listeLieuxContainer.appendChild(div);
      });

      coucheCulture = markers;
      carte.addLayer(coucheCulture);
    })
    .catch(err => console.error("Erreur chargement lieux culturels :", err));
}
