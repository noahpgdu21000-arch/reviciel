---
id: res-ipv4
matiere: reseaux
titre: L'adressage IPv4
chapitre: Réseaux — Adressage
resume: Lire une adresse IP et son masque, trouver l'adresse réseau, le broadcast et le nombre d'hôtes.
mots-cles: IP, IPv4, masque, CIDR, sous-réseau, broadcast, passerelle, adresse privée, APIPA
ordre: 3
---

## Une adresse IPv4, c'est quoi ?

Une adresse IPv4 identifie une interface réseau (une carte réseau) sur un réseau IP. Elle est codée sur ==32 bits==, soit 4 octets écrits en décimal et séparés par des points : `192.168.1.10`.

- Chaque octet va de ==0 à 255== (8 bits, donc 2^8^ = 256 valeurs).
- L'adresse se compose d'une ==partie réseau== (le « nom de la rue ») et d'une ==partie hôte== (le « numéro de la maison »).
- C'est le ==masque de sous-réseau== qui indique où s'arrête la partie réseau.

## Le masque de sous-réseau

Le masque fait aussi 32 bits : des **1 pour la partie réseau**, puis des **0 pour la partie hôte**. En notation ==CIDR==, on écrit simplement le nombre de bits à 1 : `/24`.

| CIDR | Masque | Bits hôte | Hôtes utilisables |
|---|---|---|---|
| /8 | 255.0.0.0 | 24 | 16 777 214 |
| /16 | 255.255.0.0 | 16 | 65 534 |
| /24 | 255.255.255.0 | 8 | 254 |
| /25 | 255.255.255.128 | 7 | 126 |
| /26 | 255.255.255.192 | 6 | 62 |
| /27 | 255.255.255.224 | 5 | 30 |
| /28 | 255.255.255.240 | 4 | 14 |
| /29 | 255.255.255.248 | 3 | 6 |
| /30 | 255.255.255.252 | 2 | 2 |

> [!formule]
> Nombre d'hôtes = 2^n^ − 2   (n = nombre de bits hôte, à 0 dans le masque)

On retire 2 adresses : celle du **réseau** et celle de **broadcast**. Un octet de masque ne peut valoir que 0, 128, 192, 224, 240, 248, 252, 254 ou 255.

~~~schema
ipv4
Avec /24, les 3 premiers octets désignent le réseau, le dernier désigne la machine.
~~~

## Réseau, broadcast et plage d'hôtes

- ==Adresse réseau== : tous les bits hôte à 0. C'est le « nom » du réseau, on ne la donne à aucune machine. On l'obtient par un ==ET logique== entre l'IP et le masque.
- ==Adresse de diffusion (broadcast)== : tous les bits hôte à 1. Un message envoyé à cette adresse est reçu par toutes les machines du réseau.
- Les adresses entre les deux sont attribuables aux hôtes : PC, imprimantes, serveurs, interface du routeur…

### Méthode rapide : le « nombre magique »

