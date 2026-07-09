import { configureI18n, createBlockService, setLocale as setCoreLocale, STORAGE_KEYS, type Locale } from "@focus-tower/core";
import { chromeAllowanceScheduler } from "./chrome-alarms.js";
import { chromeAppStorage } from "./chrome-storage.js";
import { createChromeBlockEnforcement } from "./dnr-enforcement.js";

const enforcement = createChromeBlockEnforcement();

export const blockService = createBlockService({
  storage: chromeAppStorage,
  scheduler: chromeAllowanceScheduler,
  enforcement,
});

configureI18n({
  localeStore: {
    get: async () => {
      const data = await chrome.storage.local.get(STORAGE_KEYS.language);
      const stored = data[STORAGE_KEYS.language];
      return typeof stored === "string" ? stored : null;
    },
    set: async (locale) => {
      await chrome.storage.local.set({ [STORAGE_KEYS.language]: locale });
    },
  },
  localeDetector: {
    detect() {
      return chrome.i18n?.getUILanguage?.() ?? navigator.language;
    },
  },
});

export async function updateBlockingRules(): Promise<void> {
  await blockService.syncEnforcement();
}

// Re-export block service methods used across the extension
export const {
  getBlockedSites,
  setBlockedSites,
  seedDefaultSitesOnInstall,
  getCustomQuotes,
  setCustomQuotes,
  getAllQuotes,
  getRandomQuote,
  getAllowanceForDomain,
  resolveAllowanceForHost,
  grantAllowance,
  revokeAllowance,
  resetDefaultSites,
} = blockService;

export async function setLocale(locale: Locale): Promise<void> {
  await setCoreLocale(locale);
}
