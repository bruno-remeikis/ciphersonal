import { execSync } from "child_process"

console.log("[v0] Instalando swr...")
execSync("pnpm add swr@^2.3.3", { stdio: "inherit", cwd: "/vercel/share/v0-project" })
console.log("[v0] swr instalado com sucesso.")
