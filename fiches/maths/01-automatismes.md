---
id: maths-automatismes
matiere: maths
titre: Automatismes : pourcentages, proportions, puissances
chapitre: Automatismes
resume: Les calculs qui reviennent partout : proportionnalité, pourcentages et évolutions, puissances de 10, préfixes et conversions.
mots-cles: proportionnalité, produit en croix, pourcentage, coefficient multiplicateur, taux d'évolution, puissances de 10, notation scientifique, préfixes, conversions, priorités
ordre: 1
---

## Proportionnalité

Deux grandeurs sont ==proportionnelles== si on passe de l'une à l'autre en multipliant toujours par le même nombre (le coefficient de proportionnalité). Graphiquement : des points alignés sur une **droite passant par l'origine**.

> [!formule] Produit en croix
> Si a/b = c/d alors d = (b × c) / a

> [!exemple]
> 3 câbles RJ45 coûtent 7,50 €. Prix de 8 câbles : 8 × 7,50 / 3 = **20 €**.

## Pourcentages et évolutions

| Je veux… | Je calcule |
|---|---|
| Prendre t % d'une valeur V | V × t / 100 |
| Augmenter V de t % | V × (1 + t/100) |
| Diminuer V de t % | V × (1 − t/100) |
| Taux d'évolution de V~D~ à V~A~ | (V~A~ − V~D~) / V~D~ × 100 |

- Le nombre (1 + t/100) ou (1 − t/100) est le ==coefficient multiplicateur== (CM). Hausse de 20 % → CM = 1,2 ; baisse de 15 % → CM = 0,85.
- Évolutions successives : on ==multiplie les coefficients==. Une hausse de 10 % puis une baisse de 10 % : 1,1 × 0,9 = 0,99 → **baisse de 1 %** (et non 0 %) !

> [!exemple]
> Un switch passe de 80 € à 92 €. Taux d'évolution : (92 − 80) / 80 × 100 = **+15 %**.

## Puissances de 10 et notation scientifique

- 10^3^ = 1 000 ; 10^6^ = 1 000 000 ; 10^-3^ = 0,001 ; 10^0^ = 1.
- 10^a^ × 10^b^ = 10^a+b^ ; 10^a^ / 10^b^ = 10^a−b^.
- ==Notation scientifique== : a × 10^n^ avec **1 ≤ a < 10**. Exemple : 0,00056 = 5,6 × 10^-4^ ; 230 000 = 2,3 × 10^5^.

## Préfixes et conversions

| Préfixe | Symbole | Valeur |
|---|---|---|
| giga | G | 10^9^ |
| méga | M | 10^6^ |
| kilo | k | 10^3^ |
| milli | m | 10^-3^ |
| micro | µ | 10^-6^ |
| nano | n | 10^-9^ |
| pico | p | 10^-12^ |

- 1 h = 60 min = 3 600 s.
- ==km/h → m/s : diviser par 3,6== (et m/s → km/h : multiplier par 3,6).
- 25 mA = 0,025 A ; 4,7 kΩ = 4 700 Ω ; 100 nF = 0,1 µF.

## Priorités opératoires

1. Parenthèses  2. Puissances  3. Multiplications et divisions  4. Additions et soustractions (de gauche à droite).

> [!retenir]
> Augmenter de t % = multiplier par **1 + t/100**. Diminuer de t % = multiplier par **1 − t/100**. Les évolutions successives se **multiplient**, elles ne s'additionnent pas.

Entraîne-toi avec l'[exercice Pourcentages](#/entrainement/pourcentages).

=== CARTES ===
Q: Coefficient multiplicateur d'une hausse de 20 % ?
R: **1,2** (= 1 + 20/100).

Q: Coefficient multiplicateur d'une baisse de 30 % ?
R: **0,7** (= 1 − 30/100).

Q: Formule du taux d'évolution ?
R: (V~A~ − V~D~) / V~D~ × 100 (valeur d'arrivée moins valeur de départ, divisé par la valeur de départ).

Q: +10 % puis −10 % : quelle évolution globale ?
R: 1,1 × 0,9 = 0,99 → une **baisse de 1 %**.

Q: Comment convertir des km/h en m/s ?
R: On **divise par 3,6** (ex. 90 km/h = 25 m/s).

Q: Que vaut le préfixe micro (µ) ?
R: 10^-6^ (un millionième).

Q: Que vaut le préfixe méga (M) ?
R: 10^6^ (un million).

Q: 0,00056 en notation scientifique ?
R: 5,6 × 10^-4^

Q: À quoi reconnaît-on graphiquement une situation de proportionnalité ?
R: Les points sont alignés sur une **droite qui passe par l'origine**.

=== QUIZ ===
? Un prix de 50 € augmente de 12 %. Nouveau prix ?
- 50,12 €
- 62 €
+ 56 €
- 60 €
! 50 × 1,12 = 56 €.

? Une baisse de 25 % correspond à un coefficient multiplicateur de…
- 0,25
+ 0,75
- 1,25
! 1 − 25/100 = 0,75.

? 72 km/h correspondent à…
- 259,2 m/s
+ 20 m/s
- 7,2 m/s
! 72 / 3,6 = 20 m/s.

? 4,7 kΩ = …
- 47 Ω
- 470 Ω
+ 4 700 Ω
! kilo = × 1 000.

? Quel est le résultat de 2 + 3 × 4 ?
- 20
+ 14
- 24
! La multiplication est prioritaire : 3 × 4 = 12, puis 2 + 12 = 14.

? Un forfait passe de 20 € à 15 €. Taux d'évolution ?
+ −25 %
- −5 %
- −33 %
! (15 − 20) / 20 × 100 = −25 %.
