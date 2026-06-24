import { STORAGE_KEYS } from "../constants.js";
import { ACHIEVEMENT_DURATIONS } from "./achievements.js";
import { interpolate } from "./interpolate.js";
import { getCatalog } from "./locales/index.js";
import {
  MINUTES_PER_DAY,
  MINUTES_PER_MONTH,
  MINUTES_PER_SIX_MONTHS,
  MINUTES_PER_WEEK,
  MINUTES_PER_YEAR,
} from "./time.js";
import type { AchievementId, DurationMessages, ErrorCode, Locale, MessageCatalog } from "./types.js";
import { LOCALES } from "./types.js";

export type { ErrorCode, Locale, MessageCatalog } from "./types.js";
export { LOCALES } from "./types.js";

let activeCatalog: MessageCatalog = getCatalog("en");

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function detectBrowserLocale(): Locale {
  const uiLanguage =
    typeof chrome !== "undefined" && chrome.i18n?.getUILanguage
      ? chrome.i18n.getUILanguage()
      : typeof navigator !== "undefined"
        ? navigator.language
        : "en";
  const code = uiLanguage.split("-")[0]?.toLowerCase() ?? "en";
  return isLocale(code) ? code : "en";
}

export async function getStoredLocale(): Promise<Locale | null> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.language);
  const stored = data[STORAGE_KEYS.language];
  return typeof stored === "string" && isLocale(stored) ? stored : null;
}

export async function getLocale(): Promise<Locale> {
  return (await getStoredLocale()) ?? detectBrowserLocale();
}

export async function setLocale(locale: Locale): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.language]: locale });
  activeCatalog = getCatalog(locale);
}

export async function initI18n(locale?: Locale): Promise<Locale> {
  const resolved = locale ?? (await getLocale());
  activeCatalog = getCatalog(resolved);
  return resolved;
}

export function getMessages(): MessageCatalog {
  return activeCatalog;
}

export function getCurrentLocale(): Locale {
  return activeCatalog.locale;
}

function getNestedValue(source: Record<string, unknown>, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
  return typeof value === "string" ? value : undefined;
}

export function t(path: string, params?: Record<string, string | number>): string {
  const template = getNestedValue(activeCatalog as unknown as Record<string, unknown>, path);
  if (!template) return path;
  return params ? interpolate(template, params) : template;
}

export function translateError(code: ErrorCode, catalog = activeCatalog): string {
  return catalog.errors[code];
}

export function formatDuration(minutes: number, duration: DurationMessages = activeCatalog.duration): string {
  if (minutes < 1) {
    const secs = Math.round(minutes * 60);
    if (secs < 1) return duration.lessThanMinute;
    if (secs === 1) return duration.oneSecond;
    return interpolate(duration.seconds, { n: secs });
  }

  const rounded = Math.max(0, Math.round(minutes));

  if (rounded >= MINUTES_PER_YEAR) {
    const years = Math.round(rounded / MINUTES_PER_YEAR);
    return years === 1 ? duration.oneYear : interpolate(duration.years, { n: years });
  }

  if (rounded === Math.round(MINUTES_PER_SIX_MONTHS)) return duration.sixMonths;

  if (rounded >= MINUTES_PER_MONTH && rounded % MINUTES_PER_MONTH === 0) {
    const months = rounded / MINUTES_PER_MONTH;
    return months === 1 ? duration.oneMonth : interpolate(duration.months, { n: months });
  }

  if (rounded >= MINUTES_PER_DAY) {
    if (rounded === 7 * MINUTES_PER_DAY) {
      return interpolate(duration.days, { n: 7 });
    }
    if (rounded >= MINUTES_PER_WEEK && rounded % MINUTES_PER_WEEK === 0) {
      const weeks = rounded / MINUTES_PER_WEEK;
      return weeks === 1 ? duration.oneWeek : interpolate(duration.weeks, { n: weeks });
    }
    const days = Math.round(rounded / MINUTES_PER_DAY);
    return days === 1 ? duration.oneDay : interpolate(duration.days, { n: days });
  }

  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;

  if (hours === 0) {
    return mins === 1 ? duration.oneMinute : interpolate(duration.minutes, { n: mins });
  }
  if (mins === 0) {
    return hours === 1 ? duration.oneHour : interpolate(duration.hours, { n: hours });
  }

  const hourLabel = hours === 1 ? duration.oneHour : interpolate(duration.hours, { n: hours });
  const minuteLabel = mins === 1 ? duration.oneMinute : interpolate(duration.minutes, { n: mins });
  return interpolate(duration.hoursAndMinutes, { hours: hourLabel, minutes: minuteLabel });
}

