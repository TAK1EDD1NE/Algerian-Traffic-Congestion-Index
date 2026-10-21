import type { Messages } from "./en";

export const fr: Messages = {
  nav: {
    liveIndex: "Indice en direct",
    rankings: "Classement",
    cityReports: "Rapports par ville",
    explorer: "Explorateur",
    dataset: "Jeu de données",
    methodology: "Méthodologie",
    about: "À propos",
    indexOnline: "Indice en ligne",
    brandSub: "Indice de congestion urbaine d'Algérie",
  },
  a11y: {
    language: "Langue",
  },
  common: {
    days: { sun: "Dim", mon: "Lun", tue: "Mar", wed: "Mer", thu: "Jeu", fri: "Ven", sat: "Sam" },
    months: {
      jan: "janv.",
      feb: "févr.",
      mar: "mars",
      apr: "avr.",
      may: "mai",
      jun: "juin",
      jul: "juil.",
      aug: "août",
      sep: "sept.",
      oct: "oct.",
      nov: "nov.",
      dec: "déc.",
    },
    workday: "Dim–Jeu",
    weekend: "Ven–Sam",
    highways: "Autoroute",
    normalRoutes: "Grande route",
    allRoads: "Toutes les routes",
    low: "Faible",
    high: "Élevé",
    km: "km",
    switchCity: "Changer de ville",
    last30Days: "30 derniers jours",
    noRecentCaptures: "Aucune capture au cours des 30 derniers jours.",
  },
  level: { free: "Fluide", moderate: "Modéré", high: "Élevé", critical: "Critique" },
  class: { green: "Fluide", yellow: "Modéré", red: "Dense", dark_red: "Embouteillage" },
  errors: {
    notFoundTitle: "Page introuvable",
    notFoundBody: "La page que vous cherchez n'existe pas ou a été déplacée.",
    goHome: "Retour à l'accueil",
    crashTitle: "Cette page n'a pas pu se charger",
    crashBody:
      "Une erreur est survenue de notre côté. Essayez de recharger la page ou revenez à l'accueil.",
    tryAgain: "Réessayer",
    datasetLoading: "Lecture du jeu de données CSV…",
    datasetErrorTitle: "Le jeu de données n'a pas pu être lu",
    datasetErrorUnknown: "Erreur inconnue lors de l'analyse des fichiers CSV.",
  },
  footer: {
    body: "Un cadre de mesure ouvert pour la congestion routière urbaine à travers l'Algérie, issu d'une initiative de stage d'ingénierie à l'ESTIN.",
    dataSource: "Source des données",
    dataValue: "Jeu de données CSV de référence intégré",
    coverage: "Couverture",
    coverageValue: "27 agglomérations",
    about: "À propos",
    teamSchool: "Équipe et école",
  },
  home: {
    title: "Indice de congestion urbaine d'Algérie",
    intro:
      "Congestion dans {{count}} zones métropolitaines, mesurée à partir d'images du trafic au niveau de la rue par rapport à la ligne de base de chaque zone.",
    nationalAverage: "Moyenne nationale",
    deltaVsPrevious: "{{value}} pts vs la veille",
    weightedNote: "Pondérée par la population sur tous les pôles surveillés.",
    monitoredNetwork: "Réseau surveillé",
    roadTracked: "de routes suivies dans {{count}} villes",
    avgCoverage: "{{value}} % de couverture moy.",
    snapshots: "{{count}} relevés",
    mostCongested: "Ville la plus congestionnée",
    indexRank: "{{value}} % d'indice · rang n°1 sur {{total}}",
    cityRanking: "Classement des villes",
    allReports: "Tous les rapports",
    peakWindowDistribution: "Répartition des heures de pointe",
    nationalAvgPerWindow: "Moyenne nationale par tranche de 2 heures",
    analysisLabel: "Analyse :",
    analysisBody:
      "le pic national se situe dans la tranche {{window}} à {{pct}} % au-dessus de la ligne de base de chaque zone. Les flux du vendredi–samedi restent en dessous de la saturation en semaine, reflétant la semaine de travail algérienne.",
    dayByDay: "Jour après jour",
    nationalMeanWindow: "Indice moyen national sur les 30 derniers jours capturés",
    daysRange: "{{count}} jours · du {{from}} au {{to}}",
  },
  explore: {
    title: "Explorateur",
    intro:
      "Découpez l'indice par ville, par jour de semaine ou week-end et par tranche de 2 heures. Choisissez jusqu'à quatre villes pour superposer leurs courbes.",
    citiesFilter: "Villes",
    citiesSelected: "{{count}}/4 sélectionnées",
    citiesNational: "moyenne nationale affichée",
    daysLabel: "Jours",
    allDays: "Tous les jours",
    weekday: "Jours de semaine (dim–jeu)",
    weekend: "Week-end (ven–sam)",
    metricLabel: "Métrique",
    metricLevel: "Niveau de congestion",
    metricChange: "Variation vs tranche précédente",
    roadClassLabel: "Classe de route",
    classScoredNote: "Calculé sur la capacité et le niveau de calme propres à cette classe.",
    worstWindow: "Pire tranche affichée : {{city}} {{window}} à {{value}} %",
    chartLevelTitle: "Niveau de congestion par tranche de 2 heures",
    chartChangeTitle: "Vitesse de variation de la congestion",
    chartLevelNote: "Indice moyen pour les jours sélectionnés",
    chartChangeNote: "Différence entre tranches de 2 heures consécutives (positif = dégradation)",
    classOnly: "{{class}} uniquement",
    selectCitiesPrompt: "Sélectionnez une ou plusieurs villes ci-dessus pour tracer leurs courbes.",
    highwaysVsNormal: "Autoroute vs grande route",
    highwaysVsNormalNote:
      "Même formule d'indice calculée sur la capacité propre à chaque classe de route",
    selectCitiesClasses: "Sélectionnez des villes pour comparer les classes de route.",
    dayByDayCity: "{{city}} · jour après jour",
    dayByDayNational: "National · jour après jour",
    meanPerDay: "Indice moyen par jour calendaire",
    indexSeries: "indice",
  },
  data: {
    title: "Jeu de données",
    intro:
      "Chaque chiffre de ce site est calculé dans le navigateur à partir de trois fichiers CSV. Remplacez-les par vos propres exports de mesures — tout l'indice se recalcule instantanément.",
    customActive: "CSV personnalisé actif",
    referenceActive: "Jeu de données de référence",
    counts: "{{cities}} villes · {{hourly}} lignes horaires · {{monthly}} lignes mensuelles",
    restore: "Restaurer les données de référence",
    files: {
      cities: { note: "Une ligne par ville surveillée — chiffres clés." },
      hourly: { note: "Une ligne par ville × jour de la semaine × heure." },
      monthly: { note: "Une ligne par ville × année × mois." },
    },
    importCsv: "Importer un CSV",
    downloadSample: "Télécharger un exemple",
    previewTitle: "Aperçu de cities.csv",
    previewSubtitle: "Premières lignes telles qu'analysées",
    hCity: "Ville",
    hWilaya: "Wilaya",
    hIndex: "Indice",
    hPrevious: "Précédent",
    hNetwork: "Réseau (km)",
    hFreeFlow: "Flux libre",
    hAm: "Matin",
    hPm: "Après-midi",
    statusMissing: "{{file}} : colonne(s) manquante(s) {{columns}}",
    statusLoaded: "{{file}} chargé dans l'indice ({{key}}).",
    statusReset: "Retour au jeu de données de référence intégré.",
  },
  cities: {
    breadcrumbCityReports: "Rapports par ville",
    wilayaOf: "Wilaya de {{wilaya}}",
    rankOf: "Rang {{rank}} sur {{total}}",
    population: "population",
    ptsYoY: "{{value}} pts sur un an",
    stat: {
      index: "Indice de congestion",
      areas: "Zones surveillées",
      network: "Réseau routier",
      visibility: "Visibilité moy.",
    },
    throughTheDay: "Congestion au fil de la journée",
    throughTheDayNote: "Indice moyen par tranche de 2 heures · pic à {{peak}}",
    weeklyHeatmap: "Carte de densité hebdomadaire",
    weeklyHeatmapNote: "7 jours × créneaux de 2 heures, intensité de la congestion",
    coverageNetwork: "Couverture et réseau",
    coverageNetworkNote:
      "La part de route vue par chaque relevé, et la répartition du réseau surveillé",
    levelMixByRoadClass: "Répartition des niveaux de congestion par classe de route",
    levelMixNote: "Couleurs du trafic Google sur les grandes routes et les autoroutes",
    noComposition: "Aucune donnée de composition disponible.",
    areaBreakdown: "Détail par zone",
    areaBreakdownNote: "{{count}} zones surveillées · triées par congestion",
  },
  network: {
    roadNetworkMonitored: "Réseau routier surveillé",
    referenceNetworkAcross: "réseau de référence sur {{count}} zones",
    avgVisibility: "Visibilité moy.",
    snapshots: "{{count}} relevés",
    coverageNote:
      "Google ne colore que les routes disposant de données de trafic en direct, donc les relevés nocturnes voient moins de routes. La couverture compare ce que chaque relevé a réellement vu au réseau de référence de la zone (99e centile de la longueur de route jamais observée).",
    normalRoutesNote: "grandes routes",
    tableLevel: "Niveau",
    tableNormal: "Grandes routes",
    tableHighway: "Autoroute",
    colorNote:
      "Part de la capacité de chaque classe de route affichée dans chaque couleur de trafic, moyennée sur toute la fenêtre. Une part rouge foncé supérieure à zéro signifie qu'une partie du réseau était à l'arrêt.",
    area: "Zone",
    congestion: "Congestion",
    avgCoverage: "Couverture moy.",
    network: "Réseau",
    calmLevel: "Niveau de calme",
    snapshotsCol: "Relevés",
    zone: "Zone {{area}}",
  },
  ranking: {
    rank: "Rang",
    cityWilaya: "Ville / Wilaya",
    congestion: "Congestion",
    roadNetwork: "Réseau routier",
    status: "Statut",
    trend: "Tendance",
  },
  rankings: {
    title: "Classement des villes",
    note: "Les {{count}} agglomérations suivies, classées par indice de congestion. Sélectionnez une ville pour ouvrir son rapport complet.",
    hoursLabel: "Heure",
    allHours: "Toutes les heures",
    hourNote:
      "Les relevés arrivent environ toutes les deux heures : chaque créneau couvre une fenêtre de 2 heures.",
    allDays: "Tous les jours",
    daysRange: "Du {{from}} au {{to}}",
    daysCount: "{{days}} jours capturés",
    daysPickEnd: "{{from}} – choisissez le dernier jour",
    daysNote:
      "Tous les jours publiés sont inclus. Ouvrez le calendrier pour resserrer la période — une semaine minimum.",
    minRange: "Min. 1 semaine",
    daysUnavailable:
      "Le sélecteur de jours attend la dernière publication des données — d'ici là, tous les jours publiés sont pris en compte.",
    daysRangeNote:
      "L'indice est recalculé sur les seuls jours sélectionnés, pondéré par la couverture, pour la classe de route et l'heure choisies.",
    calendarAria: "Choisir la période",
    changeColumn: "Variation vs tranche précédente (pts)",
    changeNote:
      "La variation compare la tranche sélectionnée à la tranche qui la précède, sur les jours et la classe de route sélectionnés (positif = dégradation). Elle a besoin d'une tranche de référence : « toutes les heures » est donc indisponible ; la tranche 00:00 est comparée à 22:00 de la veille.",
    staticNote:
      "Les zones suivies comptent des zones : elles restent identiques quels que soient les filtres ; le réseau routier, lui, suit le filtre de classe de route.",
    highwayExcluded:
      "{{count}} villes ne sont pas classées sous ce filtre — leur réseau autoroutier suivi est trop réduit pour être noté comme classe de route à part entière.",
  },
  heatmap: {
    hoverHint: "Survolez une cellule pour voir l'heure",
    cellValue: "{{day}} {{hour}} — {{value}} % au-dessus du flux libre",
    cellAria: "{{day}} {{hour}} — {{value}} %",
  },
  map: {
    ariaMap: "Carte de congestion du nord de l'Algérie",
    ariaCity: "{{city}}, indice de congestion {{value}} pour cent",
    geospatialView: "Vue géospatiale",
    northernCorridor: "Couloir nord · {{count}} villes",
    bubbleLegend: "Taille et couleur des bulles = indice de congestion",
    clickToOpen: "Cliquez pour ouvrir le rapport de la ville",
    areasNetwork: "{{count}} zones · réseau de {{km}} km",
    congestionScale: "Échelle de congestion",
    scale: {
      critical: "Critique (14 %+)",
      high: "Élevé (11–14 %)",
      moderate: "Modéré (7–11 %)",
      free: "Fluide (<7 %)",
    },
  },
  methodology: {
    technicalNote: "Note technique · v1.02",
    title: "Méthodologie",
    intro:
      "L'indice de congestion urbaine d'Algérie mesure le degré de congestion d'un réseau routier par rapport à ce même réseau en conditions de flux libre. Il est délibérément comparable aux indices internationaux de temps de trajet, afin que les villes algériennes puissent être comparées à l'étranger.",
    steps: {
      capacity: {
        title: "Capacité d'une zone",
        body: "Pour chaque zone, nous prenons le 99e centile de la longueur de route jamais observée parmi ses relevés. Cette valeur devient K, le réseau de référence. Les routes absentes d'un relevé nocturne sont comptées comme étant en flux libre, et non comme des données manquantes.",
      },
      share: {
        title: "Part de congestion pondérée",
        body: "Les segments colorés de chaque relevé se réduisent à un seul nombre : le jaune compte une fois, le rouge deux fois, le rouge foncé trois fois, le tout divisé par K. Le résultat est la part du réseau à charge équivalente à un embouteillage.",
      },
      baseline: {
        title: "Ligne de base calme et ancrage",
        body: "Chaque zone possède son propre niveau de calme typique : le 20e centile de ses valeurs brutes. L'indice publié indique à quelle distance l'état actuel se situe entre ce niveau de calme et la saturation totale, sur une échelle de 0 à 100.",
      },
      aggregation: {
        title: "Agrégation",
        body: "Les relevés sont moyennés en journées, pondérées par la part de route réellement observée par chacun ; les journées en zones ; les zones en villes, pondérées par la taille du réseau. Les autoroutes et les grandes routes sont évaluées selon leurs propres capacités.",
      },
    },
    formulaLabel: "Formule de l'indice",
    formulaNote:
      "où K est le réseau de référence de la zone (99e centile de la longueur de route observée) et calm son état de flux libre au 20e centile. Les pics sont rapportés séparément pour les créneaux du matin (06:00–10:00) et du soir (16:00–20:00).",
    scaleTitle: "Échelle de congestion",
    scale: {
      fluid: "Fluide",
      fluidRange: "Moins de {{max}} %",
      moderate: "Modéré",
      moderateRange: "{{min}} % – {{max}} %",
      high: "Élevé",
      highRange: "{{min}} % – {{max}} %",
      critical: "Critique",
      criticalRange: "{{min}} % et plus",
    },
    limitationsTitle: "Limites",
    limitations: {
      window: "Les captures d'écran ont été prises du {{from}} au {{to}}.",
      source: "Toutes les captures d'écran proviennent de Google Maps.",
      smallRoads:
        "Certaines petites routes congestionnées n'apparaissent pas dans les captures d'écran.",
      lowCoverage: "Les routes à faible couverture n'affichent aucune couleur dans Google Maps.",
    },
    terminologyTitle: "Terminologie",
    terminologyNote:
      "Tous les termes utilisés par le site et par cette page de méthodologie, réunis en un seul endroit.",
    terms: {
      congestionIndex: {
        term: "Indice de congestion",
        definition:
          "Le score principal de 0 à 100 pour une ville, une zone ou l'ensemble du réseau : à quelle distance l'état actuel se situe entre le niveau de calme de cette unité et la saturation totale.",
      },
      zone: {
        term: "Zone (secteur)",
        definition:
          "Un quartier surveillé d'une ville. C'est l'unité sur laquelle chaque relevé d'image de trafic est découpé, et le plus petit niveau que nous publions.",
      },
      snapshot: {
        term: "Relevé",
        definition:
          "Une capture horodatée de l'imagerie de trafic au niveau de la rue d'une zone. Les relevés arrivent environ toutes les deux heures et constituent la donnée d'entrée brute de tout l'indice.",
      },
      referenceNetwork: {
        term: "Réseau de référence (K)",
        definition:
          "Le 99e centile de la longueur de route jamais observée dans une zone. C'est le dénominateur de la part de congestion, de sorte qu'une zone est toujours comparée à son propre état le plus chargé possible.",
      },
      gridlockLoad: {
        term: "Charge équivalente à un embouteillage (raw)",
        definition:
          "La longueur de route pondérée en difficulté dans un relevé : (1 × jaune + 2 × rouge + 3 × rouge foncé) ÷ K. Le rouge compte deux fois et le rouge foncé trois fois, car un trafic à l'arrêt coûte plus qu'un trafic ralenti.",
      },
      calmLevel: {
        term: "Niveau de calme",
        definition:
          "La ligne de base en flux libre propre à une zone : le 20e centile de ses valeurs brutes. Elle élimine la différence structurelle entre une ville constamment chargée et une ville calme.",
      },
      coverage: {
        term: "Couverture",
        definition:
          "La part du réseau de référence d'une zone qu'un relevé donné a réellement observée. Elle pondère les moyennes journalières, de sorte qu'un relevé nocturne épars compte moins qu'un relevé diurne complet.",
      },
      twoHourWindow: {
        term: "Créneau de 2 heures",
        definition:
          "Le créneau de restitution de chaque courbe du site. Les relevés sont regroupés en douze créneaux de deux heures par jour, de sorte qu'un point tracé est une moyenne, et non une mesure unique.",
      },
      workday: {
        term: "Jour de travail",
        definition: "Du dimanche au jeudi — la semaine de travail algérienne.",
      },
      weekend: {
        term: "Week-end",
        definition: "Le vendredi et le samedi.",
      },
      roadClass: {
        term: "Classe de route",
        definition:
          "Le type de route sur lequel un chiffre est calculé : une autoroute (autoroute ou voie express) ou une grande route. Chaque classe est évaluée selon sa propre capacité et son propre niveau de calme.",
      },
      wilaya: {
        term: "Wilaya",
        definition: "La province administrative algérienne à laquelle appartient une ville.",
      },
      congestionScale: {
        term: "Échelle de congestion",
        definition:
          "Fluide en dessous de 7 %, Modéré de 7 à 11 %, Élevé de 11 à 14 %, Critique à 14 % et au-dessus.",
      },
    },
  },
  about: {
    title: "À propos",
    heading: "À propos de ce projet",
    intro:
      "L'Indice de congestion urbaine d'Algérie mesure la congestion routière urbaine dans 27 agglomérations algériennes à partir d'images du trafic au niveau de la rue. Il a été développé dans le cadre d'un projet de stage d'ingénierie à l'ESTIN, l'École Supérieure en Sciences et Technologies de l'Informatique et du Numérique.",
    teamHeading: "L'équipe",
    schoolHeading: "L'école",
    schoolName:
      "ESTIN — École Supérieure en Sciences et Technologies de l'Informatique et du Numérique",
    schoolBody:
      "Une école d'ingénieurs publique algérienne, sur le campus d'Amizour, à Béjaïa. Elle recrute au niveau national et, après un tronc commun en informatique, les étudiants se spécialisent en intelligence artificielle / science des données ou en cybersécurité. L'école abrite également le laboratoire de recherche LITAN. C'est l'école où le projet a été réalisé et où Rehail Taki Eddine est étudiant en 5e année.",
    people: {
      rehail: {
        role: "Ingénieur logiciel full-stack senior — Apprentissage automatique et science des données",
        bio: "Je construis des systèmes de données de bout en bout : architecture, code, modèles et produit.\nCette plateforme est mon travail : capture, indice de congestion et rapports par ville.\nDe grands systèmes en santé, e-learning, vision par ordinateur et audio.\nPython, TypeScript, PostgreSQL, Docker — du schéma à la production.",
      },
      azouaou: {
        role: "Professeur et enseignant — Directeur adjoint chargé des systèmes d'information et de communication et des relations extérieures",
        bio: "Je suis professeur et chercheur à l'ESTIN. Mes travaux publiés portent sur le traitement automatique de la langue arabe, la recherche d'information et l'IA à faibles ressources ; je pilote également l'activité de relations extérieures de l'école.",
      },
    },
  },
  meta: {
    siteName: "Indice de congestion urbaine d'Algérie",
    rootDescription:
      "Un indice de congestion pour les villes algériennes : classements, analyse des heures de pointe, couverture du réseau routier et tendances journalières.",
    home: {
      title: "Indice de congestion urbaine d'Algérie",
      description:
        "Indice de congestion pour 27 agglomérations algériennes : classements, courbes aux heures de pointe, couverture du réseau routier et tendances journalières.",
      ogTitle: "Indice de congestion urbaine d'Algérie",
      ogDescription:
        "Classements de congestion, analyse des heures de pointe et couverture du réseau dans les villes algériennes.",
    },
    cities: {
      title: "Rapports par ville — Indice de congestion urbaine d'Algérie",
      description:
        "Rapport détaillé de congestion pour chaque ville algérienne : profil horaire, carte de densité hebdomadaire, couverture du réseau routier et détail zone par zone.",
      ogTitle: "Rapports par ville — Indice de congestion urbaine d'Algérie",
      ogDescription:
        "Rapports de congestion par ville pour l'indice de congestion urbaine d'Algérie.",
    },
    rankings: {
      title: "Classement des villes — Indice de congestion urbaine d'Algérie",
      description:
        "Classement par congestion des agglomérations algériennes suivies, avec la taille du réseau routier, les zones suivies et la visibilité moyenne de chaque ville.",
      ogTitle: "Classement des villes — Indice de congestion urbaine d'Algérie",
      ogDescription:
        "Classement par congestion avec taille du réseau, zones suivies et visibilité moyenne.",
    },
    city: {
      title: "Rapport de congestion de {{city}} — Indice de congestion urbaine d'Algérie",
      description:
        "Profil de congestion horaire, carte de densité hebdomadaire, couverture du réseau routier et détail par zone pour {{city}}, Algérie.",
      ogTitle: "Rapport de congestion de {{city}} — Indice de congestion urbaine d'Algérie",
      ogDescription:
        "Profil horaire, carte de densité hebdomadaire et détail par zone pour {{city}}.",
    },
    explore: {
      title: "Explorateur — Indice de congestion urbaine d'Algérie",
      description:
        "Explorateur de congestion détaillé : filtrez par ville, jour de semaine ou week-end et tranche de 2 heures ; comparez autoroutes et grandes routes.",
    },
    data: {
      title: "Jeu de données et import CSV — Indice de congestion urbaine d'Algérie",
      description:
        "Inspectez le schéma CSV derrière l'indice de congestion algérien, importez vos propres fichiers de mesures ou téléchargez le jeu de données de référence.",
      ogTitle: "Jeu de données et import CSV — Indice de congestion urbaine d'Algérie",
      ogDescription:
        "Schéma CSV, outil d'import et téléchargements pour l'indice de congestion algérien.",
    },
    methodology: {
      title: "Méthodologie — Indice de congestion urbaine d'Algérie",
      description:
        "Comment l'indice de congestion algérien est calculé : lignes de base en flux libre, charge équivalente à un embouteillage, échelle de congestion à quatre niveaux et glossaire de tous les termes utilisés sur le site.",
      ogTitle: "Méthodologie — Indice de congestion urbaine d'Algérie",
      ogDescription:
        "Lignes de base en flux libre, charge équivalente à un embouteillage et échelle de congestion expliquées.",
    },
    about: {
      title: "À propos — Indice de congestion urbaine d'Algérie",
      description:
        "Les personnes et l'école derrière l'Indice de congestion urbaine d'Algérie : Rehail Taki Eddine et Pr. Faical Azouaou, et l'ESTIN.",
      ogTitle: "À propos — Indice de congestion urbaine d'Algérie",
      ogDescription: "L'équipe et l'école derrière l'Indice de congestion urbaine d'Algérie.",
    },
  },
};
