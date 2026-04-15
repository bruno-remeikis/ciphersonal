import { execSync } from "node:child_process"

console.log("[v0] Installing swr...")
execSync("pnpm add swr@^2.3.3", { stdio: "inherit", cwd: "/vercel/share/v0-project" })
console.log("[v0] swr installed successfully.")