export interface SiteTimeInsight {
  totalMinutes: number;
  totalLabel: string;
  comparison: string | null;
}

function pickAchievementId(candidates: AchievementId[], seed: string): AchievementId {
  const sorted = [...candidates].sort(
    (a, b) => ACHIEVEMENT_DURATIONS[b] - ACHIEVEMENT_DURATIONS[a],
  );
  const pool = sorted.slice(0, Math.min(5, sorted.length));
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }
  return pool[Math.abs(hash) % pool.length];
}

function buildComparison(
  catalog: MessageCatalog,
  achievement: MessageCatalog["achievements"][AchievementId],
  durationMinutes: number,
  timesOver: number,
): string {
  const duration = formatDuration(durationMinutes, catalog.duration);
  if (timesOver === 1) {
    return interpolate(catalog.siteTime.comparisonOnce, { ...achievement, duration });
  }
  return interpolate(catalog.siteTime.comparisonRepeat, {
    ...achievement,
    duration,
    times: timesOver,
  });
}

export function buildSiteTimeInsight(
  totalMinutes: number,
  seed: string,
  catalog: MessageCatalog,
): SiteTimeInsight {
  const totalLabel = formatDuration(totalMinutes, catalog.duration);

  if (totalMinutes < 0.5) {
    return { totalMinutes, totalLabel, comparison: null };
  }

  const fitsInTotal = (Object.keys(ACHIEVEMENT_DURATIONS) as AchievementId[]).filter(
    (id) => ACHIEVEMENT_DURATIONS[id] <= totalMinutes,
  );
  if (fitsInTotal.length === 0) {
    return { totalMinutes, totalLabel, comparison: null };
  }

  const repeatEligible = fitsInTotal.filter(
    (id) => Math.floor(totalMinutes / ACHIEVEMENT_DURATIONS[id]) >= 2,
  );

  if (repeatEligible.length > 0) {
    const id = pickAchievementId(repeatEligible, seed);
    const achievement = catalog.achievements[id];
    const durationMinutes = ACHIEVEMENT_DURATIONS[id];
    const timesOver = Math.floor(totalMinutes / durationMinutes);

    return {
      totalMinutes,
      totalLabel,
      comparison: buildComparison(catalog, achievement, durationMinutes, timesOver),
    };
  }

  const halfTimeEligible = fitsInTotal.filter(
    (id) => ACHIEVEMENT_DURATIONS[id] <= totalMinutes / 2,
  );

  if (halfTimeEligible.length > 0) {
    const id = pickAchievementId(halfTimeEligible, seed);
    const achievement = catalog.achievements[id];
    return {
      totalMinutes,
      totalLabel,
      comparison: interpolate(catalog.siteTime.comparisonHalf, { ...achievement }),
    };
  }

  const id = pickAchievementId(fitsInTotal, seed);
  const achievement = catalog.achievements[id];
  const durationMinutes = ACHIEVEMENT_DURATIONS[id];
  const timesOver = Math.floor(totalMinutes / durationMinutes);

  return {
    totalMinutes,
    totalLabel,
    comparison: buildComparison(catalog, achievement, durationMinutes, timesOver),
  };
}

export function applyDocumentI18n(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (key) element.textContent = t(key);
  });

  root.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (key) element.placeholder = t(key);
  });

  if (document.title && root === document) {
    const titleKey = document.documentElement.dataset.i18nTitle;
    if (titleKey) document.title = t(titleKey);
  }
}

export function formatBreakLabel(minutes: number): string {
  return minutes === 1
    ? t("blocked.oneMinuteBreak")
    : t("blocked.minutesBreak", { n: minutes });
}
