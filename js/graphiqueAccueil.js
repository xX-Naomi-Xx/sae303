import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Chargement des données CO₂ pour trois trajets types
d3.json("data/emission-co2-perimetre-complet.json").then((donnees) => {
  // On garde seulement trois exemples de trajets
  const trajets = donnees
    .filter(
      (d) =>
        (d.origine === "Paris Gare de Lyon" &&
          d.destination === "Milano P Garibaldi") ||
        (d.origine === "Paris Montparnasse" &&
          d.destination === "Toulouse Matabiau") ||
        (d.origine === "Marseille Saint-Charles" &&
          d.destination === "Nice Ville")
    )
    .map((d) => ({
      type:
        d.origine === "Paris Gare de Lyon"
          ? "🌍 Long international"
          : d.origine === "Paris Montparnasse"
          ? "🇫🇷 Moyen national"
          : "🚆 Court régional",
      origine: d.origine,
      destination: d.destination,
      train: d.train_empreinte_carbone_kgco2e,
      voiture: d.voiture_thermique_2_2_pers_empreinte_carbone_kgco2e,
    }));

  const couleurs = d3
    .scaleOrdinal()
    .domain(["train", "voiture"])
    .range(["#4CAF50", "#F44336"]);

  // Création d’un graphique pour chaque trajet
  trajets.forEach((trajet) => {
    const carte = d3
      .select("#blocGraphiques")
      .append("div")
      .attr("class", "carte-graphique");

    carte.append("div").attr("class", "titre-graphique").text(trajet.type);
    carte
      .append("div")
      .attr("class", "sous-titre")
      .text(`${trajet.origine} → ${trajet.destination}`);

    const largeur = 260;
    const hauteur = 150;
    const marge = { haut: 10, droite: 10, bas: 30, gauche: 40 };

    // 🆕 SVG avec classe
    const svg = carte
      .append("svg")
      .attr("class", "graphique-svg") // ← AJOUT ICI
      .attr("width", largeur)
      .attr("height", hauteur);

    const valeurs = [
      { mode: "train", valeur: trajet.train },
      { mode: "voiture", valeur: trajet.voiture },
    ];

    const x = d3
      .scaleBand()
      .domain(valeurs.map((d) => d.mode))
      .range([marge.gauche, largeur - marge.droite])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(valeurs, (d) => d.valeur)])
      .nice()
      .range([hauteur - marge.bas, marge.haut]);

    // Axe X
    svg
      .append("g")
      .attr("transform", `translate(0,${hauteur - marge.bas})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((d) => (d === "train" ? "Train" : "Voiture"))
      )
      .selectAll("text")
      .style("font-size", "12px");

    // Axe Y
    svg
      .append("g")
      .attr("transform", `translate(${marge.gauche},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .style("font-size", "11px");

    // Barres
    svg
      .selectAll("rect")
      .data(valeurs)
      .join("rect")
      .attr("x", (d) => x(d.mode))
      .attr("width", x.bandwidth())
      .attr("y", hauteur - marge.bas)
      .attr("height", 0)
      .attr("fill", (d) => couleurs(d.mode))
      .transition()
      .duration(1000)
      .attr("y", (d) => y(d.valeur))
      .attr("height", (d) => y(0) - y(d.valeur));

    // Valeurs au-dessus des barres
    svg
      .selectAll(".valeur")
      .data(valeurs)
      .join("text")
      .attr("class", "valeur")
      .attr("x", (d) => x(d.mode) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.valeur) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .text((d) => d.valeur.toFixed(1) + " kg");
  });
});
