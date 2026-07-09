import type { Page } from "@playwright/test";

export async function clearExtensionStorage(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await chrome.storage.local.clear();
    await chrome.storage.session.clear();
  });
}

export async function setBlockedSites(page: Page, sites: string[]): Promise<void> {
  await page.evaluate(async (blockedSites) => {
    await chrome.storage.local.set({ blockedSites });
  }, sites);
}

export async function addBlockedSite(page: Page, domain: string): Promise<void> {
  await page.evaluate(async (site) => {
    const data = await chrome.storage.local.get("blockedSites");
    const sites: string[] = data.blockedSites ?? [];
    if (!sites.includes(site)) {
      sites.push(site);
      await chrome.storage.local.set({ blockedSites: sites });
    }
  }, domain);
}

export async function revokeAllowance(page: Page, domain: string): Promise<void> {
  await page.evaluate(async (site) => {
    for (const storage of [chrome.storage.local, chrome.storage.session]) {
      const data = await storage.get("allowances");
      const allowances = data.allowances ?? {};
      if (!allowances[site]) {
        continue;
      }
      delete allowances[site];
      await storage.set({ allowances });
    }
  }, domain);
}

async function waitForBlockingRules(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      const timeout = window.setTimeout(resolve, 2_000);
      const listener = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
      ) => {
        if (areaName !== "local" || !changes.blockedSites) {
          return;
        }
        chrome.storage.onChanged.removeListener(listener);
        window.clearTimeout(timeout);
        window.setTimeout(resolve, 100);
      };
      chrome.storage.onChanged.addListener(listener);
    });
  });
}

export async function resetExtensionState(page: Page): Promise<void> {
  await clearExtensionStorage(page);
  await setBlockedSites(page, ["example.com"]);
  await waitForBlockingRules(page);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#site-list");
  await page.locator("#site-list li", { hasText: "example.com" }).waitFor();
}
