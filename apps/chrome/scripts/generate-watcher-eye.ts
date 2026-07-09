/**
 * Extracts the high-res tower eye from static/blocked/test.svg for the gate watcher.
 * Run: bun run watcher-eye
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const testSvg = readFileSync(join(root, "static", "blocked", "test.svg"), "utf8");

const eyeMatch = testSvg.match(/<g id="eye-tracking-container"[\s\S]*?<\/g>\s*(?=<\/svg>)/);

if (!eyeMatch) {
  throw new Error("Could not extract eye from test.svg");
}

const eyeMarkup = eyeMatch[0];
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

const pad = 2;
const viewX = minX - pad;
const viewY = minY - pad;
const viewW = maxX - minX + pad * 2;
const viewH = maxY - minY + pad * 2;

const watcherSvg = `<svg class="watcher-eye" xmlns="http://www.w3.org/2000/svg" viewBox="${viewX} ${viewY} ${viewW} ${viewH}" width="26" height="23" shape-rendering="crispEdges" aria-hidden="true">
  ${eyeMarkup}
</svg>
`;

const out = join(root, "static", "content", "watcher-eye.svg");
writeFileSync(out, watcherSvg);
console.log(`Wrote ${out} (viewBox ${viewX} ${viewY} ${viewW} ${viewH})`);
