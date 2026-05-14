# restore.ps1 — Restaura um dump para um banco MongoDB Atlas
#
# Uso:
#   .\restore.ps1
#   .\restore.ps1 -Uri "mongodb+srv://user:pass@cluster.net" -SourceDb "origem" -TargetDb "destino" -DumpName "ciphersonal-20240315-1430"

param(
    [string]$Uri,
    [string]$SourceDb,
    [string]$TargetDb,
    [string]$DumpName,
    [switch]$SkipConfirm
)

. "$PSScriptRoot\_common.ps1"

# ─── Entrada de dados ──────────────────────────────────────────────────────────

Write-Host "`n=== MongoDB Restore ===`n" -ForegroundColor White

if (-not $Uri) {
    $Uri = Read-Host "URI do MongoDB (ex: mongodb+srv://user:pass@cluster.net)"
    if (-not $Uri) { Log-Error "URI não pode ser vazia."; exit 1 }
}

if (-not $SourceDb) {
    $SourceDb = Read-Host "Nome do banco de origem (como estava no dump)"
    if (-not $SourceDb) { Log-Error "Banco de origem não pode ser vazio."; exit 1 }
}

if (-not $TargetDb) {
    $TargetDb = Read-Host "Nome do banco de destino (onde será restaurado)"
    if (-not $TargetDb) { Log-Error "Banco de destino não pode ser vazio."; exit 1 }
}

if (-not $DumpName) {
    # Lista dumps disponíveis
    Write-Host ""
    Log-Info "Dumps disponíveis em: $DUMP_DIR"
    if (Test-Path $DUMP_DIR) {
        Get-ChildItem $DUMP_DIR -Directory |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 10 |
            ForEach-Object { Write-Host "    • $($_.Name)" -ForegroundColor Gray }
    } else {
        Log-Warn "Nenhum dump encontrado."
    }
    Write-Host ""

    $DumpName = Read-Host "Nome do dump (ex: ciphersonal-20240315-1430)"
    if (-not $DumpName) { Log-Error "Nome do dump não pode ser vazio."; exit 1 }
}

# ─── Validações ────────────────────────────────────────────────────────────────

if (-not (Require-Tools @("mongorestore"))) { exit 1 }
if (-not (Validate-Uri $Uri)) { exit 1 }

$DumpPath = Join-Path $DUMP_DIR $DumpName

if (-not (Test-Path $DumpPath)) {
    Log-Error "Dump não encontrado: $DumpPath"
    exit 1
}

# ─── Confirmação ───────────────────────────────────────────────────────────────

Write-Host ""
Log-Warn "Resumo da operação:"
Log-Info "  Dump:    $DumpPath"
Log-Info "  Origem:  $SourceDb"
Log-Info "  Destino: $TargetDb"
Write-Host ""

if (-not $SkipConfirm) {
    $confirm = Read-Host "Confirmar restore? [s/N]"
    if ($confirm -notmatch '^[sS]$') {
        Log-Warn "Operação cancelada."
        exit 0
    }
}

# ─── Execução ──────────────────────────────────────────────────────────────────

Log-Step "Iniciando restore"

mongorestore `
    --uri="$Uri" `
    --nsFrom="${SourceDb}.*" `
    --nsTo="${TargetDb}.*" `
    --gzip `
    --drop `
    "$DumpPath"

if ($LASTEXITCODE -ne 0) {
    Log-Error "Falha no restore. Verifique os parâmetros e tente novamente."
    exit 1
}

Log-Success "Restore concluído! Banco '$TargetDb' atualizado."
