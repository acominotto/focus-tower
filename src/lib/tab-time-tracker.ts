import { domainFromUrl } from "./domains.js";
import { getBlockedSites } from "./storage.js";
import {
  addSiteTime,
  getTrackingSession,
  setTrackingSession,
  type TrackingSession,
} from "./site-time.js";

const FLUSH_ALARM = "site-time-flush";

let activeTracking: TrackingSession | null = null;
let trackerInitialized = false;

function isTrackableUrl(url: string | undefined): url is string {
  if (!url) return false;
  return !url.startsWith("chrome://") && !url.startsWith("chrome-extension://");
}

async function persistActiveSession(): Promise<void> {
  await setTrackingSession(activeTracking);
}

async function flushTracking(keepActive = false): Promise<void> {
  if (!activeTracking) return;

  const elapsed = Date.now() - activeTracking.startedAt;
  if (elapsed >= 1000) {
    await addSiteTime(activeTracking.domain, elapsed);
  }

  if (keepActive && activeTracking) {
    activeTracking = { ...activeTracking, startedAt: Date.now() };
    await persistActiveSession();
    return;
  }

  activeTracking = null;
  await setTrackingSession(null);
}

async function shouldTrackDomain(domain: string): Promise<boolean> {
  const blockedSites = await getBlockedSites();
  return blockedSites.includes(domain);
}

async function startTracking(tabId: number, url: string): Promise<void> {
  const domain = domainFromUrl(url);
  if (!domain || !(await shouldTrackDomain(domain))) {
    await flushTracking();
    return;
  }

  if (activeTracking?.tabId === tabId && activeTracking.domain === domain) {
    return;
  }

  await flushTracking();
  activeTracking = { domain, tabId, startedAt: Date.now() };
  await persistActiveSession();
}

async function handleTab(tabId: number, url?: string): Promise<void> {
  if (url === undefined) {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    url = tab?.url;
  }

  if (!isTrackableUrl(url)) {
    if (!activeTracking || activeTracking.tabId === tabId) {
      await flushTracking();
    }
    return;
  }

  await startTracking(tabId, url);
}

async function restoreTrackingSession(): Promise<void> {
  const session = await getTrackingSession();
  if (!session) return;

  const tab = await chrome.tabs.get(session.tabId).catch(() => null);
  if (!tab?.url || !isTrackableUrl(tab.url)) {
    const elapsed = Date.now() - session.startedAt;
    if (elapsed >= 1000) {
      await addSiteTime(session.domain, elapsed);
    }
    await setTrackingSession(null);
    return;
  }

  const domain = domainFromUrl(tab.url);
  if (domain !== session.domain || !(await shouldTrackDomain(domain))) {
    const elapsed = Date.now() - session.startedAt;
    if (elapsed >= 1000) {
      await addSiteTime(session.domain, elapsed);
    }
    await setTrackingSession(null);
    return;
  }

  activeTracking = session;
}

export async function initTabTimeTracker(): Promise<void> {
  await restoreTrackingSession();

  if (trackerInitialized) return;
  trackerInitialized = true;

  await chrome.alarms.create(FLUSH_ALARM, { periodInMinutes: 1 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== FLUSH_ALARM) return;
    void flushTracking(true);
  });

  chrome.tabs.onActivated.addListener(({ tabId }) => {
    void handleTab(tabId);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      void handleTab(tabId, changeInfo.url);
      return;
    }
    if (changeInfo.status === "complete" && tab.active) {
      void handleTab(tabId, tab.url);
    }
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    if (activeTracking?.tabId === tabId) {
      void flushTracking();
    }
  });

  chrome.windows.onFocusChanged.addListener((windowId) => {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      void flushTracking();
      return;
    }

    void chrome.windows.get(windowId, { populate: true }, (window) => {
      const activeTab = window.tabs?.find((tab) => tab.active);
      if (activeTab?.id !== undefined) {
        void handleTab(activeTab.id, activeTab.url);
      }
    });
  });

  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (activeTab?.id !== undefined) {
    await handleTab(activeTab.id, activeTab.url);
  }
}
