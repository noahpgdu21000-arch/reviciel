---
id: elec-logique
matiere: electronique
titre: Logique, conversion analogique-numérique et PWM
chapitre: Électronique — Numérique
resume: Portes logiques et tables de vérité, algèbre de Boole, convertisseur analogique-numérique (résolution, quantum) et signal PWM (rapport cyclique).
mots-cles: numérique, analogique, porte logique, ET, OU, NON, NAND, NOR, XOR, table de vérité, algèbre de Boole, De Morgan, CAN, résolution, quantum, CNA, PWM, MLI, rapport cyclique, analogRead, analogWrite
ordre: 3
---

## Analogique ou numérique ?

- Un signal ==analogique== peut prendre **toutes les valeurs** dans un intervalle (tension d'un capteur de température).
- Un signal ==numérique== ne prend que **deux niveaux** : 0 (bas, 0 V) et 1 (haut, 5 V ou 3,3 V selon la carte).

## Les portes logiques

| Porte | Équation | Sortie à 1 quand… | Symbole européen |
|---|---|---|---|
| ==NON== (NOT) | S = Ā | A = 0 | « 1 » avec un rond en sortie |
| ==ET== (AND) | S = A · B | A **et** B sont à 1 | « & » |
| ==OU== (OR) | S = A + B | **au moins un** est à 1 | « ≥1 » |
| NON-ET (NAND) | S = NON(A · B) | A et B ne sont pas tous les deux à 1 | « & » + rond |
| NON-OU (NOR) | S = NON(A + B) | les deux sont à 0 | « ≥1 » + rond |
| ==OU exclusif== (XOR) | S = A ⊕ B | A et B sont **différents** | « =1 » |

| A | B | ET | OU | NAND | NOR | XOR |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 1 | 1 | 0 |
| 0 | 1 | 0 | 1 | 1 | 0 | 1 |
| 1 | 0 | 0 | 1 | 1 | 0 | 1 |
| 1 | 1 | 1 | 1 | 0 | 0 | 0 |

> [!exemple] Une alarme
> L'alarme S sonne si le système est armé (A = 1) **et** qu'une porte est ouverte (P = 1) : **S = A · P**. Avec deux portes P~1~ et P~2~ : **S = A · (P~1~ + P~2~)**.

## Algèbre de Boole : les règles utiles

- A · 0 = 0 ; A · 1 = A ; A + 0 = A ; A + 1 = 1
- A · Ā = 0 ; A + Ā = 1
- ==Théorèmes de De Morgan== : NON(A · B) = Ā + B̄ et NON(A + B) = Ā · B̄

## Le convertisseur analogique-numérique (CAN)

Le ==CAN== transforme une tension en **nombre** que le microcontrôleur peut traiter.

> [!formule]
> Résolution n bits → **2^n^ valeurs** possibles
> Quantum (plus petite variation mesurable) : **q = V~ref~ / 2^n^**
> Valeur numérique : **N = U / q**   et   **U = N × q**

> [!exemple] Arduino Uno : CAN 10 bits, V~ref~ = 5 V
> 2^10^ = **1 024 valeurs** (de 0 à 1 023) ; q = 5 / 1 024 ≈ **4,9 mV**.
> `analogRead(A0)` renvoie 512 → U ≈ 512 × 4,9 mV ≈ **2,5 V**.
> (ESP32 : 12 bits, de 0 à 4 095, sur 3,3 V.)

Le ==CNA== (convertisseur numérique-analogique) fait l'inverse : nombre → tension.

## La PWM (MLI : modulation de largeur d'impulsion)

Un signal ==PWM== est un signal carré de fréquence fixe dont on fait varier la **durée à l'état haut**.

> [!formule]
> Rapport cyclique : **α = t~haut~ / T** (en %)
> Tension moyenne : **U~moy~ = α × V~cc~**

- Usages : faire varier la **luminosité** d'une LED, la **vitesse** d'un moteur, commander un **servomoteur**.
- Sur Arduino : `analogWrite(broche, valeur)` avec une valeur de **0 à 255** : 0 → 0 %, 127 → ≈ 50 % (≈ 2,5 V en moyenne), 255 → 100 %.

> [!retenir]
> ET = tous à 1 · OU = au moins un à 1 · XOR = différents · CAN n bits → 2^n^ valeurs, q = V~ref~ / 2^n^ · PWM : U~moy~ = α × V~cc~.

=== CARTES ===
Q: Quand la sortie d'une porte ET vaut-elle 1 ?
R: Seulement quand **toutes les entrées** sont à 1.

Q: Quand la sortie d'une porte OU vaut-elle 1 ?
R: Quand **au moins une** entrée est à 1.

Q: Quand la sortie d'une porte XOR vaut-elle 1 ?
R: Quand les entrées sont **différentes**.

Q: Sortie d'une porte NAND avec A = 1 et B = 1 ?
R: **0** (c'est l'inverse du ET).

Q: Théorème de De Morgan pour NON(A · B) ?
R: NON(A · B) = Ā + B̄

Q: Combien de valeurs pour un CAN 10 bits ?
R: 2^10^ = **1 024** valeurs (0 à 1 023).

Q: Formule du quantum d'un CAN ?
R: **q = V~ref~ / 2^n^**

Q: Qu'est-ce que le rapport cyclique d'un signal PWM ?
R: α = **durée à l'état haut / période** (en %).

Q: Tension moyenne d'un signal PWM ?
R: **U~moy~ = α × V~cc~**

Q: Plage de valeurs de analogWrite sur Arduino ?
R: De **0 à 255**.

=== QUIZ ===
? A = 1, B = 0. Quelle porte donne S = 1 ?
- ET
+ OU
- NOR
! Le OU vaut 1 dès qu'une entrée vaut 1.

? Un CAN 8 bits sur 5 V a un quantum d'environ…
- 4,9 mV
+ 19,5 mV
- 0,5 V
! q = 5 / 256 ≈ 0,0195 V = 19,5 mV.

? `analogRead(A0)` renvoie 1023 sur un Arduino Uno (5 V). La tension est d'environ…
- 0 V
- 2,5 V
+ 5 V
! 1 023 est la valeur maximale : environ 5 V.

? Signal PWM de 5 V avec un rapport cyclique de 25 %. Tension moyenne ?
+ 1,25 V
- 2,5 V
- 3,75 V
! U~moy~ = 0,25 × 5 = 1,25 V.

? Quelle équation décrit « la lampe s'allume si l'interrupteur A OU l'interrupteur B est fermé » ?
- S = A · B
+ S = A + B
- S = A ⊕ B
! « OU » se traduit par l'opérateur +.

? Pour diminuer la luminosité d'une LED pilotée en PWM, on…
+ diminue le rapport cyclique
- augmente la fréquence du réseau électrique
- inverse la LED
! Moins de temps à l'état haut = moins de lumière en moyenne.
