/**
 * Extension icon: eye only, transparent background (matches docs favicon).
 * Run: bun run icons
 */
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

const root = join(import.meta.dir, "..");
const iconsDir = join(root, "icons");
const testSvg = readFileSync(join(root, "static", "blocked", "test.svg"), "utf8");

const sizes = [16, 48, 128] as const;

function extractEyeMarkup(svg: string): string {
  const start = svg.indexOf('<g id="eye-tracking-container"');
  if (start === -1) {
    throw new Error('Could not find <g id="eye-tracking-container">');
  }

  const end = svg.lastIndexOf("</g>", svg.indexOf("</svg>"));
  return svg.slice(start, end + 4);
}

function squareEyeViewBox(eyeMarkup: string, pad = 2): string {
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

  const eyeW = maxX - minX;
  const eyeH = maxY - minY;
  const size = Math.max(eyeW, eyeH) + pad * 2;
  const viewX = minX - pad - (size - eyeW - pad * 2) / 2;
  const viewY = minY - pad - (size - eyeH - pad * 2) / 2;
  return `${viewX} ${viewY} ${size} ${size}`;
}

const eyeMarkup = extractEyeMarkup(testSvg);
const viewBox = squareEyeViewBox(eyeMarkup);
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" shape-rendering="crispEdges" aria-hidden="true">
  ${eyeMarkup}
</svg>
`;

const svgPath = join(iconsDir, "icon.svg");
writeFileSync(svgPath, iconSvg);
console.log(`Wrote ${svgPath}`);

const master = join(iconsDir, "icon128.png");
await $`magick -background none -density 512 ${svgPath} -filter point -resize 128x128! ${master}`;
console.log(`Wrote ${master}`);

for (const size of sizes) {
  if (size === 128) continue;
  const output = join(iconsDir, `icon${size}.png`);
  await $`magick ${master} -filter point -resize ${size}x${size}! ${output}`;
  console.log(`Wrote ${output}`);
}

const faviconPath = join(root, "docs", "assets", "favicon.svg");
copyFileSync(svgPath, faviconPath);
console.log(`Wrote ${faviconPath}`);
