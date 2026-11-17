@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "" http://localhost:8080
node outils\serveur.js 8080
