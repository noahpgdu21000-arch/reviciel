# RéviCIEL — révisions de Première Bac Pro CIEL

Site web interactif **et** appli installable (PWA) pour réviser les matières générales de Première
et l'enseignement professionnel CIEL. Une fois ouverte une première fois, l'appli **fonctionne sans connexion**.

## Ce qu'il y a dedans

- **50 fiches de révision**, **477 cartes mémoire**, **267 questions de quiz**
  - Matières générales : Français (4), Histoire-Géo & EMC (4), Maths (6), Physique-Chimie (4), Anglais (3), Économie-Gestion (3), PSE (4)
  - Pro CIEL : Réseaux (7), Cybersécurité (5), Informatique & code (4), Électronique (4), Maintenance & client (2)
- **Cartes mémoire** avec répétition espacée (boîtes de Leitner) et une **révision du jour**
- **Quiz** par fiche, par matière, ou mélangé, avec corrections expliquées
- **5 exercices générés à l'infini** et corrigés pas à pas : adressage IPv4, binaire/hexa, loi d'Ohm, code couleur des résistances, pourcentages
- **Mode caché** (les mots clés surlignés deviennent des trous à deviner), lecture à voix haute, impression
- **Mes fiches** : crée tes propres fiches (avec cartes et quiz), importe/exporte-les
- Progression par matière, série de jours, recherche, favoris, thème clair/sombre

## Utiliser sur PC

**Le plus simple (aucune installation) :** double-clique sur `dist\RéviCIEL-hors-ligne.html`.
C'est un fichier unique qui contient tout : il marche sans internet et sans serveur.

**En version appli installable :** double-clique sur `lancer.bat` (il faut Node.js, déjà installé sur ce PC),
le site s'ouvre sur http://localhost:8080. Dans Edge ou Chrome, clique sur l'icône « Installer » dans la
barre d'adresse (ou *Paramètres → Installer l'appli* dans RéviCIEL).

## Mettre l'appli sur ton téléphone (hors connexion)

Pour s'installer sur un téléphone, l'appli doit être ouverte **une fois** depuis une adresse web en `https://`.
Le plus rapide et gratuit :

1. Va sur **https://app.netlify.com/drop** (compte gratuit) et glisse-dépose le dossier `revision-ciel` entier.
2. Tu obtiens une adresse du type `https://xxxx.netlify.app` : ouvre-la sur ton téléphone.
3. **Android (Chrome)** : menu ⋮ → *Installer l'application* (ou *Ajouter à l'écran d'accueil*).
   **iPhone (Safari)** : bouton *Partager* → *Sur l'écran d'accueil*.
4. C'est fini : l'icône RéviCIEL marche ensuite **sans internet**.

Autres possibilités : GitHub Pages, ou copier `dist\RéviCIEL-hors-ligne.html` sur le téléphone et l'ouvrir avec le navigateur.
Si un jour tu veux un vrai fichier APK Android, le site **PWABuilder.com** peut le générer à partir de l'adresse en ligne.

> La progression est enregistrée dans le navigateur de chaque appareil. Pour la transférer :
> *Paramètres → Exporter* sur un appareil, puis *Importer* sur l'autre.

## Ajouter ou modifier des fiches

**Dans l'appli** : *Mes fiches → Nouvelle fiche*. Sur une fiche officielle, le bouton *Personnaliser* en crée une copie modifiable.

**Dans le projet** (pour que les fiches soient incluses pour tout le monde) :

1. Ajoute un fichier `.md` dans `fiches\<matière>\` (inspire-toi d'une fiche existante).
2. Double-clique sur `construire.bat` (ou `node outils/build.js`) : il vérifie le format, régénère `js/content.js`,
   met à jour le cache hors ligne et la version `dist\RéviCIEL-hors-ligne.html`.
3. Si l'appli est en ligne, re-dépose le dossier sur Netlify : l'appli installée proposera « Mettre à jour ».

Format d'une fiche :

```text
---
id: res-ma-fiche              (unique)
matiere: reseaux              (francais, hg-emc, maths, physique-chimie, anglais, eco-gestion, pse,
titre: Mon titre               reseaux, cyber, info, electronique, maintenance)
chapitre: Réseaux — Bases
resume: Une phrase de résumé.
mots-cles: mot1, mot2
ordre: 8
---
## Une partie
Du texte avec **gras**, ==mot clé surligné==, `code`, H~2~O, x^2^, des listes, des tableaux…

> [!retenir]
> Encadré (aussi : definition, exemple, attention, astuce, formule, info)

=== CARTES ===
Q: La question
R: La réponse

=== QUIZ ===
? La question du QCM
- mauvaise réponse
+ bonne réponse
! Explication affichée après la réponse
```

## Organisation du projet

```text
revision-ciel/
├── index.html, manifest.webmanifest, sw.js   page, manifeste et service worker (hors ligne)
├── css/app.css                               styles (clair / sombre, mobile)
├── js/                                       code de l'appli (content.js est généré)
├── fiches/<matière>/*.md                     le contenu des fiches
├── icons/                                    icônes de l'appli
├── outils/build.js, outils/serveur.js        construction et petit serveur local
├── dist/RéviCIEL-hors-ligne.html             version « un seul fichier » (générée)
└── construire.bat, lancer.bat                raccourcis Windows
```

Les fiches résument le programme : en cas de doute, ton cours et tes professeurs font foi.
