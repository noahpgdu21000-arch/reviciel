---
id: maint-diagnostic
matiere: maintenance
titre: La maintenance et la démarche de diagnostic
chapitre: Maintenance
resume: Maintenance corrective ou préventive, la méthode de diagnostic étape par étape, les précautions avant d'intervenir et les indicateurs MTBF/MTTR.
mots-cles: maintenance, corrective, palliative, curative, préventive, systématique, conditionnelle, prévisionnelle, diagnostic, hypothèses, panne, intervention, sauvegarde, MTBF, MTTR, disponibilité
ordre: 1
---

## Les types de maintenance

> [!definition] Maintenance
> Ensemble des actions qui permettent de **maintenir** ou de **rétablir** un équipement dans un état où il remplit sa fonction.

| Type | Quand ? | Exemples |
|---|---|---|
| ==Corrective palliative== | **après** la panne, dépannage **provisoire** | basculer sur un switch de secours, redémarrer un service |
| ==Corrective curative== | **après** la panne, réparation **définitive** | remplacer l'alimentation défectueuse |
| ==Préventive systématique== | **avant** la panne, selon un **échéancier** | dépoussiérer les serveurs tous les 6 mois, changer les batteries d'onduleur tous les 3 ans |
| ==Préventive conditionnelle== | **avant** la panne, selon l'**état mesuré** | remplacer un disque quand ses indicateurs SMART se dégradent |
| Préventive prévisionnelle | selon l'**analyse des tendances** | anticiper la saturation d'un disque d'après son remplissage |

On parle aussi de maintenance **améliorative** quand on modifie l'équipement pour le rendre plus fiable ou plus performant.

## La démarche de diagnostic

1. ==Recueillir les informations== : que se passe-t-il ? depuis quand ? qu'est-ce qui a changé ? quel message d'erreur ? Si possible, **reproduire** la panne.
2. **Vérifier les évidences** : alimentation, câbles, voyants, interrupteurs (une grande partie des pannes est simple !).
3. ==Émettre des hypothèses==, de la plus **probable** et la plus **simple à vérifier** à la moins probable.
4. ==Tester== chaque hypothèse : mesure (multimètre), remplacement par un **élément sain**, lecture des journaux, ping, logiciel de diagnostic.
5. **Identifier la cause** et **remédier** : réparer, remplacer, reconfigurer.
6. ==Vérifier== le bon fonctionnement, **avec l'utilisateur**.
7. ==Documenter== : compte rendu d'intervention, ticket, base de connaissances.

> [!exemple] « Internet ne marche plus sur mon poste »
> Questions : les autres postes fonctionnent-ils ? Depuis quand ? → Évidences : câble branché, voyant du port allumé ? → `ipconfig` : adresse 169.254.x.x → hypothèse : pas de DHCP → test : autre port du switch → ça marche → cause : port du switch défectueux → remédier, tester, documenter.

## Avant d'intervenir

- Avoir l'**autorisation** et prévenir les utilisateurs concernés (coupure de service).
- ==Sauvegarder les données== avant toute manipulation risquée.
- Appliquer les règles de **sécurité** : mise hors tension, consignation si nécessaire, **bracelet antistatique** pour les cartes électroniques.
- Préparer les outils et les pièces : multimètre, testeur de câble, tournevis, clé USB de diagnostic, documentation constructeur.

## Mesurer la fiabilité

> [!formule]
> **MTBF** = temps moyen de bon fonctionnement entre deux pannes
> **MTTR** = temps moyen de réparation
> **Disponibilité** = MTBF / (MTBF + MTTR)

Exemple : MTBF = 990 h et MTTR = 10 h → disponibilité = 990 / 1 000 = **99 %**. Pour améliorer la disponibilité, on rend le matériel plus fiable (MTBF ↑) et on répare plus vite (MTTR ↓ : pièces de rechange, procédures).

> [!retenir]
> Corrective = après la panne (palliative = provisoire, curative = définitive). Préventive = avant (systématique = calendrier, conditionnelle = état). Diagnostic : informations → évidences → hypothèses → tests → remède → vérification → documentation.

=== CARTES ===
Q: Différence entre maintenance palliative et curative ?
R: **Palliative** = dépannage **provisoire** ; **curative** = réparation **définitive**.

Q: Qu'est-ce que la maintenance préventive systématique ?
R: Une maintenance faite **selon un calendrier** (tous les 6 mois…), même sans signe de panne.

Q: Qu'est-ce que la maintenance préventive conditionnelle ?
R: Une maintenance déclenchée par l'**état mesuré** de l'équipement (seuil, alarme, indicateurs SMART).

Q: Première étape d'un diagnostic ?
R: **Recueillir les informations** (questionner l'utilisateur, reproduire la panne).

Q: Dans quel ordre tester les hypothèses ?
R: De la plus **probable** et **simple à vérifier** à la moins probable.

Q: Que faire avant une intervention risquée sur un poste ?
R: **Sauvegarder les données** (et prévenir l'utilisateur).

Q: Que signifie MTBF ?
R: **Temps moyen entre deux pannes** (Mean Time Between Failures).

Q: Que signifie MTTR ?
R: **Temps moyen de réparation** (Mean Time To Repair).

Q: Dernière étape d'une intervention ?
R: **Documenter** (compte rendu, ticket, base de connaissances).

=== QUIZ ===
? Le disque d'un serveur tombe en panne. On le remplace par un neuf. C'est une maintenance…
- préventive systématique
+ corrective curative
- palliative
! On répare définitivement après la panne.

? Remplacer les batteries de l'onduleur tous les 3 ans, c'est une maintenance…
+ préventive systématique
- préventive conditionnelle
- corrective
! Elle suit un échéancier fixe.

? Un utilisateur dit : « mon PC ne s'allume plus ». Que vérifier en premier ?
- La version du BIOS
+ L'alimentation électrique (prise, câble, interrupteur)
- Les pilotes de la carte graphique
! On commence toujours par les évidences.

? MTBF = 495 h, MTTR = 5 h. Disponibilité ?
- 95 %
+ 99 %
- 99,9 %
! 495 / 500 = 0,99 = 99 %.

? Pourquoi documenter une intervention ?
+ Pour garder une trace et résoudre plus vite les pannes similaires
- Parce que c'est plus long
- Pour remplacer la sauvegarde
! Le compte rendu alimente l'historique et la base de connaissances.
