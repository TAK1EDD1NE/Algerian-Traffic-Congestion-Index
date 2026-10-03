import type { Messages } from "./en";

export const fr: Messages = {
  nav: {
    liveIndex: "Indice en direct",
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
    highways: "Autoroutes",
    normalRoutes: "Routes normales",
    allRoads: "Toutes les routes",
    low: "Faible",
    high: "Élevé",
    km: "km",
    switchCity: "Changer de ville",
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
  meta: {
    siteName: "Indice de congestion urbaine d'Algérie",
    home: {
      title: "Indice de congestion urbaine d'Algérie",
      description:
        "Indice de congestion pour 27 agglomérations algériennes : classements, courbes aux heures de pointe, couverture du réseau routier et tendances journalières.",
      ogTitle: "Indice de congestion urbaine d'Algérie",
      ogDescription:
        "Classements de congestion, analyse des heures de pointe et couverture du réseau dans les villes algériennes.",
    },
  },
};
