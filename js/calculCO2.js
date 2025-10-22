// === CALCUL DES ÉMISSIONS CO2 ===
// Ce script s'occupe du calcul entre deux gares choisies
// et de l'affichage du graphique circulaire (train vs voiture)

document.getElementById("boutonCalcul").addEventListener("click", () => {
  // const depart = document.getElementById("depart").value;
  // const arrivee = document.getElementById("arrivee").value;
  const depart = document.getElementById("depart").value.trim();
  const arrivee = document.getElementById("arrivee").value.trim();
  if (!depart || !arrivee || depart === arrivee) {
    alert("Veuillez choisir deux gares différentes.");
    return;
  }

  // const gareA = stations.find(s => s.name === depart);
  // const gareB = stations.find(s => s.name === arrivee);
  const gareA = stations.find(s => s.name.toLowerCase() === depart.toLowerCase());
const gareB = stations.find(s => s.name.toLowerCase() === arrivee.toLowerCase());

if (!gareA || !gareB) {
  alert("Une ou plusieurs gares n'existent pas. Vérifiez votre saisie.");
  return;
}
  // Calcul de la distance entre les deux gares
  const distance = calculerDistance(gareA.lat, gareA.lon, gareB.lat, gareB.lon);

  // Estimation des émissions
  const co2Train = distance * 0.003;   // 3g/km
  const co2Voiture = distance * 0.12;  // 120g/km
  const economie = co2Voiture - co2Train;

  // Affichage des informations du trajet
  const texteResultat = `
    <h3>Trajet ${depart} → ${arrivee}</h3>
    <p>Distance : ${distance.toFixed(1)} km</p>
  `;
  document.getElementById("zoneResultat").innerHTML = texteResultat;

  // Affiche le panneau latéral s’il est caché
  const panneau = document.getElementById("panneauInfos");
  panneau.style.display = "block";

  // Nettoie le graphique précédent
  d3.select("#graphiqueCO2").selectAll("*").remove();

  // Prépare les données du graphique
  const donnees = [
    { label: "Train", valeur: co2Train },
    { label: "Voiture", valeur: co2Voiture }
  ];

  const largeur = 200;
  const hauteur = 200;
  const rayon = Math.min(largeur, hauteur) / 2;

  const svg = d3.select("#graphiqueCO2")
    .append("svg")
    .attr("width", largeur)
    .attr("height", hauteur)
    .append("g")
    .attr("transform", `translate(${largeur / 2}, ${hauteur / 2})`);

  const couleurs = d3.scaleOrdinal()
    .domain(donnees.map(d => d.label))
    .range(["#4CAF50", "#F44336"]);

  const arc = d3.arc()
    .innerRadius(rayon * 0.6)
    .outerRadius(rayon);

  const pie = d3.pie()
    .value(d => d.valeur)
    .sort(null);

  svg.selectAll("path")
    .data(pie(donnees))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => couleurs(d.data.label))
    .attr("stroke", "#fff")
    .attr("stroke-width", 2);

  // Texte au centre du graphique (économie)
  svg.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "0.35em")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`💚 ${economie.toFixed(1)} kg`);

  // Mise à jour de la carte
  afficherCarte(gareA, gareB);
  afficherLieuxCulturels(gareB.lat, gareB.lon);
});


// === Fonction utilitaire pour calculer la distance entre deux points GPS ===
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
