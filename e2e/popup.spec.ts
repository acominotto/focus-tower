import { test, expect } from "./fixtures/extension.js";
import { addBlockedSite, resetExtensionState } from "./helpers/storage.js";

test.describe("popup", () => {
  test("seeds default blocked sites on first install", async ({ popupPage }) => {
    await expect(popupPage.getByText("youtube.com")).toBeVisible();
    await expect(popupPage.getByText("reddit.com")).toBeVisible();
  });

  test("removes a blocked site from the popup", async ({ popupPage }) => {
    await resetExtensionState(popupPage);
    await addBlockedSite(popupPage, "example.org");
    await popupPage.reload({ waitUntil: "domcontentloaded" });
    await popupPage.locator("#site-list li", { hasText: "example.org" }).waitFor();

    const exampleOrgRow = popupPage.locator("#site-list li", { hasText: "example.org" });
    await exampleOrgRow.getByRole("button", { name: "Remove" }).click();

    await expect(popupPage.getByText("example.org")).toHaveCount(0);
    await expect(popupPage.getByText("example.com")).toBeVisible();
  });

  test("adds a custom quote", async ({ popupPage }) => {
    await popupPage.locator("#quote-text-input").fill("Stay on task.");
    await popupPage.locator("#quote-author-input").fill("Test Author");
    await popupPage.locator("#quote-form button[type='submit']").click();

    await expect(popupPage.locator("#quote-list")).toContainText("Stay on task.");
    await expect(popupPage.locator("#quote-list")).toContainText("Test Author");
  });

  test("persists language changes", async ({ popupPage }) => {
    await popupPage.locator("#language-select").selectOption("fr");
    await expect(popupPage.getByText("Bloquez les distractions. Protégez votre temps.")).toBeVisible();

    await popupPage.reload({ waitUntil: "domcontentloaded" });
    await popupPage.waitForSelector("#language-select");

    await expect(popupPage.locator("#language-select")).toHaveValue("fr");
    await expect(popupPage.getByText("Bloquez les distractions. Protégez votre temps.")).toBeVisible();
  });
});
