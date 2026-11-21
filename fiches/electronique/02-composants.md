---
id: elec-composants
matiere: electronique
titre: Les composants électroniques
chapitre: Électronique — Composants
resume: Résistance, condensateur, bobine, diode, LED, Zener, transistor, MOSFET, régulateur, relais, capteurs et actionneurs.
mots-cles: composants, résistance, pull-up, condensateur, constante de temps, bobine, diode, LED, résistance de protection, Zener, transistor, NPN, MOSFET, régulateur, 7805, relais, diode de roue libre, capteur, actionneur, LDR, CTN
ordre: 2
---

## Les composants passifs

- ==Résistance== : limite le courant, crée des chutes de tension (pont diviseur). Une résistance de **tirage** (pull-up ou pull-down, souvent 10 kΩ) fixe l'état d'une entrée quand le bouton est relâché.
- ==Condensateur== : stocke des charges électriques. Capacité en **farads** (µF, nF, pF).
  - **Électrolytique** : ==polarisé== (+ et −) ; inversé, il peut gonfler ou exploser.
  - **Céramique** : non polarisé ; un 100 nF près de chaque circuit intégré sert au **découplage** (filtrer les parasites).
  - Charge à travers une résistance : ==τ = R × C== (constante de temps) ; chargé à 63 % après τ, quasi complètement après **5τ**. Exemple : 10 kΩ et 100 µF → τ = 1 s.
- ==Bobine== (inductance, en henrys H) : s'oppose aux variations de courant ; utilisée dans les filtres et les alimentations à découpage. À la coupure, une bobine (relais, moteur) crée une **surtension**.

## Les diodes

- La ==diode== laisse passer le courant **dans un seul sens** : de l'**anode** vers la **cathode** (repérée par un **anneau**). Tension de seuil ≈ **0,6 à 0,7 V** (silicium).
- Usages : **redressement** (pont de diodes : alternatif → continu), protection contre l'inversion de polarité, ==diode de roue libre== en parallèle sur une bobine (relais, moteur) pour absorber la surtension.
- ==Diode Zener== : branchée en inverse, elle maintient une tension **constante** (régulation simple, protection).

## La LED

- Diode qui émet de la lumière. ==Anode (+) = patte la plus longue==.
- Tension directe ≈ **1,8 à 2,2 V** (rouge, jaune, vert) et ≈ **3 V** (bleu, blanc) ; courant ≈ **10 à 20 mA**.
- Toujours une **résistance de protection** en série :

> [!formule]
> **R = (U~alim~ − U~LED~) / I~LED~**
> Exemple : LED rouge (2 V, 15 mA) sur 5 V → R = (5 − 2) / 0,015 = 200 Ω → on prend la valeur normalisée au-dessus : **220 Ω**.

~~~schema
led-resistance
La LED se branche dans le sens passant, toujours avec une résistance en série pour limiter le courant.
~~~

## Les transistors : des interrupteurs commandés

| Transistor | Broches | Commande |
|---|---|---|
| ==Bipolaire NPN== (ex. 2N2222, BC547) | **B**ase, **C**ollecteur, **É**metteur | un petit courant de base commande un grand courant collecteur (I~C~ = β × I~B~) |
| ==MOSFET== canal N (ex. IRLZ44N) | **G**rille, **D**rain, **S**ource | commandé en **tension** sur la grille, très faible consommation |

En **commutation**, le transistor est soit **bloqué** (interrupteur ouvert), soit **saturé** (interrupteur fermé). Il permet à un microcontrôleur (quelques mA) de piloter un moteur, un ruban LED ou un relais.

## Les autres composants utiles

- ==Régulateur de tension== : fournit une tension fixe et stable. **7805** → 5 V ; **AMS1117-3.3** → 3,3 V (régulateur LDO, faible chute de tension).
- ==Relais== : interrupteur actionné par une bobine. Il **isole** le circuit de commande (5 V) du circuit de puissance (par exemple une lampe 230 V). Toujours avec une diode de roue libre.
- **Potentiomètre** : résistance variable (réglage, consigne).

