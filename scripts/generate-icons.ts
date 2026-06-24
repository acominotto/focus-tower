import { join } from "node:path";
import { $ } from "bun";

const root = join(import.meta.dir, "..");
const svg = join(root, "icons", "icon.svg");
const iconsDir = join(root, "icons");

const sizes = [16, 48, 128] as const;
const master = join(iconsDir, "icon128.png");

await $`magick -background none -density 512 ${svg} -filter point -resize 128x128! ${master}`;
console.log(`Wrote ${master}`);

for (const size of sizes) {
  if (size === 128) continue;
  const output = join(iconsDir, `icon${size}.png`);
  await $`magick ${master} -filter point -resize ${size}x${size}! ${output}`;
  console.log(`Wrote ${output}`);
}
