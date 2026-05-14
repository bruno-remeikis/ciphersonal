# _common.ps1 — Funções utilitárias compartilhadas

$DUMP_DIR = Join-Path $PSScriptRoot "..\..\ciphersonal-db"

function Log-Info    { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Cyan }
function Log-Success { param($msg) Write-Host "[OK]    $msg" -ForegroundColor Green }
function Log-Warn    { param($msg) Write-Host "[AVISO] $msg" -ForegroundColor Yellow }
function Log-Error   { param($msg) Write-Host "[ERRO]  $msg" -ForegroundColor Red }
function Log-Step    { param($msg) Write-Host "`n>> $msg" -ForegroundColor White }

function Validate-Uri {
    param($uri)
    if ($uri -notmatch '^mongodb(\+srv)?://') {
        Log-Error "URI inválida: '$uri'"
        Log-Error "Esperado: mongodb://... ou mongodb+srv://..."
        return $false
    }
    return $true
}

function Require-Tools {
    param([string[]]$tools)
    $missing = $false
    foreach ($tool in $tools) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            Log-Error "Ferramenta não encontrada: '$tool'"
            Log-Error "Baixe em: https://www.mongodb.com/try/download/database-tools"
            $missing = $true
        }
    }
    return -not $missing
}

function Ensure-DumpDir {
    if (-not (Test-Path $DUMP_DIR)) {
        New-Item -ItemType Directory -Path $DUMP_DIR -Force | Out-Null
    }
}

function Generate-DumpName {
    return "ciphersonal-" + (Get-Date -Format "yyyyMMdd-HHmm")
}
