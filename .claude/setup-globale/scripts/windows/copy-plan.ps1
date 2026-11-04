# Legge il JSON dall'input stdin del hook
$hookData = $input | Out-String | ConvertFrom-Json

$src = Join-Path $env:USERPROFILE ".claude\plans"
$dest = Join-Path $hookData.cwd ".claude\plans"

# Copia tutti i .md dal percorso globale a quello locale del progetto
if (Test-Path $src) {
    $files = Get-ChildItem $src -Filter "*.md" -ErrorAction SilentlyContinue
    if ($files) {
        if (-not (Test-Path $dest)) {
            New-Item -ItemType Directory -Path $dest -Force | Out-Null
        }
        foreach ($f in $files) {
            Copy-Item $f.FullName $dest -Force
        }
    }
}

# Suona la notifica
(New-Object Media.SoundPlayer "C:\Windows\Media\Windows Ding.wav").PlaySync()
