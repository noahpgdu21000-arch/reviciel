---
id: cyber-securiser-reseau
matiere: cyber
titre: Sécuriser un réseau
chapitre: Cybersécurité — Réseau
resume: Pare-feu et règles de filtrage, DMZ, VPN, proxy, IDS/IPS, segmentation, administration sécurisée et journalisation.
mots-cles: pare-feu, firewall, règles de filtrage, politique par défaut, DMZ, VPN, proxy, IDS, IPS, segmentation, VLAN, 802.1X, journalisation, logs, SIEM, défense en profondeur, durcissement
ordre: 5
---

## Le pare-feu (firewall)

Le ==pare-feu== filtre le trafic entre deux zones (par exemple le LAN et Internet) selon des ==règles== : adresse IP source et destination, **protocole**, **port**, sens du flux, et action (**autoriser** ou **refuser**).

- ==Politique par défaut== recommandée : **tout ce qui n'est pas explicitement autorisé est interdit** (liste blanche).
- Les règles sont lues **dans l'ordre** : la **première** règle qui correspond s'applique.
- Un pare-feu **à états** (stateful) suit les connexions : il laisse revenir automatiquement les réponses d'une connexion autorisée.

> [!exemple] Règles d'un petit réseau
> | N° | Source | Destination | Port | Action |
> |---|---|---|---|---|
> | 1 | LAN 192.168.1.0/24 | Internet | TCP 80, 443 | Autoriser |
> | 2 | LAN 192.168.1.0/24 | Serveur DNS | UDP 53 | Autoriser |
> | 3 | Internet | Serveur web en DMZ | TCP 443 | Autoriser |
> | 4 | Tout | Tout | Tout | ==Refuser== (règle par défaut) |

## Les autres briques de sécurité

| Élément | Rôle |
|---|---|
| ==DMZ== (zone démilitarisée) | sous-réseau isolé qui héberge les serveurs accessibles depuis Internet (web, messagerie) : si l'un d'eux est piraté, le LAN reste protégé |
| ==VPN== | **tunnel chiffré** entre deux points à travers Internet (télétravail, liaison entre sites) : IPsec, OpenVPN, WireGuard |
| ==Proxy== | intermédiaire pour accéder au web : filtrage des sites, cache, journalisation |
| ==IDS / IPS== | système de **détection** (IDS) ou de **prévention** (IPS) d'intrusion : repère les comportements suspects, l'IPS les bloque |
| Antivirus / EDR | protège les postes et serveurs |

## Segmenter et contrôler l'accès

- ==Segmenter== le réseau en VLAN (administration, production, invités, caméras…) et filtrer les flux entre eux.
- **Désactiver les ports** de switch inutilisés et utiliser l'authentification **802.1X** (une machine doit s'authentifier avant d'accéder au réseau).
- ==Sécurité physique== : baie de brassage et salle serveur **fermées à clé**, accès contrôlé.

## Administrer en sécurité (durcissement)

- Changer les **mots de passe par défaut** des équipements (admin/admin…).
- Utiliser des protocoles **chiffrés** : SSH plutôt que Telnet, HTTPS plutôt que HTTP pour les interfaces web.
- Comptes **nominatifs** (un compte par administrateur), droits minimaux.
- **Désactiver** les services inutiles et **mettre à jour** les firmwares.

## Surveiller : journaux et supervision

- Les ==journaux (logs)== enregistrent les événements (connexions, erreurs, blocages du pare-feu). Ils assurent la **traçabilité**.
- Horodatage fiable grâce à **NTP** ; centralisation des journaux, éventuellement dans un **SIEM** qui corrèle les événements et alerte.
- **Supervision** (SNMP, outils comme Zabbix ou Nagios) : être alerté quand un équipement tombe.

> [!retenir] La défense en profondeur
> Aucune protection n'est parfaite : on **empile plusieurs couches** (pare-feu, segmentation, mises à jour, MFA, sauvegardes, supervision, sensibilisation des utilisateurs) pour qu'une faille isolée ne suffise pas.

=== CARTES ===
Q: Rôle d'un pare-feu ?
R: **Filtrer le trafic** entre des zones selon des règles (IP, port, protocole, sens).

Q: Politique par défaut recommandée pour un pare-feu ?
R: **Tout refuser** sauf ce qui est explicitement autorisé.

Q: Dans quel ordre un pare-feu applique-t-il ses règles ?
R: **De haut en bas** : la première règle qui correspond s'applique.

Q: Qu'est-ce qu'une DMZ ?
R: Une **zone isolée** pour les serveurs accessibles depuis Internet, séparée du réseau interne.

Q: Qu'est-ce qu'un VPN ?
R: Un **tunnel chiffré** entre deux points à travers Internet.

Q: Différence entre IDS et IPS ?
R: L'**IDS détecte** les intrusions et alerte ; l'**IPS** les **bloque** aussi.

Q: À quoi servent les journaux (logs) ?
R: À garder une **trace** des événements : savoir qui a fait quoi et quand (traçabilité).

Q: Qu'est-ce que la défense en profondeur ?
R: **Superposer plusieurs protections** pour qu'une seule faille ne suffise pas.

Q: Pourquoi désactiver les ports de switch inutilisés ?
R: Pour éviter qu'une personne **branche un appareil non autorisé** sur le réseau.

=== QUIZ ===
? Où placer le serveur web public d'une entreprise ?
- Dans le même réseau que les postes des salariés
+ Dans une DMZ
- Sur le poste du directeur
! La DMZ isole les serveurs exposés à Internet du réseau interne.

? Un salarié en télétravail doit accéder au serveur de fichiers de l'entreprise. On utilise…
+ un VPN
- un hub
- Telnet
! Le VPN crée un tunnel chiffré jusqu'au réseau de l'entreprise.

? La dernière règle d'un pare-feu « Tout / Tout / Refuser » sert à…
- bloquer tout le trafic, même autorisé
+ refuser tout ce qui n'a pas été autorisé par les règles précédentes
- accélérer le réseau
! C'est la politique par défaut « liste blanche ».

? Pour administrer un switch à distance, il faut privilégier…
- Telnet
+ SSH
- HTTP
! SSH chiffre les échanges, contrairement à Telnet et HTTP.

? Quel outil centralise et corrèle les journaux de sécurité ?
+ Un SIEM
- Un proxy
- Un point d'accès Wi-Fi
! Le SIEM rassemble les logs et déclenche des alertes.