## Capteurs et actionneurs

| Capteurs (mesurent) | Actionneurs (agissent) |
|---|---|
| ==LDR== (photorésistance) : R **diminue** quand la lumière augmente | moteur à courant continu |
| ==CTN== (thermistance) : R **diminue** quand la température augmente | ==servomoteur== (position angulaire, commandé en PWM) |
| DHT22 : température et humidité (numérique) | moteur pas à pas |
| HC-SR04 : distance par ultrasons | buzzer, LED, relais |
| PIR : détection de mouvement | écran LCD, OLED |

> [!retenir]
> Électrolytique = polarisé · τ = RC · diode : anode → cathode (anneau), seuil 0,6-0,7 V · LED : R = (U~alim~ − U~LED~) / I · transistor = interrupteur commandé · relais + diode de roue libre.

=== EXERCICES ===
# calcul : Résistance de protection et constante de temps
? LED rouge (2 V, 20 mA) alimentée en 5 V. R (en Ω) ?
= 150 Ω
? LED bleue (3 V, 10 mA) alimentée en 5 V. R (en Ω) ?
= 200 Ω
? R = 10 kΩ et C = 47 µF. Constante de temps τ (en s) ?
= 0,47 s

# classer : Capteur ou actionneur ?
Capteur : LDR, thermistance CTN, capteur à ultrasons HC-SR04, détecteur de mouvement PIR
Actionneur : servomoteur, moteur à courant continu, buzzer, relais

=== CARTES ===
Q: Dans quel sens passe le courant dans une diode ?
R: De l'**anode** vers la **cathode** (repérée par un anneau).

Q: Tension de seuil d'une diode silicium ?
R: Environ **0,6 à 0,7 V**.

Q: Comment repère-t-on l'anode d'une LED ?
R: C'est la **patte la plus longue** (+).

Q: Formule de la résistance de protection d'une LED ?
R: R = (U~alim~ − U~LED~) / I~LED~

Q: Qu'est-ce qu'un condensateur polarisé ?
R: Un condensateur (électrolytique) qui a un **+ et un −** à respecter.

Q: Formule de la constante de temps d'un circuit RC ?
R: **τ = R × C** (charge quasi complète après 5τ).

Q: Rôle d'une diode de roue libre ?
R: Absorber la **surtension** créée par une bobine (relais, moteur) à la coupure.

Q: Les 3 broches d'un transistor bipolaire ?
R: **Base**, **collecteur**, **émetteur**.

Q: Les 3 broches d'un MOSFET ?
R: **Grille**, **drain**, **source**.

Q: Rôle d'un relais ?
R: Commander un circuit de **puissance** avec un petit signal, en **isolant** les deux circuits.

Q: Comment varie la résistance d'une LDR à la lumière ?
R: Elle **diminue** quand la lumière augmente.

Q: Quel régulateur donne 5 V ?
R: Le **7805** (LM7805).

=== QUIZ ===
? Résistance de protection pour une LED blanche (3 V, 20 mA) alimentée en 5 V ?
- 250 Ω
+ 100 Ω
- 400 Ω
! R = (5 − 3) / 0,020 = 100 Ω.

? Quel composant permet à un Arduino de commander une lampe 230 V ?
- Une LED
+ Un relais (module relais)
- Un condensateur céramique
! Le relais isole la commande 5 V du circuit 230 V.

? Un condensateur électrolytique a été monté à l'envers. Risque ?
+ Il peut gonfler ou exploser
- Aucun
- Il se transforme en résistance
! Un électrolytique est polarisé : il faut respecter le + et le −.

? Constante de temps avec R = 1 kΩ et C = 1 000 µF ?
- 1 ms
+ 1 s
- 1 000 s
! τ = 1 000 × 0,001 = 1 s.

? Une thermistance CTN chauffe. Sa résistance…
- augmente
+ diminue
- ne change pas
! CTN = coefficient de température négatif.

? En commutation, un transistor saturé se comporte comme…
+ un interrupteur fermé
- un interrupteur ouvert
- un condensateur
! Saturé = passant ; bloqué = ouvert.
