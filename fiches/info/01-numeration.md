---
id: info-numeration
matiere: info
titre: Numération : binaire, hexadécimal et logique
chapitre: Informatique — Codage de l'information
resume: Convertir entre décimal, binaire et hexadécimal, unités (Ko, Kio), code ASCII, et opérations logiques ET, OU, XOR sur les bits.
mots-cles: binaire, décimal, hexadécimal, bit, octet, quartet, conversion, poids, ASCII, Unicode, UTF-8, Ko, Kio, ET logique, OU, XOR, masque
ordre: 1
---

## Trois bases à connaître

| Base | Chiffres utilisés | Notation | Exemple |
|---|---|---|---|
| Décimal (10) | 0 à 9 | 173 | 173 |
| ==Binaire== (2) | 0 et 1 | `0b10101101` | 1010 1101 |
| ==Hexadécimal== (16) | 0 à 9 puis A=10, B=11, C=12, D=13, E=14, F=15 | `0xAD` ou ADh | AD |

- Un ==bit== vaut 0 ou 1. Un ==octet== = **8 bits** → 2^8^ = **256 valeurs** (de 0 à 255).
- Un **quartet** = 4 bits = **un chiffre hexadécimal**. Un octet s'écrit donc toujours avec **2 chiffres hexa**.

## Binaire ↔ décimal

Les poids des 8 bits d'un octet :

| 128 | 64 | 32 | 16 | 8 | 4 | 2 | 1 |
|---|---|---|---|---|---|---|---|
| 1 | 0 | 1 | 0 | 1 | 1 | 0 | 1 |

- **Binaire → décimal** : on additionne les poids des bits à 1 : 128 + 32 + 8 + 4 + 1 = **173**.
- **Décimal → binaire** : on retire les plus grands poids possibles : 173 − 128 = 45 ; 45 − 32 = 13 ; 13 − 8 = 5 ; 5 − 4 = 1 ; 1 − 1 = 0 → **1010 1101**. (Autre méthode : divisions successives par 2, en lisant les restes de bas en haut.)

## Binaire ↔ hexadécimal

On découpe en paquets de **4 bits** (en partant de la droite) : chaque paquet donne un chiffre hexa.

> [!exemple]
> 1010 1101 → 1010 = 10 = **A** et 1101 = 13 = **D** → **0xAD**. Et 0xAD = 10 × 16 + 13 = **173**.

Où trouve-t-on l'hexadécimal ? Adresses **MAC** (`3C:52:82:1A:F0:7B`), adresses **IPv6**, couleurs web (`#1D4ED8`), adresses mémoire.

## Les unités

| Préfixe décimal (SI) | Préfixe binaire |
|---|---|
| 1 ko = 1 000 octets | 1 Kio = 1 024 octets |
| 1 Mo = 10^6^ octets | 1 Mio = 1 024 Kio |
| 1 Go = 10^9^ octets | 1 Gio = 1 024 Mio |
| 1 To = 10^12^ octets | 1 Tio = 1 024 Gio |

> [!info] Pourquoi mon disque de 1 To n'affiche que 931 Go ?
> Le fabricant compte 10^12^ octets, Windows compte en Gio : 10^12^ / 2^30^ ≈ **931 Gio**. Rien n'a disparu !

## Le codage des caractères

- ==ASCII== : chaque caractère a un code (7 bits) : **A = 65** (0x41), a = 97 (0x61), 0 = 48 (0x30), espace = 32.
- **Unicode / UTF-8** : code tous les caractères du monde (accents, emojis) sur 1 à 4 octets. C'est le standard du web.

## Les opérations logiques bit à bit

| A | B | A ET B | A OU B | A XOR B |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 0 | 1 | 0 | 1 | 1 |
| 1 | 0 | 0 | 1 | 1 |
| 1 | 1 | 1 | 1 | 0 |

NON (NOT) inverse chaque bit : NON 1010 = 0101.

> [!exemple] Le ET logique du masque réseau
> IP : …37 = 0010 0101 ; masque : …224 = 1110 0000.
> 0010 0101 ET 1110 0000 = 0010 0000 = **32** → adresse réseau en .32.

> [!retenir]
> Octet = 8 bits = 0 à 255 = 2 chiffres hexa. Poids : 128 64 32 16 8 4 2 1. 1 chiffre hexa = 4 bits. ET logique IP/masque = adresse réseau.

Entraîne-toi avec l'[exercice de conversions](#/entrainement/conversions).

=== EXERCICES ===
# trous : Convertis
45 en binaire (8 bits) : [[00101101|101101]]
0xA7 en binaire : [[10100111]]
200 en hexadécimal : [[C8|0xC8]]

# calcul : Calcule en décimal
? 1100 1000 en décimal ?
= 200
? 0x2F en décimal ?
= 47
? Combien de valeurs peut prendre un nombre de 10 bits ?
= 1024
? Combien d'octets dans 2 Kio ?
= 2048

# classer : ET logique : quel est le résultat ?
Résultat 1 : 1 ET 1
Résultat 0 : 1 ET 0, 0 ET 1, 0 ET 0

=== CARTES ===
Q: Combien de bits dans un octet ?
R: **8 bits**.

Q: Combien de valeurs peut prendre un octet ?
R: **256** valeurs (de 0 à 255).

Q: Poids des 8 bits d'un octet ?
R: 128, 64, 32, 16, 8, 4, 2, 1.

Q: 1111 1111 en décimal ?
R: **255**

Q: 192 en binaire ?
R: **1100 0000** (128 + 64).

Q: Combien de bits représente un chiffre hexadécimal ?
R: **4 bits** (un quartet).

Q: 0xFF en décimal ?
R: **255** (15 × 16 + 15).

Q: Que vaut la lettre C en hexadécimal ?
R: **12** (A = 10, B = 11, C = 12, D = 13, E = 14, F = 15).

Q: Code ASCII de la lettre A majuscule ?
R: **65** (0x41).

Q: Différence entre ko et Kio ?
R: 1 **ko** = 1 000 octets ; 1 **Kio** = 1 024 octets.

Q: Résultat de 1 XOR 1 ?
R: **0** (XOR vaut 1 seulement si les bits sont différents).

=== QUIZ ===
? 1010 1010 en décimal vaut…
- 160
+ 170
- 85
! 128 + 32 + 8 + 2 = 170.

? 100 en hexadécimal s'écrit…
+ 0x64
- 0x100
- 0xA0
! 100 = 6 × 16 + 4, donc 0x64.

? 0x3F en binaire vaut…
- 0011 1110
+ 0011 1111
- 1111 0011
! 3 = 0011 et F = 1111.

? 1100 1100 ET 1010 1010 = ?
+ 1000 1000
- 1110 1110
- 0110 0110
! Le ET ne vaut 1 que si les deux bits sont à 1. (OU donnerait 1110 1110, XOR 0110 0110.)

? Combien d'octets dans 1 Kio ?
- 1 000
+ 1 024
- 8 192
! 1 Kio = 2^10^ = 1 024 octets.

? Combien de chiffres hexadécimaux faut-il pour écrire une adresse MAC de 48 bits ?
- 6
+ 12
- 48
! 48 bits / 4 bits par chiffre = 12 chiffres hexa (6 octets).
