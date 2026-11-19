---
id: pc-ondes
matiere: physique-chimie
titre: Ondes sonores et électromagnétiques
chapitre: Signaux — Ondes
resume: Son, ultrasons, décibels, spectre électromagnétique, Wi-Fi et fibre optique : les ondes qui transportent l'information.
mots-cles: onde, son, ultrason, infrason, décibel, vitesse du son, onde électromagnétique, spectre, longueur d'onde, Wi-Fi, fibre optique, lumière visible
ordre: 3
---

## Qu'est-ce qu'une onde ?

Une ==onde== est la propagation d'une perturbation qui ==transporte de l'énergie sans transporter de matière== (comme une « ola » dans un stade).

## Les ondes sonores

- Le son est une onde ==mécanique== : il a **besoin d'un milieu** matériel (air, eau, solide) et **ne se propage pas dans le vide**.
- Vitesse du son : environ ==340 m/s dans l'air==, environ 1 500 m/s dans l'eau, plus de 5 000 m/s dans l'acier.

| Domaine | Fréquence | Exemples |
|---|---|---|
| Infrasons | moins de 20 Hz | séismes, éléphants |
| Sons audibles | de 20 Hz à 20 kHz | voix, musique |
| Ultrasons | plus de 20 kHz | échographie, sonar, capteur de distance HC-SR04 (40 kHz) |

- Le ==niveau sonore== se mesure en **décibels**, dB(A), avec un sonomètre. L'échelle n'est pas proportionnelle : **+3 dB = intensité sonore doublée**.
- L'exposition prolongée à partir de **80 dB(A)** est dangereuse pour l'audition (voir la fiche PSE).

> [!exemple] Mesurer une distance avec des ultrasons
> Le capteur envoie une salve et mesure la durée t de l'aller-retour de l'écho : **d = v × t / 2**. Si t = 2 ms dans l'air : d = 340 × 0,002 / 2 = **0,34 m**.

## Les ondes électromagnétiques

- Elles se propagent **aussi dans le vide**, à la vitesse de la lumière : ==c = 3,00 × 10^8^ m/s==.

> [!formule] Longueur d'onde
> **λ = c / f**   (λ en m, c en m/s, f en Hz)

Le ==spectre électromagnétique==, des grandes aux petites longueurs d'onde :

| Ondes | Exemples d'utilisation |
|---|---|
| Ondes radio | radio FM (≈ 100 MHz), TNT |
| Micro-ondes | ==Wi-Fi (2,4 GHz et 5 GHz)==, Bluetooth, téléphonie 4G/5G, four à micro-ondes |
| Infrarouges | télécommande, caméra thermique, chaleur |
| Lumière visible | de **400 nm (violet) à 800 nm (rouge)** |
| Ultraviolets | soleil (bronzage, coups de soleil), stérilisation |
| Rayons X et gamma | radiographie, radiothérapie (dangereux) |

> [!exemple] Le Wi-Fi à 2,4 GHz
> λ = 3 × 10^8^ / 2,4 × 10^9^ = **0,125 m**, soit 12,5 cm.

## La fibre optique

La lumière est guidée dans le cœur en verre par ==réflexion totale== sur la gaine. Avantages : **très haut débit**, longues distances, ==insensible aux perturbations électromagnétiques==. C'est le support d'Internet très haut débit (FTTH) et des liaisons entre bâtiments.

> [!retenir]
> Son : onde mécanique, besoin d'un milieu, ≈ 340 m/s dans l'air, audible de 20 Hz à 20 kHz. Ondes électromagnétiques : se propagent dans le vide à 3 × 10^8^ m/s, λ = c/f, du radio aux rayons gamma.

=== EXERCICES ===
# calcul : Ondes
? Longueur d'onde du Wi-Fi à 5 GHz (en cm), avec c = 3 × 10^8^ m/s ?
= 6 cm
! λ = 3 × 10^8^ / 5 × 10^9^ = 0,06 m = 6 cm.
? Un écho revient après 0,02 s dans l'air (340 m/s). Distance de l'obstacle (en m) ?
= 3,4 m
! d = 340 × 0,02 / 2 = 3,4 m.
? Longueur d'onde d'une radio FM à 100 MHz (en m) ?
= 3 m

# classer : Classe ces sons
Infrasons (moins de 20 Hz) : 5 Hz, 15 Hz
Sons audibles : 440 Hz, 2 000 Hz, 15 000 Hz
Ultrasons (plus de 20 kHz) : 40 kHz, 50 000 Hz

=== CARTES ===
Q: Le son peut-il se propager dans le vide ?
R: **Non** : c'est une onde mécanique, il lui faut un milieu matériel.

Q: Vitesse du son dans l'air ?
R: Environ **340 m/s**.

Q: Domaine des sons audibles par l'être humain ?
R: De **20 Hz à 20 kHz**.

Q: Qu'est-ce qu'un ultrason ?
R: Un son de fréquence **supérieure à 20 kHz** (inaudible pour nous).

Q: Vitesse des ondes électromagnétiques dans le vide ?
R: c = **3,00 × 10^8^ m/s**.

Q: Formule de la longueur d'onde ?
R: **λ = c / f**

Q: Domaine de longueurs d'onde de la lumière visible ?
R: De **400 nm** (violet) à **800 nm** (rouge).

Q: Dans quelle famille d'ondes se trouve le Wi-Fi ?
R: Les **micro-ondes** (2,4 GHz et 5 GHz).

Q: Comment la lumière est-elle guidée dans une fibre optique ?
R: Par **réflexion totale** à la limite entre le cœur et la gaine.

=== QUIZ ===
? Lequel de ces signaux peut traverser le vide spatial ?
- Le son d'une explosion
+ La lumière du Soleil
- Un ultrason
! Les ondes électromagnétiques (dont la lumière) se propagent dans le vide, pas les ondes sonores.

? Longueur d'onde d'une onde de 100 MHz (radio FM) ?
- 30 cm
+ 3 m
- 300 m
! λ = 3 × 10^8^ / 10^8^ = 3 m.

? Un capteur à ultrasons mesure un aller-retour de 10 ms dans l'air. Distance de l'obstacle ?
- 3,4 m
+ 1,7 m
- 34 m
! d = 340 × 0,010 / 2 = 1,7 m.

? Quel est l'avantage principal de la fibre optique face au cuivre ?
+ Elle est insensible aux perturbations électromagnétiques et offre un très haut débit
- Elle est plus facile à souder
- Elle transporte du courant électrique
! La fibre transporte de la lumière : pas de perturbation électromagnétique, débit très élevé.

? Quel rayonnement a la plus petite longueur d'onde ?
- Les ondes radio
- L'infrarouge
+ Les rayons gamma
! Du plus grand au plus petit : radio, micro-ondes, infrarouge, visible, UV, X, gamma.
