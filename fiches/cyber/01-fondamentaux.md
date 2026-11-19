---
id: cyber-fondamentaux
matiere: cyber
titre: Les fondamentaux de la cybersécurité
chapitre: Cybersécurité — Bases
resume: Les critères DICT, le vocabulaire du risque, les attaquants, les organismes à connaître et le cadre légal (loi Godfrain, RGPD).
mots-cles: cybersécurité, DICT, disponibilité, intégrité, confidentialité, traçabilité, vulnérabilité, menace, risque, ANSSI, CNIL, cybermalveillance, loi Godfrain, RGPD, données personnelles
ordre: 1
---

## Les 4 critères de sécurité : DICT

| Critère | Question | Exemple d'atteinte |
|---|---|---|
| ==Disponibilité== | Le service est-il accessible quand on en a besoin ? | site web saturé par une attaque DDoS |
| ==Intégrité== | Les données sont-elles exactes, non modifiées sans autorisation ? | notes modifiées dans une base de données |
| ==Confidentialité== | Seules les personnes autorisées y ont-elles accès ? | fuite de fichiers clients |
| ==Traçabilité== (preuve) | Peut-on savoir qui a fait quoi, et quand ? | absence de journaux (logs) après un incident |

On parle aussi d'**authentification** : vérifier qu'une personne est bien celle qu'elle prétend être.

## Le vocabulaire du risque

- ==Actif== (bien) : ce qui a de la valeur pour l'organisation : données, serveurs, logiciels, réputation.
- ==Vulnérabilité== : une **faiblesse** (logiciel non mis à jour, mot de passe faible, port ouvert inutilement).
- ==Menace== : ce qui pourrait exploiter une vulnérabilité (un cybercriminel, un virus, une erreur humaine).
- ==Attaque== : l'exploitation **réelle** d'une vulnérabilité.
- ==Risque== : la possibilité qu'une menace exploite une vulnérabilité et cause un **impact**. On l'évalue selon sa **vraisemblance** et sa **gravité**.

## Qui attaque, et pourquoi ?

- **Cybercriminels** : l'argent (rançongiciels, vol de données bancaires, arnaques).
- **Hacktivistes** : une cause idéologique (défigurer un site, divulguer des documents).
- **États** : espionnage, sabotage, déstabilisation.
- **Initiés** : un employé malveillant… ou simplement négligent.

## Les organismes à connaître

| Organisme | Rôle |
|---|---|
| ==ANSSI== | autorité nationale de la sécurité des systèmes d'information : guides, recommandations, défense des infrastructures |
| ==CNIL== | protection des **données personnelles** et contrôle du RGPD |
| ==Cybermalveillance.gouv.fr== | assistance et prévention pour les particuliers, entreprises et collectivités victimes |
| CERT-FR | alertes et avis de sécurité sur les failles |
| 17Cyber | guichet en ligne pour les victimes de cyberattaques |

## Le cadre légal

- ==Loi Godfrain (1988)==, articles 323-1 et suivants du **Code pénal** : accéder ou se maintenir **frauduleusement** dans un système informatique (STAD) est un délit : jusqu'à **3 ans de prison et 100 000 € d'amende**, davantage si des données sont modifiées ou supprimées.
- ==RGPD== (règlement européen, 2018) : protège les **données personnelles** (nom, e-mail, adresse IP, photo…). Il impose de collecter seulement le nécessaire, de sécuriser les données et de respecter les droits des personnes (accès, rectification, effacement). Une fuite de données doit être signalée à la CNIL **sous 72 heures**. Sanctions : jusqu'à 20 millions d'euros ou 4 % du chiffre d'affaires mondial.

> [!attention] Éthique du technicien
> On ne teste **jamais** la sécurité d'un système sans **autorisation écrite** de son propriétaire, même « pour voir ». Le technicien respecte la confidentialité des données auxquelles il accède et la charte informatique de l'entreprise.

> [!retenir]
> DICT = Disponibilité, Intégrité, Confidentialité, Traçabilité. Risque = menace × vulnérabilité → impact. ANSSI (État), CNIL (données personnelles), cybermalveillance.gouv.fr (victimes). Intrusion = délit (loi Godfrain).

=== EXERCICES ===
# classer : Quel critère DICT est touché ?
Disponibilité : un site saturé par une attaque DDoS, un serveur en panne toute la journée
Intégrité : des notes modifiées dans la base de données, le montant d'un virement changé
Confidentialité : une fuite de fichiers clients, un mot de passe lu par un collègue
Traçabilité : aucun journal pour savoir qui s'est connecté

# paires : Associe chaque organisme à son rôle
- ANSSI = Autorité nationale de la sécurité des systèmes d'information
- CNIL = Protection des données personnelles
- Cybermalveillance.gouv.fr = Assistance aux victimes
- CERT-FR = Alertes sur les failles de sécurité

=== CARTES ===
Q: Que signifie DICT ?
R: **D**isponibilité, **I**ntégrité, **C**onfidentialité, **T**raçabilité.

Q: Qu'est-ce que l'intégrité ?
R: La garantie que les données sont **exactes** et n'ont **pas été modifiées** sans autorisation.

Q: Qu'est-ce que la confidentialité ?
R: Seules les **personnes autorisées** peuvent accéder à l'information.

Q: Différence entre vulnérabilité et menace ?
R: La **vulnérabilité** est une faiblesse ; la **menace** est ce qui pourrait l'exploiter.

Q: Rôle de l'ANSSI ?
R: L'**autorité nationale** de la sécurité des systèmes d'information : recommandations, guides, défense des infrastructures.

Q: Rôle de la CNIL ?
R: Protéger les **données personnelles** et faire respecter le RGPD.

Q: Que punit la loi Godfrain ?
R: L'**accès ou le maintien frauduleux** dans un système informatique (jusqu'à 3 ans de prison et 100 000 € d'amende).

Q: Qu'est-ce qu'une donnée personnelle ?
R: Toute information permettant d'**identifier une personne** (nom, e-mail, adresse IP, photo…).

Q: Délai pour signaler une fuite de données à la CNIL ?
R: **72 heures**.

=== QUIZ ===
? Une attaque DDoS rend un site inaccessible. Quel critère est touché ?
+ La disponibilité
- La confidentialité
- L'intégrité
! Le service n'est plus accessible : c'est la disponibilité qui est atteinte.

? Un pirate modifie le montant d'un virement dans une base de données. Quel critère est touché ?
- La disponibilité
+ L'intégrité
- La traçabilité
! Les données ont été modifiées sans autorisation.

? Un logiciel jamais mis à jour est…
+ une vulnérabilité
- une menace
- une attaque
! C'est une faiblesse qui pourrait être exploitée.

? Un élève teste les mots de passe du serveur du lycée « pour s'amuser ». C'est…
- autorisé s'il ne casse rien
+ un délit puni par le Code pénal
- une simple faute contre le règlement intérieur
! L'accès frauduleux à un système est un délit (loi Godfrain), même sans dégât.

? Quel site aide les victimes de cybermalveillance ?
- cnil.fr uniquement
+ cybermalveillance.gouv.fr
- impots.gouv.fr
! Cybermalveillance.gouv.fr accompagne particuliers et entreprises victimes.
