# dump.ps1 — Realiza o backup de um banco MongoDB Atlas
#
# Uso:
#   .\dump.ps1
#   .\dump.ps1 -Uri "mongodb+srv://user:pass@cluster.net" -Database "meu_banco"

param(
    [string]$Uri,
    [string]$Database
)

. "$PSScriptRoot\_common.ps1"

# ─── Entrada de dados ──────────────────────────────────────────────────────────

Write-Host "`n=== MongoDB Dump ===`n" -ForegroundColor White

if (-not $Uri) {
    $Uri = Read-Host "URI do MongoDB (ex: mongodb+srv://user:pass@cluster.net)"
    if (-not $Uri) { Log-Error "URI não pode ser vazia."; exit 1 }
}

if (-not $Database) {
    $Database = Read-Host "Nome do banco"
    if (-not $Database) { Log-Error "Nome do banco não pode ser vazio."; exit 1 }
}

# ─── Validações ────────────────────────────────────────────────────────────────

if (-not (Require-Tools @("mongodump"))) { exit 1 }
if (-not (Validate-Uri $Uri)) { exit 1 }
Ensure-DumpDir

# ─── Execução ──────────────────────────────────────────────────────────────────

$DumpName = Generate-DumpName
$DumpPath = Join-Path $DUMP_DIR $DumpName

Log-Step "Iniciando dump"
Log-Info "Banco:   $Database"
Log-Info "Destino: $DumpPath"

mongodump `
    --uri="$Uri" `
    --db="$Database" `
    --out="$DumpPath" `
    --gzip

if ($LASTEXITCODE -ne 0) {
    Log-Error "Falha no dump. Verifique a URI e o nome do banco."
    exit 1
}

Log-Success "Dump concluído: $DumpPath"

$size = "{0:N2} MB" -f ((Get-ChildItem $DumpPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB)
Log-Info "Tamanho: $size"

# Exporta para uso no duplicate.ps1
$env:LAST_DUMP_NAME = $DumpName
