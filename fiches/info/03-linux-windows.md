---
id: info-systemes
matiere: info
titre: Systèmes d'exploitation : Linux et Windows
chapitre: Informatique — Systèmes
resume: Rôle d'un OS, arborescence Linux, commandes indispensables, droits rwx et chmod, outils et commandes Windows, systèmes de fichiers.
mots-cles: système d'exploitation, Linux, Debian, Ubuntu, Windows, arborescence, terminal, commandes, ls, cd, sudo, apt, chmod, droits, rwx, 755, root, PowerShell, cmd, NTFS, ext4, FAT32, exFAT
ordre: 3
---

## Le rôle du système d'exploitation (OS)

Il fait le lien entre le **matériel** et les **applications** : il gère le processeur, la mémoire, les fichiers, les périphériques, les **utilisateurs** et leurs **droits**, et fournit une interface graphique (GUI) ou en ligne de commande (CLI).

- ==Windows== (Microsoft, propriétaire) : postes de travail, Windows Server.
- ==Linux== (libre, open source) : en **distributions** (Debian, Ubuntu, Fedora, Mint…) ; très utilisé sur les **serveurs** et les objets connectés. Android repose sur un noyau Linux.

## L'arborescence Linux

| Dossier | Contenu |
|---|---|
| `/` | la **racine** de tout le système |
| `/home` | dossiers personnels des utilisateurs (`/home/eleve`) |
| `/root` | dossier de l'administrateur root |
| `/etc` | fichiers de **configuration** |
| `/var/log` | **journaux** du système |
| `/bin`, `/usr/bin` | programmes (commandes) |
| `/dev` | périphériques (disques, ports) |
| `/tmp` | fichiers temporaires |

Chemin **absolu** : depuis la racine (`/home/eleve/tp/note.txt`). Chemin **relatif** : depuis le dossier courant (`tp/note.txt`, `..` = dossier parent, `~` = mon dossier personnel).

## Les commandes Linux indispensables

| Commande | Action |
|---|---|
| `pwd` | afficher le dossier courant |
| `ls -l` | lister le contenu (détails et droits) |
| `cd dossier` | changer de dossier |
| `mkdir tp` | créer un dossier |
| `touch f.txt` | créer un fichier vide |
| `cp source dest` / `mv source dest` | copier / déplacer ou renommer |
| `rm f.txt` / `rm -r dossier` | supprimer (définitivement !) |
| `cat f.txt` / `nano f.txt` | afficher / modifier un fichier |
| `sudo commande` | exécuter en administrateur |
| `sudo apt update` puis `sudo apt upgrade` | mettre à jour le système (Debian, Ubuntu) |
| `sudo apt install paquet` | installer un logiciel |
| `systemctl status ssh` | état d'un service (start, stop, restart) |
| `ps aux` / `top` | voir les processus |
| `df -h` / `free -h` | espace disque / mémoire |
| `man commande` | afficher l'aide |

## Les droits sous Linux

`ls -l` affiche par exemple : `-rwxr-xr-x 1 eleve profs 2048 script.sh`

- 3 groupes de droits : ==propriétaire== (u), ==groupe== (g), ==autres== (o).
- 3 droits : **r** lecture (4), **w** écriture (2), **x** exécution (1).

> [!formule] chmod en notation octale
> 7 = rwx (4+2+1) · 6 = rw- · 5 = r-x · 4 = r--
> `chmod 755 script.sh` → rwxr-xr-x · `chmod 644 note.txt` → rw-r--r--
> `chmod u+x script.sh` → ajoute l'exécution au propriétaire

L'utilisateur ==root== a tous les droits : on l'utilise le moins possible (via `sudo`).

## Windows en pratique

