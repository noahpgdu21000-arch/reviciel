---
id: res-bases
matiere: reseaux
titre: Les bases des réseaux
chapitre: Réseaux — Fondamentaux
resume: Types de réseaux, topologies, équipements (switch, routeur, point d'accès), adresse MAC, câbles RJ45 et fibre, débits.
mots-cles: réseau, LAN, WAN, topologie, étoile, switch, routeur, point d'accès, hub, adresse MAC, RJ45, catégorie, T568B, fibre optique, débit, bit, octet
ordre: 1
---

## Qu'est-ce qu'un réseau ?

Un ==réseau informatique== est un ensemble d'équipements reliés entre eux pour **échanger des données** et **partager des ressources** (Internet, imprimante, fichiers).

| Type | Étendue | Exemple |
|---|---|---|
| ==PAN== | personnel, quelques mètres | Bluetooth entre téléphone et écouteurs |
| ==LAN== | local : une maison, un bâtiment | réseau du lycée |
| WLAN | LAN sans fil | Wi-Fi |
| MAN | une ville | réseau d'une agglomération |
| ==WAN== | étendu : pays, monde | Internet |

## Les topologies

- ==Étoile== : tous les postes sont reliés à un équipement central (switch). La plus utilisée : une panne de câble ne touche qu'un poste.
- **Bus** : tous sur un même câble (ancien).
- **Anneau** : chaque poste relié au suivant.
- **Maillée** : nombreuses liaisons redondantes (cœur d'Internet) : très fiable.

## Les équipements

| Équipement | Rôle | Couche OSI |
|---|---|---|
| Carte réseau (NIC) | relie la machine au réseau ; possède l'adresse MAC | 1-2 |
| Hub (concentrateur) | répète le signal à **tous** les ports (obsolète) | 1 |
| ==Switch== (commutateur) | relie les machines d'un LAN ; envoie chaque trame **uniquement** au bon port grâce aux adresses MAC | 2 |
| ==Routeur== | relie des **réseaux différents** et choisit le chemin grâce aux adresses IP | 3 |
| Point d'accès (AP) | connecte les appareils Wi-Fi au réseau filaire | 2 |
| Box Internet | routeur + switch + point d'accès Wi-Fi + modem + pare-feu | — |
| Pare-feu (firewall) | filtre le trafic selon des règles | 3-4 (et plus) |

## L'adresse MAC

L'==adresse MAC== (adresse physique) identifie une carte réseau. Elle fait **48 bits** (6 octets), écrite en hexadécimal : `00:1A:2B:3C:4D:5E`. Les 3 premiers octets identifient le **fabricant** (OUI).

## Les supports de transmission

- ==Paire torsadée== avec connecteurs ==RJ45== : **100 m maximum** par liaison. Catégorie **5e** et **6** : 1 Gbit/s ; **6a** : 10 Gbit/s sur 100 m. Versions blindées (FTP, S/FTP) contre les perturbations.
- ==Fibre optique== : très haut débit, longues distances, insensible aux perturbations électromagnétiques. **Monomode** (laser, très longues distances) ou **multimode** (courtes distances).
- **Sans fil** : Wi-Fi, Bluetooth, 4G/5G.

> [!info] Norme de câblage T568B (la plus utilisée)
> 1 blanc-orange · 2 orange · 3 blanc-vert · 4 bleu · 5 blanc-bleu · 6 vert · 7 blanc-marron · 8 marron.
> La T568A inverse les paires orange et verte. Câble **droit** : même norme aux deux bouts. Câble **croisé** : A d'un côté, B de l'autre (presque plus utile grâce à l'Auto MDI-X).

## Débits et unités

- Le débit se mesure en ==bits par seconde== (bit/s, Mbit/s, Gbit/s).
- ==1 octet = 8 bits== : 100 Mbit/s = 12,5 Mo/s.

> [!formule] Durée de transfert
> t = taille du fichier (en bits) / débit (en bit/s)
> Exemple : 500 Mo sur une liaison à 100 Mbit/s → 500 × 8 = 4 000 Mbit → t = 4 000 / 100 = **40 s** (en théorie).

> [!retenir]
> Switch = niveau 2, adresses **MAC**, dans un même réseau. Routeur = niveau 3, adresses **IP**, entre réseaux. RJ45 : 100 m max. 1 octet = 8 bits.

=== CARTES ===
Q: Qu'est-ce qu'un LAN ?
R: Un **réseau local** (maison, entreprise, lycée).

Q: Quelle est la topologie la plus utilisée dans les LAN ?
R: La topologie en **étoile** (autour d'un switch).

Q: Rôle d'un switch ?
R: Relier les machines d'un même réseau local et envoyer chaque trame **au bon port** grâce aux **adresses MAC** (couche 2).

Q: Rôle d'un routeur ?
R: Relier des **réseaux différents** et acheminer les paquets grâce aux **adresses IP** (couche 3).

Q: Taille d'une adresse MAC ?
R: **48 bits** (6 octets en hexadécimal).

Q: Longueur maximale d'un câble Ethernet en paire torsadée ?
R: **100 mètres**.

Q: Débit d'un câble catégorie 6a ?
R: **10 Gbit/s** sur 100 m.

Q: Ordre des fils en T568B ?
R: blanc-orange, orange, blanc-vert, bleu, blanc-bleu, vert, blanc-marron, marron.

Q: 100 Mbit/s = combien de Mo/s ?
R: **12,5 Mo/s** (on divise par 8).

Q: Pourquoi le hub est-il obsolète ?
R: Il répète chaque trame sur **tous les ports** : collisions, trafic inutile, pas de confidentialité.

=== QUIZ ===
? Quel équipement relie le réseau du lycée à Internet ?
- Un switch
+ Un routeur
- Un hub
! Le routeur relie des réseaux différents (LAN et Internet).

? Sur quelle adresse se base un switch pour transmettre une trame ?
+ L'adresse MAC
- L'adresse IP
- Le nom de domaine
! Le switch travaille en couche 2 avec les adresses MAC.

? Combien de temps faut-il (en théorie) pour transférer 1 Go à 1 Gbit/s ?
- 1 s
+ 8 s
- 0,125 s
! 1 Go = 8 Gbit ; 8 Gbit / 1 Gbit/s = 8 s.

? Quel support est insensible aux perturbations électromagnétiques ?
- Le câble RJ45 non blindé
+ La fibre optique
- Le Wi-Fi
! La fibre transporte de la lumière, pas un courant électrique.

? Laquelle est une adresse MAC valide ?
- 192.168.1.1
+ 3C:52:82:1A:F0:7B
- 2001:db8::1
! 6 octets en hexadécimal : c'est une adresse MAC (les autres sont des IP).

? Les fils 1 et 2 d'un câble en T568B sont…
+ blanc-orange et orange
- blanc-vert et vert
- bleu et blanc-bleu
! T568B commence par la paire orange.
