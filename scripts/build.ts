import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");
const src = join(root, "src");

function copyStatic(): void {
  mkdirSync(dist, { recursive: true });
  cpSync(join(root, "static"), dist, { recursive: true });
  cpSync(join(root, "icons"), join(dist, "icons"), { recursive: true });

  const manifest = JSON.parse(readFileSync(join(root, "manifest.json"), "utf8"));
  writeFileSync(join(dist, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

const isDevBuild = process.env.DEV_BUILD === "1";

async function build(): Promise<void> {
  const generateWatcherEye = Bun.spawnSync(["bun", "run", join(import.meta.dir, "generate-watcher-eye.ts")], {
    cwd: root,
    stdout: "inherit",
    stderr: "inherit",
  });
  if (generateWatcherEye.exitCode !== 0) {
    process.exit(generateWatcherEye.exitCode ?? 1);
  }

  copyStatic();

  const result = await Bun.build({
    entrypoints: [
      join(src, "background.ts"),
      join(src, "blocked/blocked.ts"),
      join(src, "popup/popup.ts"),
      join(src, "content/gate-watcher.ts"),
    ],
    outdir: dist,
    root: src,
    target: "browser",
    format: "esm",
    minify: false,
    define: {
      __DEV__: JSON.stringify(isDevBuild),
    },
  });

  if (!result.success) {
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }

  console.log("Build complete → dist/");
}

await build();
