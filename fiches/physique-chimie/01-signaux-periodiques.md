---
id: pc-signaux
matiere: physique-chimie
titre: Signaux périodiques et tension alternative
chapitre: Électricité
resume: Période, fréquence, valeur maximale et valeur efficace ; lire un oscillogramme ; le secteur 230 V – 50 Hz.
mots-cles: signal périodique, période, fréquence, hertz, tension alternative, sinusoïdale, valeur maximale, valeur efficace, oscilloscope, base de temps, sensibilité, secteur
ordre: 1
---

## Signal périodique

Un signal est ==périodique== s'il se répète identique à lui-même à intervalles de temps réguliers.

> [!formule]
> Période **T** (en secondes, s) = durée d'un motif
> Fréquence **f** (en hertz, Hz) = nombre de motifs par seconde
> **f = 1 / T**   et   **T = 1 / f**

Exemples : signal carré d'une horloge numérique, signal triangulaire, tension sinusoïdale du secteur.

## Tension alternative sinusoïdale

- Une tension ==continue== garde la même valeur (pile, batterie, alimentation de PC).
- Une tension ==alternative== change de signe : elle est tantôt positive, tantôt négative.
- Une tension ==sinusoïdale== a la forme d'une courbe sinus.

| Grandeur | Notation | Définition |
|---|---|---|
| Valeur maximale (amplitude) | U~max~ | plus haute valeur atteinte |
| Valeur crête à crête | U~cc~ | U~cc~ = 2 × U~max~ |
| Valeur moyenne | U~moy~ | 0 V pour une sinusoïde |
| ==Valeur efficace== | U~eff~ | U~eff~ = U~max~ / √2 ≈ 0,707 × U~max~ |

> [!definition] Valeur efficace
> La valeur efficace d'une tension alternative est la valeur de la tension continue qui produirait le **même effet thermique** dans une résistance. C'est elle qu'affiche le multimètre en position alternatif (AC, symbole ~).

~~~schema
signal-periodique
On lit Umax sur l'axe vertical et la période T entre deux maximums successifs.
~~~

## Le secteur électrique

En France, le secteur fournit une tension sinusoïdale de ==230 V efficaces== à ==50 Hz== :

- T = 1 / 50 = 0,02 s = **20 ms** ;
- U~max~ = 230 × √2 ≈ **325 V**.

## Lire un oscillogramme

L'oscilloscope affiche la tension en fonction du temps sur un écran quadrillé en **divisions** (div).

- ==Sensibilité verticale== (en V/div) → U~max~ = nombre de divisions × sensibilité.
- ==Base de temps== (en ms/div ou µs/div) → T = nombre de divisions d'un motif × base de temps.

> [!exemple]
> Un motif occupe **4 div** avec une base de temps de **5 ms/div** → T = 4 × 5 = 20 ms → f = 1 / 0,020 = **50 Hz**.
> Le sommet est à **3 div** du milieu avec **2 V/div** → U~max~ = 6 V → U~eff~ = 6 / √2 ≈ **4,24 V**.

> [!attention] Unités
> Convertis la période en **secondes** avant de calculer f : 20 ms = 0,020 s. Et 1 kHz = 1 000 Hz, 1 MHz = 10^6^ Hz.

> [!retenir]
> f = 1/T · U~eff~ = U~max~/√2 · secteur : 230 V, 50 Hz, T = 20 ms, U~max~ ≈ 325 V · le multimètre (AC) mesure la valeur efficace.

=== EXERCICES ===
# calcul : Signaux périodiques
? Période de 20 ms : fréquence (en Hz) ?
= 50 Hz
! f = 1/T = 1/0,020 = 50 Hz.
? Fréquence de 1 000 Hz : période (en ms) ?
= 1 ms
? U~max~ = 12 V. Valeur efficace (en V) ?
= 8,49 V ± 0,02
! 12 / √2 ≈ 8,49 V.
? Oscilloscope : un motif fait 4 divisions avec une base de temps de 5 ms/div. Période (en ms) ?
= 20 ms
? Le sommet est à 3 divisions avec une sensibilité de 2 V/div. U~max~ (en V) ?
= 6 V

# paires : Associe chaque grandeur à son unité
- Période = seconde (s)
- Fréquence = hertz (Hz)
- Tension = volt (V)
- Base de temps = ms/div
- Sensibilité verticale = V/div

=== CARTES ===
Q: Relation entre fréquence et période ?
R: **f = 1 / T** (f en Hz, T en s).

Q: Unité de la fréquence ?
R: Le **hertz** (Hz) : nombre de motifs par seconde.

Q: Formule de la valeur efficace d'une tension sinusoïdale ?
R: U~eff~ = U~max~ / √2 (≈ 0,707 × U~max~).

Q: Caractéristiques du secteur en France ?
R: **230 V** efficaces, **50 Hz**.

Q: Période du secteur à 50 Hz ?
R: T = 1/50 = **20 ms**.

Q: Valeur maximale de la tension du secteur ?
R: U~max~ = 230 × √2 ≈ **325 V**.

Q: Que mesure un multimètre en position AC (~) ?
R: La **valeur efficace** de la tension (ou de l'intensité).

Q: À quoi sert la base de temps d'un oscilloscope ?
R: À mesurer les **durées** (période) : T = nombre de divisions × base de temps.

=== QUIZ ===
? Un signal a une période de 2 ms. Sa fréquence est…
- 2 Hz
+ 500 Hz
- 2 000 Hz
! f = 1 / 0,002 = 500 Hz.

? U~max~ = 10 V. Quelle est la valeur efficace ?
- 14,1 V
+ 7,07 V
- 5 V
! U~eff~ = 10 / √2 ≈ 7,07 V.

? Sur un oscillogramme, un motif fait 5 div avec une base de temps de 0,2 ms/div. Fréquence ?
+ 1 000 Hz
- 100 Hz
- 5 000 Hz
! T = 5 × 0,2 = 1 ms = 0,001 s, donc f = 1 000 Hz.

? Quelle est la valeur moyenne d'une tension sinusoïdale ?
+ 0 V
- U~max~
- U~eff~
! Les alternances positive et négative se compensent : la moyenne est nulle.

? La tension de 230 V du secteur est une valeur…
- maximale
+ efficace
- crête à crête
! 230 V est la valeur efficace ; la valeur maximale est d'environ 325 V.
