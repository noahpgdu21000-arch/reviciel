---
id: elec-lois
matiere: electronique
titre: Les lois fondamentales de l'électricité
chapitre: Électronique — Bases
resume: Tension, intensité, loi d'Ohm, lois des nœuds et des mailles, résistances en série et en parallèle, pont diviseur, code couleur et mesures.
mots-cles: tension, intensité, résistance, loi d'Ohm, loi des nœuds, loi des mailles, série, parallèle, résistance équivalente, pont diviseur, puissance, code couleur, multimètre, voltmètre, ampèremètre, court-circuit
ordre: 1
---

## Les grandeurs électriques

| Grandeur | Symbole | Unité | Se mesure avec… | Branchement |
|---|---|---|---|---|
| Tension | U | volt (V) | voltmètre | en ==dérivation== (parallèle) |
| Intensité | I | ampère (A) | ampèremètre | en ==série== (on ouvre le circuit) |
| Résistance | R | ohm (Ω) | ohmmètre | composant ==hors tension== |
| Puissance | P | watt (W) | wattmètre | — |

## Les lois à connaître

> [!formule] Loi d'Ohm
> **U = R × I**   (U en V, R en Ω, I en A)   →   I = U / R   et   R = U / I

- ==Loi des nœuds== : la somme des courants qui **arrivent** à un nœud est égale à la somme des courants qui en **repartent**.
- ==Loi des mailles== : dans une boucle fermée, la somme des tensions est nulle. Pour des dipôles **en série** : U = U~1~ + U~2~ + …
- ==Puissance== : P = U × I = R × I² = U² / R. Une résistance doit supporter la puissance qu'elle dissipe (souvent 1/4 W).

## Associer des résistances

| En série | En parallèle (dérivation) |
|---|---|
| R~éq~ = R~1~ + R~2~ + … | 1 / R~éq~ = 1 / R~1~ + 1 / R~2~ + … |
| même courant partout | même tension aux bornes |
| R~éq~ plus grande que chaque résistance | R~éq~ plus petite que la plus petite |

Pour **deux** résistances en parallèle : **R~éq~ = (R~1~ × R~2~) / (R~1~ + R~2~)**. Deux résistances identiques R en parallèle → R/2.

## Le pont diviseur de tension

> [!formule]
> **U~s~ = U~e~ × R~2~ / (R~1~ + R~2~)**   (sortie prise aux bornes de R~2~, sans charge)

> [!exemple] Adapter un signal 5 V pour un ESP32 (3,3 V)
> R~1~ = 1 kΩ et R~2~ = 2 kΩ : U~s~ = 5 × 2 / (1 + 2) ≈ **3,33 V**.

## Le code couleur des résistances (4 anneaux)

| Couleur | Chiffre | Multiplicateur |
|---|---|---|
| Noir | 0 | × 1 |
| Marron | 1 | × 10 |
| Rouge | 2 | × 100 |
| Orange | 3 | × 1 k |
| Jaune | 4 | × 10 k |
| Vert | 5 | × 100 k |
| Bleu | 6 | × 1 M |
| Violet | 7 | — |
| Gris | 8 | — |
| Blanc | 9 | — |

4e anneau = **tolérance** : or ± 5 %, argent ± 10 %, marron ± 1 %, rouge ± 2 %.

> [!astuce] Mémoriser l'ordre des couleurs
> « **N**e **M**angez **R**ien **O**u **J**e **V**ous **B**rûle **V**otre **G**rande **B**arbe » : noir, marron, rouge, orange, jaune, vert, bleu, violet, gris, blanc.
> Exemple : jaune, violet, rouge, or → 4, 7, × 100 → **4 700 Ω = 4,7 kΩ ± 5 %**.

Les valeurs du commerce suivent des séries normalisées, comme la **E12** : 10, 12, 15, 18, 22, 27, 33, 39, 47, 56, 68, 82 (× 1, × 10, × 100…).

## Mesurer en sécurité avec le multimètre

- Cordon noir sur **COM** ; cordon rouge sur **V/Ω** (tension, résistance) ou sur la borne **A/mA** (intensité).
- Choisir le bon **calibre** (le plus grand d'abord si on ne connaît pas la valeur), et le bon mode : continu (DC, ⎓) ou alternatif (AC, ~).
- ==Ne jamais mesurer une tension avec le cordon sur la borne A== : c'est un court-circuit (fusible grillé au mieux).
- Un ==court-circuit== (R ≈ 0) fait circuler un courant énorme : échauffement, destruction, incendie.

> [!retenir]
> U = R × I · série : R~éq~ = R~1~ + R~2~ · parallèle : R~1~R~2~ / (R~1~ + R~2~) · pont diviseur : U~s~ = U~e~ × R~2~ / (R~1~ + R~2~) · voltmètre en dérivation, ampèremètre en série.

Entraîne-toi : [loi d'Ohm](#/entrainement/ohm) et [code couleur](#/entrainement/resistances).

=== CARTES ===
Q: Énoncé de la loi d'Ohm ?
R: **U = R × I** (tension = résistance × intensité).

Q: Comment branche-t-on un voltmètre ?
R: En **dérivation** (en parallèle) sur le composant.

Q: Comment branche-t-on un ampèremètre ?
R: En **série** dans le circuit.

Q: Résistance équivalente de deux résistances en série ?
R: R~éq~ = R~1~ + R~2~

Q: Résistance équivalente de deux résistances en parallèle ?
R: R~éq~ = (R~1~ × R~2~) / (R~1~ + R~2~)

Q: Formule du pont diviseur de tension ?
R: U~s~ = U~e~ × R~2~ / (R~1~ + R~2~)

Q: Que dit la loi des nœuds ?
R: Somme des courants **entrants** = somme des courants **sortants**.

Q: Phrase pour retenir le code couleur ?
R: « Ne Mangez Rien Ou Je Vous Brûle Votre Grande Barbe » (0 à 9).

Q: Marron, noir, orange, or : quelle valeur ?
R: 1, 0, × 1 000 → **10 kΩ ± 5 %**.

Q: Comment mesure-t-on une résistance ?
R: À l'**ohmmètre**, composant **hors tension** (et idéalement dessoudé).

=== QUIZ ===
? Une résistance de 470 Ω est traversée par 10 mA. Tension à ses bornes ?
- 47 V
+ 4,7 V
- 0,47 V
! U = 470 × 0,010 = 4,7 V.

? Deux résistances de 1 kΩ en parallèle équivalent à…
- 2 kΩ
+ 500 Ω
- 1 kΩ
! Deux résistances identiques en parallèle : R/2.

? Rouge, rouge, marron, or : quelle valeur ?
+ 220 Ω
- 22 Ω
- 2 200 Ω
! 2, 2, × 10 → 220 Ω ± 5 %.

? Pont diviseur : U~e~ = 12 V, R~1~ = R~2~ = 10 kΩ. U~s~ = ?
+ 6 V
- 12 V
- 3 V
! 12 × 10 / 20 = 6 V.

? Pour mesurer le courant consommé par une carte, l'ampèremètre se branche…
- en parallèle sur l'alimentation
+ en série dans le fil d'alimentation
- entre la masse et la terre
! L'intensité se mesure en série : le courant doit traverser l'appareil.

? Trois résistances en série : 100 Ω, 220 Ω et 680 Ω. R~éq~ = ?
- 680 Ω
+ 1 000 Ω
- 61 Ω
! 100 + 220 + 680 = 1 000 Ω.
