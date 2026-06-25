/**
 * Rasterize the toolbar icon by screenshotting the block-page tower eye
 * (test.svg + gate-theme glow) at high resolution, then point-scaling down.
 *
 * Run: bun run icons
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { $ } from "bun";
import { chromium } from "@playwright/test";

const root = join(import.meta.dir, "..");
const iconsDir = join(root, "icons");
const testSvgPath = join(root, "static", "blocked", "test.svg");
const captureShellPath = join(import.meta.dir, "icon-capture.html");
const capturePagePath = join(import.meta.dir, ".icon-capture-page.html");
const masterCapture = join(iconsDir, ".icon-capture-master.png");

const sizes = [16, 48, 128] as const;
const towerRenderWidth = 960;
const eyePadding = 48;

function extractSvgGroup(svg: string, id: string): string {
  const marker = `<g id="${id}"`;
  const start = svg.indexOf(marker);
  if (start === -1) {
    throw new Error(`Could not find <g id="${id}">`);
  }

  let depth = 0;
  for (let i = start; i < svg.length; i++) {
    if (svg.startsWith("<g", i) && (svg[i + 2] === " " || svg[i + 2] === ">")) {
      depth++;
    }
    if (svg.startsWith("</g>", i)) {
      depth--;
      if (depth === 0) {
        return svg.slice(start, i + 4);
      }
    }
  }

  throw new Error(`Unclosed group: ${id}`);
}

function eyeViewBox(eyeMarkup: string): string {
  const rects = [...eyeMarkup.matchAll(/<rect[^>]+>/g)];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const rect of rects) {
    const tag = rect[0];
    const x = Number(tag.match(/x="(\d+)"/)?.[1]);
    const y = Number(tag.match(/y="(\d+)"/)?.[1]);
    const w = Number(tag.match(/width="(\d+)"/)?.[1] ?? 1);
    const h = Number(tag.match(/height="(\d+)"/)?.[1] ?? 1);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  }

  const pad = 4;
  const side = Math.max(maxX - minX, maxY - minY) + pad * 2;
  const cx = minX + (maxX - minX) / 2;
  const cy = minY + (maxY - minY) / 2;
  const viewX = Math.round(cx - side / 2);
  const viewY = Math.round(cy - side / 2);
  return `${viewX} ${viewY} ${side} ${side}`;
}

const testSvg = readFileSync(testSvgPath, "utf8");
const shell = readFileSync(captureShellPath, "utf8");
const capturePage = shell.replace(
  '<div class="dark-tower" id="tower"></div>',
  `<div class="dark-tower" id="tower">${testSvg}</div>`,
);
writeFileSync(capturePagePath, capturePage);

const browser = await chromium.launch({ channel: "chromium", headless: true });
const page = await browser.newPage({
  viewport: { width: towerRenderWidth + 160, height: 420 },
  deviceScaleFactor: 1,
});

await page.goto(pathToFileURL(capturePagePath).href, { waitUntil: "domcontentloaded" });
await page.waitForSelector("#eye-tracking-container");
await page.evaluate((width) => {
  document.documentElement.style.setProperty("--tower-width", `${width}px`);
}, towerRenderWidth);
await page.waitForTimeout(300);

const eye = page.locator("#eye-tracking-container");
await eye.screenshot({
  path: masterCapture,
  omitBackground: true,
  padding: eyePadding,
  animations: "disabled",
});

await browser.close();

for (const size of sizes) {
  const output = join(iconsDir, `icon${size}.png`);
  await $`magick ${masterCapture} -filter point -resize ${size}x${size} -background none -gravity center -extent ${size}x${size} ${output}`;
  console.log(`Wrote ${output}`);
}

const eyeMarkup = extractSvgGroup(testSvg, "eye-tracking-container");
const viewBox = eyeViewBox(eyeMarkup);
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" shape-rendering="crispEdges" aria-hidden="true">
  ${eyeMarkup}
</svg>
`;
writeFileSync(join(iconsDir, "icon.svg"), iconSvg);
console.log(`Wrote ${join(iconsDir, "icon.svg")}`);

await $`rm -f ${capturePagePath} ${masterCapture}`;
