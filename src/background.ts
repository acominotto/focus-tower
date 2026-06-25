import { domainFromUrl, hostMatchesBlockedDomain, normalizeDomain } from "./lib/domains.js";
import { getSiteTimeInsight } from "./lib/site-time.js";
import {
  getBlockedSites,
  getCustomQuotes,
  getRandomQuote,
  grantAllowance,
  resolveAllowanceForHost,
  revokeAllowance,
  resetDefaultSites,
  seedDefaultSitesOnInstall,
  setBlockedSites,
  setCustomQuotes,
  updateBlockingRules,
} from "./lib/storage.js";
import { initTabTimeTracker } from "./lib/tab-time-tracker.js";
import { STORAGE_KEYS } from "./lib/constants.js";
import {
  getLocale,
  initI18n,
  isLocale,
  setLocale,
  translateError,
  type ErrorCode,
  type Locale,
} from "./lib/i18n/index.js";
import type { Allowance, Message, Quote, Response } from "./lib/types.js";

function reply(sendResponse: (response: Response) => void, response: Response): void {
  sendResponse(response);
}

async function localizedError(code: ErrorCode): Promise<Response> {
  const locale = await getLocale();
  await initI18n(locale);
  return { ok: false, error: translateError(code) };
}

function blockedPageUrl(domain: string): string {
  return chrome.runtime.getURL(`blocked/blocked.html?domain=${encodeURIComponent(domain)}`);
}

async function returnTabsToGate(domain: string): Promise<void> {
  const tabs = await chrome.tabs.query({});
  const blockedUrl = blockedPageUrl(domain);

  await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id === undefined || !tab.url?.startsWith("http")) {
        return;
      }
      if (!hostMatchesBlockedDomain(domainFromUrl(tab.url), domain)) {
        return;
      }
      try {
        await chrome.tabs.update(tab.id, { url: blockedUrl });
      } catch {
        // Tab may have closed or be navigating.
      }
    }),
  );
}

async function expireTimedAllowance(domain: string, tabId?: number): Promise<void> {
  const normalized = normalizeDomain(domain);
  await revokeAllowance(normalized);

  if (tabId !== undefined) {
    try {
      await chrome.tabs.update(tabId, { url: blockedPageUrl(normalized) });
    } catch {
      // Fall through to query all tabs.
    }
  }

  await returnTabsToGate(normalized);
}

async function sweepExpiredAllowances(): Promise<void> {
  const blockedSites = await getBlockedSites();
  const local = await chrome.storage.local.get(STORAGE_KEYS.allowances);
  const session = await chrome.storage.session.get(STORAGE_KEYS.allowances);
  const merged: Record<string, Allowance> = {
    ...(local[STORAGE_KEYS.allowances] ?? {}),
    ...(session[STORAGE_KEYS.allowances] ?? {}),
  };
  const now = Date.now();

  for (const site of blockedSites) {
    const allowance = merged[site];
    if (!allowance || allowance.expiresAt === null || allowance.expiresAt > now) {
      continue;
    }
    await expireTimedAllowance(site);
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await seedDefaultSitesOnInstall();
  }
  await updateBlockingRules();
  await initTabTimeTracker();
});

chrome.runtime.onStartup.addListener(() => {
  void initTabTimeTracker();
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes[STORAGE_KEYS.blockedSites] || changes[STORAGE_KEYS.allowances]) {
    void updateBlockingRules();
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "allowance-sweep") {
    await sweepExpiredAllowances();
    return;
  }

  if (!alarm.name.startsWith("allowance-")) return;

  const domain = alarm.name.replace("allowance-", "");
  await expireTimedAllowance(domain);
});

chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
  const respond = (response: Response) => reply(sendResponse, response);

  if (message.type === "GRANT_ALLOWANCE") {
    void (async () => {
      await grantAllowance(message.domain, message.durationMs, message.label);
      respond({ ok: true });
    })();
    return true;
  }

  if (message.type === "GET_BLOCKED_SITES") {
    void getBlockedSites().then((sites) => respond({ ok: true, sites }));
    return true;
  }

  if (message.type === "ADD_BLOCKED_SITE") {
    void (async () => {
      const sites = await getBlockedSites();
      const domain = normalizeDomain(message.domain);
      if (!domain || sites.includes(domain)) {
        respond(await localizedError("invalidSite"));
        return;
      }
      sites.push(domain);
      await setBlockedSites(sites);
      await updateBlockingRules();
      respond({ ok: true, sites });
    })();
    return true;
  }

  if (message.type === "REMOVE_BLOCKED_SITE") {
    void (async () => {
      const domain = normalizeDomain(message.domain);
      const next = (await getBlockedSites()).filter((site) => site !== domain);
      await setBlockedSites(next);
      await updateBlockingRules();
      respond({ ok: true, sites: next });
    })();
    return true;
  }

  if (message.type === "RESET_DEFAULT_SITES") {
    void resetDefaultSites()
      .then((sites) => respond({ ok: true, sites }))
      .catch((error: Error) => respond({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "GET_RANDOM_QUOTE") {
    void getRandomQuote()
      .then((quote) => respond({ ok: true, quote }))
      .catch((error: Error) => respond({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "GET_CUSTOM_QUOTES") {
    void getCustomQuotes()
      .then((quotes) => respond({ ok: true, quotes }))
      .catch((error: Error) => respond({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "ADD_CUSTOM_QUOTE") {
    void (async () => {
      const text = message.quote.text.trim();
      const author = message.quote.author.trim() || "You";
      if (!text) {
        respond(await localizedError("quoteRequired"));
        return;
      }
      const quotes = await getCustomQuotes();
      quotes.push({ text, author });
      await setCustomQuotes(quotes);
      respond({ ok: true, quotes });
    })();
    return true;
  }

  if (message.type === "REMOVE_CUSTOM_QUOTE") {
    void (async () => {
      const quotes = await getCustomQuotes();
      if (message.index < 0 || message.index >= quotes.length) {
        respond(await localizedError("quoteNotFound"));
        return;
      }
      quotes.splice(message.index, 1);
      await setCustomQuotes(quotes);
      respond({ ok: true, quotes });
    })();
    return true;
  }

  if (message.type === "REFRESH_RULES") {
    void updateBlockingRules()
      .then(() => respond({ ok: true }))
      .catch((error: Error) => respond({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "GET_SITE_TIME") {
    void getSiteTimeInsight(message.domain)
      .then((siteTime) => respond({ ok: true, siteTime }))
      .catch((error: Error) => respond({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "GET_LANGUAGE") {
    void getLocale()
      .then((locale) => respond({ ok: true, locale }))
      .catch((error: Error) => respond({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "SET_LANGUAGE") {
    void (async () => {
      if (!isLocale(message.locale)) {
        const locale = await getLocale();
        respond({ ok: true, locale });
        return;
      }
      await setLocale(message.locale);
      respond({ ok: true, locale: message.locale });
    })();
    return true;
  }

  if (message.type === "GET_GATE_STATUS") {
    void (async () => {
      const host = normalizeDomain(message.domain);
      const resolved = await resolveAllowanceForHost(host);
      if (!resolved) {
        respond({ ok: true, gate: null });
        return;
      }
      const { domain, allowance } = resolved;
      respond({
        ok: true,
        gate: {
          domain,
          expiresAt: allowance.expiresAt,
          grantedAt: allowance.grantedAt,
          label: allowance.label,
        },
      });
    })();
    return true;
  }

  if (message.type === "REVOKE_ALLOWANCE") {
    void (async () => {
      const domain = normalizeDomain(message.domain);
      await revokeAllowance(domain);
      respond({ ok: true });
    })().catch((error: Error) => respond({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === "EXPIRE_GATE") {
    void (async () => {
      const domain = normalizeDomain(message.domain);
      await expireTimedAllowance(domain, sender.tab?.id);
      respond({ ok: true });
    })().catch((error: Error) => respond({ ok: false, error: error.message }));
    return true;
  }

  return false;
});

void updateBlockingRules();
void initTabTimeTracker();
void sweepExpiredAllowances();
void chrome.alarms.create("allowance-sweep", { periodInMinutes: 1 });
