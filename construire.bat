@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Construction de ReviCIEL (fiches + mode hors ligne)...
node outils\build.js
echo.
pause