1. Repère l'octet du masque qui n'est ni 255 ni 0 (l'octet « intéressant »).
2. Nombre magique = 256 − valeur de cet octet.
3. Les réseaux commencent aux multiples du nombre magique : l'adresse réseau est le multiple juste en dessous (ou égal).
4. Broadcast = début du réseau suivant − 1.

> [!exemple] Exemple : 192.168.10.37/27
> - /27 → masque 255.255.255.224 → octet intéressant : le 4e (224).
> - Nombre magique : 256 − 224 = 32 → réseaux en .0, .32, .64, .96…
> - 37 est entre 32 et 63 → **réseau 192.168.10.32** et **broadcast 192.168.10.63**.
> - Hôtes : de .33 à .62, soit 2^5^ − 2 = **30 hôtes**.

Tu peux t'entraîner à l'infini avec l'[exercice Adressage IPv4](#/entrainement/ipv4).

## Adresses particulières

| Adresse ou plage | Rôle |
|---|---|
| 10.0.0.0/8 | Privée (grands réseaux d'entreprise) |
| 172.16.0.0/12 | Privée (de 172.16.0.0 à 172.31.255.255) |
| 192.168.0.0/16 | Privée (box, petits réseaux) |
| 127.0.0.1 | Boucle locale (*localhost*) : la machine elle-même |
| 169.254.x.x | APIPA : adresse auto-attribuée quand aucun serveur DHCP ne répond |
| 255.255.255.255 | Diffusion sur le réseau local |

Les adresses ==privées== ne circulent pas sur Internet : le routeur (la box) fait de la ==NAT== pour sortir avec une adresse ==publique==.

## La passerelle par défaut

La ==passerelle par défaut== (*default gateway*) est l'adresse IP du ==routeur== dans le réseau local. La machine lui envoie tous les paquets destinés à un autre réseau (Internet par exemple). Elle doit appartenir au même réseau que la machine.

> [!attention] Erreurs fréquentes
> - Deux machines avec la même IP → conflit d'adresses.
> - Un masque différent sur deux PC du même réseau → communication perturbée.
> - Une passerelle qui n'est pas dans le réseau → pas d'accès à Internet.

> [!info] Les classes (historique)
> On entend encore parler de classes : A (1 à 126, /8), B (128 à 191, /16), C (192 à 223, /24). Aujourd'hui on utilise le ==CIDR== : le masque peut être n'importe quel /n.

=== EXERCICES ===
# calcul : Adressage IPv4
? Combien d'hôtes dans un réseau /26 ?
= 62
? Combien d'hôtes dans un réseau /29 ?
= 6
? 192.168.1.130/25 : dernier octet de l'adresse réseau ?
= 128
? 10.0.0.77/27 : dernier octet de l'adresse de broadcast ?
= 95
! Nombre magique 32 : 77 est dans le bloc de 64 à 95.

# trous : Complète
Le masque /24 s'écrit 255.255.255.[[0]] et le masque /27 s'écrit 255.255.255.[[224]]. Une adresse en 169.254.x.x est une adresse [[APIPA]] : le PC n'a pas obtenu d'adresse du serveur [[DHCP]].

# classer : Adresse privée ou publique ?
Privée : 192.168.1.10, 10.5.20.1, 172.20.0.5
Publique : 8.8.8.8, 80.12.1.5, 172.40.0.1

=== CARTES ===
Q: Sur combien de bits est codée une adresse IPv4 ?
R: Sur **32 bits**, soit 4 octets (ex. 192.168.1.10).

Q: Quel masque correspond à /24 ?
R: 255.255.255.0

Q: Quel masque correspond à /26 ?
R: 255.255.255.192 (26 bits à 1 = 8 + 8 + 8 + 2)

Q: Quel masque correspond à /27 ?
R: 255.255.255.224

Q: Comment obtient-on l'adresse réseau ?
R: Par un **ET logique** entre l'adresse IP et le masque (les bits hôte passent à 0).

Q: Qu'est-ce que l'adresse de broadcast ?
R: L'adresse avec **tous les bits hôte à 1** : un message envoyé à cette adresse est reçu par toutes les machines du réseau.

Q: Formule du nombre d'hôtes d'un réseau ?
R: 2^n^ − 2, avec n = nombre de bits hôte (bits à 0 dans le masque).

Q: Combien d'hôtes dans un réseau /24 ?
R: 2^8^ − 2 = **254** hôtes.

Q: Quelles sont les 3 plages d'adresses privées ?
R: 10.0.0.0/8 · 172.16.0.0/12 · 192.168.0.0/16

Q: Que signifie une adresse en 169.254.x.x ?
R: C'est une adresse **APIPA** : la machine n'a pas reçu d'adresse du serveur DHCP.

Q: Qu'est-ce que la passerelle par défaut ?
R: L'adresse IP du **routeur** dans le réseau local, utilisée pour joindre les autres réseaux (Internet).

Q: Réseau et broadcast de 192.168.10.37/27 ?
R: Réseau **192.168.10.32**, broadcast **192.168.10.63** (nombre magique 32).

=== QUIZ ===
? Combien d'hôtes peut-on adresser dans un réseau /28 ?
- 16
+ 14
- 28
- 30
! /28 → 4 bits hôte → 2^4^ − 2 = 14.

? Quelle est l'adresse réseau de 172.16.5.200/24 ?
- 172.16.0.0
+ 172.16.5.0
- 172.16.5.255
- 172.16.5.200
! Avec /24, les 3 premiers octets forment la partie réseau : on met le dernier octet à 0.

? Laquelle de ces adresses est privée ?
- 8.8.8.8
- 80.12.1.5
+ 192.168.4.20
- 193.51.24.1
! 192.168.0.0/16 fait partie des plages privées, comme 10.0.0.0/8 et 172.16.0.0/12.

? Quel est le broadcast du réseau 192.168.1.64/26 ?
- 192.168.1.255
+ 192.168.1.127
- 192.168.1.128
- 192.168.1.95
! /26 → nombre magique 64 → le réseau suivant commence en .128, donc le broadcast est .127.

? Un PC a l'adresse 169.254.12.3. Que peut-on en conclure ?
- Il est bien connecté à Internet
+ Il n'a pas obtenu d'adresse du serveur DHCP
- Il a une adresse publique
- C'est l'adresse du routeur
! Les adresses 169.254.x.x (APIPA) sont auto-attribuées quand aucun serveur DHCP ne répond.

? Le masque 255.255.255.240 correspond à :
- /24
- /26
+ /28
- /30
! 240 = 1111 0000 → 4 bits à 1 dans le dernier octet : 24 + 4 = 28.
