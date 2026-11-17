---
id: maths-second-degre
matiere: maths
titre: Fonctions polynômes du second degré
chapitre: Algèbre — Analyse
resume: La parabole, son sommet, le discriminant Δ et la résolution de ax² + bx + c = 0.
mots-cles: second degré, polynôme, parabole, sommet, axe de symétrie, discriminant, delta, racines, équation, factorisation
ordre: 5
---

## La fonction f(x) = ax² + bx + c

Une fonction polynôme du second degré s'écrit **f(x) = ax² + bx + c** avec **a ≠ 0**. Sa courbe est une ==parabole==.

| Signe de a | Allure | Le sommet est… |
|---|---|---|
| a > 0 | parabole tournée vers le haut (∪) | un ==minimum== |
| a < 0 | parabole tournée vers le bas (∩) | un ==maximum== |

> [!formule] Sommet S de la parabole
> x~S~ = −b / (2a)   et   y~S~ = f(x~S~)
> La droite d'équation x = x~S~ est l'==axe de symétrie==.

## Résoudre ax² + bx + c = 0

On calcule le ==discriminant== :

> [!formule]
> Δ = b² − 4ac

| Valeur de Δ | Solutions | Factorisation |
|---|---|---|
| Δ > 0 | **deux** solutions : x~1~ = (−b − √Δ) / (2a) et x~2~ = (−b + √Δ) / (2a) | a(x − x~1~)(x − x~2~) |
| Δ = 0 | **une** solution : x~0~ = −b / (2a) | a(x − x~0~)² |
| Δ < 0 | **aucune** solution réelle | impossible |

Graphiquement, les solutions de f(x) = 0 sont les ==abscisses des points où la parabole coupe l'axe des abscisses==.

> [!exemple] f(x) = x² − 2x − 3
> - a = 1, b = −2, c = −3.
> - Δ = (−2)² − 4 × 1 × (−3) = 4 + 12 = **16** > 0 → deux solutions.
> - x~1~ = (2 − 4) / 2 = **−1** et x~2~ = (2 + 4) / 2 = **3**.
> - Sommet : x~S~ = 2 / 2 = 1 ; f(1) = 1 − 2 − 3 = −4 → **S (1 ; −4)**, c'est un minimum car a > 0.
> - Factorisation : f(x) = (x + 1)(x − 3).

## Applications

- Trouver un ==maximum== : bénéfice maximal d'une entreprise, hauteur maximale d'un objet lancé.
- Trouver un ==minimum== : coût minimal, distance minimale.
- Résoudre un problème d'aire (un côté inconnu x donne souvent une équation du second degré).

> [!attention] Pièges classiques
> - Avec b négatif : −b devient positif (b = −2 → −b = 2).
> - (−2)² = 4, mais −2² = −4 : mets des parenthèses à la calculatrice !
> - Vérifie toujours tes solutions en les remplaçant dans f(x).

> [!retenir]
> Δ = b² − 4ac → Δ > 0 : 2 solutions ; Δ = 0 : 1 solution ; Δ < 0 : aucune. Sommet en x = −b/(2a).

=== CARTES ===
Q: Forme d'une fonction polynôme du second degré ?
R: f(x) = ax² + bx + c avec **a ≠ 0**.

Q: Quelle est la courbe d'une fonction du second degré ?
R: Une **parabole**.

Q: Si a > 0, le sommet est un maximum ou un minimum ?
R: Un **minimum** (parabole tournée vers le haut).

Q: Abscisse du sommet de la parabole ?
R: x~S~ = **−b / (2a)**

Q: Formule du discriminant ?
R: Δ = **b² − 4ac**

Q: Solutions quand Δ > 0 ?
R: x~1~ = (−b − √Δ) / (2a) et x~2~ = (−b + √Δ) / (2a).

Q: Combien de solutions si Δ < 0 ?
R: **Aucune** solution réelle (la parabole ne coupe pas l'axe des abscisses).

Q: Lecture graphique des solutions de f(x) = 0 ?
R: Ce sont les **abscisses des points d'intersection** de la parabole avec l'axe des abscisses.

=== QUIZ ===
? Pour f(x) = 2x² − 4x + 1, que vaut Δ ?
- 24
+ 8
- −8
! Δ = (−4)² − 4 × 2 × 1 = 16 − 8 = 8.

? f(x) = x² − 6x + 9. Combien de solutions à f(x) = 0 ?
- Deux
+ Une seule
- Aucune
! Δ = 36 − 36 = 0 → une solution : x = 3.

? Abscisse du sommet de f(x) = −x² + 4x + 5 ?
- −2
+ 2
- 4
! x~S~ = −b/(2a) = −4 / (−2) = 2.

? f(x) = −3x² + x − 2. La parabole est…
- tournée vers le haut
+ tournée vers le bas, avec un maximum
- une droite
! a = −3 < 0 : la parabole est tournée vers le bas, son sommet est un maximum.

? Les solutions de x² − 5x + 6 = 0 sont…
+ 2 et 3
- −2 et −3
- 1 et 6
! Δ = 25 − 24 = 1 ; x = (5 ± 1) / 2, soit 2 et 3.
