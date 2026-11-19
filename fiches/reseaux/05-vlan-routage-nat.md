---
id: res-vlan-routage
matiere: reseaux
titre: Commutation, VLAN, routage et NAT
chapitre: Réseaux — Architecture
resume: Comment un switch apprend les adresses MAC, segmenter avec des VLAN, router entre réseaux et partager une IP publique avec la NAT.
mots-cles: switch, table MAC, commutation, VLAN, 802.1Q, access, trunk, routage, table de routage, route statique, route par défaut, NAT, PAT, redirection de port, broadcast
ordre: 5
---

## Le switch et sa table MAC

- Le switch ==apprend== les adresses MAC en lisant l'adresse **source** de chaque trame reçue : il note « telle MAC est sur tel port » dans sa ==table MAC== (table CAM).
- Pour une trame destinée à une MAC connue, il l'envoie **uniquement sur le bon port**. Si la MAC est inconnue (ou pour un broadcast), il l'envoie sur tous les ports.
- Tous les ports d'un switch (sans VLAN) forment un seul ==domaine de diffusion== : un broadcast atteint toutes les machines.

## Les VLAN (réseaux locaux virtuels)

Un ==VLAN== découpe **logiquement** un switch en plusieurs réseaux indépendants, comme s'il y avait plusieurs switchs.

> [!exemple]
> VLAN 10 « Administration », VLAN 20 « Ateliers », VLAN 30 « Invités Wi-Fi ». Un PC du VLAN 30 ne voit pas les serveurs du VLAN 10.

**Avantages** : ==sécurité== (isolement des services), moins de broadcasts, organisation indépendante du câblage.

| Type de port | Rôle |
|---|---|
| ==Access== | appartient à **un seul VLAN** ; on y branche un PC, une imprimante |
| ==Trunk== | transporte **plusieurs VLAN** entre switchs ou vers un routeur ; les trames sont **étiquetées** (norme ==802.1Q==) |

Pour que deux VLAN communiquent, il faut passer par un **routeur** (ou un switch de niveau 3).

```text
Switch(config)# vlan 10
Switch(config-vlan)# name ADMIN
Switch(config)# interface fa0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
Switch(config)# interface g0/1
Switch(config-if)# switchport mode trunk
```

## Le routage

Le ==routeur== relie des réseaux différents. Pour chaque paquet, il consulte sa ==table de routage== : réseau de destination, masque, et **prochain saut** (passerelle) ou interface de sortie.

- **Routes directement connectées** : les réseaux branchés sur ses interfaces.
- **Routes statiques** : écrites à la main par l'administrateur.
- **Routes dynamiques** : apprises automatiquement (protocoles RIP, OSPF).
- ==Route par défaut== `0.0.0.0/0` : utilisée quand aucune autre route ne correspond (souvent vers Internet).

```text
Router(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2
Router(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1
```

## La NAT

Les adresses privées (192.168.x.x…) ne circulent pas sur Internet. La ==NAT== (traduction d'adresses) remplace l'adresse **privée** par l'adresse **publique** du routeur à la sortie, et fait l'inverse au retour.

- Avec la ==PAT== (NAT avec ports), **toutes les machines** du réseau partagent **une seule IP publique** : le routeur les distingue grâce aux numéros de port. C'est ce que fait ta box.
- La ==redirection de port== (port forwarding) permet de rendre joignable depuis Internet un serveur interne (ex. : port 443 public → 192.168.1.20:443).

> [!retenir]
> Switch = table MAC. VLAN = réseaux séparés sur un même switch (access = 1 VLAN, trunk = plusieurs, 802.1Q). Routeur = table de routage, route par défaut 0.0.0.0/0. NAT/PAT = IP privées → une IP publique.

=== EXERCICES ===
# paires : Associe chaque notion à sa définition
- VLAN = Réseau local virtuel isolé sur un switch
- Port access = Port qui appartient à un seul VLAN
- Port trunk = Port qui transporte plusieurs VLAN étiquetés
- 802.1Q = Norme d'étiquetage des trames VLAN
- NAT = Traduction des adresses privées en adresse publique

# trous : Complète les commandes Cisco
Pour mettre un port dans le VLAN 10 : switchport access vlan [[10]]. Pour qu'un port transporte plusieurs VLAN : switchport mode [[trunk]]. Pour créer une route par défaut : ip route [[0.0.0.0]] 0.0.0.0 10.0.0.1.

=== CARTES ===
Q: Comment un switch remplit-il sa table MAC ?
R: En lisant l'adresse MAC **source** des trames reçues sur chaque port.

Q: Que fait un switch d'une trame dont la MAC de destination est inconnue ?
R: Il l'envoie sur **tous les ports** (sauf celui d'arrivée).

Q: Qu'est-ce qu'un VLAN ?
R: Un **réseau local virtuel** : un découpage logique d'un switch en plusieurs réseaux isolés.

Q: Différence entre port access et port trunk ?
R: **Access** = un seul VLAN (pour un PC) ; **trunk** = plusieurs VLAN étiquetés (entre switchs).

Q: Quelle norme étiquette les trames des VLAN ?
R: La norme **IEEE 802.1Q**.

Q: Comment faire communiquer deux VLAN ?
R: Avec un **routeur** (ou un switch de niveau 3).

Q: Qu'est-ce que la route par défaut ?
R: La route **0.0.0.0/0**, utilisée quand aucune autre route ne correspond.

Q: Rôle de la NAT ?
R: Traduire les adresses **privées** en adresse **publique** pour accéder à Internet.

Q: Qu'est-ce que la PAT ?
R: Une NAT qui utilise les **ports** pour que plusieurs machines partagent **une seule IP publique**.

=== QUIZ ===
? Sur quel type de port branche-t-on le PC d'un utilisateur ?
+ Un port access
- Un port trunk
- Un port console
! Le PC appartient à un seul VLAN : port access.

? Quel est le principal avantage sécurité des VLAN ?
- Augmenter le débit Wi-Fi
+ Isoler des groupes de machines les uns des autres
- Supprimer le besoin de mots de passe
! Les VLAN séparent les flux : un invité ne voit pas les serveurs de l'administration.

? La commande « ip route 0.0.0.0 0.0.0.0 203.0.113.1 » crée…
- une route vers le réseau 203.0.113.0
+ une route par défaut
- un VLAN
! 0.0.0.0/0 correspond à toutes les destinations : c'est la route par défaut.

? Comment 10 PC d'une maison accèdent-ils à Internet avec une seule IP publique ?
+ Grâce à la NAT/PAT de la box
- Grâce au DNS
- Grâce aux VLAN
! La box traduit les adresses privées et distingue les connexions par les ports.

? Un switch reçoit une trame de la MAC AA:AA:AA:AA:AA:AA sur le port 3. Que note-t-il ?
+ Que cette MAC est joignable par le port 3
- Que cette MAC doit être bloquée
- L'adresse IP correspondante
! Le switch apprend la MAC source et le port d'arrivée.
