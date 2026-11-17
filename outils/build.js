#!/usr/bin/env node
/* RéviCIEL — construction du site.
   1. Lit toutes les fiches de « fiches/ » (fichiers .md) et vérifie leur format.
   2. Écrit js/content.js (les fiches regroupées, chargé par index.html).
   3. Met à jour la liste des fichiers et la version dans sw.js (mode hors connexion).
   4. Crée dist/RéviCIEL-hors-ligne.html : un seul fichier qui marche sans internet ni serveur.
   Utilisation : node outils/build.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s, 'utf8'); };

// Charge le vrai lecteur de fiches du site (même analyse que dans le navigateur)
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(read('js/markdown.js'), sandbox);
const RCMD = sandbox.window.RCMD;

// Matières connues (lues dans js/data.js)
const SUBJECT_IDS = Array.from(read('js/data.js').matchAll(/\{ id: '([\w-]+)', name: '[^']*', group:/g)).map((m) => m[1]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : /\.md$/i.test(d.name) ? [p] : [];
  });
}

const files = walk(path.join(ROOT, 'fiches')).sort();
const sources = [], ids = new Map(), problems = [], stats = {};
let nCards = 0, nQuiz = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  const f = RCMD.parseFiche(src);
  const where = rel(file);
  if (!f.id) problems.push(where + ' : il manque « id: » dans l\'en-tête');
  else if (ids.has(f.id)) problems.push(where + ' : id « ' + f.id + ' » déjà utilisé par ' + ids.get(f.id));
  else ids.set(f.id, where);
  if (SUBJECT_IDS.indexOf(f.subject) === -1) problems.push(where + ' : matière inconnue « ' + f.subject + ' » (possibles : ' + SUBJECT_IDS.join(', ') + ')');
  if (f.title === 'Sans titre') problems.push(where + ' : il manque « titre: » dans l\'en-tête');
  f.errors.forEach((e) => problems.push(where + ' : ' + e));
  stats[f.subject] = stats[f.subject] || { fiches: 0, cards: 0, quiz: 0 };
  stats[f.subject].fiches++; stats[f.subject].cards += f.cards.length; stats[f.subject].quiz += f.quiz.length;
  nCards += f.cards.length; nQuiz += f.quiz.length;
  sources.push(src);
}

// Échappe </script> et <!-- pour pouvoir intégrer le contenu dans une page HTML
const safeJson = (x) => JSON.stringify(x).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');

// Version = date + empreinte de tous les fichiers du site
const APP_FILES = ['index.html', 'manifest.webmanifest', 'css/app.css',
  ...fs.readdirSync(path.join(ROOT, 'js')).filter((n) => n.endsWith('.js') && n !== 'content.js').sort().map((n) => 'js/' + n),
  ...fs.readdirSync(path.join(ROOT, 'icons')).filter((n) => /\.(png|svg)$/.test(n)).sort().map((n) => 'icons/' + n)];
const h = crypto.createHash('sha1');
APP_FILES.forEach((p) => h.update(fs.readFileSync(path.join(ROOT, p))));
sources.forEach((s) => h.update(s));
const d = new Date();
const version = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + '-' + h.digest('hex').slice(0, 8);

// 1. js/content.js
write('js/content.js', '/* Fichier généré par « node outils/build.js » à partir du dossier fiches/ — ne pas modifier à la main. */\n' +
  'window.REVICIEL_CONTENT = ' + safeJson({ version, files: sources }) + ';\n');

// 2. sw.js
const assets = ['./'].concat(APP_FILES, ['js/content.js']);
const sw = read('sw.js').replace(/\/\/ @@BUILD-START[\s\S]*?\/\/ @@BUILD-END/,
  '// @@BUILD-START\nconst VERSION = ' + JSON.stringify(version) + ';\nconst ASSETS = ' + JSON.stringify(assets, null, 2) + ';\n// @@BUILD-END');
write('sw.js', sw);

// 3. Version « un seul fichier » (hors ligne, sans serveur)
let html = read('index.html');
const svgIcon = 'data:image/svg+xml;base64,' + Buffer.from(read('icons/icon.svg')).toString('base64');
html = html.replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
  .replace(/href="icons\/icon\.svg"/g, 'href="' + svgIcon + '"')
  .replace(/src="icons\/icon\.svg"/g, 'src="' + svgIcon + '"')
  .replace(/<link rel="stylesheet" href="([^"]+)">/g, (m, p) => '<style>\n' + read(p) + '\n</style>')
  .replace(/<script src="([^"]+)"><\/script>/g, (m, p) => '<script>\n' + read(p).replace(/<\/script/gi, '<\\/script') + '\n</script>');
write('dist/RéviCIEL-hors-ligne.html', html);

// Résumé
console.log('\nRéviCIEL — construction terminée (version ' + version + ')\n');
Object.keys(stats).sort((a, b) => SUBJECT_IDS.indexOf(a) - SUBJECT_IDS.indexOf(b)).forEach((k) => {
  const s = stats[k];
  console.log('  ' + k.padEnd(16) + String(s.fiches).padStart(3) + ' fiches ' + String(s.cards).padStart(4) + ' cartes ' + String(s.quiz).padStart(4) + ' questions');
});
console.log('  ' + 'TOTAL'.padEnd(16) + String(sources.length).padStart(3) + ' fiches ' + String(nCards).padStart(4) + ' cartes ' + String(nQuiz).padStart(4) + ' questions\n');
console.log('  → js/content.js, sw.js et dist/RéviCIEL-hors-ligne.html mis à jour.');
if (problems.length) {
  console.log('\n  ⚠ ' + problems.length + ' problème(s) à corriger :');
  problems.forEach((p) => console.log('    - ' + p));
  process.exitCode = 1;
} else console.log('  ✓ Aucune erreur de format.\n');
