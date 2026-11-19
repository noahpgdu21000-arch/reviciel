---
id: res-wifi-ipv6
matiere: reseaux
titre: Le Wi-Fi et l'IPv6
chapitre: Réseaux — Architecture
resume: Normes et bandes Wi-Fi, sécuriser un réseau sans fil, et lire ou abréger une adresse IPv6.
mots-cles: Wi-Fi, 802.11, Wi-Fi 6, 2,4 GHz, 5 GHz, SSID, WPA2, WPA3, WEP, WPS, point d'accès, canal, IPv6, 128 bits, abréviation, fe80, lien-local, SLAAC
ordre: 7
---

## Les normes Wi-Fi (IEEE 802.11)

| Nom commercial | Norme | Bandes |
|---|---|---|
| Wi-Fi 4 | 802.11n | 2,4 et 5 GHz |
| Wi-Fi 5 | 802.11ac | 5 GHz |
| ==Wi-Fi 6 / 6E== | 802.11ax | 2,4 et 5 GHz (+ 6 GHz pour le 6E) |
| Wi-Fi 7 | 802.11be | 2,4, 5 et 6 GHz |

## 2,4 GHz ou 5 GHz ?

| 2,4 GHz | 5 GHz (et 6 GHz) |
|---|---|
| ==meilleure portée==, traverse mieux les murs | ==débit plus élevé== |
| plus de perturbations (voisins, Bluetooth, micro-ondes) | moins encombré, plus de canaux |
| seulement 3 canaux qui ne se chevauchent pas : **1, 6, 11** | portée plus faible |

## Le vocabulaire

- ==SSID== : le nom du réseau Wi-Fi.
- ==Point d'accès (AP)== : relie les appareils sans fil au réseau filaire.
- **Mode infrastructure** : les appareils passent par un point d'accès (cas normal).
- **Canal** : sous-bande de fréquence utilisée ; on évite les canaux des voisins.

## Sécuriser un réseau Wi-Fi

| Protocole | Avis |
|---|---|
| WEP | ==obsolète==, cassé en quelques minutes : à bannir |
| WPA | obsolète |
| ==WPA2== (AES) | minimum acceptable |
| ==WPA3== | **recommandé** |

> [!retenir] Bonnes pratiques Wi-Fi
> - **WPA3** (ou WPA2-AES), avec une **phrase de passe longue** ;
> - changer le **mot de passe d'administration** de la box ou du point d'accès ;
> - **désactiver le WPS** (code PIN vulnérable) ;
> - créer un **réseau invité** séparé ;
> - mettre à jour le **firmware**.
> Le filtrage par adresse MAC ou le masquage du SSID ne sont **pas** de vraies protections (une MAC se falsifie facilement).

## L'IPv6

Les adresses IPv4 (32 bits, environ 4,3 milliards) sont épuisées. L'==IPv6== utilise ==128 bits== : 2^128^ ≈ 3,4 × 10^38^ adresses.

- Écriture : **8 groupes de 4 chiffres hexadécimaux** séparés par « : » → `2001:0db8:0000:0000:0000:ff00:0042:8329`.
- **Abréviation** : on supprime les zéros en tête de chaque groupe, et on remplace **une seule** suite de groupes à zéro par « :: ».

> [!exemple]
> 2001:0db8:0000:0000:0000:ff00:0042:8329 → **2001:db8::ff00:42:8329**

| Adresse | Rôle |
|---|---|
| `::1` | boucle locale (équivalent de 127.0.0.1) |
| `fe80::/10` | ==lien-local== : valable seulement sur le réseau local, créée automatiquement |
| `2000::/3` | adresses globales (publiques), routables sur Internet |
| `ff00::/8` | multicast (l'IPv6 n'a **pas de broadcast**) |

- Le préfixe réseau d'un réseau local est en général un **/64**.
- Une machine peut se configurer seule grâce à la ==SLAAC== (autoconfiguration), ou via DHCPv6.
- Avec autant d'adresses, la NAT n'est plus nécessaire.

> [!retenir]
> Wi-Fi : 2,4 GHz = portée, 5 GHz = débit ; WPA3 recommandé, WEP interdit, WPS désactivé. IPv6 = 128 bits, 8 groupes hexadécimaux, « :: » une seule fois, fe80:: = lien-local, ::1 = boucle locale.

=== EXERCICES ===
# classer : 2,4 GHz ou 5 GHz ?
2,4 GHz : meilleure portée ; traverse mieux les murs ; canaux 1, 6 et 11
5 GHz : débit plus élevé ; moins de perturbations ; portée plus faible

# trous : Abrège les adresses IPv6
2001:0db8:0000:0000:0000:0000:0000:0001 s'écrit [[2001:db8::1]].
fe80:0000:0000:0000:0000:0000:0000:0001 s'écrit [[fe80::1]].
L'adresse de boucle locale IPv6 s'écrit [[::1]].

=== CARTES ===
Q: Avantage de la bande 2,4 GHz ?
R: Une **meilleure portée** (traverse mieux les murs).

Q: Avantage de la bande 5 GHz ?
R: Un **débit plus élevé** et moins de perturbations.

Q: Quels canaux 2,4 GHz ne se chevauchent pas ?
R: Les canaux **1, 6 et 11**.

Q: Qu'est-ce que le SSID ?
R: Le **nom du réseau** Wi-Fi.

Q: Quel protocole de sécurité Wi-Fi est recommandé ?
R: **WPA3** (WPA2-AES au minimum).

Q: Pourquoi désactiver le WPS ?
R: Son **code PIN** est vulnérable aux attaques.

Q: Nom commercial de la norme 802.11ax ?
R: **Wi-Fi 6** (6E avec la bande 6 GHz).

Q: Taille d'une adresse IPv6 ?
R: **128 bits** (8 groupes de 16 bits).

Q: Adresse de boucle locale en IPv6 ?
R: **::1**

Q: Préfixe des adresses IPv6 lien-local ?
R: **fe80::/10**

Q: Règle d'abréviation « :: » en IPv6 ?
R: On remplace **une seule** suite de groupes de zéros par « :: ».

=== QUIZ ===
? Quel protocole Wi-Fi ne faut-il plus jamais utiliser ?
+ WEP
- WPA2
- WPA3
! Le WEP se casse en quelques minutes.

? Abréviation correcte de 2001:0db8:0000:0000:0000:0000:0000:0001 ?
- 2001:db8:0:1
+ 2001:db8::1
- 2001::db8::1
! On supprime les zéros en tête et une seule suite de groupes nuls devient « :: ».

? Un appareil doit capter le Wi-Fi au fond du jardin. Quelle bande privilégier ?
+ 2,4 GHz
- 5 GHz
- 6 GHz
! La bande 2,4 GHz porte plus loin.

? Combien de bits dans une adresse IPv6 ?
- 32
- 64
+ 128
! 128 bits, contre 32 en IPv4.

? Le filtrage par adresse MAC suffit-il à sécuriser un Wi-Fi ?
- Oui, c'est la meilleure protection
+ Non, une adresse MAC se falsifie facilement
- Oui, si le SSID est caché
! Seul un chiffrement WPA2/WPA3 avec une phrase de passe forte protège vraiment.
