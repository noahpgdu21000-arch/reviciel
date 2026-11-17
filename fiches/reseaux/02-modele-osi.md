---
id: res-osi
matiere: reseaux
titre: Le modèle OSI et le modèle TCP/IP
chapitre: Réseaux — Fondamentaux
resume: Les 7 couches OSI, les 4 couches TCP/IP, l'encapsulation, et quel équipement ou protocole travaille à quelle couche.
mots-cles: OSI, TCP/IP, couches, physique, liaison, réseau, transport, application, encapsulation, trame, paquet, segment, PDU
ordre: 2
---

## Pourquoi un modèle en couches ?

Pour communiquer, deux machines doivent respecter les mêmes règles (==protocoles==). Le modèle ==OSI== découpe la communication en **7 couches** : chacune a un rôle précis et rend service à la couche du dessus. Cela permet de comprendre un réseau et de **dépanner méthodiquement**.

## Les 7 couches du modèle OSI

| N° | Couche | Rôle | Unité (PDU) | Exemples |
|---|---|---|---|---|
| 7 | ==Application== | services pour l'utilisateur | données | HTTP, DNS, DHCP, SSH, SMTP |
| 6 | Présentation | format, codage, chiffrement | données | TLS, JPEG, UTF-8 |
| 5 | Session | ouvrir et gérer le dialogue | données | sessions, RPC |
| 4 | ==Transport== | acheminement de bout en bout, **ports** | ==segment== (TCP) / datagramme (UDP) | TCP, UDP |
| 3 | ==Réseau== | adressage **IP** et routage | ==paquet== | IP, ICMP · **routeur** |
| 2 | ==Liaison de données== | transmission sur le lien local, adresses **MAC** | ==trame== | Ethernet, Wi-Fi · **switch** |
| 1 | ==Physique== | signaux électriques, lumineux ou radio | ==bit== | câbles, fibre, ondes · **hub** |

> [!astuce] Retenir l'ordre des couches (de 1 à 7)
> « **P**our **L**e **R**éseau **T**out **S**e **P**asse **A**utomatiquement » → Physique, Liaison, Réseau, Transport, Session, Présentation, Application.

## Le modèle TCP/IP (celui d'Internet)

| Modèle TCP/IP | Correspond aux couches OSI |
|---|---|
| Application | 5, 6, 7 |
| Transport | 4 |
| Internet | 3 |
| Accès réseau | 1, 2 |

## L'encapsulation

À l'**émission**, chaque couche ajoute son ==en-tête== (et parfois une fin) aux données reçues de la couche du dessus : données → segment (+ en-tête TCP avec les **ports**) → paquet (+ en-tête IP avec les **adresses IP**) → trame (+ en-tête Ethernet avec les **adresses MAC**) → bits sur le câble.

À la **réception**, c'est la ==désencapsulation== : chaque couche lit et retire son en-tête.

> [!exemple] Quand tu ouvres un site web
> Le navigateur (couche 7) envoie une requête HTTP → TCP la découpe en segments vers le port 443 (couche 4) → IP ajoute l'adresse du serveur (couche 3) → Ethernet ajoute l'adresse MAC de la box (couche 2) → la carte réseau envoie les bits (couche 1).

## Qui travaille où ?

- Couche 1 : câbles, connecteurs, hub, répéteur.
- Couche 2 : ==switch==, point d'accès, carte réseau, adresses MAC.
- Couche 3 : ==routeur==, adresses IP.
- Couche 4 : ports TCP/UDP, pare-feu (filtrage par ports).
- Couche 7 : navigateur, serveur web, proxy.

> [!retenir]
> 1 Physique (bits) · 2 Liaison (trames, MAC, switch) · 3 Réseau (paquets, IP, routeur) · 4 Transport (segments, ports, TCP/UDP) · 5-6-7 Session, Présentation, Application.

=== CARTES ===
Q: Combien de couches dans le modèle OSI ?
R: **7** couches.

Q: Phrase pour retenir les couches OSI de 1 à 7 ?
R: « **P**our **L**e **R**éseau **T**out **S**e **P**asse **A**utomatiquement » (Physique, Liaison, Réseau, Transport, Session, Présentation, Application).

Q: À quelle couche travaille un switch ?
R: Couche **2** (liaison de données), avec les adresses MAC.

Q: À quelle couche travaille un routeur ?
R: Couche **3** (réseau), avec les adresses IP.

Q: Comment s'appelle l'unité de données de la couche 2 ?
R: La **trame**.

Q: Comment s'appelle l'unité de données de la couche 3 ?
R: Le **paquet**.

Q: À quelle couche se trouvent les ports et TCP/UDP ?
R: Couche **4** (transport).

Q: Qu'est-ce que l'encapsulation ?
R: L'ajout d'un **en-tête** par chaque couche aux données de la couche du dessus, lors de l'émission.

Q: Combien de couches dans le modèle TCP/IP ?
R: **4** : accès réseau, Internet, transport, application.

=== QUIZ ===
? Quelle couche OSI gère l'adressage IP ?
- Couche 2
+ Couche 3
- Couche 4
! La couche réseau (3) gère les adresses IP et le routage.

? Le protocole HTTP appartient à la couche…
- transport
- réseau
+ application
! HTTP est un protocole de la couche application (7).

? Dans quel ordre se fait l'encapsulation à l'émission ?
+ Données → segment → paquet → trame → bits
- Bits → trame → paquet → segment → données
- Trame → paquet → segment → bits
! On descend les couches de 7 à 1 en ajoutant des en-têtes.

? Quel équipement fonctionne uniquement à la couche 1 ?
+ Le hub
- Le switch
- Le routeur
! Le hub se contente de répéter les signaux électriques.

? Dans le modèle TCP/IP, la couche « Internet » correspond à la couche OSI…
- 2
+ 3
- 4
! Couche Internet TCP/IP = couche Réseau OSI (IP).
