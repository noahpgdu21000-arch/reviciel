---
id: res-depannage
matiere: reseaux
titre: Commandes réseau et méthode de dépannage
chapitre: Réseaux — Pratique
resume: ipconfig, ping, tracert, nslookup sous Windows et Linux, la méthode de diagnostic couche par couche, et les bases de Cisco IOS (Packet Tracer).
mots-cles: ipconfig, ping, tracert, traceroute, nslookup, arp, netstat, ip a, dépannage, diagnostic, Cisco, IOS, Packet Tracer, show ip interface brief, running-config
ordre: 6
---

## Les commandes essentielles

| Besoin | Windows (cmd / PowerShell) | Linux |
|---|---|---|
| Voir sa configuration IP | `ipconfig` / `ipconfig /all` (MAC, DHCP, DNS) | `ip a` (ip addr) |
| Voir la passerelle, les routes | `route print` | `ip r` (ip route) |
| Tester la connexion avec une machine | `ping 192.168.1.1` | `ping -c 4 192.168.1.1` |
| Voir le chemin jusqu'à une destination | `tracert 8.8.8.8` | `traceroute 8.8.8.8` |
| Interroger le DNS | `nslookup www.exemple.fr` | `dig www.exemple.fr` ou `nslookup` |
| Voir la table ARP | `arp -a` | `ip neigh` |
| Voir les connexions et ports ouverts | `netstat -an` | `ss -tuln` |
| Renouveler l'adresse DHCP | `ipconfig /release` puis `ipconfig /renew` | `sudo dhclient -r` puis `sudo dhclient` |
| Vider le cache DNS | `ipconfig /flushdns` | selon la distribution |

## La méthode de dépannage (du bas vers le haut)

On suit les couches du modèle OSI, **de la couche 1 vers la couche 7** :

1. **Physique** : le câble est-il branché ? Les ==voyants== du port clignotent-ils ? Le Wi-Fi est-il activé ? Tester avec un autre câble ou un autre port.
2. **Configuration IP** (`ipconfig`) : adresse, masque, passerelle, DNS sont-ils cohérents ? Une adresse ==169.254.x.x== signifie : **pas de réponse du serveur DHCP**.
3. **Tests de ping progressifs** :
   1. `ping 127.0.0.1` → la pile TCP/IP de la machine fonctionne ;
   2. `ping` de sa propre IP → la carte réseau est configurée ;
   3. `ping` de la ==passerelle== → le réseau local fonctionne ;
   4. `ping 8.8.8.8` (une IP sur Internet) → l'accès Internet fonctionne ;
   5. `ping www.google.fr` (un nom) → le ==DNS== fonctionne.
4. Si l'IP répond mais pas le nom → problème de **DNS** (`nslookup`).
5. Si tout répond mais pas l'application → service arrêté, mauvais port, **pare-feu**.

> [!astuce] Lire la réponse d'un ping
> - « Réponse de… temps=2 ms TTL=64 » → ça marche.
> - « Délai d'attente de la demande dépassé » → pas de réponse (machine éteinte, mauvais réseau, ou pare-feu qui bloque ICMP).
> - « Hôte de destination inaccessible » → pas de route vers la destination (souvent un problème de passerelle).

## Les bases de Cisco IOS (Packet Tracer)

| Mode | Invite | Pour y aller |
|---|---|---|
| Utilisateur | `Switch>` | à la connexion |
| Privilégié | `Switch#` | `enable` |
| Configuration globale | `Switch(config)#` | `configure terminal` |
| Configuration d'interface | `Switch(config-if)#` | `interface g0/0` |

```text
Router> enable
Router# configure terminal
Router(config)# hostname R1
R1(config)# interface g0/0
R1(config-if)# ip address 192.168.1.1 255.255.255.0
R1(config-if)# no shutdown
R1(config-if)# end
R1# show ip interface brief
R1# copy running-config startup-config
```

