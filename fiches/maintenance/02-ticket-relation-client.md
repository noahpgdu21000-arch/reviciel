---
id: maint-relation-client
matiere: maintenance
titre: Ticket, niveaux de support et relation client
chapitre: Relation client
resume: Gérer une demande avec un ticket (GLPI), incident ou demande de service, niveaux N1/N2/N3, priorité, et les bonnes pratiques face au client.
mots-cles: ticket, GLPI, helpdesk, ITIL, incident, demande de service, problème, niveau de support, N1, N2, N3, escalade, priorité, impact, urgence, SLA, relation client, reformulation, compte rendu d'intervention
ordre: 2
---

## Le ticket

Chaque demande d'un utilisateur est enregistrée dans un ==ticket==, souvent avec un outil comme ==GLPI== (logiciel libre). Un ticket contient :

- le **demandeur**, la **date**, le matériel concerné ;
- la **description** du problème et sa **catégorie** ;
- la **priorité** ;
- le **statut** : nouveau → en cours → en attente → résolu → clos ;
- les **actions réalisées**, le **temps passé** et la **solution**.

## Incident, demande, problème (vocabulaire ITIL)

| Terme | Définition | Exemple |
|---|---|---|
| ==Incident== | interruption ou dégradation **non prévue** d'un service | « l'imprimante n'imprime plus » |
| ==Demande de service== | demande **standard**, prévue au catalogue | « créer un compte pour le nouveau stagiaire » |
| ==Problème== | **cause inconnue** d'un ou plusieurs incidents, à rechercher | « le Wi-Fi coupe tous les jours vers 10 h » |

## Les niveaux de support

| Niveau | Qui ? | Rôle |
|---|---|---|
| ==N1== | helpdesk, hotline | accueille, enregistre, qualifie, résout les cas simples (mot de passe, procédure) |
| ==N2== | technicien de proximité ou spécialiste | interventions plus techniques, sur place ou à distance |
| ==N3== | expert, éditeur, constructeur | cas complexes, correctifs, remplacement sous garantie |

Quand un niveau ne peut pas résoudre, il fait une ==escalade== vers le niveau supérieur.

## La priorité

> [!formule]
> Priorité = **impact** (combien d'utilisateurs ou de services touchés) × **urgence** (délai acceptable)

Un serveur de messagerie en panne pour toute l'entreprise passe avant la souris d'un seul poste. Les délais à respecter peuvent être fixés dans un ==SLA== (contrat de niveau de service) : délai de prise en charge, délai de résolution.

## La relation client

> [!retenir] Les bons réflexes
> - **Accueillir** : se présenter, être poli et souriant, même au téléphone.
> - **Écouter** sans couper, puis **questionner** : d'abord des questions **ouvertes** (« que se passe-t-il ? »), puis **fermées** (« le voyant est-il vert ? »).
> - ==Reformuler== pour vérifier qu'on a compris : « Si je comprends bien, depuis ce matin… ».
> - **Expliquer simplement**, sans jargon, ce qu'on va faire et combien de temps cela prendra.
> - **Rester calme** face à un client mécontent : ne pas le prendre personnellement, montrer qu'on cherche une solution.
> - Ne **jamais promettre** ce qu'on ne peut pas tenir.
> - Respecter la **confidentialité** des données et des lieux.

## Le compte rendu d'intervention

Il précise : date et heure, client et lieu, matériel, **symptômes**, **diagnostic**, **actions réalisées**, pièces remplacées, **temps passé**, **résultat** (résolu ou non), recommandations, et la **signature du client** (validation : c'est la ==recette==).

> [!astuce] Le mail professionnel
> Objet précis (« Intervention du 12/03 – imprimante accueil »), formule d'appel, phrases courtes, une idée par paragraphe, formule de politesse, signature avec ses coordonnées. Relire avant d'envoyer !

=== CARTES ===
Q: À quoi sert un ticket ?
R: À **enregistrer et suivre** une demande, de sa création à sa clôture.

Q: Un outil libre de gestion de tickets et de parc ?
R: **GLPI**.

Q: Différence entre un incident et une demande de service ?
R: L'**incident** est une panne ou dégradation **non prévue** ; la **demande de service** est une demande **standard** (nouveau compte, logiciel…).

Q: Qu'est-ce qu'un problème au sens ITIL ?
R: La **cause inconnue** d'un ou plusieurs incidents.

Q: Rôle du support N1 ?
R: **Accueillir**, enregistrer, qualifier et résoudre les demandes simples.

Q: Qu'est-ce qu'une escalade ?
R: Transmettre le ticket au **niveau de support supérieur**.

Q: Comment détermine-t-on la priorité d'un ticket ?
R: Selon l'**impact** et l'**urgence**.

Q: Qu'est-ce qu'un SLA ?
R: Un **contrat de niveau de service** qui fixe les délais de prise en charge et de résolution.

Q: Pourquoi reformuler la demande du client ?
R: Pour **vérifier qu'on a bien compris** et montrer qu'on l'écoute.

=== QUIZ ===
? « Installer le logiciel de CAO sur le poste d'un nouvel employé » est…
- un incident
+ une demande de service
- un problème
! C'est une demande standard, pas une panne.

? Quel ticket traiter en premier ?
+ Le serveur de fichiers inaccessible pour tout le service comptable
- Une souris qui accroche sur un poste
- Une demande de nouveau fond d'écran
! Impact élevé (tout un service) et urgence forte.

? Le client est énervé au téléphone. Quelle attitude adopter ?
- Lui répondre sur le même ton
+ Rester calme, écouter, reformuler et proposer une solution
- Raccrocher
! Le calme et l'écoute font baisser la tension.

? Après avoir résolu une panne chez un client, on…
- part sans rien dire
+ vérifie avec lui le bon fonctionnement et fait signer le compte rendu
- ferme le ticket sans commentaire
! La validation par le client (recette) et la documentation terminent l'intervention.

? « Que se passe-t-il exactement ? » est une question…
+ ouverte
- fermée
- fermée à choix multiple
! Une question ouverte laisse le client décrire librement.
