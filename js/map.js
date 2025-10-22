let map;

function showMap(stationA, stationB) {
  if (!map) {
    map = L.map("map").setView([46.8, 2.5], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  }

  map.eachLayer(layer => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  const markerA = L.marker([stationA.lat, stationA.lon])
    .addTo(map)
    .bindPopup(stationA.name);
  const markerB = L.marker([stationB.lat, stationB.lon])
    .addTo(map)
    .bindPopup(stationB.name);

  const line = L.polyline(
    [
      [stationA.lat, stationA.lon],
      [stationB.lat, stationB.lon],
    ],
    { color: "blue", weight: 4 }
  ).addTo(map);

  map.fitBounds(line.getBounds(), { padding: [40, 40] });
}
