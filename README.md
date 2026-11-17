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

## Le site web

**https://noahpgdu21000-arch.github.io/reviciel/** (hébergé gratuitement par GitHub Pages,
dépôt : https://github.com/noahpgdu21000-arch/reviciel).

## L'appli sur PC

Elle est installée : icône **RéviCIEL** sur le Bureau et dans le menu Démarrer (fenêtre à part, marche sans internet
après la première ouverture). Pour la réinstaller : double-clique sur `installer-pc.bat`.

Sans rien installer, `dist\RéviCIEL-hors-ligne.html` contient aussi tout le site dans un seul fichier.

## L'appli sur téléphone (hors connexion)

1. Sur ton téléphone, ouvre **https://noahpgdu21000-arch.github.io/reviciel/** (avec internet, une seule fois).
2. **Android (Chrome)** : menu ⋮ → *Installer l'application* (ou *Ajouter à l'écran d'accueil*).
   **iPhone (Safari)** : bouton *Partager* → *Sur l'écran d'accueil*.
3. L'icône RéviCIEL marche ensuite **sans internet**.

Astuce : dans Edge sur le PC, clic droit sur la page → *Créer un code QR pour cette page*, puis scanne-le avec le téléphone.
Si un jour tu veux un vrai fichier APK Android, le site **PWABuilder.com** peut le générer à partir de l'adresse du site.

## Mettre à jour le site et les applis

Après avoir ajouté ou modifié des fiches dans `fiches\` : double-clique sur **`publier.bat`**.
Il reconstruit le site, l'envoie sur GitHub, et le site se met à jour en 1 à 2 minutes.
À la prochaine ouverture, l'appli (PC ou téléphone) affiche « Nouvelle version disponible → Mettre à jour ».

> La progression est enregistrée dans le navigateur de chaque appareil. Pour la transférer :
> *Paramètres → Exporter* sur un appareil, puis *Importer* sur l'autre.

## Ajouter ou modifier des fiches

**Dans l'appli** : *Mes fiches → Nouvelle fiche*. Sur une fiche officielle, le bouton *Personnaliser* en crée une copie modifiable.

**Dans le projet** (pour que les fiches soient incluses pour tout le monde) :

1. Ajoute un fichier `.md` dans `fiches\<matière>\` (inspire-toi d'une fiche existante).
2. Double-clique sur `construire.bat` pour vérifier le format (il régénère `js/content.js`, le cache hors ligne
   et `dist\RéviCIEL-hors-ligne.html`).
3. Double-clique sur `publier.bat` pour mettre le site en ligne à jour.

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
├── outils/                                   build.js, serveur.js, installer-pc.ps1, site-url.txt
├── dist/RéviCIEL-hors-ligne.html             version « un seul fichier » (générée)
└── construire.bat, publier.bat,              raccourcis Windows
    installer-pc.bat, lancer.bat
```

Les fiches résument le programme : en cas de doute, ton cours et tes professeurs font foi.
