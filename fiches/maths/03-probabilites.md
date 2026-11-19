---
id: maths-probabilites
matiere: maths
titre: Probabilités
chapitre: Statistiques et probabilités
resume: Expérience aléatoire, événements, calcul de probabilités, événement contraire, « et » / « ou », fréquences.
mots-cles: probabilité, expérience aléatoire, issue, univers, événement, équiprobabilité, événement contraire, intersection, réunion, fréquence, loi des grands nombres, arbre
ordre: 3
---

## Le vocabulaire

- ==Expérience aléatoire== : expérience dont on connaît les résultats possibles, mais pas celui qui va sortir (lancer un dé).
- ==Issue== : un résultat possible (obtenir 4). L'ensemble des issues s'appelle l'==univers== Ω.
- ==Événement== : un ensemble d'issues (« obtenir un nombre pair » = {2 ; 4 ; 6}).

## Calculer une probabilité

- Une probabilité est toujours comprise entre **0** (événement impossible) et **1** (événement certain).
- La somme des probabilités de toutes les issues vaut **1**.

> [!formule] Situation d'équiprobabilité (toutes les issues ont la même chance)
> P(A) = nombre d'issues favorables à A / nombre d'issues possibles

> [!exemple]
> Dé équilibré à 6 faces. A = « obtenir un nombre pair » : P(A) = 3/6 = **1/2**. B = « obtenir plus de 4 » = {5 ; 6} : P(B) = 2/6 = **1/3**.

## Événement contraire

L'événement contraire de A, noté ==Ā==, se réalise quand A ne se réalise pas.

> [!formule]
> P(Ā) = 1 − P(A)

## « A et B », « A ou B »

- ==A ∩ B== (« A et B ») : les issues communes à A et B.
- ==A ∪ B== (« A ou B ») : les issues de A, de B, ou des deux.
- Si A et B n'ont aucune issue commune, ils sont ==incompatibles== : P(A ∩ B) = 0.

> [!formule]
> P(A ∪ B) = P(A) + P(B) − P(A ∩ B)

> [!exemple] Suite de l'exemple du dé
> A ∩ B = {6} donc P(A ∩ B) = 1/6. P(A ∪ B) = 1/2 + 1/3 − 1/6 = 4/6 = **2/3** (on vérifie : A ∪ B = {2 ; 4 ; 5 ; 6}).

## Fréquence et probabilité

Si on répète une expérience un **grand nombre de fois**, la ==fréquence== d'apparition d'un événement se rapproche de sa probabilité : c'est la ==loi des grands nombres==. C'est ce qu'on observe en simulant l'expérience avec un tableur ou un programme Python.

## Outils : tableau et arbre

- Un ==tableau à double entrée== aide à compter les issues quand il y a deux critères (ex. élèves selon la classe et l'option).
- Un ==arbre== représente les expériences en plusieurs étapes : on multiplie les probabilités le long d'une branche.

> [!retenir]
> 0 ≤ P(A) ≤ 1 · P(Ā) = 1 − P(A) · P(A ∪ B) = P(A) + P(B) − P(A ∩ B) · fréquence → probabilité quand le nombre d'essais augmente.

=== EXERCICES ===
# calcul : Calcule les probabilités (réponds avec un nombre décimal)
? Dé équilibré à 6 faces : probabilité d'obtenir un nombre pair ?
= 0,5
! 3 issues favorables sur 6.
? Si P(A) = 0,35, que vaut P(Ā) ?
= 0,65
! P(Ā) = 1 − 0,35.
? P(A) = 0,5 ; P(B) = 0,4 ; P(A ∩ B) = 0,2. Que vaut P(A ∪ B) ?
= 0,7
! 0,5 + 0,4 − 0,2 = 0,7.
? On tire une carte dans un jeu de 32. Probabilité de tirer un cœur ?
= 0,25
! 8 cœurs sur 32 cartes.

# paires : Associe chaque notation ou mot à son sens
- A ∩ B = A et B
- A ∪ B = A ou B
- Ā = Le contraire de A
- Probabilité égale à 1 = Événement certain
- Probabilité égale à 0 = Événement impossible

=== CARTES ===
Q: Entre quelles valeurs est comprise une probabilité ?
R: Entre **0** (impossible) et **1** (certain).

Q: Formule en situation d'équiprobabilité ?
R: P(A) = nombre d'issues **favorables** / nombre d'issues **possibles**.

Q: Probabilité de l'événement contraire Ā ?
R: P(Ā) = **1 − P(A)**.

Q: Que signifie A ∩ B ?
R: « A **et** B » : les issues qui réalisent les deux événements à la fois.

Q: Formule de P(A ∪ B) ?
R: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).

Q: Que sont deux événements incompatibles ?
R: Deux événements **sans issue commune** : P(A ∩ B) = 0.

Q: Que dit la loi des grands nombres ?
R: Quand on répète l'expérience un grand nombre de fois, la **fréquence** se rapproche de la **probabilité**.

=== QUIZ ===
? On tire une carte au hasard dans un jeu de 32 cartes. Probabilité de tirer un as ?
- 1/32
+ 1/8
- 1/4
! Il y a 4 as sur 32 cartes : 4/32 = 1/8.

? Si P(A) = 0,35, alors P(Ā) = …
- 0,35
+ 0,65
- 1,35
! P(Ā) = 1 − 0,35 = 0,65.

? Dé à 6 faces : probabilité d'obtenir un nombre strictement supérieur à 4 ?
- 1/2
+ 1/3
- 2/3
! Issues favorables : 5 et 6, soit 2/6 = 1/3.

? P(A) = 0,5 ; P(B) = 0,4 ; P(A ∩ B) = 0,2. P(A ∪ B) = ?
- 0,9
+ 0,7
- 0,2
! 0,5 + 0,4 − 0,2 = 0,7.

? On lance 10 000 fois une pièce équilibrée. La fréquence de « pile » sera…
- exactement 0,5
+ proche de 0,5
- proche de 1
! Loi des grands nombres : la fréquence se rapproche de la probabilité 0,5, sans être forcément exactement égale.
