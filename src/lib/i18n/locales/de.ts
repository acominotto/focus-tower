import type { MessageCatalog } from "../types.js";

export const de: MessageCatalog = {
  locale: "de",
  meta: {
    blockedTitle: "Bleib fokussiert — Focus Tower",
    popupTitle: "Focus Tower",
    extensionName: "Focus Tower",
  },
  blocked: {
    gateWhisper: "Das Auge ruht auf dir…",
    heading: "Du warst auf dem Weg zu einer Ablenkung.",
    blockedLabel: "Blockiert:",
    loadingQuote: "Inspiration wird geladen…",
    nudge:
      "Der Turm versperrt deinen Weg. Kehre um, bevor eine weitere Stunde in den Schatten fällt.",
    actionsLabel: "Brauchst du eine kurze Pause? Wähle weise:",
    oneMinuteBreak: "1 Minute",
    minutesBreak: "{n} Minuten",
    allowSession: "Für diese Browsersitzung erlauben",
    turnAway: "Wende dich vom Turm ab",
    thisSite: "diese Seite",
  },
  gate: {
    controlsLabel: "Focus Tower Tor-Kontrollen",
    restartGate: "Tor neu starten",
    sessionBreak: "Sitzung",
  },
  popup: {
    tagline: "Blockiere Ablenkungen. Schütze deine Zeit.",
    language: "Sprache",
    blockedSites: "Blockierte Seiten",
    resetDefaults: "Standard wiederherstellen",
    sitePlaceholder: "z. B. twitter.com",
    block: "Blockieren",
    noSites: "Noch keine Seiten blockiert.",
    customQuotes: "Eigene Zitate",
    quotesNote: "Werden der eingebauten Bibliothek auf der Blockseite hinzugefügt.",
    quotePlaceholder: "Zitattext",
    authorPlaceholder: "Autor (optional)",
    addQuote: "Zitat hinzufügen",
    noQuotes: "Noch keine eigenen Zitate.",
    remove: "Entfernen",
  },
  errors: {
    invalidSite: "Ungültige oder doppelte Seite.",
    quoteRequired: "Zitattext ist erforderlich.",
    quoteNotFound: "Zitat nicht gefunden.",
  },
  siteTime: {
    spentOn: "Du hast {duration} auf {domain} verbracht.",
    comparisonHalf:
      "{author} {action} {work} in der halben Zeit, die du hier verbracht hast.",
    comparisonOnce:
      "{author} {action} {work} in {duration} — ungefähr so lange wie du hier verbracht hast.",
    comparisonRepeat:
      "{author} {action} {work} in {duration} — du hättest es {times}× schaffen können.",
  },
  duration: {
    lessThanMinute: "weniger als eine Minute",
    oneSecond: "1 Sekunde",
    seconds: "{n} Sekunden",
    oneMinute: "1 Minute",
    minutes: "{n} Minuten",
    oneHour: "1 Stunde",
    hours: "{n} Stunden",
    hoursAndMinutes: "{hours} {minutes}",
    oneDay: "1 Tag",
    days: "{n} Tage",
    oneWeek: "1 Woche",
    weeks: "{n} Wochen",
    oneMonth: "1 Monat",
    months: "{n} Monate",
    sixMonths: "6 Monate",
    oneYear: "1 Jahr",
    years: "{n} Jahre",
  },
  achievements: {
    "usain-finals": {
      author: "Usain Bolt",
      action: "ist gelaufen",
      work: "drei olympische 100-m-Finals",
    },
    "rubiks-cube": {
      author: "Ein Speedcubing-Weltmeister",
      action: "hat gelöst",
      work: "einen Zauberwürfel",
    },
    sonnet: {
      author: "Ein fokussierter Schriftsteller",
      action: "hat verfasst",
      work: "ein shakespearisches Sonett",
    },
    "guernica-sketch": {
      author: "Picasso",
      action: "hat skizziert",
      work: "die erste Studie für Guernica",
    },
    "picasso-portrait": {
      author: "Picasso",
      action: "hat gemalt",
      work: "ein vollständiges Porträt in einer Sitzung",
    },
    "dumas-chapter": {
      author: "Alexandre Dumas",
      action: "hat geschrieben",
      work: "ein Kapitel der Drei Musketiere",
    },
    "mozart-don-giovanni": {
      author: "Mozart",
      action: "hat komponiert",
      work: "die Ouvertüre zu Don Giovanni",
    },
    "beethoven-moonlight": {
      author: "Beethoven",
      action: "hat komponiert",
      work: "den ersten Satz der Mondscheinsonate",
    },
    "hemingway-macomber": {
      author: "Hemingway",
      action: "hat geschrieben",
      work: "Das kurze glückliche Leben des Francis Macomber",
    },
    "austen-pride": {
      author: "Jane Austen",
      action: "hat geschrieben",
      work: "zwei Kapitel von Stolz und Vorurteil",
    },
    "pilot-atlantic": {
      author: "Ein Verkehrspilot",
      action: "ist geflogen",
      work: "einen Atlantiküberquerung",
    },
    "rowling-harry": {
      author: "J.K. Rowling",
      action: "hat skizziert",
      work: "die Handlung von Harry Potter",
    },
    "apollo-moon": {
      author: "Die Apollo-11-Besatzung",
      action: "hat vollbracht",
      work: "die erste Mondlandung",
    },
    "darwin-finches": {
      author: "Charles Darwin",
      action: "hat verbracht",
      work: "eine Woche mit der Katalogisierung von Finken auf den Galápagos",
    },
    "nanowrimo-novel": {
      author: "Ein NaNoWriMo-Romanautor",
      action: "hat verfasst",
      work: "einen Roman mit 50.000 Wörtern",
    },
    "valley-forge": {
      author: "Die Kontinentalarmee",
      action: "hat überstanden",
      work: "einen Winter in Valley Forge",
    },
    "einstein-1905": {
      author: "Einstein",
      action: "hat veröffentlicht",
      work: "vier Artikel, die die Physik veränderten",
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
