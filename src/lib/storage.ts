import { DEFAULT_BLOCKED_SITES } from "../data/default-sites.js";
import { BLOCK_RULE_ID_BASE, STORAGE_KEYS } from "./constants.js";
import { normalizeDomain } from "./domains.js";
import { DEFAULT_QUOTES, pickRandomQuote } from "./quotes.js";
import type { Allowance, Allowances, Quote } from "./types.js";

export async function getBlockedSites(): Promise<string[]> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.blockedSites);
  const sites: string[] = data[STORAGE_KEYS.blockedSites] ?? [];
  return sites.map(normalizeDomain).filter(Boolean);
}

export async function setBlockedSites(sites: string[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.blockedSites]: sites });
}

export async function seedDefaultSitesOnInstall(): Promise<void> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.blockedSites);
  const sites: string[] | undefined = data[STORAGE_KEYS.blockedSites];
  if (!sites || sites.length === 0) {
    await setBlockedSites([...DEFAULT_BLOCKED_SITES]);
  }
}

export async function getCustomQuotes(): Promise<Quote[]> {
  const data = await chrome.storage.local.get(STORAGE_KEYS.customQuotes);
  return data[STORAGE_KEYS.customQuotes] ?? [];
}

export async function setCustomQuotes(quotes: Quote[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.customQuotes]: quotes });
}

export async function getAllQuotes(): Promise<Quote[]> {
  const custom = await getCustomQuotes();
  return [...DEFAULT_QUOTES, ...custom];
}

export async function getRandomQuote(): Promise<Quote> {
  const quotes = await getAllQuotes();
  return pickRandomQuote(quotes);
}

export async function getAllowanceForDomain(domain: string): Promise<Allowance | null> {
  const normalized = normalizeDomain(domain);
  const allowances = await getAllowances();
  return allowances[normalized] ?? null;
}

export async function revokeAllowance(domain: string): Promise<void> {
  const normalized = normalizeDomain(domain);

  for (const storage of [chrome.storage.local, chrome.storage.session]) {
    const data = await storage.get(STORAGE_KEYS.allowances);
    const allowances: Allowances = data[STORAGE_KEYS.allowances] ?? {};
    if (!allowances[normalized]) {
      continue;
    }
    delete allowances[normalized];
    await storage.set({ [STORAGE_KEYS.allowances]: allowances });
  }

  await chrome.alarms.clear(`allowance-${normalized}`);
  await updateBlockingRules();
}

async function getAllowances(): Promise<Allowances> {
  const local = await chrome.storage.local.get(STORAGE_KEYS.allowances);
  const session = await chrome.storage.session.get(STORAGE_KEYS.allowances);
  const merged: Allowances = {
    ...(local[STORAGE_KEYS.allowances] ?? {}),
    ...(session[STORAGE_KEYS.allowances] ?? {}),
  };

  const now = Date.now();
  const active: Allowances = {};

  for (const [domain, allowance] of Object.entries(merged)) {
    if (allowance.expiresAt === null || allowance.expiresAt > now) {
      active[domain] = allowance;
    }
  }

  return active;
}

async function pruneExpiredAllowances(): Promise<void> {
  const local = await chrome.storage.local.get(STORAGE_KEYS.allowances);
  const allowances: Allowances = local[STORAGE_KEYS.allowances] ?? {};
  const now = Date.now();
  let changed = false;

  for (const [domain, allowance] of Object.entries(allowances)) {
    if (allowance.expiresAt !== null && allowance.expiresAt <= now) {
      delete allowances[domain];
      changed = true;
    }
  }

  if (changed) {
    await chrome.storage.local.set({ [STORAGE_KEYS.allowances]: allowances });
  }
}

export async function updateBlockingRules(): Promise<void> {
  await pruneExpiredAllowances();

  const blockedSites = await getBlockedSites();
  const allowances = await getAllowances();
  const activeBlocks = blockedSites.filter((domain) => !allowances[domain]);

  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((rule) => rule.id);

  const addRules: chrome.declarativeNetRequest.Rule[] = activeBlocks.map((domain, index) => ({
    id: BLOCK_RULE_ID_BASE + index,
    priority: 1,
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
      redirect: {
        extensionPath: `/blocked/blocked.html?domain=${encodeURIComponent(domain)}`,
      },
    },
    condition: {
      requestDomains: [domain],
      resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
    },
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}

export async function grantAllowance(
  domain: string,
  durationMs: number | null,
  label: string,
): Promise<void> {
  const normalized = normalizeDomain(domain);
  const expiresAt = durationMs === null ? null : Date.now() + durationMs;

  const storage = durationMs === null ? chrome.storage.session : chrome.storage.local;
  const data = await storage.get(STORAGE_KEYS.allowances);
  const allowances: Allowances = data[STORAGE_KEYS.allowances] ?? {};

  allowances[normalized] = { expiresAt, label, grantedAt: Date.now() };
  await storage.set({ [STORAGE_KEYS.allowances]: allowances });

  if (expiresAt !== null) {
    await chrome.alarms.create(`allowance-${normalized}`, { when: expiresAt });
  }

  await updateBlockingRules();
}

export async function resetDefaultSites(): Promise<string[]> {
  await setBlockedSites([...DEFAULT_BLOCKED_SITES]);
  await updateBlockingRules();
  return getBlockedSites();
}
