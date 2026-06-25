import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { $ } from "bun";
import { chromium } from "@playwright/test";

const root = join(import.meta.dir, "..");
const outDir = join(root, "docs", "store-assets");
const dist = join(root, "dist");
const promoHtml = join(import.meta.dir, "store-assets", "promo.html");
const storeIconHtml = join(import.meta.dir, "store-assets", "store-icon.html");
const popupScreenshotHtml = join(import.meta.dir, "store-assets", "screenshot-popup.html");
const bgColor = "#080504";

async function flattenPng(input: string, output: string, width?: number, height?: number): Promise<void> {
  if (width && height) {
    await $`magick ${input} -background ${bgColor} -alpha remove -alpha off -resize ${`${width}x${height}!`} ${output}`;
  } else {
    await $`magick ${input} -background ${bgColor} -alpha remove -alpha off ${output}`;
  }
}

async function ensureIcons(): Promise<void> {
  await $`bun run icons`;
}

async function writeStoreIcon(): Promise<void> {
  const browser = await chromium.launch({ channel: "chromium", headless: true });
  const page = await browser.newPage({ viewport: { width: 128, height: 128 } });
  await page.goto(pathToFileURL(storeIconHtml).href, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const output = join(outDir, "store-icon-128.png");
  const raw = join(outDir, "_raw-store-icon-128.png");
  await page.screenshot({ path: raw, type: "png" });
  await flattenPng(raw, output, 128, 128);
  await browser.close();
  console.log("Wrote store-icon-128.png");
}

async function launchExtensionContext() {
  const userDataDir = mkdtempSync(join(tmpdir(), "focus-tower-store-assets-"));
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: "chromium",
    headless: true,
    viewport: { width: 1280, height: 800 },
    args: [
      `--disable-extensions-except=${dist}`,
      `--load-extension=${dist}`,
      "--no-first-run",
      "--no-default-browser-check",
    ],
  });

  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent("serviceworker", { timeout: 15_000 });
  }

  const extensionId = new URL(serviceWorker.url()).host;
  return {
    context,
    extensionId,
    async close() {
      await context.close();
      rmSync(userDataDir, { recursive: true, force: true });
    },
  };
}

async function screenshotBlockedPage(
  context: Awaited<ReturnType<typeof launchExtensionContext>>["context"],
  extensionId: string,
): Promise<void> {
  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(
    `chrome-extension://${extensionId}/blocked/blocked.html?domain=twitter.com`,
    { waitUntil: "networkidle" },
  );
  await page.waitForFunction(() => {
    const quote = document.querySelector("#quote-text");
    return quote && quote.textContent && quote.textContent !== "Loading inspiration…";
  });
  await page.waitForTimeout(500);

  const raw = join(outDir, "_raw-screenshot-01-blocked.png");
  await page.screenshot({ path: raw, type: "png" });
  await flattenPng(raw, join(outDir, "screenshot-01-blocked-page.png"), 1280, 800);
  await page.close();
  console.log("Wrote screenshot-01-blocked-page.png");
}

async function screenshotPopup(context: Awaited<ReturnType<typeof launchExtensionContext>>["context"], extensionId: string): Promise<void> {
  const popup = await context.newPage();
  await popup.setViewportSize({ width: 420, height: 620 });
  await popup.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: "domcontentloaded" });
  await popup.waitForSelector("#site-list");
  await popup.waitForTimeout(400);

  const popupCapture = join(import.meta.dir, "store-assets", "popup-capture.png");
  await popup.screenshot({ path: popupCapture, type: "png" });
  await popup.close();

  const browser = await chromium.launch({ channel: "chromium", headless: true });
  const frame = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await frame.goto(pathToFileURL(popupScreenshotHtml).href, { waitUntil: "networkidle" });
  await frame.waitForSelector("#popup-shot");
  await frame.waitForTimeout(400);

  const raw = join(outDir, "_raw-screenshot-02-popup.png");
  await frame.screenshot({ path: raw, type: "png" });
  await flattenPng(raw, join(outDir, "screenshot-02-popup.png"), 1280, 800);
  await browser.close();
  console.log("Wrote screenshot-02-popup.png");
}

