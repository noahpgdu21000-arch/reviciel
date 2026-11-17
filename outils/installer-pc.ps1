# RéviCIEL — installe l'appli sur ce PC : raccourcis Bureau + menu Démarrer
# qui ouvrent le site dans sa propre fenêtre (Microsoft Edge, mode application).
# Utilisation : installer-pc.bat   (ou : powershell -ExecutionPolicy Bypass -File outils\installer-pc.ps1 -Url https://...)
param([string]$Url = "")

$ErrorActionPreference = 'Stop'
$name = "R$([char]0x00E9)viCIEL"   # RéviCIEL (écrit ainsi pour éviter les soucis d'encodage)

if (-not $Url) {
  $cfg = Join-Path $PSScriptRoot 'site-url.txt'
  if (Test-Path $cfg) { $Url = (Get-Content $cfg -Raw).Trim() }
}
if (-not $Url) { throw "Adresse du site inconnue : renseigne outils\site-url.txt ou passe -Url." }

$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") |
  Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "Microsoft Edge est introuvable." }

# L'icône est copiée dans le profil, pour que le raccourci marche même si le dossier du projet bouge
$appDir = Join-Path $env:LOCALAPPDATA $name
New-Item -ItemType Directory -Force -Path $appDir | Out-Null
$icon = Join-Path $appDir 'reviciel.ico'
Copy-Item (Join-Path $PSScriptRoot '..\icons\reviciel.ico') $icon -Force

$shell = New-Object -ComObject WScript.Shell
$targets = @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))
foreach ($dir in $targets) {
  $lnk = $shell.CreateShortcut((Join-Path $dir "$name.lnk"))
  $lnk.TargetPath = $edge
  $lnk.Arguments = "--app=$Url"
  $lnk.WorkingDirectory = Split-Path $edge
  $lnk.IconLocation = "$icon,0"
  $lnk.Description = "$name - r$([char]0x00E9)visions Premi$([char]0x00E8)re Bac Pro CIEL"
  $lnk.Save()
  Write-Output "Raccourci cree : $(Join-Path $dir "$name.lnk")"
}
Write-Output "Appli installee. Adresse : $Url"
