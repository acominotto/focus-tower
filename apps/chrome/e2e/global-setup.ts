import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

export default function globalSetup(): void {
  const distManifest = join(import.meta.dirname, "..", "dist", "manifest.json");
  if (!existsSync(distManifest)) {
    execSync("bun run build", { cwd: join(import.meta.dirname, ".."), stdio: "inherit" });
  }
}
