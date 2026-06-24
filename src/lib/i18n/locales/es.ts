import type { MessageCatalog } from "../types.js";

export const es: MessageCatalog = {
  locale: "es",
  meta: {
    blockedTitle: "Mantén el foco — Focus Tower",
    popupTitle: "Focus Tower",
    extensionName: "Focus Tower",
  },
  blocked: {
    gateWhisper: "El ojo está sobre ti…",
    heading: "Ibas hacia algo que distrae.",
    blockedLabel: "Bloqueado:",
    loadingQuote: "Cargando inspiración…",
    nudge:
      "La torre bloquea tu camino. Da la vuelta antes de que otra hora caiga en la sombra.",
    actionsLabel: "¿Necesitas un descanso breve? Elige con cuidado:",
    oneMinuteBreak: "1 minuto",
    minutesBreak: "{n} minutos",
    allowSession: "Permitir en esta sesión del navegador",
    turnAway: "Apártate de la torre",
    thisSite: "este sitio",
  },
  gate: {
    controlsLabel: "Controles del portón Focus Tower",
    restartGate: "Reiniciar el portón",
    sessionBreak: "Sesión",
  },
  popup: {
    tagline: "Bloquea distracciones. Protege tu tiempo.",
    language: "Idioma",
    blockedSites: "Sitios bloqueados",
    resetDefaults: "Restablecer valores",
    sitePlaceholder: "p. ej. twitter.com",
    block: "Bloquear",
    noSites: "Aún no hay sitios bloqueados.",
    customQuotes: "Citas personalizadas",
    quotesNote: "Se añaden a la biblioteca integrada en la página de bloqueo.",
    quotePlaceholder: "Texto de la cita",
    authorPlaceholder: "Autor (opcional)",
    addQuote: "Añadir cita",
    noQuotes: "Aún no hay citas personalizadas.",
    remove: "Eliminar",
  },
  errors: {
    invalidSite: "Sitio no válido o duplicado.",
    quoteRequired: "El texto de la cita es obligatorio.",
    quoteNotFound: "Cita no encontrada.",
  },
  siteTime: {
    spentOn: "Has pasado {duration} en {domain}.",
    comparisonHalf:
      "{author} {action} {work} en la mitad del tiempo que has pasado aquí.",
    comparisonOnce:
      "{author} {action} {work} en {duration} — más o menos el tiempo que has pasado aquí.",
    comparisonRepeat:
      "{author} {action} {work} en {duration} — podrías haberlo hecho {times} veces.",
  },
  duration: {
    lessThanMinute: "menos de un minuto",
    oneSecond: "1 segundo",
    seconds: "{n} segundos",
    oneMinute: "1 minuto",
    minutes: "{n} minutos",
    oneHour: "1 hora",
    hours: "{n} horas",
    hoursAndMinutes: "{hours} {minutes}",
    oneDay: "1 día",
    days: "{n} días",
    oneWeek: "1 semana",
    weeks: "{n} semanas",
    oneMonth: "1 mes",
    months: "{n} meses",
    sixMonths: "6 meses",
    oneYear: "1 año",
    years: "{n} años",
  },
  achievements: {
    "usain-finals": {
      author: "Usain Bolt",
      action: "corrió",
      work: "tres finales olímpicas de 100 m",
    },
    "rubiks-cube": {
      author: "Un campeón mundial de speedcubing",
      action: "resolvió",
      work: "un cubo de Rubik",
    },
    sonnet: {
      author: "Un escritor concentrado",
      action: "redactó",
      work: "un soneto shakespeariano",
    },
    "guernica-sketch": {
      author: "Picasso",
      action: "bosquejó",
      work: "el primer estudio de Guernica",
    },
    "picasso-portrait": {
      author: "Picasso",
      action: "pintó",
      work: "un retrato completo en una sola sesión",
    },
    "dumas-chapter": {
      author: "Alexandre Dumas",
      action: "escribió",
      work: "un capítulo de Los tres mosqueteros",
    },
    "mozart-don-giovanni": {
      author: "Mozart",
      action: "compuso",
      work: "la obertura de Don Giovanni",
    },
    "beethoven-moonlight": {
      author: "Beethoven",
      action: "compuso",
      work: "el primer movimiento de la Sonata Claro de luna",
    },
    "hemingway-macomber": {
      author: "Hemingway",
      action: "escribió",
      work: "La feliz breve vida de Francis Macomber",
    },
    "austen-pride": {
      author: "Jane Austen",
      action: "escribió",
      work: "dos capítulos de Orgullo y prejuicio",
    },
    "pilot-atlantic": {
      author: "Un piloto comercial",
      action: "voló",
      work: "un cruce transatlántico",
    },
    "rowling-harry": {
      author: "J.K. Rowling",
      action: "esbozó",
      work: "la trama de Harry Potter",
    },
    "apollo-moon": {
      author: "La tripulación del Apolo 11",
      action: "completó",
      work: "el primer alunizaje",
    },
    "darwin-finches": {
      author: "Charles Darwin",
      action: "pasó",
      work: "una semana catalogando pinzones en Galápagos",
    },
    "nanowrimo-novel": {
      author: "Un novelista de NaNoWriMo",
      action: "redactó",
      work: "una novela de 50.000 palabras",
    },
    "valley-forge": {
      author: "El Ejército Continental",
      action: "soportó",
      work: "un invierno en Valley Forge",
    },
    "einstein-1905": {
      author: "Einstein",
      action: "publicó",
      work: "cuatro artículos que cambiaron la física",
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