async function seedBlockedSites(context: Awaited<ReturnType<typeof launchExtensionContext>>["context"], extensionId: string): Promise<void> {
  const admin = await context.newPage();
  await admin.goto(`chrome-extension://${extensionId}/popup/popup.html`, { waitUntil: "domcontentloaded" });
  await admin.waitForSelector("#site-list");
  await admin.evaluate(async () => {
    await chrome.storage.local.set({ blockedSites: ["example.com"] });
  });
  await admin.waitForTimeout(300);
  await admin.close();
}

async function screenshotGateWatcher(
  context: Awaited<ReturnType<typeof launchExtensionContext>>["context"],
  extensionId: string,
): Promise<void> {
  await seedBlockedSites(context, extensionId);

  const page = await context.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
  await page.waitForURL(/blocked\/blocked\.html/, { timeout: 15_000 });
  await page.getByRole("button", { name: "5 minutes" }).click();
  await page.waitForURL("https://example.com/**", { timeout: 15_000 });
  await page.locator("#focus-tower-gate-watcher").waitFor({ state: "attached", timeout: 15_000 });
  await page.evaluate(() => {
    document.body.style.margin = "0";
    document.body.style.background = "#f5f5f5";
  });
  await page.waitForTimeout(600);

  const raw = join(outDir, "_raw-screenshot-03-watcher.png");
  await page.screenshot({ path: raw, type: "png" });
  await flattenPng(raw, join(outDir, "screenshot-03-gate-watcher.png"), 1280, 800);
  await page.close();
  console.log("Wrote screenshot-03-gate-watcher.png");
}

function promoTowerSvg(svg: string): string {
  return svg
    .replace(/<path d="M 70 98 L 74 65 H 126 L 130 98 Z" fill="#1f1f29" \/>\s*/, "")
    .replace(/<path d="M 76 68 L 78 52 H 122 L 124 68 Z" fill="#252532" \/>\s*/, "")
    .replace(/<rect x="90" y="54" width="20" height="4" fill="#0d0d11" \/>\s*/, "")
    .replace(/filter: drop-shadow\(0 0 5px rgba\(255, 90, 0, 0\.45\)\);/, "");
}

async function screenshotPromo(variant: "small" | "marquee", width: number, height: number, filename: string): Promise<void> {
  const browser = await chromium.launch({ channel: "chromium", headless: true });
  const page = await browser.newPage({ viewport: { width, height } });

  let promoUrl = pathToFileURL(promoHtml).href;
  let tempPromo: string | undefined;

  if (variant === "marquee") {
    const testSvg = readFileSync(join(root, "static", "blocked", "test.svg"), "utf8");
    const promoMarkup = readFileSync(promoHtml, "utf8").replace(
      "<!-- TOWER_INJECT -->",
      promoTowerSvg(testSvg),
    );
    tempPromo = join(import.meta.dir, "store-assets", ".promo-marquee-render.html");
    writeFileSync(tempPromo, promoMarkup);
    promoUrl = pathToFileURL(tempPromo).href;
  }

  await page.goto(`${promoUrl}?variant=${variant}`, { waitUntil: "networkidle" });
  if (variant === "marquee") {
    await page.waitForSelector("#eye-tracking-container");
  }
  await page.waitForTimeout(600);

  const raw = join(outDir, `_raw-${filename}`);
  await page.screenshot({ path: raw, type: "png" });
  await flattenPng(raw, join(outDir, filename), width, height);
  await browser.close();

  if (tempPromo) {
    await $`rm -f ${tempPromo}`;
  }

  console.log(`Wrote ${filename}`);
}

async function cleanupRaw(): Promise<void> {
  const glob = new Bun.Glob("_raw-*");
  for await (const file of glob.scan({ cwd: outDir })) {
    await $`rm ${join(outDir, file)}`;
  }
  const popupCapture = join(import.meta.dir, "store-assets", "popup-capture.png");
  try {
    await $`rm ${popupCapture}`;
  } catch {
    // ignore
  }
}

await mkdir(outDir, { recursive: true });
console.log("Building extension…");
await $`bun run build`;
await ensureIcons();
await writeStoreIcon();

const extension = await launchExtensionContext();
try {
  await screenshotBlockedPage(extension.context, extension.extensionId);
  await screenshotPopup(extension.context, extension.extensionId);
  await screenshotGateWatcher(extension.context, extension.extensionId);
} finally {
  await extension.close();
}

await screenshotPromo("small", 440, 280, "promo-small-440x280.png");
await screenshotPromo("marquee", 1400, 560, "promo-marquee-1400x560.png");
await cleanupRaw();

console.log(`\nChrome Web Store assets are in ${outDir}`);
