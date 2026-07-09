import { buildSiteTimeInsight, getLocale, getMessages, initI18n, normalizeDomain, STORAGE_KEYS, type SiteTimeInsight } from "@focus-tower/core";

export type { SiteTimeInsight };

export type SiteTimeTotals = Record<string, number>;

export interface TrackingSession {
  domain: string;
  tabId: number;
  startedAt: number;
}

export async function addSiteTime(domain: string, ms: number): Promise<void> {
  if (ms < 1000) return;

  const normalized = normalizeDomain(domain);
  const data = await chrome.storage.local.get(STORAGE_KEYS.siteTimeTotals);
  const totals: SiteTimeTotals = (data[STORAGE_KEYS.siteTimeTotals] as SiteTimeTotals | undefined) ?? {};
  totals[normalized] = (totals[normalized] ?? 0) + ms;
  await chrome.storage.local.set({ [STORAGE_KEYS.siteTimeTotals]: totals });
}

export async function getSiteTimeMs(domain: string): Promise<number> {
  const normalized = normalizeDomain(domain);
  const data = await chrome.storage.local.get(STORAGE_KEYS.siteTimeTotals);
  const totals: SiteTimeTotals = (data[STORAGE_KEYS.siteTimeTotals] as SiteTimeTotals | undefined) ?? {};
  return totals[normalized] ?? 0;
}

export async function getSiteTimeInsight(domain: string): Promise<SiteTimeInsight> {
  const totalMs = await getSiteTimeMs(domain);
  const totalMinutes = totalMs / 60_000;
  const locale = await getLocale();
  await initI18n(locale);
  const catalog = getMessages();
  const daySeed = `${normalizeDomain(domain)}-${new Date().toISOString().slice(0, 10)}`;
  return buildSiteTimeInsight(totalMinutes, daySeed, catalog);
}

export async function getTrackingSession(): Promise<TrackingSession | null> {
  const data = await chrome.storage.session.get(STORAGE_KEYS.trackingSession);
  return (data[STORAGE_KEYS.trackingSession] as TrackingSession | undefined) ?? null;
}

export async function setTrackingSession(session: TrackingSession | null): Promise<void> {
  if (session) {
    await chrome.storage.session.set({ [STORAGE_KEYS.trackingSession]: session });
    return;
  }
  await chrome.storage.session.remove(STORAGE_KEYS.trackingSession);
}
