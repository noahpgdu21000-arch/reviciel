---
id: info-architecture
matiere: info
titre: L'architecture d'un ordinateur
chapitre: Informatique — Matériel
resume: Les composants d'un PC (carte mère, processeur, RAM, stockage, alimentation), le démarrage UEFI, et la virtualisation.
mots-cles: architecture, von Neumann, carte mère, processeur, CPU, cœur, fréquence, cache, RAM, mémoire vive, SSD, NVMe, HDD, carte graphique, alimentation, BIOS, UEFI, POST, démarrage, virtualisation, hyperviseur, machine virtuelle
ordre: 2
---

## Le modèle de von Neumann

Presque tous les ordinateurs suivent l'architecture de **von Neumann** : un **processeur** (unité de calcul + unité de contrôle), une **mémoire** qui contient les programmes **et** les données, des **entrées/sorties**, reliés par des **bus**.

## Les composants d'un PC

| Composant | Rôle | À retenir |
|---|---|---|
| ==Carte mère== | relie tous les composants | socket du processeur, emplacements RAM, ports PCIe, chipset |
| ==Processeur (CPU)== | exécute les instructions | nombre de **cœurs**, fréquence en **GHz**, mémoire **cache** |
| ==Mémoire vive (RAM)== | stocke les programmes en cours | ==volatile== : effacée sans courant ; DDR4, DDR5 ; en Go |
| ==Stockage== | conserve les données | **non volatile** : HDD (mécanique, lent), SSD SATA (≈ 550 Mo/s), ==SSD NVMe M.2== (plusieurs Go/s) |
| Carte graphique (GPU) | calcule l'affichage | intégrée au processeur ou dédiée |
| ==Alimentation (PSU)== | convertit le 230 V alternatif en tensions continues (12 V, 5 V, 3,3 V) | puissance en **W**, label 80 PLUS (rendement) |
| Refroidissement | évacue la chaleur | ventirad + **pâte thermique**, watercooling |

> [!info] La hiérarchie des mémoires
> Des plus rapides (et petites) aux plus lentes (et grandes) : registres → cache → RAM → SSD → disque dur. Plus de RAM = plus de programmes ouverts sans ralentissement.

## Les périphériques et la connectique

- **Entrée** : clavier, souris, micro, scanner. **Sortie** : écran, imprimante, haut-parleurs. **Entrée-sortie** : écran tactile, clé USB, carte réseau.
- Ports : USB-A, ==USB-C==, HDMI, DisplayPort, RJ45 (réseau), jack audio ; en interne : SATA, M.2, PCIe.

## Le démarrage d'un PC

1. Mise sous tension : l'alimentation fournit les tensions.
2. Le firmware ==UEFI== (successeur du BIOS) lance le ==POST== : test du matériel (bips ou voyants en cas d'erreur).
3. L'UEFI cherche un **périphérique de démarrage** (ordre de boot) et lance le **chargeur d'amorçage** (Windows Boot Manager, GRUB).
4. Le **noyau** du système d'exploitation se charge, puis la session utilisateur.

Dans l'UEFI, on règle l'ordre de démarrage, l'heure, la virtualisation, le **Secure Boot** (n'accepte que des chargeurs signés).

## La virtualisation

Une ==machine virtuelle (VM)== est un ordinateur simulé par un logiciel, l'==hyperviseur==, qui partage les ressources (CPU, RAM, disque) d'une machine physique.

| Hyperviseur | Fonctionnement | Exemples |
|---|---|---|
| ==Type 1== (bare metal) | installé **directement sur le matériel** : serveurs | VMware ESXi, Proxmox, Hyper-V |
| ==Type 2== | installé **sur un système d'exploitation** : tests, formation | VirtualBox, VMware Workstation |

Avantages : plusieurs serveurs sur une seule machine, tests sans risque, **instantanés** (snapshots) pour revenir en arrière. Les ==conteneurs== (Docker) sont encore plus légers : ils partagent le noyau du système hôte.

> [!attention] Avant d'ouvrir un PC
> Éteindre et **débrancher** l'alimentation, se décharger de l'électricité statique (**bracelet antistatique** relié à la masse), manipuler les cartes par les bords.

> [!retenir]
> CPU = calcule · RAM = mémoire de travail **volatile** · SSD/HDD = stockage **permanent** · UEFI + POST au démarrage · hyperviseur type 1 = sur le matériel, type 2 = sur un OS.

=== CARTES ===
Q: Rôle de la carte mère ?
R: **Relier** tous les composants entre eux (processeur, RAM, stockage, cartes d'extension).

Q: Que signifie « la RAM est volatile » ?
R: Elle **perd son contenu** quand l'ordinateur est éteint.

Q: Différence entre RAM et stockage ?
R: La **RAM** contient les programmes en cours (rapide, volatile) ; le **stockage** conserve les données de façon permanente.

Q: Avantage d'un SSD NVMe par rapport à un disque dur ?
R: Il est **beaucoup plus rapide** (plusieurs Go/s), silencieux et sans pièce mécanique.

Q: Rôle de l'alimentation d'un PC ?
R: Convertir le **230 V alternatif** en **tensions continues** (12 V, 5 V, 3,3 V).

Q: Qu'est-ce que le POST ?
R: Le **test automatique du matériel** au démarrage (Power-On Self-Test).

Q: Qu'est-ce que l'UEFI ?
R: Le **micrologiciel** de la carte mère qui démarre le PC (successeur du BIOS).

Q: Qu'est-ce qu'un hyperviseur ?
R: Le logiciel qui **crée et fait fonctionner des machines virtuelles**.

Q: Différence entre hyperviseur de type 1 et de type 2 ?
R: **Type 1** : directement sur le matériel (ESXi, Proxmox) ; **type 2** : sur un système d'exploitation (VirtualBox).

Q: À quoi sert la pâte thermique ?
R: À **améliorer le transfert de chaleur** entre le processeur et le radiateur.

=== QUIZ ===
? Quel composant perd ses données à l'extinction du PC ?
+ La RAM
- Le SSD
- Le disque dur
! La mémoire vive est volatile.

? Un PC ralentit dès qu'on ouvre plusieurs logiciels. Quelle amélioration est la plus pertinente ?
- Changer la souris
+ Ajouter de la RAM
- Changer l'écran
! Avec plus de mémoire vive, le système n'a pas à utiliser le disque comme mémoire de secours.

? Proxmox installé directement sur un serveur est un hyperviseur…
+ de type 1
- de type 2
- de type 3
! Il s'installe directement sur le matériel (bare metal).

? Le PC émet des bips au démarrage et n'affiche rien. Quelle étape a détecté un problème ?
- Le chargement de Windows
+ Le POST
- La session utilisateur
! Le POST teste le matériel ; les bips signalent souvent un problème de RAM ou de carte graphique.

? Quel stockage est le plus rapide ?
- Disque dur 7 200 tr/min
- SSD SATA
+ SSD NVMe M.2
! Le NVMe utilise le bus PCIe : plusieurs Go/s.
