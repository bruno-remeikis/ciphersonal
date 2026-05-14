# duplicate.ps1 — Duplica um banco MongoDB Atlas (dump + restore em sequência)
#
# Uso:
#   .\duplicate.ps1
#   .\duplicate.ps1 -Uri "mongodb+srv://user:pass@cluster.net" -SourceDb "origem" -TargetDb "destino"

param(
    [string]$Uri,
    [string]$SourceDb,
    [string]$TargetDb
)

. "$PSScriptRoot\_common.ps1"

# ─── Entrada de dados ──────────────────────────────────────────────────────────

Write-Host "`n=== MongoDB Duplicate ===" -ForegroundColor White
Write-Host "Duplica um banco realizando dump e restore em sequência.`n" -ForegroundColor Cyan

if (-not $Uri) {
    $Uri = Read-Host "URI do MongoDB (ex: mongodb+srv://user:pass@cluster.net)"
    if (-not $Uri) { Log-Error "URI não pode ser vazia."; exit 1 }
}

if (-not $SourceDb) {
    $SourceDb = Read-Host "Nome do banco de origem"
    if (-not $SourceDb) { Log-Error "Banco de origem não pode ser vazio."; exit 1 }
}

if (-not $TargetDb) {
    $TargetDb = Read-Host "Nome do banco de destino"
    if (-not $TargetDb) { Log-Error "Banco de destino não pode ser vazio."; exit 1 }
}

# ─── Validações ────────────────────────────────────────────────────────────────

if (-not (Require-Tools @("mongodump", "mongorestore"))) { exit 1 }
if (-not (Validate-Uri $Uri)) { exit 1 }

if ($SourceDb -eq $TargetDb) {
    Log-Error "Banco de origem e destino não podem ser iguais."
    exit 1
}

# ─── Confirmação ───────────────────────────────────────────────────────────────

Write-Host ""
Log-Warn "Resumo da operação:"
Log-Info "  Origem:  $SourceDb"
Log-Info "  Destino: $TargetDb  (será sobrescrito se existir)"
Write-Host ""

$confirm = Read-Host "Confirmar duplicação? [s/N]"
if ($confirm -notmatch '^[sS]$') {
    Log-Warn "Operação cancelada."
    exit 0
}

# ─── Etapa 1: Dump ─────────────────────────────────────────────────────────────

Log-Step "Etapa 1/2 — Dump de '$SourceDb'"

& "$PSScriptRoot\dump.ps1" -Uri $Uri -Database $SourceDb

if ($LASTEXITCODE -ne 0) {
    Log-Error "Falha na etapa de dump. Abortando."
    exit 1
}

$DumpName = $env:LAST_DUMP_NAME

# ─── Etapa 2: Restore ──────────────────────────────────────────────────────────

Log-Step "Etapa 2/2 — Restore para '$TargetDb'"

& "$PSScriptRoot\restore.ps1" -Uri $Uri -SourceDb $SourceDb -TargetDb $TargetDb -DumpName $DumpName -SkipConfirm

if ($LASTEXITCODE -ne 0) {
    Log-Error "Falha na etapa de restore."
    exit 1
}

# ─── Conclusão ─────────────────────────────────────────────────────────────────

Write-Host ""
Log-Success "Duplicação concluída!"
Log-Info "  '$SourceDb'  ->  '$TargetDb'"
Log-Info "  Dump salvo em: $(Join-Path $DUMP_DIR $DumpName)"
