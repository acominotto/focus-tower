import type { MessageCatalog } from "../types.js";

export const fr: MessageCatalog = {
  locale: "fr",
  meta: {
    blockedTitle: "Restez concentré — Focus Tower",
    popupTitle: "Focus Tower",
    extensionName: "Focus Tower",
  },
  blocked: {
    gateWhisper: "L'œil est sur vous…",
    heading: "Vous alliez vers une distraction.",
    blockedLabel: "Bloqué :",
    loadingQuote: "Chargement de l'inspiration…",
    nudge:
      "La tour barre votre chemin. Revenez en arrière avant qu'une autre heure ne tombe dans l'ombre.",
    actionsLabel: "Besoin d'une courte pause ? Choisissez avec soin :",
    oneMinuteBreak: "1 minute",
    minutesBreak: "{n} minutes",
    allowSession: "Autoriser pour cette session du navigateur",
    turnAway: "Détournez-vous de la tour",
    thisSite: "ce site",
  },
  gate: {
    controlsLabel: "Contrôles du portail Focus Tower",
    restartGate: "Recommencer le portail",
    sessionBreak: "Session",
  },
  popup: {
    tagline: "Bloquez les distractions. Protégez votre temps.",
    language: "Langue",
    blockedSites: "Sites bloqués",
    resetDefaults: "Réinitialiser",
    sitePlaceholder: "ex. twitter.com",
    block: "Bloquer",
    noSites: "Aucun site bloqué pour l'instant.",
    customQuotes: "Citations personnalisées",
    quotesNote: "Ajoutées à la bibliothèque intégrée sur la page de blocage.",
    quotePlaceholder: "Texte de la citation",
    authorPlaceholder: "Auteur (facultatif)",
    addQuote: "Ajouter la citation",
    noQuotes: "Aucune citation personnalisée pour l'instant.",
    remove: "Supprimer",
  },
  errors: {
    invalidSite: "Site invalide ou déjà bloqué.",
    quoteRequired: "Le texte de la citation est requis.",
    quoteNotFound: "Citation introuvable.",
  },
  siteTime: {
    spentOn: "Vous avez passé {duration} sur {domain}.",
    comparisonHalf:
      "{author} {action} {work} en la moitié du temps que vous avez passé ici.",
    comparisonOnce:
      "{author} {action} {work} en {duration} — à peu près le temps que vous avez passé ici.",
    comparisonRepeat:
      "{author} {action} {work} en {duration} — vous auriez pu le faire {times} fois.",
  },
  duration: {
    lessThanMinute: "moins d'une minute",
    oneSecond: "1 seconde",
    seconds: "{n} secondes",
    oneMinute: "1 minute",
    minutes: "{n} minutes",
    oneHour: "1 heure",
    hours: "{n} heures",
    hoursAndMinutes: "{hours} {minutes}",
    oneDay: "1 jour",
    days: "{n} jours",
    oneWeek: "1 semaine",
    weeks: "{n} semaines",
    oneMonth: "1 mois",
    months: "{n} mois",
    sixMonths: "6 mois",
    oneYear: "1 an",
    years: "{n} ans",
  },
  achievements: {
    "usain-finals": {
      author: "Usain Bolt",
      action: "a couru",
      work: "trois finales olympiques du 100 m",
    },
    "rubiks-cube": {
      author: "Un champion du monde de speedcubing",
      action: "a résolu",
      work: "un Rubik's Cube",
    },
    sonnet: {
      author: "Un écrivain concentré",
      action: "a rédigé",
      work: "un sonnet shakespearien",
    },
    "guernica-sketch": {
      author: "Picasso",
      action: "a esquissé",
      work: "la première étude pour Guernica",
    },
    "picasso-portrait": {
      author: "Picasso",
      action: "a peint",
      work: "un portrait complet en une séance",
    },
    "dumas-chapter": {
      author: "Alexandre Dumas",
      action: "a écrit",
      work: "un chapitre des Trois Mousquetaires",
    },
    "mozart-don-giovanni": {
      author: "Mozart",
      action: "a composé",
      work: "l'ouverture de Don Giovanni",
    },
    "beethoven-moonlight": {
      author: "Beethoven",
      action: "a composé",
      work: "le premier mouvement de la Sonate au clair de lune",
    },
    "hemingway-macomber": {
      author: "Hemingway",
      action: "a écrit",
      work: "La Joyeuse Fin de Francis Macomber",
    },
    "austen-pride": {
      author: "Jane Austen",
      action: "a écrit",
      work: "deux chapitres d'Orgueil et Préjugés",
    },
    "pilot-atlantic": {
      author: "Un pilote de ligne",
      action: "a effectué",
      work: "une traversée transatlantique",
    },
    "rowling-harry": {
      author: "J.K. Rowling",
      action: "a esquissé",
      work: "l'intrigue d'Harry Potter",
    },
    "apollo-moon": {
      author: "L'équipage d'Apollo 11",
      action: "a accompli",
      work: "le premier alunissage",
    },
    "darwin-finches": {
      author: "Charles Darwin",
      action: "a passé",
      work: "une semaine à cataloguer les pinsons des Galápagos",
    },
    "nanowrimo-novel": {
      author: "Un romancier NaNoWriMo",
      action: "a rédigé",
      work: "un roman de 50 000 mots",
    },
    "valley-forge": {
      author: "L'armée continentale",
      action: "a enduré",
      work: "un hiver à Valley Forge",
    },
    "einstein-1905": {
      author: "Einstein",
      action: "a publié",
      work: "quatre articles qui ont bouleversé la physique",
    },
  },
  languageNames: {
    en: "English",
    fr: "Français",
    it: "Italiano",
    de: "Deutsch",
    es: "Español",
  },
};
