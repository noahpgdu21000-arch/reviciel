---
id: maths-stats-2var
matiere: maths
titre: Statistiques à deux variables
chapitre: Statistiques et probabilités
resume: Nuage de points, point moyen, ajustement affine et prévisions (interpolation, extrapolation).
mots-cles: série statistique, deux variables, nuage de points, point moyen, ajustement affine, droite d'ajustement, moindres carrés, interpolation, extrapolation, tableur
ordre: 2
---

## Série statistique à deux variables

On étudie **deux caractères** sur une même population, par exemple l'année et le nombre d'abonnés à la fibre. Chaque individu donne un couple (x~i~ ; y~i~).

On représente la série par un ==nuage de points== dans un repère : le point M~i~ a pour coordonnées (x~i~ ; y~i~).

## Le point moyen

> [!formule] Point moyen G
> G (x̄ ; ȳ) où x̄ est la moyenne des x~i~ et ȳ la moyenne des y~i~

## L'ajustement affine

Quand les points du nuage sont ==à peu près alignés==, on peut les remplacer par une ==droite d'ajustement== d'équation **y = ax + b**.

- La droite donnée par la calculatrice ou le tableur est la ==droite des moindres carrés== (régression linéaire) : c'est celle qui passe « au plus près » de tous les points. Elle passe par le **point moyen G**.
- Au tableur : insérer un graphique en nuage de points, puis « ajouter une courbe de tendance linéaire » et « afficher l'équation ».
- Si le nuage n'a pas une forme allongée (points dispersés, courbe), un ajustement affine n'est **pas pertinent**.

## Faire une prévision

- ==Interpolation== : estimer une valeur **à l'intérieur** de la plage des données (assez fiable).
- ==Extrapolation== : prévoir une valeur **en dehors** de la plage (par exemple dans le futur) : on suppose que la tendance continue → **prudence**.

> [!exemple] Exemple complet
> | Rang de l'année x~i~ | 1 | 2 | 3 | 4 | 5 |
> |---|---|---|---|---|---|
> | Ventes y~i~ (milliers) | 12 | 15 | 19 | 21 | 23 |
>
> - Point moyen : x̄ = 15 / 5 = 3 ; ȳ = 90 / 5 = 18 → **G (3 ; 18)**.
> - La calculatrice donne la droite **y = 2,8x + 9,6** (on vérifie : 2,8 × 3 + 9,6 = 18, elle passe bien par G).
> - Prévision pour l'année 7 : y = 2,8 × 7 + 9,6 = **29,2 milliers** (extrapolation).

## Méthode à la calculatrice

1. Entrer les x~i~ dans la liste 1 et les y~i~ dans la liste 2.
2. Choisir le calcul statistique à 2 variables : lire x̄, ȳ.
3. Choisir la régression linéaire (« ax + b ») : lire a et b, arrondir comme demandé.

> [!retenir]
> Nuage de points → point moyen G (x̄ ; ȳ) → droite d'ajustement y = ax + b (qui passe par G) → prévisions par interpolation ou extrapolation.

=== EXERCICES ===
# calcul : Point moyen et prévision
? Les x valent 1, 2, 3, 4, 5. Calcule x̄.
= 3
? Les y valent 10, 14, 15, 19, 22. Calcule ȳ.
= 16
! (10 + 14 + 15 + 19 + 22) / 5 = 80 / 5 = 16.
? La droite d'ajustement est y = 2,9x + 7,3. Estime y pour x = 8.
= 30,5
! 2,9 × 8 + 7,3 = 23,2 + 7,3 = 30,5.

# paires : Associe chaque mot à sa définition
- Nuage de points = Les couples (x ; y) placés dans un repère
- Point moyen = Le point de coordonnées (x̄ ; ȳ)
- Interpolation = Estimation à l'intérieur de la plage des données
- Extrapolation = Prévision en dehors de la plage des données

=== CARTES ===
Q: Qu'est-ce qu'un nuage de points ?
R: La représentation d'une série à deux variables : chaque couple (x~i~ ; y~i~) donne un point dans un repère.

Q: Coordonnées du point moyen G ?
R: G (x̄ ; ȳ) : la **moyenne des x** et la **moyenne des y**.

Q: Quand un ajustement affine est-il pertinent ?
R: Quand les points du nuage sont **à peu près alignés** (forme allongée).

Q: Par quel point passe la droite des moindres carrés ?
R: Par le **point moyen G**.

Q: Différence entre interpolation et extrapolation ?
R: **Interpolation** = estimation à l'intérieur de la plage des données ; **extrapolation** = prévision en dehors (moins fiable).

Q: Comment obtenir l'équation de la droite au tableur ?
R: Graphique en nuage de points → **courbe de tendance linéaire** → afficher l'équation.

=== QUIZ ===
? Les x~i~ valent 2, 4, 6 et les y~i~ valent 10, 20, 30. Point moyen ?
- G (12 ; 60)
+ G (4 ; 20)
- G (6 ; 30)
! x̄ = 12/3 = 4 et ȳ = 60/3 = 20.

? Une droite d'ajustement a pour équation y = 3x + 5. Valeur estimée pour x = 10 ?
- 30
+ 35
- 53
! y = 3 × 10 + 5 = 35.

? Prévoir les ventes dans 3 ans à partir des 5 dernières années, c'est…
- une interpolation
+ une extrapolation
- un calcul de moyenne
! On sort de la plage des données connues : c'est une extrapolation.

? La droite des moindres carrés passe toujours par…
- l'origine du repère
+ le point moyen G
- le premier point du nuage
! C'est une propriété de la droite de régression : elle passe par G (x̄ ; ȳ).

? Les points d'un nuage forment une courbe en U. Que dire d'un ajustement affine ?
- Il est parfait
+ Il n'est pas adapté
- Il passe forcément par l'origine
! Un ajustement affine suppose des points à peu près alignés.
