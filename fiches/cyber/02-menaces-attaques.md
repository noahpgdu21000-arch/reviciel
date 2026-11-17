---
id: cyber-menaces
matiere: cyber
titre: Les menaces et les attaques
chapitre: Cybersécurité — Menaces
resume: Les familles de logiciels malveillants, l'ingénierie sociale et le phishing, les attaques sur les mots de passe, le réseau et le web.
mots-cles: malware, virus, ver, cheval de Troie, rançongiciel, ransomware, spyware, keylogger, botnet, phishing, hameçonnage, ingénierie sociale, force brute, DDoS, MITM, injection SQL, XSS
ordre: 2
---

## Les logiciels malveillants (malwares)

| Nom | Ce qu'il fait |
|---|---|
| ==Virus== | s'attache à un fichier ou programme et se propage quand on l'**exécute** |
| ==Ver== (worm) | se propage **tout seul** par le réseau, sans action de l'utilisateur |
| ==Cheval de Troie== (trojan) | programme d'apparence normale qui cache une fonction malveillante (souvent une porte dérobée) |
| ==Rançongiciel== (ransomware) | **chiffre les fichiers** et réclame une rançon pour les rendre |
| Logiciel espion (spyware) | espionne l'utilisateur et envoie ses données |
| ==Enregistreur de frappe== (keylogger) | enregistre tout ce qui est tapé au clavier (mots de passe !) |
| Rootkit | se cache au cœur du système pour rester invisible |
| ==Botnet== | réseau de machines infectées (« zombies ») pilotées à distance, par exemple pour un DDoS |

## L'ingénierie sociale

> [!definition] Ingénierie sociale
> Manipuler une **personne** (et non la machine) pour qu'elle donne une information ou fasse une action : c'est le maillon faible le plus exploité.

- ==Hameçonnage (phishing)== : faux e-mail imitant une banque, un service connu ou l'administration pour voler des identifiants. **Spear phishing** : version ciblée et personnalisée.
- **Smishing** (par SMS), **vishing** (par téléphone), **quishing** (par QR code).
- **Faux support technique** : fausse alerte « virus détecté, appelez ce numéro ».
- **Arnaque au président** (FOVI) : un faux dirigeant ordonne un virement urgent et confidentiel.
- **Clé USB piégée** abandonnée exprès, pour qu'on la branche par curiosité.

> [!attention] Repérer un e-mail d'hameçonnage
> - Adresse de l'expéditeur bizarre (`service@banque-securite-verif.com`).
> - Ton **urgent ou menaçant** (« votre compte sera supprimé sous 24 h »).
> - **Lien** dont la vraie adresse (visible en survolant) ne correspond pas au site officiel.
> - Demande de **mot de passe** ou de coordonnées bancaires (un vrai service ne le fait jamais).
> - Pièce jointe inattendue (.zip, .exe, document avec macros), fautes d'orthographe.
> Réflexes : ne pas cliquer, vérifier par un autre moyen, signaler (signal-spam.fr, le **33700** pour les SMS).

## Les attaques sur les mots de passe

- ==Force brute== : essayer toutes les combinaisons possibles (d'où l'intérêt des mots de passe **longs**).
- **Attaque par dictionnaire** : essayer des mots de passe courants (123456, azerty, motdepasse…).
- ==Credential stuffing== : réutiliser des identifiants volés sur un site pour se connecter à d'autres (d'où l'importance d'un mot de passe **unique** par service).

## Les attaques réseau et web

- ==DDoS== (déni de service distribué) : des milliers de machines (un botnet) saturent un service pour le rendre indisponible.
- ==Homme du milieu (MITM)== : l'attaquant s'intercale entre deux machines pour lire ou modifier les échanges (faux Wi-Fi public, usurpation ARP).
- **Usurpation (spoofing)** : se faire passer pour une autre adresse IP, MAC ou e-mail.
- ==Injection SQL== : du code SQL glissé dans un formulaire pour lire ou modifier la base de données.
- **XSS** (cross-site scripting) : du code JavaScript malveillant injecté dans une page web vue par d'autres utilisateurs.

> [!retenir]
> Ver = se propage seul ; virus = besoin qu'on l'exécute ; rançongiciel = chiffre et demande une rançon. Le phishing vise l'**humain**. DDoS → disponibilité ; MITM → confidentialité et intégrité.

=== CARTES ===
Q: Différence entre un virus et un ver ?
R: Le **virus** a besoin d'être exécuté (attaché à un fichier) ; le **ver** se propage **tout seul** par le réseau.

Q: Qu'est-ce qu'un rançongiciel ?
R: Un malware qui **chiffre les fichiers** et réclame une **rançon**.

Q: Qu'est-ce qu'un cheval de Troie ?
R: Un programme d'apparence **légitime** qui cache une fonction malveillante.

Q: Qu'est-ce qu'un keylogger ?
R: Un **enregistreur de frappe** : il capture tout ce qui est tapé au clavier.

Q: Qu'est-ce qu'un botnet ?
R: Un **réseau de machines infectées** contrôlées à distance par un attaquant.

Q: Qu'est-ce que l'ingénierie sociale ?
R: La **manipulation d'une personne** pour obtenir une information ou une action.

Q: Qu'est-ce que le phishing ?
R: L'**hameçonnage** : un faux message imitant un service connu pour voler des identifiants.

Q: Qu'est-ce qu'une attaque par force brute ?
R: Essayer **toutes les combinaisons** possibles d'un mot de passe.

Q: Qu'est-ce qu'une attaque DDoS ?
R: Un **déni de service distribué** : saturer un service avec un très grand nombre de requêtes.

Q: Qu'est-ce qu'une attaque de l'homme du milieu ?
R: L'attaquant **s'intercale** entre deux machines pour intercepter ou modifier les échanges.

=== QUIZ ===
? Un e-mail « urgent » de ta banque demande de confirmer ton mot de passe via un lien. Que fais-tu ?
- Tu cliques vite pour éviter la suspension
+ Tu ne cliques pas et tu signales le message
- Tu réponds en donnant ton mot de passe
! Une banque ne demande jamais un mot de passe par e-mail : c'est du phishing.

? Quel malware se propage sur le réseau sans aucune action de l'utilisateur ?
- Un cheval de Troie
+ Un ver
- Un adware
! Le ver exploite des failles pour se copier de machine en machine.

? Tous les fichiers d'un serveur deviennent illisibles et une rançon est demandée. C'est…
+ un rançongiciel
- un keylogger
- un DDoS
! Le rançongiciel chiffre les données et exige un paiement.

? Pourquoi un mot de passe unique par site est-il important ?
- Pour aller plus vite
+ Pour se protéger du credential stuffing
- Parce que la loi l'impose
! Si un site se fait voler ses mots de passe, les attaquants les essaient partout ailleurs.

? Un formulaire web accepte « ' OR 1=1 -- » et affiche toute la base. Quelle attaque ?
- XSS
+ Injection SQL
- Phishing
! Du code SQL a été injecté dans le champ du formulaire.

? Une clé USB trouvée sur le parking doit être…
- branchée pour retrouver son propriétaire
+ remise au service informatique sans la brancher
- formatée sur son PC personnel
! Une clé abandonnée peut être piégée : on ne la branche jamais.
