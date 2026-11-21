@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Construction des fiches...
node outils\build.js || goto :erreur
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0outils\paquet-pc.ps1" || goto :erreur
echo.
echo Mise en ligne sur https://reviciel.web.app ...
call "%~dp0..\reviciel-outils\firebase\node_modules\.bin\firebase.cmd" deploy --only hosting,firestore:rules --project reviciel --non-interactive || goto :erreur
echo.
echo Envoi sur GitHub (l'ancien lien se met a jour en 1 a 2 minutes)...
git add -A
git commit -m "Mise a jour des fiches" || echo Rien de nouveau a envoyer.
git -c credential.helper= -c "credential.https://github.com.helper=!'%LOCALAPPDATA%/reviciel-outils/gh/bin/gh.exe' auth git-credential" push || goto :erreur
"%LOCALAPPDATA%\reviciel-outils\gh\bin\gh.exe" release upload v1.0 "dist\ReviCIEL-PC.zip" --clobber -R noahpgdu21000-arch/reviciel || goto :erreur
echo.
echo Termine ! L'appli proposera "Mettre a jour" a la prochaine ouverture.
pause
exit /b 0
:erreur
echo.
echo Une erreur est survenue : lis le message ci-dessus.
pause
exit /b 1