- **Outils** : Gestionnaire des tâches (**Ctrl + Maj + Échap**), Services (`services.msc`), Observateur d'événements (`eventvwr`), Gestion des disques (`diskmgmt.msc`), Gestion de l'ordinateur (`compmgmt.msc`).
- **Invite de commandes (cmd)** : `dir`, `cd`, `mkdir`, `copy`, `del`, `cls`, `ipconfig`, `ping`, `tasklist`, `systeminfo`, `hostname`, `whoami`.
- **PowerShell** : `Get-ChildItem`, `Get-Process`, `Get-Service`, `Restart-Service`, `Get-NetIPAddress`.
- Comptes **administrateur** et **standard** ; le contrôle de compte d'utilisateur (UAC) demande une confirmation pour les actions sensibles.

## Les systèmes de fichiers

| Système | Utilisation |
|---|---|
| ==NTFS== | disques Windows (droits, gros fichiers) |
| FAT32 | très compatible, mais fichiers de **4 Go maximum** |
| ==exFAT== | clés USB et disques externes (gros fichiers, compatible Windows/macOS) |
| ==ext4== | disques Linux |

> [!retenir]
> Linux : `/etc` = configuration, `/home` = utilisateurs, `/var/log` = journaux. Droits rwx = 4, 2, 1 → `chmod 755`. Windows : NTFS, Gestionnaire des tâches, services.msc, PowerShell.

=== EXERCICES ===
# paires : Associe chaque commande Linux à son action
- pwd = Afficher le dossier courant
- ls -l = Lister avec les droits
- mkdir = Créer un dossier
- rm = Supprimer
- sudo = Exécuter en administrateur
- chmod = Modifier les droits

# calcul : Droits Linux en notation octale
? rwxr-xr-x en octal ?
= 755
? rw-r--r-- en octal ?
= 644
? rw-r----- en octal ?
= 640
? rwx------ en octal ?
= 700

=== CARTES ===
Q: Quel dossier Linux contient les fichiers de configuration ?
R: **/etc**

Q: Où sont les journaux (logs) sous Linux ?
R: Dans **/var/log**

Q: Commande pour afficher le dossier courant ?
R: **pwd**

Q: Commande pour lister avec les droits ?
R: **ls -l**

Q: Comment mettre à jour un système Debian ou Ubuntu ?
R: **sudo apt update** puis **sudo apt upgrade**

Q: Valeurs des droits r, w, x ?
R: r = **4**, w = **2**, x = **1**.

Q: Que donne chmod 755 ?
R: **rwxr-xr-x** : tout pour le propriétaire, lecture et exécution pour les autres.

Q: Que donne chmod 644 ?
R: **rw-r--r--** : lecture-écriture pour le propriétaire, lecture seule pour les autres.

Q: Qui est root sous Linux ?
R: Le **super-utilisateur** (administrateur), qui a tous les droits.

Q: Raccourci du Gestionnaire des tâches sous Windows ?
R: **Ctrl + Maj + Échap**

Q: Limite de taille d'un fichier en FAT32 ?
R: **4 Go**.

=== QUIZ ===
? Quelle commande crée un dossier « tp » ?
- touch tp
+ mkdir tp
- cd tp
! mkdir = make directory.

? « -rw-r----- » correspond à…
- 755
+ 640
- 644
! rw- = 6, r-- = 4, --- = 0.

? Pour rendre un script exécutable par son propriétaire :
+ chmod u+x script.sh
- chmod -r script.sh
- sudo script.sh
! u+x ajoute le droit d'exécution au propriétaire (user).

? Quel système de fichiers choisir pour une clé USB qui doit contenir un fichier de 8 Go, lisible sous Windows et macOS ?
- FAT32
+ exFAT
- ext4
! FAT32 est limité à 4 Go par fichier ; ext4 n'est pas lu nativement par Windows.

? Quelle commande Windows affiche la liste des processus en ligne de commande ?
- ipconfig
+ tasklist
- whoami
! tasklist liste les processus (Get-Process en PowerShell).

? Que fait « cd .. » ?
+ Remonte au dossier parent
- Va à la racine
- Supprime le dossier
! « .. » désigne le dossier parent.
