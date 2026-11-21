/* RéviCIEL — labs réseau : un cours + une mise en pratique notée, du niveau débutant au niveau difficile.
   Chaque objectif est vérifié automatiquement dans le simulateur (h = outils de vérification, voir labo.js). */
(function (global) {
  'use strict';
  const LEVELS = [
    { n: 1, id: 'debutant', name: 'Débutant', color: '#16a34a', desc: 'La ligne de commande, la sécurité de base, les adresses IP et le ping.' },
    { n: 2, id: 'intermediaire', name: 'Intermédiaire', color: '#d97706', desc: 'VLAN, routeur et passerelles, trunk entre switchs, DHCP.' },
    { n: 3, id: 'difficile', name: 'Difficile', color: '#dc2626', desc: 'Routage inter-VLAN, routage statique, SSH, ACL et dépannage.' }
  ];

  const LABS = [
    /* ================= DÉBUTANT ================= */
    {
      id: 'cli', level: 1, time: '10 min', title: 'Premiers pas dans la ligne de commande',
      desc: 'Les modes du switch, enable, configure terminal, hostname, show running-config et l\'aide « ? ».',
      devices: [{ id: 'SW1', type: 'switch', x: 320, y: 90 }, { id: 'PC1', type: 'pc', x: 320, y: 225, pc: { ip: '192.168.1.10', mask: '255.255.255.0' } }],
      links: [['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0']],
      start: 'SW1',
      cours: `## La ligne de commande (CLI)

Les switchs et routeurs Cisco se configurent en tapant des commandes dans la **CLI** (*Command Line Interface*), branché sur le **port console** ou à distance. Chaque mode a son **invite** :

| Invite | Mode | Pour y aller | Ce qu'on y fait |
|---|---|---|---|
| Switch> | ==utilisateur== | (au démarrage) | quelques vérifications |
| Switch# | ==privilégié== | **enable** | tous les **show**, sauvegarder, redémarrer |
| Switch(config)# | ==configuration globale== | **configure terminal** | modifier la configuration |
| Switch(config-if)# | configuration d'interface | **interface fa0/1** | régler un port |

- **exit** remonte d'un mode, **end** (ou **Ctrl+Z**) revient directement au mode privilégié.
- **hostname SW1** donne un nom à l'équipement (l'invite change aussitôt).
- **show running-config** affiche la configuration **en cours** (en mémoire vive).

## Les astuces qui font gagner du temps

- Les commandes peuvent être ==abrégées== tant qu'il n'y a pas d'ambiguïté : **en** = enable, **conf t** = configure terminal, **sh run** = show running-config.
- **?** affiche l'aide : seul, il liste les commandes possibles ; après un mot (**show ?**), il liste la suite.
- **Tab** complète le mot commencé.
- **Flèche haut** rappelle les commandes précédentes.

~~~
Switch>enable
Switch#configure terminal
Switch(config)#hostname SW1
SW1(config)#end
SW1#show running-config
~~~

> [!attention] Le message « % Invalid input detected at '^' marker »
> Le **^** montre l'endroit exact de la faute de frappe. Lis-le, corrige, recommence.`,
      goals: [
        { t: 'Affiche l\'aide en tapant « ? »', hint: 'Tape simplement ? dans le terminal (l\'aide s\'affiche tout de suite).', c: (h) => h.used('SW1', '?') },
        { t: 'Passe en mode privilégié', hint: 'enable (ou en). L\'invite devient Switch#', c: (h) => h.used('SW1', 'enable') },
        { t: 'Entre en mode configuration globale', hint: 'configure terminal (ou conf t)', c: (h) => h.used('SW1', 'configure terminal') || h.used('SW1', 'configure') },
        { t: 'Nomme le switch « SW1 »', hint: 'hostname SW1', c: (h) => h.hostname('SW1', 'SW1') },
        { t: 'Reviens en mode privilégié', hint: 'end (ou Ctrl+Z)', c: (h) => h.hostname('SW1', 'SW1') && h.mode('SW1') === 'priv' },
        { t: 'Affiche la configuration en cours', hint: 'show running-config (ou sh run)', c: (h) => h.hostname('SW1', 'SW1') && h.used('SW1', 'show running-config') }
      ],
      solution: [['SW1', ['?', 'enable', 'configure terminal', 'hostname SW1', 'end', 'show running-config']]]
    },
    {
      id: 'securite', level: 1, time: '15 min', title: 'Sécuriser l\'accès et sauvegarder',
      desc: 'Mots de passe (enable, console, vty), chiffrement, bannière et copy running-config startup-config.',
      devices: [{ id: 'SW1', type: 'switch', x: 320, y: 90 }, { id: 'PC1', type: 'pc', x: 320, y: 225, pc: { ip: '192.168.1.10', mask: '255.255.255.0' } }],
      links: [['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0']],
      setup: { SW1: ['hostname SW1'] },
      start: 'SW1',
      cours: `## Pourquoi sécuriser ?

Sans mot de passe, n'importe qui peut brancher un câble console et tout modifier. On protège donc **3 accès** :

| Accès | Commandes |
|---|---|
| Mode privilégié | **enable secret** motdepasse (chiffré, à préférer à « enable password ») |
| Port console | **line console 0** → **password** … → **login** |
| Accès à distance (Telnet/SSH) | **line vty 0 4** → **password** … → **login** |

~~~
SW1(config)#enable secret class
SW1(config)#line console 0
SW1(config-line)#password cisco
SW1(config-line)#login
SW1(config-line)#line vty 0 4
SW1(config-line)#password cisco
SW1(config-line)#login
SW1(config-line)#exit
SW1(config)#service password-encryption
SW1(config)#banner motd #Acces reserve au personnel autorise#
~~~

- **service password-encryption** chiffre les mots de passe visibles dans **show running-config** (ils apparaissent en « type 7 »).
- **banner motd** affiche un message d'avertissement à la connexion (le caractère # sert de délimiteur).

## Enregistrer la configuration

> [!retenir] running-config ≠ startup-config
> - **running-config** = configuration **en cours**, en mémoire vive : elle est ==perdue au redémarrage==.
> - **startup-config** = configuration **enregistrée** (NVRAM), chargée au démarrage.
> Pour enregistrer : **copy running-config startup-config** (puis Entrée), ou **write**.

> [!astuce] Tester
> Tape **exit** jusqu'à te déconnecter : le switch doit te demander le mot de passe console. Puis **enable** doit demander « class ».`,
      goals: [
        { t: 'Protège le mode privilégié avec « enable secret class »', hint: 'En mode configuration : enable secret class', c: (h) => h.cfg('SW1').enableSecret === 'class' },
        { t: 'Mot de passe « cisco » sur la console + login', hint: 'line console 0 → password cisco → login', c: (h) => { const l = h.cfg('SW1').lines.con; return l.password === 'cisco' && l.login; } },
        { t: 'Mot de passe « cisco » sur les lignes vty + login', hint: 'line vty 0 4 → password cisco → login', c: (h) => { const l = h.cfg('SW1').lines.vty; return l.password === 'cisco' && l.login; } },
        { t: 'Chiffre les mots de passe affichés', hint: 'service password-encryption', c: (h) => h.cfg('SW1').servicePE },
        { t: 'Ajoute une bannière d\'avertissement', hint: 'banner motd #Acces reserve au personnel autorise#', c: (h) => !!h.cfg('SW1').banner },
        { t: 'Enregistre la configuration', hint: 'end puis copy running-config startup-config (et Entrée)', c: (h) => h.cfg('SW1').enableSecret === 'class' && h.cfg('SW1').servicePE && h.saved('SW1') }
      ],
      solution: [['SW1', ['enable', 'configure terminal', 'enable secret class', 'line console 0', 'password cisco', 'login', 'line vty 0 4', 'password cisco', 'login', 'exit', 'service password-encryption', 'banner motd #Acces reserve au personnel autorise#', 'end', 'copy running-config startup-config', '(Entrée)']]]
    },
    {
      id: 'ping', level: 1, time: '10 min', title: 'Adresser deux PC et tester avec ping',
      desc: 'Configurer l\'adresse IP et le masque des PC, vérifier avec ipconfig, tester avec ping.',
      devices: [{ id: 'SW1', type: 'switch', x: 320, y: 80 }, { id: 'PC1', type: 'pc', x: 190, y: 225 }, { id: 'PC2', type: 'pc', x: 450, y: 225 }],
      links: [['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW1', 'FastEthernet0/2', 'PC2', 'FastEthernet0']],
      setup: { SW1: ['hostname SW1'] },
      start: 'PC1',
      cours: `## L'adresse IP d'un PC

Pour communiquer, chaque PC a besoin d'une **adresse IP** unique et d'un **masque** (et d'une **passerelle** pour sortir du réseau, on verra ça plus tard). Deux PC communiquent directement s'ils sont dans le ==même réseau== : même partie réseau d'après le masque.

| PC | Adresse IP | Masque |
|---|---|---|
| PC1 | 192.168.1.10 | 255.255.255.0 |
| PC2 | 192.168.1.11 | 255.255.255.0 |

Dans le simulateur : clique sur un PC, remplis **Configuration IP** puis **Enregistrer**.

## Vérifier et tester

- **ipconfig** affiche la configuration IP du PC.
- **ping 192.168.1.11** envoie 4 messages ICMP et attend les réponses.

> [!retenir] Lire un ping
> - « Réponse de… » : ça marche.
> - « Délai d'attente de la demande dépassé » : personne ne répond (machine absente, mauvais réseau, câble…).
> - « Défaillance générale » : le PC n'a pas d'adresse ou pas de passerelle pour cette destination.`,
      goals: [
        { t: 'Configure PC1 : 192.168.1.10 / 255.255.255.0', hint: 'Clique sur PC1 → Configuration IP → Statique', c: (h) => h.pc('PC1', '192.168.1.10', '255.255.255.0') },
        { t: 'Configure PC2 : 192.168.1.11 / 255.255.255.0', hint: 'Clique sur PC2 → Configuration IP → Statique', c: (h) => h.pc('PC2', '192.168.1.11', '255.255.255.0') },
        { t: 'Vérifie la configuration de PC1 avec ipconfig', hint: 'Dans l\'invite de commandes de PC1 : ipconfig', c: (h) => h.used('PC1', 'pc:ipconfig') },
        { t: 'Depuis PC1, ping PC2 avec succès', hint: 'ping 192.168.1.11', c: (h) => h.pinged('PC1', '192.168.1.11') },
        { t: 'Observe un échec : ping une adresse qui n\'existe pas (192.168.1.50)', hint: 'ping 192.168.1.50 : personne ne répond', c: (h) => h.pingFailed('PC1', '192.168.1.50') }
      ],
      solution: [['PC2', ['Configuration IP → 192.168.1.11 / 255.255.255.0 → Enregistrer']], ['PC1', ['Configuration IP → 192.168.1.10 / 255.255.255.0 → Enregistrer', 'ipconfig', 'ping 192.168.1.11', 'ping 192.168.1.50']]]
    },
    {
      id: 'cablage', level: 1, time: '15 min', title: 'Câbler un réseau : droit, croisé et console', cabling: true,
      desc: 'Choisir le bon câble, brancher les bons ports, lire les voyants et ouvrir une session console.',
      devices: [{ id: 'R1', type: 'router', x: 320, y: 55 }, { id: 'SW1', type: 'switch', x: 190, y: 150 }, { id: 'SW2', type: 'switch', x: 450, y: 150 },
        { id: 'PC1', type: 'pc', x: 190, y: 255, pc: { ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' } }, { id: 'PC2', type: 'laptop', x: 450, y: 255, label: 'Portable', pc: { ip: '192.168.1.11', mask: '255.255.255.0', gw: '192.168.1.1' } }],
      links: [],
      setup: { R1: ['hostname R1', 'interface g0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown'], SW1: ['hostname SW1'], SW2: ['hostname SW2'] },
      start: 'PC1',
      cours: `## Le bon câble au bon endroit

Dans un réseau Ethernet, on utilise des câbles à paires torsadées (RJ45). Il en existe deux sortes :

| Câble | Les fils… | On l'utilise entre… |
|---|---|---|
| ==droit== | arrivent au même endroit des deux côtés | deux équipements **différents** : PC ↔ switch, routeur ↔ switch, serveur ↔ switch |
| ==croisé== | émission et réception sont inversées | deux équipements **semblables** : switch ↔ switch, PC ↔ PC, routeur ↔ routeur, PC ↔ routeur |

> [!retenir] Le moyen de s'en souvenir
> PC, routeur et serveur sont de la **même famille** ; le switch est de l'autre famille. **Familles différentes → droit. Même famille → croisé.**

Les équipements récents savent inverser les fils tout seuls (**Auto-MDIX**), mais à l'examen on te demande le bon câble. Dans l'atelier, le câble **Auto** choisit à ta place.

## Les voyants

- **Vert** : la liaison fonctionne.
- **Orange** : le port démarre (sur un switch, il passe au vert après quelques secondes).
- **Rouge** : rien ne passe → mauvais câble, ou port éteint (**shutdown**). Sur un routeur, les ports sont éteints au départ : il faut **no shutdown**.

## Le câble console

Le câble console (bleu clair) relie le port **RS232** d'un PC au port **Console** d'un routeur ou d'un switch. Il sert à configurer un équipement **neuf**, qui n'a pas encore d'adresse IP. Sur le PC, on ouvre ensuite **Bureau → Terminal** : c'est la même ligne de commande que dans l'onglet CLI.

## Dans l'atelier

1. Choisis un câble en bas (Droit, Croisé ou Console).
2. Touche le premier équipement et choisis le port.
3. Touche le second équipement et choisis le port.
4. Regarde les voyants, puis teste avec **Message simple** (l'enveloppe) ou **ping**.`,
      goals: [
        { t: 'Relie PC1 au switch SW1 avec le bon câble', hint: 'PC et switch sont de familles différentes → câble droit. Port FastEthernet0 du PC → un port FastEthernet du switch.', c: (h) => h.linkUp('PC1', 'SW1') },
        { t: 'Relie le portable au switch SW2', hint: 'Câble droit entre le port FastEthernet0 du portable et un port FastEthernet de SW2.', c: (h) => h.linkUp('PC2', 'SW2') },
        { t: 'Relie les deux switchs entre eux', hint: 'Deux switchs = même famille → câble croisé (par exemple GigabitEthernet0/1 ↔ GigabitEthernet0/1).', c: (h) => h.linkUp('SW1', 'SW2') },
        { t: 'Relie le routeur R1 (port G0/0) à SW1', hint: 'Routeur et switch : câble droit, du port GigabitEthernet0/0 de R1 vers un port de SW1. Le port G0/0 est déjà configuré et allumé.', c: (h) => h.linkUp('R1', 'SW1', 'GigabitEthernet0/0') },
        { t: 'Branche un câble console entre PC1 et le routeur', hint: 'Outil « Console » : port RS232 de PC1 → port Console de R1.', c: (h) => h.console('PC1', 'R1') },
        { t: 'Ouvre le Terminal de PC1 pour configurer le routeur', hint: 'Touche PC1 → onglet Bureau → Terminal.', c: (h) => h.console('PC1', 'R1') && h.used('PC1', 'terminal') },
        { t: 'Le portable ping PC1', hint: 'Portable → Bureau → Invite de commandes → ping 192.168.1.10 (ou l\'enveloppe Message simple).', c: (h) => h.pinged('PC2', '192.168.1.10') },
        { t: 'Le portable ping le routeur (192.168.1.1)', hint: 'ping 192.168.1.1 depuis le portable : le paquet traverse SW2, le câble croisé, puis SW1.', c: (h) => h.pinged('PC2', '192.168.1.1') }
      ],
      solution: [['Câblage', ['Câble droit : PC1 FastEthernet0 ↔ SW1 FastEthernet0/1', 'Câble droit : PC2 FastEthernet0 ↔ SW2 FastEthernet0/1', 'Câble croisé : SW1 GigabitEthernet0/1 ↔ SW2 GigabitEthernet0/1', 'Câble droit : R1 GigabitEthernet0/0 ↔ SW1 GigabitEthernet0/2', 'Câble console : PC1 RS232 ↔ R1 Console']],
        ['PC1', ['Bureau → Terminal']], ['PC2', ['ping 192.168.1.10', 'ping 192.168.1.1']]]
    },
    {
      id: 'svi', level: 1, time: '15 min', title: 'Administrer un switch à distance',
      desc: 'Donner une adresse IP au switch (interface VLAN 1), sa passerelle, et vérifier avec show ip interface brief.',
      devices: [{ id: 'SW1', type: 'switch', x: 320, y: 90 }, { id: 'PC1', type: 'pc', x: 320, y: 225, pc: { ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' } }],
      links: [['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0']],
      setup: { SW1: ['hostname SW1'] },
      start: 'SW1',
      cours: `## Une adresse IP pour le switch

Un switch transmet les trames sans avoir besoin d'adresse IP. Mais pour l'**administrer à distance** (Telnet, SSH) ou le **pinger**, on lui donne une adresse sur une ==interface virtuelle== : l'**interface VLAN 1** (SVI).

~~~
SW1(config)#interface vlan 1
SW1(config-if)#ip address 192.168.1.2 255.255.255.0
SW1(config-if)#no shutdown
SW1(config-if)#exit
SW1(config)#ip default-gateway 192.168.1.1
~~~

- L'interface VLAN 1 est ==éteinte par défaut== : sans **no shutdown**, elle reste « administratively down ».
- **ip default-gateway** indique au switch le routeur à utiliser pour répondre aux autres réseaux.

## Vérifier : show ip interface brief

~~~
SW1#show ip interface brief
Interface              IP-Address      OK? Method Status                Protocol
FastEthernet0/1        unassigned      YES unset  up                    up
Vlan1                  192.168.1.2     YES manual up                    up
~~~

> [!retenir] Status / Protocol
> **up / up** : tout va bien. **administratively down** : il manque **no shutdown**. **down** : pas de câble ou l'autre côté est éteint.`,
      goals: [
        { t: 'Adresse 192.168.1.2 /24 sur l\'interface VLAN 1', hint: 'interface vlan 1 → ip address 192.168.1.2 255.255.255.0', c: (h) => h.ifIp('SW1', 'Vlan1', '192.168.1.2', '255.255.255.0') },
        { t: 'Active l\'interface VLAN 1', hint: 'no shutdown (dans interface vlan 1)', c: (h) => h.ifUp('SW1', 'Vlan1') },
        { t: 'Passerelle par défaut du switch : 192.168.1.1', hint: 'En mode configuration : ip default-gateway 192.168.1.1', c: (h) => h.cfg('SW1').gateway === h.ip('192.168.1.1') },
        { t: 'Vérifie avec show ip interface brief', hint: 'end puis show ip interface brief (sh ip int br)', c: (h) => h.used('SW1', 'show ip interface brief') && h.ifUp('SW1', 'Vlan1') },
        { t: 'Depuis PC1, ping le switch', hint: 'Clique sur PC1 : ping 192.168.1.2', c: (h) => h.pinged('PC1', '192.168.1.2') },
        { t: 'Enregistre la configuration du switch', hint: 'copy running-config startup-config', c: (h) => h.ifUp('SW1', 'Vlan1') && h.saved('SW1') }
      ],
      solution: [['SW1', ['enable', 'configure terminal', 'interface vlan 1', 'ip address 192.168.1.2 255.255.255.0', 'no shutdown', 'exit', 'ip default-gateway 192.168.1.1', 'end', 'show ip interface brief', 'copy running-config startup-config', '(Entrée)']], ['PC1', ['ping 192.168.1.2']]]
    },

    /* ================= INTERMÉDIAIRE ================= */
    {
      id: 'vlan', level: 2, time: '20 min', title: 'Créer des VLAN et y placer les ports',
      desc: 'Séparer un switch en deux réseaux logiques : création de VLAN, ports access, show vlan brief.',
      devices: [{ id: 'SW1', type: 'switch', x: 320, y: 70 },
        { id: 'PC1', type: 'pc', x: 90, y: 225, pc: { ip: '192.168.1.11', mask: '255.255.255.0' } }, { id: 'PC2', type: 'pc', x: 240, y: 225, pc: { ip: '192.168.1.12', mask: '255.255.255.0' } },
        { id: 'PC3', type: 'pc', x: 400, y: 225, pc: { ip: '192.168.1.13', mask: '255.255.255.0' } }, { id: 'PC4', type: 'pc', x: 550, y: 225, pc: { ip: '192.168.1.14', mask: '255.255.255.0' } }],
      links: [['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW1', 'FastEthernet0/2', 'PC2', 'FastEthernet0'], ['SW1', 'FastEthernet0/3', 'PC3', 'FastEthernet0'], ['SW1', 'FastEthernet0/4', 'PC4', 'FastEthernet0']],
      setup: { SW1: ['hostname SW1'] },
      start: 'SW1',
      cours: `## Qu'est-ce qu'un VLAN ?

Un **VLAN** (réseau local virtuel) découpe un switch en plusieurs réseaux **isolés**, comme s'il y avait plusieurs switchs. Ici, PC1 et PC2 (administration) ne doivent plus voir PC3 et PC4 (élèves), même s'ils sont branchés sur le même switch.

## Créer les VLAN

~~~
SW1(config)#vlan 10
SW1(config-vlan)#name ADMIN
SW1(config-vlan)#vlan 20
SW1(config-vlan)#name ELEVES
~~~

## Placer les ports (mode access)

~~~
SW1(config)#interface range fa0/1 - 2
SW1(config-if-range)#switchport mode access
SW1(config-if-range)#switchport access vlan 10
SW1(config-if-range)#interface range fa0/3 - 4
SW1(config-if-range)#switchport mode access
SW1(config-if-range)#switchport access vlan 20
~~~

**interface range** configure plusieurs ports d'un coup. Un port **access** appartient à **un seul VLAN**.

## Vérifier

**show vlan brief** liste les VLAN et leurs ports. Teste ensuite : PC1 doit joindre PC2, mais plus PC3 (même si les adresses sont dans le même réseau !).

> [!retenir]
> Par défaut, tous les ports sont dans le **VLAN 1**. Deux machines dans des VLAN différents ne communiquent **pas** sans routeur.`,
      goals: [
        { t: 'Crée le VLAN 10 nommé ADMIN', hint: 'vlan 10 → name ADMIN', c: (h) => h.vlan('SW1', 10, 'ADMIN') },
        { t: 'Crée le VLAN 20 nommé ELEVES', hint: 'vlan 20 → name ELEVES', c: (h) => h.vlan('SW1', 20, 'ELEVES') },
        { t: 'Ports Fa0/1 et Fa0/2 dans le VLAN 10', hint: 'interface range fa0/1 - 2 → switchport mode access → switchport access vlan 10', c: (h) => h.access('SW1', 'FastEthernet0/1', 10) && h.access('SW1', 'FastEthernet0/2', 10) },
        { t: 'Ports Fa0/3 et Fa0/4 dans le VLAN 20', hint: 'interface range fa0/3 - 4 → switchport access vlan 20', c: (h) => h.access('SW1', 'FastEthernet0/3', 20) && h.access('SW1', 'FastEthernet0/4', 20) },
        { t: 'Vérifie avec show vlan brief', hint: 'end puis show vlan brief', c: (h) => h.used('SW1', 'show vlan brief') && h.vlan('SW1', 20) },
        { t: 'PC1 ping PC2 (même VLAN) : ça marche', hint: 'Sur PC1 : ping 192.168.1.12', c: (h) => h.pinged('PC1', '192.168.1.12') && h.access('SW1', 'FastEthernet0/1', 10) },
        { t: 'PC1 ping PC3 (autre VLAN) : ça échoue', hint: 'Sur PC1 : ping 192.168.1.13, après avoir créé les VLAN', c: (h) => h.pingFailed('PC1', '192.168.1.13') && h.access('SW1', 'FastEthernet0/3', 20) }
      ],
      solution: [['SW1', ['enable', 'configure terminal', 'vlan 10', 'name ADMIN', 'vlan 20', 'name ELEVES', 'interface range fa0/1 - 2', 'switchport mode access', 'switchport access vlan 10', 'interface range fa0/3 - 4', 'switchport mode access', 'switchport access vlan 20', 'end', 'show vlan brief']], ['PC1', ['ping 192.168.1.12', 'ping 192.168.1.13']]]
    },
    {
      id: 'routeur', level: 2, time: '20 min', title: 'Configurer un routeur et les passerelles',
      desc: 'Relier deux réseaux avec un routeur : adresses des interfaces, no shutdown, passerelle par défaut des PC.',
      devices: [{ id: 'R1', type: 'router', x: 320, y: 55 }, { id: 'SW1', type: 'switch', x: 160, y: 150 }, { id: 'SW2', type: 'switch', x: 480, y: 150 },
        { id: 'PC1', type: 'pc', x: 160, y: 250, pc: { ip: '192.168.1.10', mask: '255.255.255.0' } }, { id: 'PC2', type: 'pc', x: 480, y: 250, pc: { ip: '192.168.2.10', mask: '255.255.255.0' } }],
      links: [['R1', 'GigabitEthernet0/0', 'SW1', 'GigabitEthernet0/1'], ['R1', 'GigabitEthernet0/1', 'SW2', 'GigabitEthernet0/1'], ['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW2', 'FastEthernet0/1', 'PC2', 'FastEthernet0']],
      setup: { SW1: ['hostname SW1'], SW2: ['hostname SW2'] },
      start: 'R1',
      cours: `## Le rôle du routeur

Un switch relie les machines d'un **même réseau**. Pour passer d'un réseau à un autre (192.168.1.0/24 → 192.168.2.0/24), il faut un **routeur** : chacune de ses interfaces appartient à un réseau différent.

~~~
Router(config)#hostname R1
R1(config)#interface g0/0
R1(config-if)#ip address 192.168.1.1 255.255.255.0
R1(config-if)#no shutdown
R1(config-if)#interface g0/1
R1(config-if)#ip address 192.168.2.1 255.255.255.0
R1(config-if)#no shutdown
~~~

> [!attention] Les interfaces d'un routeur sont éteintes par défaut
> Sans **no shutdown**, elles restent « administratively down » (lien rouge sur le schéma).

## La passerelle par défaut des PC

Un PC qui veut joindre un autre réseau envoie ses paquets à sa ==passerelle par défaut== : l'adresse du routeur **dans son réseau**. PC1 → 192.168.1.1, PC2 → 192.168.2.1. Sans passerelle, le ping affiche « Défaillance générale ».

## Vérifier

- **show ip interface brief** : les deux interfaces doivent être **up / up**.
- **show ip route** : les deux réseaux apparaissent en **C** (directement connectés).
- Depuis PC1 : **ping 192.168.2.10** puis **tracert 192.168.2.10** pour voir le routeur traversé.`,
      goals: [
        { t: 'Nomme le routeur R1', hint: 'hostname R1', c: (h) => h.hostname('R1', 'R1') },
        { t: 'G0/0 : 192.168.1.1 /24 et activée', hint: 'interface g0/0 → ip address 192.168.1.1 255.255.255.0 → no shutdown', c: (h) => h.ifIp('R1', 'GigabitEthernet0/0', '192.168.1.1', '255.255.255.0') && h.ifUp('R1', 'GigabitEthernet0/0') },
        { t: 'G0/1 : 192.168.2.1 /24 et activée', hint: 'interface g0/1 → ip address 192.168.2.1 255.255.255.0 → no shutdown', c: (h) => h.ifIp('R1', 'GigabitEthernet0/1', '192.168.2.1', '255.255.255.0') && h.ifUp('R1', 'GigabitEthernet0/1') },
        { t: 'Passerelle de PC1 : 192.168.1.1', hint: 'Clique sur PC1 → Configuration IP → Passerelle', c: (h) => h.pc('PC1', null, null, '192.168.1.1') },
        { t: 'Passerelle de PC2 : 192.168.2.1', hint: 'Clique sur PC2 → Configuration IP → Passerelle', c: (h) => h.pc('PC2', null, null, '192.168.2.1') },
        { t: 'Affiche la table de routage de R1', hint: 'show ip route', c: (h) => h.used('R1', 'show ip route') && h.ifUp('R1', 'GigabitEthernet0/1') },
        { t: 'PC1 ping PC2 à travers le routeur', hint: 'Sur PC1 : ping 192.168.2.10', c: (h) => h.pinged('PC1', '192.168.2.10') }
      ],
      solution: [['R1', ['enable', 'configure terminal', 'hostname R1', 'interface g0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface g0/1', 'ip address 192.168.2.1 255.255.255.0', 'no shutdown', 'end', 'show ip route']], ['PC2', ['Passerelle : 192.168.2.1 → Enregistrer']], ['PC1', ['Passerelle : 192.168.1.1 → Enregistrer', 'ping 192.168.2.10']]]
    },
    {
      id: 'trunk', level: 2, time: '20 min', title: 'Relier deux switchs avec un trunk',
      desc: 'Faire passer plusieurs VLAN sur un seul câble entre deux switchs (802.1Q).',
      devices: [{ id: 'SW1', type: 'switch', x: 170, y: 80 }, { id: 'SW2', type: 'switch', x: 470, y: 80 },
        { id: 'PC1', type: 'pc', x: 90, y: 230, label: 'PC1 (V10)', pc: { ip: '192.168.10.11', mask: '255.255.255.0' } }, { id: 'PC2', type: 'pc', x: 250, y: 230, label: 'PC2 (V20)', pc: { ip: '192.168.20.12', mask: '255.255.255.0' } },
        { id: 'PC3', type: 'pc', x: 390, y: 230, label: 'PC3 (V10)', pc: { ip: '192.168.10.13', mask: '255.255.255.0' } }, { id: 'PC4', type: 'pc', x: 550, y: 230, label: 'PC4 (V20)', pc: { ip: '192.168.20.14', mask: '255.255.255.0' } }],
      links: [['SW1', 'GigabitEthernet0/1', 'SW2', 'GigabitEthernet0/1'], ['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW1', 'FastEthernet0/2', 'PC2', 'FastEthernet0'], ['SW2', 'FastEthernet0/1', 'PC3', 'FastEthernet0'], ['SW2', 'FastEthernet0/2', 'PC4', 'FastEthernet0']],
      setup: { SW1: ['hostname SW1', 'vlan 10', 'name ADMIN', 'vlan 20', 'name ELEVES', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'interface fa0/2', 'switchport mode access', 'switchport access vlan 20'], SW2: ['hostname SW2'] },
      start: 'SW2',
      cours: `## Le problème

SW1 est déjà configuré (VLAN 10 ADMIN sur Fa0/1, VLAN 20 ELEVES sur Fa0/2). Il faut faire la même chose sur **SW2**… puis relier les deux switchs. Un port access ne transporte qu'**un** VLAN : il faudrait un câble par VLAN !

## La solution : le trunk

Un port ==trunk== transporte **plusieurs VLAN** sur un seul câble. Chaque trame reçoit une **étiquette** (*tag*) avec le numéro de son VLAN : c'est la norme ==IEEE 802.1Q==.

~~~
SW2(config)#vlan 10
SW2(config-vlan)#name ADMIN
SW2(config-vlan)#vlan 20
SW2(config-vlan)#name ELEVES
SW2(config-vlan)#interface fa0/1
SW2(config-if)#switchport mode access
SW2(config-if)#switchport access vlan 10
SW2(config-if)#interface fa0/2
SW2(config-if)#switchport mode access
SW2(config-if)#switchport access vlan 20
SW2(config-if)#interface g0/1
SW2(config-if)#switchport mode trunk
~~~

Fais aussi **switchport mode trunk** sur **G0/1 de SW1**.

## Vérifier

- **show interfaces trunk** : le port G0/1 doit être « trunking ».
- PC1 doit joindre PC3 (VLAN 10), PC2 doit joindre PC4 (VLAN 20).

> [!attention] Les VLAN doivent exister sur les deux switchs
> Un trunk ne transporte que les VLAN créés sur le switch. Oublier **vlan 10** sur SW2 = pas de communication.`,
      goals: [
        { t: 'Sur SW2, crée les VLAN 10 (ADMIN) et 20 (ELEVES)', hint: 'vlan 10 → name ADMIN → vlan 20 → name ELEVES', c: (h) => h.vlan('SW2', 10, 'ADMIN') && h.vlan('SW2', 20, 'ELEVES') },
        { t: 'Sur SW2, Fa0/1 dans le VLAN 10 et Fa0/2 dans le VLAN 20', hint: 'interface fa0/1 → switchport access vlan 10 ; interface fa0/2 → switchport access vlan 20', c: (h) => h.access('SW2', 'FastEthernet0/1', 10) && h.access('SW2', 'FastEthernet0/2', 20) },
        { t: 'G0/1 de SW2 en trunk', hint: 'interface g0/1 → switchport mode trunk', c: (h) => h.trunk('SW2', 'GigabitEthernet0/1') },
        { t: 'G0/1 de SW1 en trunk', hint: 'Clique sur SW1 : interface g0/1 → switchport mode trunk', c: (h) => h.trunk('SW1', 'GigabitEthernet0/1') },
        { t: 'Vérifie avec show interfaces trunk', hint: 'show interfaces trunk (sh int trunk)', c: (h) => (h.used('SW1', 'show interfaces trunk') || h.used('SW2', 'show interfaces trunk')) && h.trunk('SW1', 'GigabitEthernet0/1') && h.trunk('SW2', 'GigabitEthernet0/1') },
        { t: 'PC1 ping PC3 (VLAN 10)', hint: 'Sur PC1 : ping 192.168.10.13', c: (h) => h.pinged('PC1', '192.168.10.13') },
        { t: 'PC2 ping PC4 (VLAN 20)', hint: 'Sur PC2 : ping 192.168.20.14', c: (h) => h.pinged('PC2', '192.168.20.14') }
      ],
      solution: [['SW2', ['enable', 'configure terminal', 'vlan 10', 'name ADMIN', 'vlan 20', 'name ELEVES', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'interface fa0/2', 'switchport mode access', 'switchport access vlan 20', 'interface g0/1', 'switchport mode trunk', 'end', 'show interfaces trunk']], ['SW1', ['enable', 'configure terminal', 'interface g0/1', 'switchport mode trunk', 'end']], ['PC1', ['ping 192.168.10.13']], ['PC2', ['ping 192.168.20.14']]]
    },
    {
      id: 'dhcp', level: 2, time: '20 min', title: 'Distribuer les adresses avec DHCP',
      desc: 'Transformer le routeur en serveur DHCP : adresses exclues, pool, passerelle et DNS donnés aux PC.',
      devices: [{ id: 'R1', type: 'router', x: 320, y: 55 }, { id: 'SW1', type: 'switch', x: 320, y: 145 },
        { id: 'PC1', type: 'pc', x: 160, y: 250, pc: { dhcp: true } }, { id: 'PC2', type: 'pc', x: 320, y: 250, pc: { dhcp: true } }, { id: 'PC3', type: 'pc', x: 480, y: 250, pc: { dhcp: true } }],
      links: [['R1', 'GigabitEthernet0/0', 'SW1', 'GigabitEthernet0/1'], ['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW1', 'FastEthernet0/2', 'PC2', 'FastEthernet0'], ['SW1', 'FastEthernet0/3', 'PC3', 'FastEthernet0']],
      setup: { R1: ['hostname R1'], SW1: ['hostname SW1'] },
      start: 'R1',
      cours: `## Le DHCP

Configurer chaque PC à la main est long et source d'erreurs. Un serveur ==DHCP== donne automatiquement à chaque PC : **adresse IP, masque, passerelle et DNS**, pour une durée limitée (le **bail**). Un routeur Cisco peut jouer ce rôle.

## Configuration

~~~
R1(config)#interface g0/0
R1(config-if)#ip address 192.168.10.1 255.255.255.0
R1(config-if)#no shutdown
R1(config-if)#exit
R1(config)#ip dhcp excluded-address 192.168.10.1 192.168.10.10
R1(config)#ip dhcp pool LAN
R1(dhcp-config)#network 192.168.10.0 255.255.255.0
R1(dhcp-config)#default-router 192.168.10.1
R1(dhcp-config)#dns-server 8.8.8.8
~~~

- **excluded-address** réserve des adresses qui ne seront ==jamais distribuées== (routeur, serveurs, imprimantes).
- **network** : le réseau à distribuer ; **default-router** : la passerelle donnée aux PC.

## Côté PC

Les PC sont déjà en mode **DHCP**. Dans leur invite de commandes : **ipconfig /renew** pour demander une adresse, puis **ipconfig**. Sur R1 : **show ip dhcp binding** liste les adresses attribuées.

> [!retenir] Adresse en 169.254.x.x ?
> C'est une adresse **APIPA** : le PC n'a trouvé aucun serveur DHCP (interface du routeur éteinte, pool mal configuré…).`,
      goals: [
        { t: 'G0/0 de R1 : 192.168.10.1 /24 et activée', hint: 'interface g0/0 → ip address 192.168.10.1 255.255.255.0 → no shutdown', c: (h) => h.ifIp('R1', 'GigabitEthernet0/0', '192.168.10.1', '255.255.255.0') && h.ifUp('R1', 'GigabitEthernet0/0') },
        { t: 'Exclus les adresses 192.168.10.1 à 192.168.10.10', hint: 'ip dhcp excluded-address 192.168.10.1 192.168.10.10', c: (h) => h.excluded('R1', '192.168.10.1', '192.168.10.10') },
        { t: 'Crée un pool pour 192.168.10.0 /24 avec la passerelle 192.168.10.1', hint: 'ip dhcp pool LAN → network 192.168.10.0 255.255.255.0 → default-router 192.168.10.1', c: (h) => h.pool('R1', '192.168.10.0', '255.255.255.0', '192.168.10.1') },
        { t: 'PC1 obtient une adresse du DHCP', hint: 'Sur PC1 : ipconfig /renew', c: (h) => h.dhcpOk('PC1', '192.168.10.0', '255.255.255.0') },
        { t: 'PC2 et PC3 obtiennent aussi une adresse', hint: 'ipconfig /renew sur PC2 et PC3', c: (h) => h.dhcpOk('PC2', '192.168.10.0', '255.255.255.0') && h.dhcpOk('PC3', '192.168.10.0', '255.255.255.0') },
        { t: 'Affiche les baux sur R1', hint: 'show ip dhcp binding', c: (h) => h.used('R1', 'show ip dhcp binding') && h.dhcpOk('PC1', '192.168.10.0', '255.255.255.0') },
        { t: 'PC1 ping sa passerelle 192.168.10.1', hint: 'Sur PC1 : ping 192.168.10.1', c: (h) => h.pinged('PC1', '192.168.10.1') }
      ],
      solution: [['R1', ['enable', 'configure terminal', 'interface g0/0', 'ip address 192.168.10.1 255.255.255.0', 'no shutdown', 'exit', 'ip dhcp excluded-address 192.168.10.1 192.168.10.10', 'ip dhcp pool LAN', 'network 192.168.10.0 255.255.255.0', 'default-router 192.168.10.1', 'dns-server 8.8.8.8', 'end', 'show ip dhcp binding']], ['PC1', ['ipconfig /renew', 'ping 192.168.10.1']], ['PC2', ['ipconfig /renew']], ['PC3', ['ipconfig /renew']]]
    },

    /* ================= DIFFICILE ================= */
    {
      id: 'intervlan', level: 3, time: '25 min', title: 'Routage inter-VLAN (router-on-a-stick)',
      desc: 'Faire communiquer deux VLAN avec un seul lien vers le routeur : trunk + sous-interfaces 802.1Q.',
      devices: [{ id: 'R1', type: 'router', x: 320, y: 55 }, { id: 'SW1', type: 'switch', x: 320, y: 150 },
        { id: 'PC1', type: 'pc', x: 190, y: 250, label: 'PC1 (V10)', pc: { ip: '192.168.10.11', mask: '255.255.255.0', gw: '192.168.10.1' } }, { id: 'PC2', type: 'pc', x: 450, y: 250, label: 'PC2 (V20)', pc: { ip: '192.168.20.12', mask: '255.255.255.0', gw: '192.168.20.1' } }],
      links: [['R1', 'GigabitEthernet0/0', 'SW1', 'GigabitEthernet0/1'], ['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW1', 'FastEthernet0/2', 'PC2', 'FastEthernet0']],
      setup: { R1: ['hostname R1'], SW1: ['hostname SW1', 'vlan 10', 'name ADMIN', 'vlan 20', 'name ELEVES', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 10', 'interface fa0/2', 'switchport mode access', 'switchport access vlan 20'] },
      start: 'SW1',
      cours: `## Le principe

Les VLAN sont isolés : pour qu'ils communiquent, il faut un **routeur**. Plutôt qu'un câble par VLAN, on utilise **un seul lien trunk** vers le routeur, découpé en ==sous-interfaces== : une par VLAN. C'est le « **router-on-a-stick** ».

## Côté switch : un trunk vers le routeur

~~~
SW1(config)#interface g0/1
SW1(config-if)#switchport mode trunk
~~~

## Côté routeur : les sous-interfaces

~~~
R1(config)#interface g0/0
R1(config-if)#no shutdown
R1(config-if)#interface g0/0.10
R1(config-subif)#encapsulation dot1Q 10
R1(config-subif)#ip address 192.168.10.1 255.255.255.0
R1(config-subif)#interface g0/0.20
R1(config-subif)#encapsulation dot1Q 20
R1(config-subif)#ip address 192.168.20.1 255.255.255.0
~~~

- **encapsulation dot1Q 10** : cette sous-interface traite les trames étiquetées **VLAN 10**. Elle se tape ==avant== l'adresse IP (sinon le routeur refuse).
- L'interface physique **g0/0** doit être activée (**no shutdown**), elle n'a pas d'adresse IP.
- Chaque sous-interface est la **passerelle** de son VLAN.

> [!astuce] Vérifier
> **show ip interface brief** (sur R1) : g0/0, g0/0.10 et g0/0.20 en up/up. **show ip route** : deux réseaux connectés. Puis ping de PC1 vers PC2.`,
      goals: [
        { t: 'G0/1 de SW1 en trunk', hint: 'Sur SW1 : interface g0/1 → switchport mode trunk', c: (h) => h.trunk('SW1', 'GigabitEthernet0/1') },
        { t: 'Active l\'interface physique G0/0 de R1', hint: 'interface g0/0 → no shutdown', c: (h) => h.ifUp('R1', 'GigabitEthernet0/0') },
        { t: 'Sous-interface G0/0.10 : dot1Q 10 et 192.168.10.1 /24', hint: 'interface g0/0.10 → encapsulation dot1Q 10 → ip address 192.168.10.1 255.255.255.0', c: (h) => h.cfgIf('R1', 'GigabitEthernet0/0.10').encap === 10 && h.ifIp('R1', 'GigabitEthernet0/0.10', '192.168.10.1', '255.255.255.0') },
        { t: 'Sous-interface G0/0.20 : dot1Q 20 et 192.168.20.1 /24', hint: 'interface g0/0.20 → encapsulation dot1Q 20 → ip address 192.168.20.1 255.255.255.0', c: (h) => h.cfgIf('R1', 'GigabitEthernet0/0.20').encap === 20 && h.ifIp('R1', 'GigabitEthernet0/0.20', '192.168.20.1', '255.255.255.0') },
        { t: 'PC1 (VLAN 10) ping PC2 (VLAN 20)', hint: 'Sur PC1 : ping 192.168.20.12', c: (h) => h.pinged('PC1', '192.168.20.12') },
        { t: 'Enregistre la configuration de R1 et de SW1', hint: 'copy running-config startup-config sur les deux', c: (h) => h.saved('R1') && h.saved('SW1') && h.trunk('SW1', 'GigabitEthernet0/1') && h.ifUp('R1', 'GigabitEthernet0/0') }
      ],
      solution: [['SW1', ['enable', 'configure terminal', 'interface g0/1', 'switchport mode trunk', 'end', 'copy running-config startup-config', '(Entrée)']], ['R1', ['enable', 'configure terminal', 'interface g0/0', 'no shutdown', 'interface g0/0.10', 'encapsulation dot1Q 10', 'ip address 192.168.10.1 255.255.255.0', 'interface g0/0.20', 'encapsulation dot1Q 20', 'ip address 192.168.20.1 255.255.255.0', 'end', 'copy running-config startup-config', '(Entrée)']], ['PC1', ['ping 192.168.20.12']]]
    },
    {
      id: 'statique', level: 3, time: '25 min', title: 'Routage statique entre deux sites',
      desc: 'Deux routeurs, trois réseaux : écrire les routes statiques (et une route par défaut) pour que tout communique.',
      devices: [{ id: 'R1', type: 'router', x: 200, y: 70 }, { id: 'R2', type: 'router', x: 440, y: 70 }, { id: 'SW1', type: 'switch', x: 120, y: 160 }, { id: 'SW2', type: 'switch', x: 520, y: 160 },
        { id: 'PC1', type: 'pc', x: 120, y: 255, pc: { ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' } }, { id: 'PC2', type: 'pc', x: 520, y: 255, pc: { ip: '192.168.2.10', mask: '255.255.255.0', gw: '192.168.2.1' } }],
      links: [['R1', 'GigabitEthernet0/1', 'R2', 'GigabitEthernet0/1'], ['R1', 'GigabitEthernet0/0', 'SW1', 'GigabitEthernet0/1'], ['R2', 'GigabitEthernet0/0', 'SW2', 'GigabitEthernet0/1'], ['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW2', 'FastEthernet0/1', 'PC2', 'FastEthernet0']],
      setup: {
        R1: ['hostname R1', 'interface g0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface g0/1', 'ip address 10.0.0.1 255.255.255.252', 'no shutdown'],
        R2: ['hostname R2', 'interface g0/0', 'ip address 192.168.2.1 255.255.255.0', 'no shutdown', 'interface g0/1', 'ip address 10.0.0.2 255.255.255.252', 'no shutdown'],
        SW1: ['hostname SW1'], SW2: ['hostname SW2']
      },
      start: 'R1',
      cours: `## Le problème

Le site 1 (192.168.1.0/24, derrière R1) et le site 2 (192.168.2.0/24, derrière R2) sont reliés par un petit réseau **10.0.0.0/30** (R1 = .1, R2 = .2). Toutes les interfaces sont déjà configurées… mais **R1 ne connaît pas le réseau du site 2**, et R2 ne connaît pas celui du site 1. Essaie d'abord : PC1 ping 192.168.2.10 → « Impossible de joindre l'hôte de destination ».

## La route statique

On indique au routeur : « pour aller vers **tel réseau**, passe par **ce voisin** (le prochain saut) ».

~~~
R1(config)#ip route 192.168.2.0 255.255.255.0 10.0.0.2
R2(config)#ip route 192.168.1.0 255.255.255.0 10.0.0.1
~~~

Syntaxe : **ip route** réseau-destination masque adresse-du-prochain-saut.

> [!attention] Il faut l'aller ET le retour
> Avec une route seulement sur R1, le ping part… mais la réponse ne revient pas. Chaque routeur doit savoir joindre l'autre réseau.

## La route par défaut

Quand un routeur n'a qu'une seule sortie, on peut écrire une ==route par défaut== (« tout le reste ») : **ip route 0.0.0.0 0.0.0.0 10.0.0.1**. Elle apparaît en **S*** dans **show ip route**.

## Vérifier

- **show ip route** : la route apparaît avec la lettre **S** (static).
- Depuis PC1 : **ping 192.168.2.10** puis **tracert 192.168.2.10** (on voit passer R1 puis R2).`,
      goals: [
        { t: 'Sur R1 : route vers 192.168.2.0 /24 via 10.0.0.2', hint: 'ip route 192.168.2.0 255.255.255.0 10.0.0.2', c: (h) => h.route('R1', '192.168.2.0', '255.255.255.0') },
        { t: 'Sur R2 : route vers 192.168.1.0 /24 (ou route par défaut) via 10.0.0.1', hint: 'ip route 192.168.1.0 255.255.255.0 10.0.0.1 (ou ip route 0.0.0.0 0.0.0.0 10.0.0.1)', c: (h) => h.route('R2', '192.168.1.0', '255.255.255.0') || h.route('R2', '0.0.0.0', '0.0.0.0') },
        { t: 'Affiche la table de routage de R1', hint: 'show ip route', c: (h) => h.used('R1', 'show ip route') && h.route('R1', '192.168.2.0', '255.255.255.0') },
        { t: 'PC1 ping PC2', hint: 'Sur PC1 : ping 192.168.2.10', c: (h) => h.pinged('PC1', '192.168.2.10') },
        { t: 'Trace le chemin avec tracert', hint: 'Sur PC1 : tracert 192.168.2.10', c: (h) => h.used('PC1', 'pc:tracert') && h.ok('PC1', '192.168.2.10') },
        { t: 'Enregistre R1 et R2', hint: 'copy running-config startup-config sur les deux routeurs', c: (h) => h.saved('R1') && h.saved('R2') && h.route('R1', '192.168.2.0', '255.255.255.0') }
      ],
      solution: [['R1', ['enable', 'configure terminal', 'ip route 192.168.2.0 255.255.255.0 10.0.0.2', 'end', 'show ip route', 'copy running-config startup-config', '(Entrée)']], ['R2', ['enable', 'configure terminal', 'ip route 192.168.1.0 255.255.255.0 10.0.0.1', 'end', 'copy running-config startup-config', '(Entrée)']], ['PC1', ['ping 192.168.2.10', 'tracert 192.168.2.10']]]
    },
    {
      id: 'ssh', level: 3, time: '25 min', title: 'Sécuriser l\'administration avec SSH',
      desc: 'Remplacer Telnet (en clair) par SSH (chiffré) : domaine, clés RSA, compte local, lignes vty.',
      devices: [{ id: 'R1', type: 'router', x: 320, y: 55 }, { id: 'SW1', type: 'switch', x: 320, y: 150 }, { id: 'PC1', type: 'pc', x: 320, y: 250, label: 'PC Admin', pc: { ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' } }],
      links: [['R1', 'GigabitEthernet0/0', 'SW1', 'GigabitEthernet0/1'], ['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0']],
      setup: { R1: ['interface g0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown'], SW1: ['hostname SW1'] },
      start: 'R1',
      cours: `## Pourquoi SSH ?

**Telnet** envoie tout **en clair**, y compris les mots de passe : un attaquant sur le réseau peut les lire. ==SSH== chiffre toute la session. C'est la seule méthode d'administration à distance acceptable aujourd'hui.

## Les étapes

~~~
Router(config)#hostname R1
R1(config)#ip domain-name ciel.local
R1(config)#crypto key generate rsa
How many bits in the modulus [512]: 1024
R1(config)#ip ssh version 2
R1(config)#username admin secret Ciel2026
R1(config)#line vty 0 4
R1(config-line)#login local
R1(config-line)#transport input ssh
R1(config-line)#exit
R1(config)#enable secret class
R1(config)#service password-encryption
~~~

1. Un **nom d'hôte** (autre que Router) et un **nom de domaine** : ils servent à nommer les clés.
2. Des **clés RSA** d'au moins **1024 bits** (768 minimum pour SSH v2).
3. Un **compte local** (username/secret) : **login local** demande identifiant + mot de passe.
4. **transport input ssh** : les lignes vty n'acceptent plus Telnet.

## Tester depuis le PC

Dans l'invite de commandes du PC Admin : **ssh -l admin 192.168.1.1** puis le mot de passe. Essaie aussi **telnet 192.168.1.1** : la connexion doit être **refusée**.`,
      goals: [
        { t: 'Nomme le routeur R1 et définis le domaine ciel.local', hint: 'hostname R1 puis ip domain-name ciel.local', c: (h) => h.hostname('R1', 'R1') && (h.cfg('R1').domainName || '').toLowerCase() === 'ciel.local' },
        { t: 'Génère des clés RSA de 1024 bits', hint: 'crypto key generate rsa puis 1024', c: (h) => h.cfg('R1').rsa >= 1024 },
        { t: 'Active SSH version 2', hint: 'ip ssh version 2', c: (h) => h.cfg('R1').sshVersion === 2 },
        { t: 'Crée le compte admin (avec secret)', hint: 'username admin secret Ciel2026', c: (h) => { const u = h.cfg('R1').users.admin; return !!(u && u.secret); } },
        { t: 'Lignes vty : login local et SSH uniquement', hint: 'line vty 0 4 → login local → transport input ssh', c: (h) => { const v = h.cfg('R1').lines.vty; return v.local && v.transport === 'ssh'; } },
        { t: 'Protège le mode privilégié et chiffre les mots de passe', hint: 'enable secret class et service password-encryption', c: (h) => !!h.cfg('R1').enableSecret && h.cfg('R1').servicePE },
        { t: 'Depuis le PC Admin, connecte-toi en SSH', hint: 'ssh -l admin 192.168.1.1 puis le mot de passe du compte', c: (h) => h.used('PC1', 'ssh-ok') },
        { t: 'Vérifie que Telnet est refusé', hint: 'telnet 192.168.1.1 doit répondre « Connection refused »', c: (h) => h.used('PC1', 'pc:telnet') && h.cfg('R1').lines.vty.transport === 'ssh' },
        { t: 'Enregistre la configuration', hint: 'copy running-config startup-config', c: (h) => h.saved('R1') && h.cfg('R1').sshVersion === 2 }
      ],
      solution: [['R1', ['enable', 'configure terminal', 'hostname R1', 'ip domain-name ciel.local', 'crypto key generate rsa', '1024', 'ip ssh version 2', 'username admin secret Ciel2026', 'line vty 0 4', 'login local', 'transport input ssh', 'exit', 'enable secret class', 'service password-encryption', 'end', 'copy running-config startup-config', '(Entrée)']], ['PC1', ['ssh -l admin 192.168.1.1', 'Ciel2026', 'telnet 192.168.1.1']]]
    },
    {
      id: 'acl', level: 3, time: '25 min', title: 'Filtrer le trafic avec une ACL standard',
      desc: 'Interdire à un poste d\'accéder au réseau des serveurs, sans bloquer les autres.',
      devices: [{ id: 'R1', type: 'router', x: 320, y: 60 }, { id: 'SW1', type: 'switch', x: 160, y: 150 }, { id: 'SW2', type: 'switch', x: 480, y: 150 },
        { id: 'PC1', type: 'pc', x: 90, y: 255, pc: { ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' } }, { id: 'PC2', type: 'pc', x: 230, y: 255, label: 'PC2 (interdit)', pc: { ip: '192.168.1.20', mask: '255.255.255.0', gw: '192.168.1.1' } },
        { id: 'SRV', type: 'pc', x: 480, y: 255, label: 'Serveur', pc: { ip: '192.168.2.10', mask: '255.255.255.0', gw: '192.168.2.1' } }],
      links: [['R1', 'GigabitEthernet0/0', 'SW1', 'GigabitEthernet0/1'], ['R1', 'GigabitEthernet0/1', 'SW2', 'GigabitEthernet0/1'], ['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW1', 'FastEthernet0/2', 'PC2', 'FastEthernet0'], ['SW2', 'FastEthernet0/1', 'SRV', 'FastEthernet0']],
      setup: { R1: ['hostname R1', 'interface g0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface g0/1', 'ip address 192.168.2.1 255.255.255.0', 'no shutdown'], SW1: ['hostname SW1'], SW2: ['hostname SW2'] },
      start: 'R1',
      cours: `## Qu'est-ce qu'une ACL ?

Une **ACL** (*Access Control List*) est une liste de règles **permit** (autoriser) / **deny** (refuser) qu'un routeur applique aux paquets qui traversent une interface. Une ACL ==standard== (numéros **1 à 99**) filtre uniquement selon l'**adresse source**.

## Les règles d'or

- Les lignes sont lues **dans l'ordre** : la **première** qui correspond s'applique.
- À la fin, il y a un ==deny any implicite== (invisible) : tout ce qui n'est pas autorisé est refusé. D'où le **permit any** final.
- Une ACL standard se place ==au plus près de la destination== (ici : sortie vers les serveurs).

## Configuration

~~~
R1(config)#access-list 10 deny host 192.168.1.20
R1(config)#access-list 10 permit any
R1(config)#interface g0/1
R1(config-if)#ip access-group 10 out
~~~

- **host 192.168.1.20** = une seule adresse (comme 192.168.1.20 0.0.0.0).
- Pour un réseau entier, on utilise un **masque générique** (wildcard) : **192.168.1.0 0.0.0.255**.
- **ip access-group 10 out** : l'ACL filtre les paquets qui **sortent** par g0/1.

> [!astuce] Vérifier
> **show access-lists** affiche les règles. PC1 doit toujours joindre le serveur, PC2 doit recevoir « Impossible de joindre l'hôte de destination ».`,
      goals: [
        { t: 'Écris l\'ACL 10 qui refuse l\'hôte 192.168.1.20', hint: 'access-list 10 deny host 192.168.1.20', c: (h) => h.ace('R1', 10, 'deny', '192.168.1.20', '0.0.0.0') },
        { t: 'Ajoute la règle qui autorise tout le reste', hint: 'access-list 10 permit any', c: (h) => h.ace('R1', 10, 'permit', '0.0.0.0', '255.255.255.255') },
        { t: 'Applique l\'ACL 10 en sortie de G0/1', hint: 'interface g0/1 → ip access-group 10 out', c: (h) => h.cfgIf('R1', 'GigabitEthernet0/1').aclOut === 10 },
        { t: 'Affiche les ACL', hint: 'show access-lists', c: (h) => h.used('R1', 'show access-lists') && h.ace('R1', 10, 'deny', '192.168.1.20', '0.0.0.0') },
        { t: 'PC1 joint toujours le serveur', hint: 'Sur PC1 : ping 192.168.2.10', c: (h) => h.pinged('PC1', '192.168.2.10') && h.cfgIf('R1', 'GigabitEthernet0/1').aclOut === 10 },
        { t: 'PC2 est bloqué', hint: 'Sur PC2 : ping 192.168.2.10 (après avoir appliqué l\'ACL)', c: (h) => h.pingFailed('PC2', '192.168.2.10') }
      ],
      solution: [['R1', ['enable', 'configure terminal', 'access-list 10 deny host 192.168.1.20', 'access-list 10 permit any', 'interface g0/1', 'ip access-group 10 out', 'end', 'show access-lists']], ['PC1', ['ping 192.168.2.10']], ['PC2', ['ping 192.168.2.10']]]
    },
    {
      id: 'depannage', level: 3, time: '30 min', title: 'Dépannage : répare le réseau',
      desc: 'Trois pannes cachées empêchent PC1 de joindre PC2. Trouve-les avec les commandes de diagnostic.',
      devices: [{ id: 'R1', type: 'router', x: 320, y: 55 }, { id: 'SW1', type: 'switch', x: 160, y: 150 }, { id: 'SW2', type: 'switch', x: 480, y: 150 },
        { id: 'PC1', type: 'pc', x: 160, y: 250, pc: { ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' } }, { id: 'PC2', type: 'pc', x: 480, y: 250, pc: { ip: '192.168.2.10', mask: '255.255.255.0', gw: '192.168.2.254' } }],
      links: [['R1', 'GigabitEthernet0/0', 'SW1', 'GigabitEthernet0/1'], ['R1', 'GigabitEthernet0/1', 'SW2', 'GigabitEthernet0/1'], ['SW1', 'FastEthernet0/1', 'PC1', 'FastEthernet0'], ['SW2', 'FastEthernet0/1', 'PC2', 'FastEthernet0']],
      setup: { R1: ['hostname R1', 'interface g0/0', 'ip address 192.168.1.1 255.255.255.0', 'no shutdown', 'interface g0/1', 'ip address 192.168.2.1 255.255.255.0', 'shutdown'], SW1: ['hostname SW1', 'interface fa0/1', 'switchport mode access', 'switchport access vlan 99'], SW2: ['hostname SW2'] },
      start: 'PC1',
      cours: `## La situation

Un client appelle : « **PC1 n'arrive pas à joindre PC2** ». Le réseau a été configuré par quelqu'un d'autre et contient **3 erreurs**. Ta mission : les trouver et les corriger, comme en intervention réelle.

## La méthode (du bas vers le haut)

1. **Physique** : les liens sont-ils verts sur le schéma ? Une interface est-elle éteinte ?
2. **Côté PC** : **ipconfig** — adresse, masque et **passerelle** sont-ils cohérents ?
3. **Tests progressifs** depuis PC1 : ping de **sa passerelle** (192.168.1.1), puis de l'**autre interface** du routeur (192.168.2.1), puis de **PC2**.
4. **Côté équipements** :
   - **show ip interface brief** (routeur) : une interface « administratively down » ?
   - **show vlan brief** (switch) : le port du PC est-il dans le bon VLAN ?
   - **show running-config** : tout est-il cohérent ?

> [!retenir] Ce que les messages veulent dire
> - « Délai d'attente dépassé » sur la passerelle : problème dans le **réseau local** (câble, VLAN, port).
> - Le routeur répond mais pas PC2 : problème **de l'autre côté** (interface du routeur, passerelle de PC2…).

> [!astuce] Une erreur à la fois
> Corrige une panne, reteste, puis passe à la suivante. Et note ce que tu as fait : c'est ce qu'on attend dans un **compte rendu d'intervention**.`,
      goals: [
        { t: 'Panne n°1 trouvée et corrigée (côté PC1)', hint: 'Sur SW1 : show vlan brief. Le port Fa0/1 de PC1 n\'est pas dans le même VLAN que le lien vers le routeur (VLAN 1).', c: (h) => h.access('SW1', 'FastEthernet0/1', 1) },
        { t: 'Panne n°2 trouvée et corrigée (sur le routeur)', hint: 'Sur R1 : show ip interface brief. Une interface est « administratively down » → no shutdown.', c: (h) => h.ifUp('R1', 'GigabitEthernet0/1') },
        { t: 'Panne n°3 trouvée et corrigée (côté PC2)', hint: 'Sur PC2 : ipconfig. La passerelle ne correspond pas à l\'adresse du routeur (192.168.2.1).', c: (h) => h.pc('PC2', null, null, '192.168.2.1') },
        { t: 'PC1 ping PC2 : le réseau est réparé', hint: 'Sur PC1 : ping 192.168.2.10', c: (h) => h.pinged('PC1', '192.168.2.10') }
      ],
      solution: [['SW1', ['enable', 'configure terminal', 'interface fa0/1', 'switchport access vlan 1', 'end']], ['R1', ['enable', 'configure terminal', 'interface g0/1', 'no shutdown', 'end']], ['PC2', ['Passerelle : 192.168.2.1 → Enregistrer']], ['PC1', ['ping 192.168.2.10']]]
    }
  ];

  /* Outils de vérification des objectifs (utilisés par labo.js et par les tests) */
  function labHelpers(sim) {
    const NS = global.NetSim, ip = NS.ipToInt, dev = (id) => sim.devices[id];
    return {
      ip,
      cfg: (id) => dev(id).cfg,
      cfgIf: (id, n) => dev(id).cfg.ifs[n] || {},
      used: (id, s) => !!dev(id).used[s],
      mode: (id) => dev(id).mode,
      hostname: (id, n) => dev(id).cfg.hostname === n,
      saved: (id) => sim.saved(id),
      ifIp: (id, n, a, m) => { const i = dev(id).cfg.ifs[n]; return !!i && i.ip === ip(a) && (!m || i.mask === ip(m)); },
      ifUp: (id, n) => sim.ifUp(id, n),
      pc: (id, a, m, g) => { const p = dev(id).pc; return (a == null || p.ip === ip(a)) && (m == null || p.mask === ip(m)) && (g == null || p.gw === ip(g)); },
      ok: (from, a) => sim.ping(from, ip(a)).ok,
      pinged: (from, a) => !!dev(from).pingOk[a] && sim.ping(from, ip(a)).ok,
      pingFailed: (from, a) => !!dev(from).pingFail[a] && !sim.ping(from, ip(a)).ok,
      vlan: (id, n, name) => { const v = dev(id).cfg.vlans[n]; return v != null && (!name || String(v).toUpperCase() === name.toUpperCase()); },
      access: (id, n, v) => { const i = dev(id).cfg.ifs[n]; return !!i && i.mode !== 'trunk' && i.vlan === v; },
      trunk: (id, n) => { const i = dev(id).cfg.ifs[n]; return !!i && i.mode === 'trunk'; },
      route: (id, a, m) => dev(id).cfg.routes.some((r) => r.net === ip(a) && r.mask === ip(m)),
      excluded: (id, lo, hi) => { for (let k = ip(lo); k <= ip(hi); k++) if (!dev(id).cfg.excluded.some((x) => k >= x[0] && k <= x[1])) return false; return true; },
      pool: (id, n, m, gw) => Object.keys(dev(id).cfg.pools).some((k) => { const p = dev(id).cfg.pools[k]; return p.network === ip(n) && p.mask === ip(m) && (!gw || p.router === ip(gw)); }),
      dhcpOk: (id, n, m) => { const p = dev(id).pc; return p.dhcp && p.ip != null && NS.net(p.ip, ip(m)) === ip(n); },
      /* câble Ethernet qui fonctionne entre a et b (sur le port ia de a si précisé) */
      linkUp: (a, b, ia) => sim.links.some((l) => {
        const [x, y] = l.a[0] === a ? [l.a, l.b] : [l.b, l.a];
        return x[0] === a && y[0] === b && (!ia || x[1] === ia) && sim.physUp(x[0], x[1]);
      }),
      console: (pc, d) => sim.links.some((l) => l.cable === 'console' && sim.cableOk(l) && ((l.a[0] === pc && l.b[0] === d) || (l.a[0] === d && l.b[0] === pc))),
      ace: (id, num, action, src, wild) => (dev(id).cfg.acls[num] || []).some((e) => e.action === action && e.src === ip(src) && e.wild === ip(wild))
    };
  }

  /* ---------- Défis du mode libre : on part d'un espace vide, la vérification est automatique ---------- */
  function defiTools(sim) {
    const NS = global.NetSim, ip = NS.ipToInt;
    const devs = () => sim.order.map((id) => sim.devices[id]);
    const hosts = () => devs().filter((d) => NS.isHost(d.type));
    const ofType = (t) => devs().filter((d) => d.type === t);
    const peerTypes = (id) => sim.links.filter((l) => l.cable !== 'console' && (l.a[0] === id || l.b[0] === id)).map((l) => sim.devices[l.a[0] === id ? l.b[0] : l.a[0]].type);
    const ipsOf = (d) => (NS.isHost(d.type) ? (d.pc.ip != null ? [{ ip: d.pc.ip, mask: d.pc.mask }] : []) : Object.keys(d.cfg.ifs).map((n) => d.cfg.ifs[n]).filter((i) => i.ip != null));
    const owner = (a) => devs().find((d) => ipsOf(d).some((x) => x.ip === a));
    /* pings réussis (enregistrés par l'invite de commandes ou le Message simple) et toujours valables */
    const pings = () => {
      const out = [];
      devs().forEach((d) => Object.keys(d.pingOk || {}).forEach((s) => {
        const a = ip(s), t = owner(a);
        if (a != null && t && t.id !== d.id && sim.ping(d.id, a).ok) out.push({ from: d, to: t, ip: a });
      }));
      return out;
    };
    const apipa = (d) => d.pc.ip != null && d.pc.ip >>> 16 === ((169 << 8) | 254);
    return { NS, ip, devs, hosts, ofType, peerTypes, ipsOf, owner, pings, apipa };
  }
  const DEFIS = [
    {
      id: 'reseau-local', level: 1, title: 'Mon premier réseau local',
      desc: 'Un switch, trois postes, des adresses IP et un ping qui marche.',
      goals: [
        { t: 'Pose un switch et au moins 3 PC ou portables', hint: 'Palette du bas : Switch, puis PC ou Portable. Touche l\'espace de travail pour les poser.', c: (x) => x.ofType('switch').length >= 1 && x.hosts().length >= 3 },
        { t: 'Relie chaque poste au switch (voyants verts)', hint: 'Câble droit (ou Auto) entre le port FastEthernet0 de chaque poste et un port du switch.', c: (x, sim) => x.hosts().length >= 3 && x.hosts().every((h) => sim.ifUp(h.id) && x.peerTypes(h.id).indexOf('switch') !== -1) },
        { t: 'Donne aux postes des adresses du réseau 192.168.10.0 /24', hint: 'Touche un poste → Bureau → Configuration IP : 192.168.10.1, .2, .3… avec le masque 255.255.255.0.', c: (x) => x.hosts().length >= 3 && x.hosts().every((h) => h.pc.ip != null && h.pc.mask === x.ip('255.255.255.0') && x.NS.net(h.pc.ip, h.pc.mask) === x.ip('192.168.10.0')) },
        { t: 'Réussis un ping entre deux postes', hint: 'Invite de commandes d\'un poste : ping 192.168.10.2, ou l\'enveloppe « Message simple ».', c: (x) => x.pings().some((p) => x.NS.isHost(p.from.type) && x.NS.isHost(p.to.type)) }
      ]
    },
    {
      id: 'console', level: 1, title: 'Configurer un switch neuf par la console',
      desc: 'Câble console, Terminal du PC, nom du switch et sauvegarde.',
      goals: [
        { t: 'Branche un câble console entre un PC et un switch', hint: 'Câble Console : port RS232 du PC → port Console du switch.', c: (x, sim) => sim.links.some((l) => l.cable === 'console' && sim.cableOk(l) && [sim.devices[l.a[0]].type, sim.devices[l.b[0]].type].indexOf('switch') !== -1) },
        { t: 'Ouvre le Terminal du PC', hint: 'Touche le PC → Bureau → Terminal.', c: (x) => x.hosts().some((h) => h.used && h.used.terminal) },
        { t: 'Donne un nom au switch (hostname)', hint: 'enable → configure terminal → hostname SW-CIEL', c: (x) => x.ofType('switch').some((s) => s.cfg.hostname !== 'Switch') },
        { t: 'Enregistre la configuration du switch', hint: 'end puis copy running-config startup-config (et Entrée).', c: (x, sim) => x.ofType('switch').some((s) => s.cfg.hostname !== 'Switch' && sim.saved(s.id)) }
      ]
    },
    {
      id: 'site-web', level: 2, title: 'Le site web de la classe',
      desc: 'Un serveur web, un nom DNS et un navigateur qui affiche la page.',
      goals: [
        { t: 'Ajoute un serveur avec une adresse IP, relié au réseau', hint: 'Pose un Serveur, câble-le au switch, puis Config → adresse IP (par exemple 192.168.10.100 /24).', c: (x, sim) => x.ofType('server').some((s) => s.pc.ip != null && sim.ifUp(s.id)) },
        { t: 'Dans le service DNS du serveur, crée le nom www.ciel.lan', hint: 'Serveur → Services → DNS : On, nom www.ciel.lan, adresse = celle du serveur web.', c: (x) => x.ofType('server').some((s) => s.services.dns.on && s.services.dns.records.some((r) => r.name.toLowerCase() === 'www.ciel.lan' && x.owner(r.ip) && x.owner(r.ip).type === 'server')) },
        { t: 'Indique ce serveur DNS dans la configuration IP d\'un PC', hint: 'PC → Bureau → Configuration IP → Serveur DNS = adresse du serveur.', c: (x) => x.hosts().some((h) => h.type !== 'server' && h.pc.dns != null && x.ofType('server').some((s) => s.pc.ip === h.pc.dns && s.services.dns.on)) },
        { t: 'Ouvre http://www.ciel.lan dans le navigateur d\'un PC', hint: 'PC → Bureau → Navigateur web → www.ciel.lan → Aller.', c: (x, sim) => x.hosts().some((h) => h.type !== 'server' && h.used && h.used['web-ok'] && sim.browse(h.id, 'www.ciel.lan').ok) }
      ]
    },
    {
      id: 'dhcp-auto', level: 2, title: 'Des adresses automatiques avec DHCP',
      desc: 'Un serveur DHCP distribue les adresses : plus besoin de les taper.',
      goals: [
        { t: 'Active un service DHCP (sur un serveur ou un routeur)', hint: 'Serveur → Services → DHCP : On, adresse de départ, masque, puis Enregistrer. Le serveur doit avoir une adresse fixe dans ce réseau.', c: (x) => x.ofType('server').some((s) => s.services.dhcp.on && s.services.dhcp.start != null && s.pc.ip != null) || x.ofType('router').some((r) => Object.keys(r.cfg.pools).length > 0) },
        { t: 'Au moins 3 postes reçoivent une adresse en DHCP', hint: 'Sur chaque poste : Configuration IP → DHCP. Une adresse en 169.254.x.x veut dire « pas de réponse du serveur ».', c: (x) => x.hosts().filter((h) => h.pc.dhcp && h.pc.ip != null && !x.apipa(h)).length >= 3 },
        { t: 'Ping réussi entre deux postes en DHCP', hint: 'ipconfig pour lire l\'adresse reçue, puis ping vers un autre poste.', c: (x) => x.pings().some((p) => p.from.pc && p.from.pc.dhcp && p.to.pc && p.to.pc.dhcp) }
      ]
    },
    {
      id: 'deux-reseaux', level: 3, title: 'Deux réseaux reliés par un routeur',
      desc: 'Deux switchs, deux réseaux IP, un routeur et des passerelles bien réglées.',
      goals: [
        { t: 'Un routeur relié à au moins deux switchs', hint: 'Câble droit entre GigabitEthernet0/0 du routeur et un switch, puis GigabitEthernet0/1 et un autre switch.', c: (x) => x.ofType('router').some((r) => x.peerTypes(r.id).filter((t) => t === 'switch').length >= 2) },
        { t: 'Deux interfaces du routeur allumées, dans deux réseaux différents', hint: 'CLI du routeur : interface g0/0 → ip address 192.168.1.1 255.255.255.0 → no shutdown ; même chose pour g0/1 en 192.168.2.1.', c: (x, sim) => x.ofType('router').some((r) => { const nets = Object.keys(r.cfg.ifs).filter((n) => r.cfg.ifs[n].ip != null && sim.ifUp(r.id, n)).map((n) => x.NS.net(r.cfg.ifs[n].ip, r.cfg.ifs[n].mask)); return new Set(nets).size >= 2; }) },
        { t: 'Chaque poste a pour passerelle l\'adresse du routeur de son réseau', hint: 'Configuration IP → Passerelle = adresse de l\'interface du routeur dans le même réseau.', c: (x) => { const gws = x.ofType('router').flatMap((r) => x.ipsOf(r)); const hs = x.hosts(); return hs.length >= 2 && hs.every((h) => h.pc.ip != null && gws.some((g) => g.ip === h.pc.gw && x.NS.same(h.pc.ip, g.ip, h.pc.mask))) && new Set(hs.map((h) => x.NS.net(h.pc.ip, h.pc.mask))).size >= 2; } },
        { t: 'Ping réussi entre deux postes de réseaux différents', hint: 'Depuis un poste du réseau 1 : ping vers un poste du réseau 2.', c: (x) => x.pings().some((p) => x.NS.isHost(p.from.type) && x.NS.isHost(p.to.type) && !x.NS.same(p.from.pc.ip, p.to.pc.ip, p.from.pc.mask)) }
      ]
    }
  ];
  function checkDefi(defi, sim) {
    const x = defiTools(sim);
    return defi.goals.map((g) => { try { return !!g.c(x, sim); } catch (e) { return false; } });
  }

  global.DEFIS = DEFIS;
  global.checkDefi = checkDefi;
  global.LABS = LABS;
  global.LAB_LEVELS = LEVELS;
  global.labHelpers = labHelpers;
})(window);
