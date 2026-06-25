import type { MessageCatalog } from "../types.js";

export const it: MessageCatalog = {
  locale: "it",
  meta: {
    blockedTitle: "Resta concentrato — Focus Tower",
    popupTitle: "Focus Tower",
    extensionName: "Focus Tower",
  },
  blocked: {
    gateWhisper: "L'occhio è su di te…",
    heading: "Stavi andando verso una distrazione.",
    blockedLabel: "Bloccato:",
    loadingQuote: "Caricamento ispirazione…",
    nudge:
      "La torre blocca il tuo cammino. Torna indietro prima che un'altra ora cada nell'ombra.",
    actionsLabel: "Hai bisogno di una breve pausa? Scegli con saggezza:",
    oneMinuteBreak: "1 minuto",
    minutesBreak: "{n} minuti",
    allowSession: "Consenti per questa sessione del browser",
    turnAway: "Allontanati dalla torre",
    thisSite: "questo sito",
  },
  gate: {
    controlsLabel: "Controlli del varco Focus Tower",
    restartGate: "Riavvia il varco",
    hideEye: "Nascondi l'occhio",
    sessionBreak: "Sessione",
  },
  popup: {
    tagline: "Blocca le distrazioni. Proteggi il tuo tempo.",
    language: "Lingua",
    blockedSites: "Siti bloccati",
    resetDefaults: "Ripristina predefiniti",
    sitePlaceholder: "es. twitter.com",
    block: "Blocca",
    noSites: "Nessun sito bloccato.",
    showGateWatcher: "Mostra l'occhio su {domain}",
    customQuotes: "Citazioni personalizzate",
    quotesNote: "Aggiunte alla libreria integrata nella pagina di blocco.",
    quotePlaceholder: "Testo della citazione",
    authorPlaceholder: "Autore (facoltativo)",
    addQuote: "Aggiungi citazione",
    noQuotes: "Nessuna citazione personalizzata.",
    remove: "Rimuovi",
  },
  errors: {
    invalidSite: "Sito non valido o già bloccato.",
    quoteRequired: "Il testo della citazione è obbligatorio.",
    quoteNotFound: "Citazione non trovata.",
  },
  siteTime: {
    spentOn: "Hai trascorso {duration} su {domain}.",
    comparisonHalf:
      "{author} {action} {work} nella metà del tempo che hai trascorso qui.",
    comparisonOnce:
      "{author} {action} {work} in {duration} — più o meno il tempo che hai trascorso qui.",
    comparisonRepeat:
      "{author} {action} {work} in {duration} — avresti potuto farlo {times} volte.",
  },
  duration: {
    lessThanMinute: "meno di un minuto",
    oneSecond: "1 secondo",
    seconds: "{n} secondi",
    oneMinute: "1 minuto",
    minutes: "{n} minuti",
    oneHour: "1 ora",
    hours: "{n} ore",
    hoursAndMinutes: "{hours} {minutes}",
    oneDay: "1 giorno",
    days: "{n} giorni",
    oneWeek: "1 settimana",
    weeks: "{n} settimane",
    oneMonth: "1 mese",
    months: "{n} mesi",
    sixMonths: "6 mesi",
    oneYear: "1 anno",
    years: "{n} anni",
  },
  achievements: {
    "usain-finals": {
      author: "Usain Bolt",
      action: "ha corso",
      work: "tre finali olimpiche dei 100 metri",
    },
    "rubiks-cube": {
      author: "Un campione mondiale di speedcubing",
      action: "ha risolto",
      work: "un cubo di Rubik",
    },
    sonnet: {
      author: "Uno scrittore concentrato",
      action: "ha redatto",
      work: "un sonetto shakespeariano",
    },
    "guernica-sketch": {
      author: "Picasso",
      action: "ha abbozzato",
      work: "il primo studio per Guernica",
    },
    "picasso-portrait": {
      author: "Picasso",
      action: "ha dipinto",
      work: "un ritratto completo in una sola seduta",
    },
    "dumas-chapter": {
      author: "Alexandre Dumas",
      action: "ha scritto",
      work: "un capitolo de I tre moschettieri",
    },
    "mozart-don-giovanni": {
      author: "Mozart",
      action: "ha composto",
      work: "l'ouverture di Don Giovanni",
    },
    "beethoven-moonlight": {
      author: "Beethoven",
      action: "ha composto",
      work: "il primo movimento della Sonata al chiaro di luna",
    },
    "hemingway-macomber": {
      author: "Hemingway",
      action: "ha scritto",
      work: "La felice breve vita di Francis Macomber",
    },
    "austen-pride": {
      author: "Jane Austen",
      action: "ha scritto",
      work: "due capitoli di Orgoglio e pregiudizio",
    },
    "pilot-atlantic": {
      author: "Un pilota di linea",
      action: "ha volato",
      work: "una traversata transatlantica",
    },
    "rowling-harry": {
      author: "J.K. Rowling",
      action: "ha abbozzato",
      work: "la trama di Harry Potter",
    },
    "apollo-moon": {
      author: "L'equipaggio di Apollo 11",
      action: "ha completato",
      work: "il primo allunaggio",
    },
    "darwin-finches": {
      author: "Charles Darwin",
      action: "ha trascorso",
      work: "una settimana a catalogare i fringuelli alle Galápagos",
    },
    "nanowrimo-novel": {
      author: "Un romanziere NaNoWriMo",
      action: "ha redatto",
      work: "un romanzo di 50.000 parole",
    },
    "valley-forge": {
      author: "L'esercito continentale",
      action: "ha sopportato",
      work: "un inverno a Valley Forge",
    },
    "einstein-1905": {
      author: "Einstein",
      action: "ha pubblicato",
      work: "quattro articoli che hanno cambiato la fisica",
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
