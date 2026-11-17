---
id: cyber-bonnes-pratiques
matiere: cyber
titre: Hygiène numérique et bonnes pratiques
chapitre: Cybersécurité — Se protéger
resume: Mots de passe, double authentification, mises à jour, sauvegardes 3-2-1, moindre privilège, et la conduite à tenir face à un incident.
mots-cles: mot de passe, phrase de passe, gestionnaire de mots de passe, MFA, double authentification, 2FA, mises à jour, sauvegarde, 3-2-1, moindre privilège, verrouillage, chiffrement, incident, rançongiciel, ANSSI
ordre: 3
---

## Les mots de passe

- ==Long== avant tout : au moins **12 caractères** mélangeant majuscules, minuscules, chiffres et symboles, ou une ==phrase de passe== de plusieurs mots (`Cable-Rouge-Switch-Cerise-42`).
- ==Unique== pour chaque service : une fuite sur un site ne compromet pas les autres.
- Stockés dans un ==gestionnaire de mots de passe== (comme KeePass ou KeePassXC) protégé par un mot de passe maître solide.
- Jamais partagés, jamais notés sur un post-it, changés immédiatement en cas de fuite.

## La double authentification (MFA / 2FA)

Elle combine **au moins deux facteurs** de nature différente :

1. ce que je ==sais== : mot de passe, code PIN ;
2. ce que je ==possède== : téléphone (application d'authentification, SMS), clé de sécurité ;
3. ce que je ==suis== : empreinte digitale, visage.

Même si le mot de passe est volé, l'attaquant est bloqué sans le second facteur. **À activer en priorité** sur la messagerie et les comptes importants.

## Les mises à jour

Les mises à jour corrigent des ==failles de sécurité== connues. On met à jour le système, les logiciels, le navigateur, l'antivirus, et le **firmware** des équipements (box, switchs, caméras). Un système qui n'est plus mis à jour par son éditeur doit être remplacé.

## Les sauvegardes : la règle 3-2-1

> [!retenir] Règle 3-2-1
> **3** copies des données, sur **2** supports différents, dont **1** copie **hors site** (et idéalement **hors ligne**, débranchée, pour résister à un rançongiciel).

Il faut aussi **tester la restauration** : une sauvegarde qu'on ne sait pas restaurer ne sert à rien.

## Les bons réflexes au quotidien

- Principe du ==moindre privilège== : un compte **utilisateur standard** au quotidien, un compte **administrateur** séparé pour l'administration.
- ==Verrouiller sa session== dès qu'on s'absente : touches **Windows + L**.
- Antivirus (ou EDR) et pare-feu **activés**.
- Télécharger uniquement depuis les **sites officiels** ou les magasins d'applications.
- ==Chiffrer== les disques des ordinateurs portables (BitLocker, LUKS) et des clés USB.
- Sur un **Wi-Fi public** : éviter les opérations sensibles, préférer le partage de connexion de son téléphone ou un VPN.
- Séparer les usages **professionnels** et **personnels**.

> [!info] Guide d'hygiène informatique
> L'ANSSI publie un guide de **42 mesures** pour sécuriser un système d'information : une référence pour les entreprises.

## Que faire en cas d'incident (ex. rançongiciel) ?

1. ==Isoler== la machine : débrancher le câble réseau, couper le Wi-Fi (**sans l'éteindre** si possible, pour conserver les traces).
2. **Prévenir** immédiatement le responsable informatique ou le support.
3. **Ne pas payer** la rançon (rien ne garantit la récupération des données).
4. Conserver les **preuves** et **porter plainte**.
5. **Restaurer** depuis une sauvegarde saine après avoir éliminé la menace, puis changer les mots de passe.

> [!retenir]
> Mot de passe long et unique + gestionnaire + MFA. Mises à jour. Sauvegardes 3-2-1. Moindre privilège. En cas d'attaque : isoler, prévenir, ne pas payer, porter plainte.

=== CARTES ===
Q: Longueur minimale conseillée pour un mot de passe ?
R: Au moins **12 caractères** (ou une phrase de passe de plusieurs mots).

Q: Pourquoi utiliser un mot de passe différent par service ?
R: Pour qu'une **fuite sur un site** ne donne pas accès à tous les autres comptes.

Q: Quels sont les 3 types de facteurs d'authentification ?
R: Ce que je **sais**, ce que je **possède**, ce que je **suis**.

Q: Que dit la règle de sauvegarde 3-2-1 ?
R: **3** copies, sur **2** supports différents, dont **1** hors site (idéalement hors ligne).

Q: Qu'est-ce que le principe du moindre privilège ?
R: Ne donner que les **droits strictement nécessaires** (compte utilisateur standard au quotidien).

Q: Raccourci pour verrouiller sa session Windows ?
R: **Windows + L**

Q: Premier réflexe face à un rançongiciel ?
R: **Isoler** la machine du réseau (câble, Wi-Fi), puis prévenir le responsable.

Q: Faut-il payer la rançon ?
R: **Non** : rien ne garantit la récupération des données et cela finance les criminels.

Q: Pourquoi les mises à jour sont-elles importantes ?
R: Elles **corrigent des failles de sécurité** connues et exploitées par les attaquants.

=== QUIZ ===
? Lequel est le meilleur mot de passe ?
- azerty123
- Julien2008
+ Cable-Rouge-Switch-Cerise-42
! Long, sans lien avec toi, avec des mots aléatoires : c'est une bonne phrase de passe.

? Ton mot de passe a fuité, mais la double authentification est activée. Que se passe-t-il ?
+ L'attaquant est bloqué sans le second facteur
- L'attaquant entre quand même facilement
- Le compte est supprimé
! La MFA exige un deuxième élément que l'attaquant ne possède pas.

? Pourquoi garder une sauvegarde hors ligne ?
- Pour qu'elle soit plus rapide
+ Pour qu'un rançongiciel ne puisse pas la chiffrer
- Parce que c'est moins cher
! Une sauvegarde débranchée est hors d'atteinte d'un malware.

? Un technicien utilise au quotidien un compte administrateur. Quel principe n'est pas respecté ?
+ Le moindre privilège
- La règle 3-2-1
- La double authentification
! Les droits administrateur ne doivent servir que pour les tâches d'administration.

? Un PC affiche un message de rançon. Que faire en premier ?
- L'éteindre et le jeter
- Payer pour récupérer les fichiers
+ Le débrancher du réseau et prévenir le responsable
! Isoler empêche la propagation aux autres machines.
