---
id: pc-puissance-energie
matiere: physique-chimie
titre: Puissance et énergie électriques
chapitre: Électricité
resume: P = U × I, E = P × t, le kilowattheure, l'effet Joule, le rendement et le calcul d'une consommation.
mots-cles: puissance, watt, énergie, joule, kilowattheure, kWh, effet Joule, rendement, plaque signalétique, consommation, facture
ordre: 2
---

## La puissance électrique

La ==puissance== (en watts, **W**) indique la quantité d'énergie consommée ou fournie chaque seconde.

> [!formule]
> **P = U × I**   (P en W, U en V, I en A)
> Pour une résistance (effet Joule) : **P = R × I²** = U² / R

Cette formule s'applique en continu, et en alternatif pour les appareils résistifs (radiateur, four) avec les valeurs **efficaces**.

> [!exemple]
> Un radiateur de 2 000 W branché sur 230 V : I = P / U = 2 000 / 230 ≈ **8,7 A**. Il faut une ligne protégée en conséquence (disjoncteur adapté).

## L'énergie électrique

> [!formule]
> **E = P × t**
> E en joules (J) si P en W et t en s · E en wattheures (Wh) si P en W et t en h
> **1 kWh = 1 000 Wh = 3,6 × 10^6^ J**

Le ==kilowattheure (kWh)== est l'unité de la facture d'électricité.

> [!exemple] Combien coûte un PC de gamer ?
> Un PC de 300 W fonctionne 4 h par jour pendant 30 jours : t = 120 h.
> E = 0,3 kW × 120 h = **36 kWh**. Avec un prix de 0,25 € le kWh (prix d'exemple) : 36 × 0,25 = **9 €** par mois.

## L'effet Joule

Tout conducteur parcouru par un courant ==s'échauffe== : c'est l'==effet Joule==.

- **Utile** : radiateur, bouilloire, fer à souder, fusible (qui fond en cas de surintensité).
- **Gênant** : pertes d'énergie dans les câbles, échauffement des composants (d'où les dissipateurs et ventilateurs).

## Le rendement

Un appareil transforme l'énergie, mais une partie est perdue (souvent en chaleur).

> [!formule]
> **η = P~utile~ / P~absorbée~**   (sans unité, toujours < 1, souvent en %)

Exemple : une alimentation absorbe 500 W et fournit 450 W aux composants : η = 450 / 500 = 0,9 = **90 %**. Les 50 W perdus chauffent le boîtier.

## La plaque signalétique

Elle indique les valeurs ==nominales== de l'appareil : tension (230 V ~), fréquence (50 Hz), puissance (W), parfois l'intensité. Ces valeurs permettent de choisir la protection et de calculer la consommation.

> [!astuce] Réduire la consommation
> Éteindre plutôt que laisser en veille, choisir des appareils bien classés sur l'étiquette énergie, régler l'ordinateur en mode économie d'énergie.

> [!retenir]
> P = U × I · E = P × t · 1 kWh = 3,6 MJ · η = P~utile~ / P~absorbée~ < 1.

=== CARTES ===
Q: Formule de la puissance électrique ?
R: **P = U × I** (W = V × A).

Q: Puissance dissipée par une résistance ?
R: P = R × I² (ou U² / R) : c'est l'**effet Joule**.

Q: Formule de l'énergie électrique ?
R: **E = P × t**

Q: 1 kWh = combien de joules ?
R: **3,6 × 10^6^ J** (3,6 MJ).

Q: Qu'est-ce que l'effet Joule ?
R: L'**échauffement** d'un conducteur traversé par un courant.

Q: Formule du rendement ?
R: η = P~utile~ / P~absorbée~ (toujours inférieur à 1).

Q: Intensité absorbée par un appareil de 1 150 W sur 230 V ?
R: I = 1 150 / 230 = **5 A**.

=== QUIZ ===
? Un appareil de 60 W fonctionne pendant 10 h. Énergie consommée ?
- 6 Wh
+ 0,6 kWh
- 6 kWh
! E = 60 W × 10 h = 600 Wh = 0,6 kWh.

? Une résistance de 100 Ω est traversée par 0,2 A. Puissance dissipée ?
- 20 W
+ 4 W
- 0,4 W
! P = R × I² = 100 × 0,04 = 4 W.

? Un moteur absorbe 800 W et fournit 600 W. Son rendement est de…
- 133 %
+ 75 %
- 25 %
! η = 600 / 800 = 0,75 = 75 %.

? Quelle unité trouve-t-on sur une facture d'électricité ?
- Le watt
+ Le kilowattheure
- Le volt
! La facture compte l'énergie consommée, en kWh.

? Lequel de ces appareils utilise l'effet Joule de façon utile ?
+ Un fer à souder
- Un haut-parleur
- Une LED
! Le fer à souder chauffe grâce à l'effet Joule.
