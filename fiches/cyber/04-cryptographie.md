---
id: cyber-crypto
matiere: cyber
titre: Chiffrement, hachage et certificats
chapitre: Cybersécurité — Cryptographie
resume: Chiffrement symétrique et asymétrique, fonctions de hachage, signature numérique, certificats et HTTPS.
mots-cles: cryptographie, chiffrement, symétrique, asymétrique, clé publique, clé privée, AES, RSA, hachage, SHA-256, MD5, empreinte, signature numérique, certificat, autorité de certification, HTTPS, TLS, César, Base64
ordre: 4
---

## Codage, chiffrement, hachage : ne pas confondre

| | Réversible ? | Besoin d'une clé ? | Exemple |
|---|---|---|---|
| ==Codage== | oui, par tout le monde | non | Base64, ASCII : **aucune sécurité** |
| ==Chiffrement== | oui, avec la bonne clé | oui | AES, RSA |
| ==Hachage== | **non** (sens unique) | non | SHA-256 |

## Le chiffrement symétrique

La ==même clé secrète== sert à chiffrer et à déchiffrer.

- Exemple : ==AES== (clés de 128 ou 256 bits), utilisé pour le Wi-Fi WPA2, les disques chiffrés, les VPN.
- **Avantage** : très rapide.
- **Problème** : il faut transmettre la clé secrète à l'autre sans qu'elle soit interceptée.

> [!exemple] Le chiffre de César (historique)
> On décale chaque lettre de l'alphabet d'un nombre fixe (la clé). Avec un décalage de 3 : CIEL → **FLHO**. Très facile à casser : seulement 25 clés possibles !

## Le chiffrement asymétrique

Chaque personne possède une ==paire de clés== liées mathématiquement :

- une ==clé publique==, que tout le monde peut connaître ;
- une ==clé privée==, gardée secrète.

> [!retenir] Les deux usages
> - **Confidentialité** : on chiffre avec la clé **publique du destinataire** → seul le destinataire peut déchiffrer avec sa clé **privée**.
> - **Signature** : l'émetteur signe avec **sa clé privée** → tout le monde vérifie avec sa clé **publique**.

- Exemples : ==RSA==, courbes elliptiques (ECC).
- Plus lent que le symétrique : en pratique (HTTPS), on utilise l'asymétrique pour **échanger une clé symétrique**, puis l'AES pour la suite : c'est le **chiffrement hybride**.

## Le hachage

Une ==fonction de hachage== calcule une **empreinte** (un « résumé ») de taille fixe à partir de n'importe quelle donnée.

- Même donnée → **même empreinte** ; la moindre modification → empreinte **complètement différente**.
- **Impossible** de retrouver la donnée à partir de l'empreinte.
- ==SHA-256== est recommandé ; **MD5** et **SHA-1** sont obsolètes.
- Usages : vérifier l'==intégrité== d'un fichier téléchargé (comparer son empreinte avec celle du site officiel), **stocker les mots de passe** (on stocke l'empreinte, avec un « sel », jamais le mot de passe en clair).

## Signature numérique et certificat

- ==Signature numérique== : l'émetteur calcule l'empreinte du document et la chiffre avec **sa clé privée**. Le destinataire vérifie avec la **clé publique**. Elle garantit l'**intégrité**, l'**authenticité** de l'auteur et la **non-répudiation** (il ne peut pas nier l'avoir signé).
- ==Certificat numérique== : une « carte d'identité » qui associe une **clé publique** à une identité (un site, une personne), signée par une ==autorité de certification (AC)== de confiance.

## HTTPS

==HTTPS = HTTP + TLS== : le navigateur vérifie le certificat du site, puis la connexion est **chiffrée**. Le cadenas garantit que la connexion est chiffrée avec le bon site… mais **pas** que le site est honnête : un site de phishing peut aussi avoir un cadenas !

> [!retenir]
> Symétrique = 1 clé partagée (AES, rapide). Asymétrique = clé publique + clé privée (RSA). Hachage = empreinte irréversible (SHA-256) pour l'intégrité. Certificat = clé publique + identité, signé par une AC.

=== CARTES ===
Q: Différence entre chiffrement symétrique et asymétrique ?
R: **Symétrique** : une seule clé secrète partagée. **Asymétrique** : une paire clé publique / clé privée.

Q: Un algorithme de chiffrement symétrique ?
R: **AES**.

Q: Un algorithme de chiffrement asymétrique ?
R: **RSA** (ou ECC).

Q: Pour envoyer un message confidentiel à Léa, avec quelle clé chiffrer ?
R: Avec la **clé publique de Léa** (seule sa clé privée pourra déchiffrer).

Q: Avec quelle clé signe-t-on un document ?
R: Avec **sa propre clé privée**.

Q: Une fonction de hachage est-elle réversible ?
R: **Non** : on ne peut pas retrouver la donnée à partir de l'empreinte.

Q: Quel algorithme de hachage est recommandé aujourd'hui ?
R: **SHA-256** (MD5 et SHA-1 sont obsolètes).

Q: Base64 est-il un chiffrement ?
R: **Non** : c'est un simple codage, réversible par n'importe qui.

Q: Qu'est-ce qu'un certificat numérique ?
R: Un document qui associe une **clé publique à une identité**, signé par une **autorité de certification**.

Q: HTTPS = ?
R: **HTTP + TLS** : connexion chiffrée et authentification du serveur.

=== QUIZ ===
? Comment un site doit-il stocker les mots de passe de ses utilisateurs ?
- En clair dans la base
- Codés en Base64
+ Sous forme d'empreinte (hachage salé)
! Même en cas de vol de la base, les mots de passe ne sont pas lisibles directement.

? Quel est le principal inconvénient du chiffrement symétrique ?
- Il est trop lent
+ Il faut transmettre la clé secrète de façon sûre
- Il n'est pas fiable
! L'échange de la clé est le point délicat ; l'asymétrique résout ce problème.

? Tu télécharges une image ISO de Linux. Comment vérifier qu'elle n'a pas été modifiée ?
+ Comparer son empreinte SHA-256 avec celle du site officiel
- Regarder la taille du fichier seulement
- L'ouvrir avec le Bloc-notes
! Une empreinte identique prouve l'intégrité du fichier.

? Avec le chiffre de César et un décalage de 1, « RESEAU » devient…
+ SFTFBV
- QDRDZT
- RESEAU
! Chaque lettre avance d'un rang : R→S, E→F, S→T, E→F, A→B, U→V.

? Le cadenas HTTPS dans le navigateur garantit…
- que le site est honnête
+ que la connexion est chiffrée avec le serveur du certificat
- que le site n'a pas de virus
! Un site d'hameçonnage peut aussi avoir un certificat valide.

? La signature numérique garantit notamment…
+ l'intégrité et l'authenticité de l'auteur
- la disponibilité du serveur
- la vitesse de transmission
! Elle prouve que le document n'a pas été modifié et qui l'a signé.
