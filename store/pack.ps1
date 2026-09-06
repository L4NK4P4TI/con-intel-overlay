$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content (Join-Path $root "manifest.json") -Raw | ConvertFrom-Json
$version = $manifest.version
$dist = Join-Path $root "dist"
$zip = Join-Path $dist "con-intel-overlay-$version.zip"
$stage = Join-Path $dist "stage"

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Force -Path $stage, (Join-Path $stage "icons"), (Join-Path $stage "src") | Out-Null

Copy-Item (Join-Path $root "manifest.json") $stage
Copy-Item (Join-Path $root "popup.html") $stage
Copy-Item (Join-Path $root "icons\icon16.png") (Join-Path $stage "icons")
Copy-Item (Join-Path $root "icons\icon32.png") (Join-Path $stage "icons")
Copy-Item (Join-Path $root "icons\icon48.png") (Join-Path $stage "icons")
Copy-Item (Join-Path $root "icons\icon128.png") (Join-Path $stage "icons")
Copy-Item (Join-Path $root "src\content.js") (Join-Path $stage "src")
Copy-Item (Join-Path $root "src\inject.js") (Join-Path $stage "src")

if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal
Remove-Item $stage -Recurse -Force
Write-Output "Wrote $zip"
Get-Item $zip | Format-List FullName, Length
