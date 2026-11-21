---
id: maths-trigo
matiere: maths
titre: Trigonométrie et cercle trigonométrique
chapitre: Géométrie
resume: Cosinus, sinus et tangente, le radian, le cercle trigonométrique et les valeurs remarquables (utiles en électricité).
mots-cles: trigonométrie, cosinus, sinus, tangente, radian, cercle trigonométrique, valeurs remarquables, pi, angle
ordre: 6
---

## Dans le triangle rectangle

Pour un angle aigu x d'un triangle rectangle :

> [!formule] SOH CAH TOA
> sin x = côté **o**pposé / **h**ypoténuse
> cos x = côté **a**djacent / **h**ypoténuse
> tan x = côté **o**pposé / côté **a**djacent

L'==hypoténuse== est le côté le plus long, en face de l'angle droit.

> [!exemple]
> Une échelle de 5 m fait un angle de 60° avec le sol. Hauteur atteinte : h = 5 × sin 60° ≈ 5 × 0,866 ≈ **4,33 m**.

## Le radian

Le ==radian== (rad) est une autre unité d'angle, utilisée en sciences.

> [!formule]
> π rad = 180°   →   angle en rad = angle en degrés × π / 180

| Degrés | 0° | 30° | 45° | 60° | 90° | 180° | 360° |
|---|---|---|---|---|---|---|---|
| Radians | 0 | π/6 | π/4 | π/3 | π/2 | π | 2π |

## Le cercle trigonométrique

C'est un cercle de **centre O** et de **rayon 1**, parcouru dans le ==sens direct== (inverse des aiguilles d'une montre). À chaque nombre réel x correspond un point M du cercle :

- ==cos x== = abscisse de M ;
- ==sin x== = ordonnée de M.

Conséquences :

- −1 ≤ cos x ≤ 1 et −1 ≤ sin x ≤ 1 ;
- ==cos² x + sin² x = 1== ;
- cos(−x) = cos x et sin(−x) = −sin x.

~~~schema
cercle-trigo
Le point M du cercle de rayon 1 a pour coordonnées (cos θ ; sin θ).
~~~

## Valeurs remarquables

| x | 0 | π/6 | π/4 | π/3 | π/2 |
|---|---|---|---|---|---|
| cos x | 1 | √3/2 | √2/2 | 1/2 | 0 |
| sin x | 0 | 1/2 | √2/2 | √3/2 | 1 |

> [!astuce] Retenir le tableau
> Pour sin, écris √0/2, √1/2, √2/2, √3/2, √4/2 → 0, 1/2, √2/2, √3/2, 1. Le cosinus, c'est le même tableau à l'envers.

## Lien avec l'électricité

Une tension alternative sinusoïdale s'écrit u(t) = U~max~ × sin(ωt), avec ==ω = 2πf== (pulsation en rad/s). Pour le secteur à 50 Hz : ω = 2π × 50 ≈ 314 rad/s.

> [!attention] Mode de la calculatrice
> Vérifie que ta calculatrice est en mode **degrés (D)** ou **radians (R)** selon l'unité de l'énoncé : c'est l'erreur la plus fréquente !

> [!retenir]
> SOH CAH TOA · π rad = 180° · sur le cercle trigonométrique, cos = abscisse et sin = ordonnée · cos² + sin² = 1.

=== EXERCICES ===
# calcul : Trigonométrie
? 60° = π/n radians : quelle est la valeur de n ?
= 3
? Convertis π/4 radian en degrés.
= 45 °
? Triangle rectangle : hypoténuse 10 cm, côté opposé 5 cm. Que vaut sin x ?
= 0,5
? Tension de 50 Hz : pulsation ω = 2πf (en rad/s, arrondie à l'unité) ?
= 314 ± 1
! 2 × 3,14159 × 50 ≈ 314 rad/s.

# paires : Associe chaque valeur remarquable
- cos 0 = 1
- sin(π/6) = 1/2
- cos(π/4) = √2/2
- sin(π/3) = √3/2
- cos(π/2) = 0

=== CARTES ===
Q: Définition du cosinus dans un triangle rectangle ?
R: cos x = côté **adjacent** / **hypoténuse**.

Q: Définition du sinus dans un triangle rectangle ?
R: sin x = côté **opposé** / **hypoténuse**.

Q: Définition de la tangente ?
R: tan x = côté **opposé** / côté **adjacent**.

Q: Combien de degrés vaut π radians ?
R: **180°**

Q: 90° en radians ?
R: **π/2**

Q: Sur le cercle trigonométrique, que représente cos x ?
R: L'**abscisse** du point M associé à x (sin x = l'ordonnée).

Q: Relation fondamentale entre cos et sin ?
R: cos² x + sin² x = **1**

Q: cos(π/3) = ?
R: **1/2**

Q: sin(π/6) = ?
R: **1/2**

=== QUIZ ===
? 60° en radians vaut…
- π/6
+ π/3
- π/2
! 60 × π / 180 = π/3.

? Dans un triangle rectangle, hypoténuse 10 cm, côté opposé à l'angle x : 5 cm. sin x = ?
+ 0,5
- 2
- 0,2
! sin x = opposé / hypoténuse = 5/10 = 0,5 (donc x = 30°).

? Que vaut cos(0) ?
- 0
+ 1
- −1
! Le point associé à 0 sur le cercle trigonométrique est (1 ; 0) : cos 0 = 1.

? Pulsation ω d'une tension de fréquence 50 Hz ?
- 50 rad/s
+ environ 314 rad/s
- environ 157 rad/s
! ω = 2πf = 2 × π × 50 ≈ 314 rad/s.

? Si sin x = 0,6 (avec x aigu), alors cos x = ?
- 0,4
+ 0,8
- 0,36
! cos² x = 1 − 0,36 = 0,64 donc cos x = 0,8.