- `show running-config` : configuration en cours (en RAM) ; `startup-config` : configuration sauvegardée (chargée au démarrage).
- ==N'oublie pas `no shutdown`== : sur un routeur, les interfaces sont éteintes par défaut.
- ==Sauvegarde== avec `copy running-config startup-config` (ou `write`), sinon tout est perdu au redémarrage.

> [!retenir]
> Dépanner du bas vers le haut : câble → configuration IP → ping 127.0.0.1 → ping passerelle → ping 8.8.8.8 → ping d'un nom (DNS). 169.254.x.x = problème DHCP.

=== EXERCICES ===
# ordre : Remets la méthode de dépannage dans l'ordre
- Vérifier le câble et les voyants
- Vérifier la configuration IP (ipconfig)
- ping 127.0.0.1
- ping de la passerelle
- ping d'une adresse sur Internet (8.8.8.8)
- ping d'un nom (test du DNS)

# paires : Associe chaque besoin à sa commande
- Voir la configuration IP détaillée sous Windows = ipconfig /all
- Interroger le DNS = nslookup
- Voir le chemin vers une destination = tracert
- Renouveler l'adresse DHCP = ipconfig /renew
- Voir l'état des interfaces d'un routeur Cisco = show ip interface brief
- Enregistrer la configuration Cisco = copy running-config startup-config

=== CARTES ===
Q: Commande Windows pour voir la configuration IP complète ?
R: **ipconfig /all**

Q: Commande Linux équivalente à ipconfig ?
R: **ip a** (ip addr)

Q: Que vérifie « ping 127.0.0.1 » ?
R: Que la **pile TCP/IP** de la machine fonctionne (boucle locale).

Q: Ping vers 8.8.8.8 OK mais pas vers www.google.fr : quel problème ?
R: Un problème de **DNS**.

Q: Commande pour suivre le chemin vers une destination sous Windows ?
R: **tracert** (traceroute sous Linux).

Q: Commande pour interroger un serveur DNS ?
R: **nslookup** (ou dig sous Linux).

Q: Comment renouveler son adresse DHCP sous Windows ?
R: **ipconfig /release** puis **ipconfig /renew**.

Q: Commande Cisco pour passer en mode configuration ?
R: **configure terminal** (après enable).

Q: Commande Cisco pour activer une interface ?
R: **no shutdown**

Q: Commande Cisco pour sauvegarder la configuration ?
R: **copy running-config startup-config**

Q: Commande Cisco pour voir l'état et l'IP des interfaces ?
R: **show ip interface brief**

=== QUIZ ===
? Un PC a l'adresse 169.254.20.5. Quelle est la première chose à vérifier ?
- Le serveur DNS
+ La connexion au réseau et le serveur DHCP
- Le navigateur web
! L'adresse APIPA indique que le PC n'a pas obtenu de bail DHCP.

? Le ping de la passerelle échoue mais le câble et l'IP sont corrects. Que soupçonner ?
+ Un problème sur le réseau local (switch, VLAN, passerelle)
- Un problème de DNS
- Un problème de navigateur
! Sans réponse de la passerelle, le problème est dans le réseau local.

? Sur un routeur Cisco, l'interface est configurée mais reste « down ». Il manque sans doute…
- la commande enable
+ la commande no shutdown
- la commande hostname
! Les interfaces des routeurs sont éteintes par défaut.

? Quelle commande montre les ports en écoute sous Linux ?
- ip a
+ ss -tuln
- traceroute
! ss -tuln liste les sockets TCP/UDP en écoute.

? Le prompt « R1(config-if)# » indique le mode…
- privilégié
- configuration globale
+ configuration d'interface
! (config-if) signifie qu'on configure une interface.

? Que se passe-t-il si on redémarre un switch sans « copy running-config startup-config » ?
+ Les modifications non sauvegardées sont perdues
- Rien, tout est sauvegardé automatiquement
- Le switch refuse de redémarrer
! La running-config est en RAM : elle disparaît à l'extinction.
