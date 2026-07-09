import { test, expect } from "./fixtures/extension.js";
import { resetExtensionState, revokeAllowance } from "./helpers/storage.js";

async function openPopup(context: import("@playwright/test").BrowserContext, extensionId: string) {
  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: "domcontentloaded" });
  await popup.waitForSelector("#site-list");
  return popup;
}

test.describe("blocking", () => {
  test("redirects blocked domains to the block page", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await resetExtensionState(popup);
    await popup.close();

    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(
      new RegExp(`chrome-extension://${extensionId}/blocked/blocked\\.html\\?domain=example\\.com`),
    );
    await expect(page.locator("#domain")).toHaveText("example.com");
    await expect(page.locator("h1")).toContainText("You were headed somewhere distracting.");
    await expect(page.locator("#quote-text")).not.toHaveText("Loading inspiration…");

    await page.close();
  });

  test("grants a timed break and shows the gate watcher", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await resetExtensionState(popup);
    await popup.close();

    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/blocked\/blocked\.html\?domain=example\.com/);

    await page.getByRole("button", { name: "5 minutes" }).click();
    await page.waitForURL("https://example.com/**", { timeout: 15_000 });

    await expect(page.locator("#focus-tower-gate-watcher")).toBeAttached({ timeout: 15_000 });
    await page.close();
  });

  test("returns to the gate after a dev-only 10 second break expires", async ({ context, extensionId }) => {
    test.setTimeout(60_000);

    const popup = await openPopup(context, extensionId);
    await resetExtensionState(popup);
    await popup.close();

    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/blocked\/blocked\.html\?domain=example\.com/);

    const devBreak = page.getByRole("button", { name: "10 seconds" });
    if ((await devBreak.count()) === 0) {
      test.skip(true, "Dev-only break option not in build (use DEV_BUILD=1)");
      return;
    }

    await devBreak.click();
    await page.waitForURL("https://example.com/**", { timeout: 15_000 });
    await expect(page.locator("#focus-tower-gate-watcher")).toBeAttached({ timeout: 15_000 });

    await expect(page).toHaveURL(
      new RegExp(`chrome-extension://${extensionId}/blocked/blocked\\.html\\?domain=example\\.com`),
      { timeout: 20_000 },
    );
    await page.close();
  });

  test("re-blocks after revoking allowance", async ({ context, extensionId }) => {
    const popup = await openPopup(context, extensionId);
    await resetExtensionState(popup);
    await popup.close();

    const page = await context.newPage();
    await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Allow for this browser session" }).click();
    await page.waitForURL("https://example.com/**", { timeout: 15_000 });
    await expect(page.locator("#focus-tower-gate-watcher")).toBeAttached({ timeout: 15_000 });

    const admin = await openPopup(context, extensionId);
    await revokeAllowance(admin, "example.com");
    await admin.close();

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(
      new RegExp(`chrome-extension://${extensionId}/blocked/blocked\\.html\\?domain=example\\.com`),
      { timeout: 15_000 },
    );
    await page.close();
  });
});
