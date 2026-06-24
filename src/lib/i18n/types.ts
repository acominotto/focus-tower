export const LOCALES = ["en", "fr", "it", "de", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const ACHIEVEMENT_IDS = [
  "usain-finals",
  "rubiks-cube",
  "sonnet",
  "guernica-sketch",
  "picasso-portrait",
  "dumas-chapter",
  "mozart-don-giovanni",
  "beethoven-moonlight",
  "hemingway-macomber",
  "austen-pride",
  "pilot-atlantic",
  "rowling-harry",
  "apollo-moon",
  "darwin-finches",
  "nanowrimo-novel",
  "valley-forge",
  "einstein-1905",
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

export interface AchievementText {
  author: string;
  action: string;
  work: string;
}

export interface DurationMessages {
  lessThanMinute: string;
  oneSecond: string;
  seconds: string;
  oneMinute: string;
  minutes: string;
  oneHour: string;
  hours: string;
  hoursAndMinutes: string;
  oneDay: string;
  days: string;
  oneWeek: string;
  weeks: string;
  oneMonth: string;
  months: string;
  sixMonths: string;
  oneYear: string;
  years: string;
}

export interface MessageCatalog {
  locale: Locale;
  meta: {
    blockedTitle: string;
    popupTitle: string;
    extensionName: string;
  };
  blocked: {
    gateWhisper: string;
    heading: string;
    blockedLabel: string;
    loadingQuote: string;
    nudge: string;
    actionsLabel: string;
    oneMinuteBreak: string;
    minutesBreak: string;
    allowSession: string;
    turnAway: string;
    thisSite: string;
  };
  gate: {
    controlsLabel: string;
    restartGate: string;
    sessionBreak: string;
  };
  popup: {
    tagline: string;
    language: string;
    blockedSites: string;
    resetDefaults: string;
    sitePlaceholder: string;
    block: string;
    noSites: string;
    customQuotes: string;
    quotesNote: string;
    quotePlaceholder: string;
    authorPlaceholder: string;
    addQuote: string;
    noQuotes: string;
    remove: string;
  };
  errors: {
    invalidSite: string;
    quoteRequired: string;
    quoteNotFound: string;
  };
  siteTime: {
    spentOn: string;
    comparisonHalf: string;
    comparisonOnce: string;
    comparisonRepeat: string;
  };
  duration: DurationMessages;
  achievements: Record<AchievementId, AchievementText>;
  languageNames: Record<Locale, string>;
}

export type ErrorCode = keyof MessageCatalog["errors"];
