---
id: res-protocoles
matiere: reseaux
titre: Protocoles et services réseau
chapitre: Réseaux — Services
resume: TCP ou UDP, les ports à connaître, et le fonctionnement de DHCP, DNS, ARP, ICMP, HTTP(S), SSH et de la messagerie.
mots-cles: TCP, UDP, port, DHCP, DORA, bail, DNS, enregistrement A, MX, ARP, ICMP, ping, HTTP, HTTPS, SSH, FTP, SMTP, IMAP, POP3, NTP, SNMP, RDP
ordre: 4
---

## TCP ou UDP ?

| ==TCP== | ==UDP== |
|---|---|
| **connecté** : ouverture de connexion en 3 temps (SYN, SYN-ACK, ACK) | **non connecté** : on envoie directement |
| **fiable** : accusés de réception, retransmission, remise dans l'ordre | pas de garantie de livraison |
| plus lent | plus rapide, plus léger |
| web, mail, SSH, transfert de fichiers | DNS, DHCP, streaming, voix sur IP, jeux en ligne |

## Les ports à connaître

Un ==port== (de 0 à 65 535) identifie le **service** sur une machine. Couple IP + port = une ==socket==.

| Port | Service | Transport |
|---|---|---|
| 20, 21 | FTP (transfert de fichiers) | TCP |
| ==22== | ==SSH== (administration à distance chiffrée), SFTP | TCP |
| 23 | Telnet (non chiffré : à éviter) | TCP |
| 25 | SMTP (envoi de mails) | TCP |
| ==53== | ==DNS== | UDP (et TCP) |
| ==67, 68== | ==DHCP== (serveur 67, client 68) | UDP |
| ==80== | ==HTTP== | TCP |
| 110 | POP3 (réception de mails) | TCP |
| 123 | NTP (heure) | UDP |
| 143 | IMAP (réception de mails) | TCP |
| 161 | SNMP (supervision) | UDP |
| ==443== | ==HTTPS== (HTTP chiffré par TLS) | TCP |
| 3389 | RDP (bureau à distance Windows) | TCP |

## DHCP : l'adressage automatique

Le serveur ==DHCP== distribue automatiquement aux clients : **adresse IP, masque, passerelle, serveurs DNS**, pour une durée limitée (le ==bail==). Échange en 4 étapes, ==DORA== :

1. **D**iscover : le client cherche un serveur (en broadcast) ;
2. **O**ffer : le serveur propose une adresse ;
3. **R**equest : le client demande l'adresse proposée ;
4. **A**ck : le serveur confirme.

Sans réponse DHCP, Windows s'attribue une adresse ==APIPA 169.254.x.x==.

## DNS : l'annuaire d'Internet

Le ==DNS== traduit un **nom de domaine** (www.education.gouv.fr) en **adresse IP**. La résolution part des serveurs **racine**, puis du domaine de premier niveau (**.fr**), puis du serveur qui fait autorité pour le domaine.

Enregistrements : **A** (nom → IPv4), **AAAA** (nom → IPv6), **CNAME** (alias), **MX** (serveur de messagerie), **NS** (serveur DNS du domaine), **PTR** (IP → nom).

## ARP et ICMP

- ==ARP== trouve l'**adresse MAC** qui correspond à une **adresse IP** du réseau local (« Qui a 192.168.1.1 ? » en broadcast). Le résultat est mémorisé dans la table ARP (`arp -a`).
- ==ICMP== transporte les messages de contrôle et d'erreur. Il est utilisé par **ping** (echo request / echo reply) et **traceroute**.

## Web, administration, messagerie

- **HTTP** affiche les pages web ; ==HTTPS== = HTTP + **TLS** : la connexion est chiffrée et le serveur authentifié par un certificat.
- ==SSH== permet d'administrer une machine à distance de façon **chiffrée** (il remplace Telnet).
- Messagerie : **SMTP** pour **envoyer**, **IMAP** pour consulter en **synchronisant** (mails restent sur le serveur), **POP3** pour **télécharger** les mails.

> [!retenir]
> DHCP = adresse automatique (DORA, UDP 67/68). DNS = nom → IP (port 53). ARP = IP → MAC. ICMP = ping. HTTP 80, HTTPS 443, SSH 22.

=== CARTES ===
Q: Différence principale entre TCP et UDP ?
R: **TCP** est connecté et fiable (accusés de réception) ; **UDP** est non connecté, plus rapide mais sans garantie.

Q: Les 3 étapes d'ouverture d'une connexion TCP ?
R: **SYN**, **SYN-ACK**, **ACK** (« three-way handshake »).

Q: Port de HTTPS ?
R: **443** (TCP).

Q: Port de SSH ?
R: **22** (TCP).

Q: Port du DNS ?
R: **53** (UDP, et TCP).

Q: Que fournit un serveur DHCP ?
R: Adresse **IP**, **masque**, **passerelle**, **DNS**, pour une durée limitée (bail).

Q: Que signifie DORA ?
R: **D**iscover, **O**ffer, **R**equest, **A**ck : les 4 messages DHCP.

Q: Rôle du DNS ?
R: Traduire un **nom de domaine** en **adresse IP**.

Q: Quel enregistrement DNS désigne le serveur de messagerie ?
R: L'enregistrement **MX**.

Q: Rôle d'ARP ?
R: Trouver l'**adresse MAC** correspondant à une adresse IP sur le réseau local.

Q: Quel protocole utilise la commande ping ?
R: **ICMP** (echo request / echo reply).

Q: Différence entre IMAP et POP3 ?
R: **IMAP** synchronise (les mails restent sur le serveur) ; **POP3** les télécharge sur l'appareil.

=== QUIZ ===
? Quel protocole attribue automatiquement une adresse IP ?
- DNS
+ DHCP
- ARP
! DHCP distribue IP, masque, passerelle et DNS.

? Pour administrer un serveur Linux à distance de façon sécurisée, on utilise…
- Telnet (port 23)
+ SSH (port 22)
- HTTP (port 80)
! SSH chiffre la connexion ; Telnet envoie tout en clair, même le mot de passe.

? Le site s'affiche avec l'adresse IP mais pas avec son nom. Quel service pose problème ?
- DHCP
+ DNS
- ARP
! La résolution nom → IP est le rôle du DNS.

? Quel protocole de transport utilise le streaming vidéo en direct ?
- TCP
+ UDP
- ICMP
! UDP privilégie la rapidité : une image perdue n'est pas retransmise.

? Dans DORA, quel message envoie le serveur en premier ?
- Discover
+ Offer
- Request
! Le client envoie Discover, le serveur répond par Offer.

? Le port 443 correspond à…
- HTTP
+ HTTPS
- FTP
! HTTPS : HTTP chiffré par TLS, port 443.
