import { existsSync } from "fs"
import { dirname, join } from "path"
import { config } from "dotenv"

const MARKERS = ["pnpm-workspace.yaml", "turbo.json"] as const

export function findRepoRoot(start = process.cwd()): string {
  let dir = start
  for (let i = 0; i < 14; i++) {
    if (MARKERS.some((m) => existsSync(join(dir, m)))) {
      return dir
    }
    const parent = dirname(dir)
    if (parent === dir) {
      break
    }
    dir = parent
  }
  return start
}

/** Load `<repo-root>/.env` once. Prefer shell env when set (`override: false`). */
export function loadRootEnv(): void {
  const root = findRepoRoot()
  const envPath = join(root, ".env")
  if (existsSync(envPath)) {
    config({ path: envPath, override: false })
  }
}
