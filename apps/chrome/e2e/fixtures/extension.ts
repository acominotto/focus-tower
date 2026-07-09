import { test as base, chromium, type BrowserContext, type Page } from "@playwright/test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const extensionPath = join(import.meta.dirname, "..", "..", "dist");

export const test = base.extend<{
  context: BrowserContext;
  extensionId: string;
  popupPage: Page;
}>({
  context: async ({}, use) => {
    const userDataDir = mkdtempSync(join(tmpdir(), "focus-tower-e2e-"));
    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: "chromium",
      headless: process.env.HEADED === "1" ? false : true,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        "--no-first-run",
        "--no-default-browser-check",
        ...(process.env.CI ? ["--no-sandbox"] : []),
      ],
    });

    try {
      await use(context);
    } finally {
      await context.close();
      rmSync(userDataDir, { recursive: true, force: true });
    }
  },

  extensionId: async ({ context }, use) => {
    let [serviceWorker] = context.serviceWorkers();
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent("serviceworker", { timeout: 15_000 });
    }

    const extensionId = new URL(serviceWorker.url()).host;
    await use(extensionId);
  },

  popupPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#site-list");
    await use(page);
    await page.close();
  },
});

export const expect = test.expect;
