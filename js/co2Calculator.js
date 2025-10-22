document.getElementById("calculate").addEventListener("click", () => {
  const depart = document.getElementById("depart").value;
  const arrivee = document.getElementById("arrivee").value;

  if (!depart || !arrivee || depart === arrivee) {
    alert("Veuillez choisir deux gares différentes.");
    return;
  }

  const stationA = stations.find(s => s.name === depart);
  const stationB = stations.find(s => s.name === arrivee);

  const distance = getDistance(
    stationA.lat,
    stationA.lon,
    stationB.lat,
    stationB.lon
  );

  const co2Train = distance * 0.003; // 3g CO₂ / km
  const co2Voiture = distance * 0.12; // 120g CO₂ / km

  const result = `
    <h3>Trajet ${depart} → ${arrivee}</h3>
    <p>Distance : ${distance.toFixed(1)} km</p>
    <p>🚄 Train : ${co2Train.toFixed(1)} kg CO₂</p>
    <p>🚗 Voiture : ${co2Voiture.toFixed(1)} kg CO₂</p>
    <p>💚 Économie : ${(co2Voiture - co2Train).toFixed(1)} kg CO₂</p>
  `;

  document.getElementById("co2Result").innerHTML = result;

  showMap(stationA, stationB);
});

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
