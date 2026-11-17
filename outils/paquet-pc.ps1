# RéviCIEL — fabrique dist\ReviCIEL-PC.zip (version PC à télécharger) :
#   - la version « un seul fichier » qui marche sans internet ni installation
#   - « Installer ReviCIEL.bat » qui ajoute l'appli au Bureau et au menu Démarrer
$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$e = [char]0x00E9
$stage = Join-Path $env:TEMP ('reviciel-paquet-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Force -Path (Join-Path $stage 'outils'), (Join-Path $stage 'icons') | Out-Null

Copy-Item (Join-Path $root "dist\R${e}viCIEL-hors-ligne.html") (Join-Path $stage 'ReviCIEL - version hors ligne.html')
Copy-Item (Join-Path $root 'installer-pc.bat') (Join-Path $stage 'Installer ReviCIEL.bat')
Copy-Item (Join-Path $root 'outils\installer-pc.ps1') (Join-Path $stage 'outils')
Copy-Item (Join-Path $root 'outils\site-url.txt') (Join-Path $stage 'outils')
Copy-Item (Join-Path $root 'icons\reviciel.ico') (Join-Path $stage 'icons')

$url = (Get-Content (Join-Path $root 'outils\site-url.txt') -Raw).Trim()
$lisez = @"
R${e}viCIEL - version PC
=====================

OPTION 1 - rien a installer
  Double-clique sur "ReviCIEL - version hors ligne.html".
  Tout est dedans : ca marche sans internet.

OPTION 2 - comme une vraie appli
  Double-clique sur "Installer ReviCIEL.bat".
  Une icone R${e}viCIEL est ajoutee sur le Bureau et dans le menu Demarrer.
  Si Windows affiche "Windows a protege votre ordinateur" :
  clique sur "Informations complementaires" puis "Executer quand meme".
  La premiere ouverture a besoin d'internet, ensuite ca marche hors ligne.

Site : $url
"@
[IO.File]::WriteAllText((Join-Path $stage 'LISEZ-MOI.txt'), ($lisez -replace "`r?`n", "`r`n"), (New-Object Text.UTF8Encoding($true)))

$zip = Join-Path $root 'dist\ReviCIEL-PC.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$fs = [IO.File]::Open($zip, 'Create')
$archive = New-Object IO.Compression.ZipArchive($fs, [IO.Compression.ZipArchiveMode]::Create)
Get-ChildItem $stage -Recurse -File | ForEach-Object {
  $name = $_.FullName.Substring($stage.Length + 1).Replace('\', '/')   # chemins standard (« / ») dans le zip
  [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $name, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
}
$archive.Dispose(); $fs.Dispose()
Remove-Item $stage -Recurse -Force
Write-Output ("Paquet PC cree : dist\ReviCIEL-PC.zip ({0:N0} Ko)" -f ((Get-Item $zip).Length / 1KB))
