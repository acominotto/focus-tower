import { DEFAULT_BLOCKED_SITES } from "../data/default-sites.js";
import { STORAGE_KEYS } from "../constants.js";
import { hostMatchesBlockedDomain, normalizeDomain } from "../domains.js";
import type { BlockEnforcement } from "../ports/enforcement.js";
import { allowanceAlarmId, type AllowanceScheduler } from "../ports/scheduler.js";
import type { AppStorage } from "../ports/storage.js";
import { DEFAULT_QUOTES, pickRandomQuote } from "../quotes.js";
import type { Allowance, Allowances, Quote } from "../types.js";
import {
  computeActiveBlocks,
  filterActiveAllowances,
  mergeAllowances,
  pruneExpiredAllowances,
} from "./allowances.js";

export interface BlockServiceDeps {
  storage: AppStorage;
  scheduler: AllowanceScheduler;
  enforcement: BlockEnforcement;
}

export function createBlockService(deps: BlockServiceDeps) {
  const { storage, scheduler, enforcement } = deps;

  async function getBlockedSites(): Promise<string[]> {
    const data = await storage.local.get(STORAGE_KEYS.blockedSites);
    const sites: string[] = (data[STORAGE_KEYS.blockedSites] as string[] | undefined) ?? [];
    return sites.map(normalizeDomain).filter(Boolean);
  }

  async function setBlockedSites(sites: string[]): Promise<void> {
    await storage.local.set({ [STORAGE_KEYS.blockedSites]: sites });
  }

  async function getAllowancesRaw(): Promise<Allowances> {
    const local = await storage.local.get(STORAGE_KEYS.allowances);
    const session = await storage.session.get(STORAGE_KEYS.allowances);
    return mergeAllowances(
      (local[STORAGE_KEYS.allowances] as Allowances | undefined) ?? {},
      (session[STORAGE_KEYS.allowances] as Allowances | undefined) ?? {},
    );
  }

  async function getAllowances(): Promise<Allowances> {
    return filterActiveAllowances(await getAllowancesRaw());
  }

  async function pruneExpiredPersistedAllowances(): Promise<void> {
    const local = await storage.local.get(STORAGE_KEYS.allowances);
    const allowances: Allowances = (local[STORAGE_KEYS.allowances] as Allowances | undefined) ?? {};
    const { pruned, changed } = pruneExpiredAllowances(allowances);
    if (changed) {
      await storage.local.set({ [STORAGE_KEYS.allowances]: pruned });
    }
  }

  async function syncEnforcement(): Promise<void> {
    await pruneExpiredPersistedAllowances();
    const blockedSites = await getBlockedSites();
    const allowances = await getAllowances();
    const activeBlocks = computeActiveBlocks(blockedSites, allowances);
    const blocked = activeBlocks.map((id) => ({ id, kind: "domain" as const }));
    await enforcement.syncBlockedTargets(blocked, allowances);
  }

  return {
    async getBlockedSites() {
      return getBlockedSites();
    },

    async setBlockedSites(sites: string[]) {
      await setBlockedSites(sites);
    },

    async seedDefaultSitesOnInstall() {
      const data = await storage.local.get(STORAGE_KEYS.blockedSites);
      const sites = data[STORAGE_KEYS.blockedSites] as string[] | undefined;
      if (!sites || sites.length === 0) {
        await setBlockedSites([...DEFAULT_BLOCKED_SITES]);
      }
    },

    async getCustomQuotes(): Promise<Quote[]> {
      const data = await storage.local.get(STORAGE_KEYS.customQuotes);
      return (data[STORAGE_KEYS.customQuotes] as Quote[] | undefined) ?? [];
    },

    async setCustomQuotes(quotes: Quote[]) {
      await storage.local.set({ [STORAGE_KEYS.customQuotes]: quotes });
    },

    async getAllQuotes(): Promise<Quote[]> {
      const custom = await this.getCustomQuotes();
      return [...DEFAULT_QUOTES, ...custom];
    },

    async getRandomQuote(): Promise<Quote> {
      return pickRandomQuote(await this.getAllQuotes());
    },

    async resolveAllowanceForHost(host: string) {
      const normalizedHost = normalizeDomain(host);
      const blockedSites = await getBlockedSites();
      const allowances = await getAllowances();

      if (blockedSites.includes(normalizedHost) && allowances[normalizedHost]) {
        return { domain: normalizedHost, allowance: allowances[normalizedHost] };
      }

      for (const site of blockedSites) {
        if (!hostMatchesBlockedDomain(normalizedHost, site)) continue;
        const allowance = allowances[site];
        if (allowance) return { domain: site, allowance };
      }

      return null;
    },

    async getAllowanceForDomain(domain: string): Promise<Allowance | null> {
      const resolved = await this.resolveAllowanceForHost(domain);
      return resolved?.allowance ?? null;
    },

    async grantAllowance(domain: string, durationMs: number | null, label: string) {
      const normalized = normalizeDomain(domain);
      const expiresAt = durationMs === null ? null : Date.now() + durationMs;
      const area = durationMs === null ? storage.session : storage.local;
      const data = await area.get(STORAGE_KEYS.allowances);
      const allowances: Allowances = (data[STORAGE_KEYS.allowances] as Allowances | undefined) ?? {};

      allowances[normalized] = { expiresAt, label, grantedAt: Date.now() };
      await area.set({ [STORAGE_KEYS.allowances]: allowances });

      if (expiresAt !== null) {
        await scheduler.schedule(allowanceAlarmId(normalized), expiresAt);
      }

      await enforcement.grantTemporaryAccess(normalized);
      await syncEnforcement();
    },

    async revokeAllowance(domain: string) {
      const normalized = normalizeDomain(domain);

      for (const area of [storage.local, storage.session]) {
        const data = await area.get(STORAGE_KEYS.allowances);
        const allowances: Allowances = (data[STORAGE_KEYS.allowances] as Allowances | undefined) ?? {};
        if (!allowances[normalized]) continue;
        delete allowances[normalized];
        await area.set({ [STORAGE_KEYS.allowances]: allowances });
      }

      await scheduler.cancel(allowanceAlarmId(normalized));
      await enforcement.revokeAccess(normalized);
      await syncEnforcement();
    },

    async resetDefaultSites() {
      await setBlockedSites([...DEFAULT_BLOCKED_SITES]);
      await syncEnforcement();
      return getBlockedSites();
    },

    async syncEnforcement() {
      return syncEnforcement();
    },
  };
}

export type BlockService = ReturnType<typeof createBlockService>;
